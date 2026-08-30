import { NextRequest, NextResponse } from "next/server";
import { getParty, saveRSVP } from "@/lib/airtable";
import { EVENT_KEYS, type EventKey, type RSVPSubmission } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const handle =
    request.nextUrl.searchParams.get("party") ??
    request.nextUrl.searchParams.get("code");

  if (!handle) {
    return NextResponse.json({ error: "Missing party" }, { status: 400 });
  }

  try {
    const party = await getParty(handle);
    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }
    return NextResponse.json(party);
  } catch (err) {
    console.error("[rsvp] lookup failed", err);
    return NextResponse.json(
      { error: "Could not load your invitation" },
      { status: 500 }
    );
  }
}

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Validate the browser payload before it reaches Airtable. */
function parseSubmission(body: unknown): RSVPSubmission | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;

  const partyId = str(b.partyId, 100);
  if (!partyId) return null;
  if (!Array.isArray(b.members) || b.members.length === 0) return null;

  const members: RSVPSubmission["members"] = [];
  for (const raw of b.members) {
    if (typeof raw !== "object" || raw === null) return null;
    const m = raw as Record<string, unknown>;
    const id = str(m.id, 100);
    if (!id) return null;

    const rawEvents = (m.events ?? {}) as Record<string, unknown>;
    const events = Object.fromEntries(
      EVENT_KEYS.map((k) => [k, rawEvents[k] === true])
    ) as Record<EventKey, boolean>;

    members.push({
      id,
      attending: m.attending === true,
      events,
      dietary: Array.isArray(m.dietary)
        ? m.dietary.filter((d): d is string => typeof d === "string").slice(0, 20)
        : [],
      dietaryNotes: str(m.dietaryNotes, 2000),
    });
  }

  const email = str(b.email, 320);
  // Deliberately permissive — a guest mistyping their email should not block an RSVP.
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;

  return {
    partyId,
    email,
    phone: str(b.phone, 40),
    songRequest: str(b.songRequest, 2000),
    message: str(b.message, 5000),
    members,
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const submission = parseSubmission(body);
  if (!submission) {
    return NextResponse.json(
      { error: "Some of those answers didn't look right. Please check and try again." },
      { status: 400 }
    );
  }

  try {
    const party = await saveRSVP(submission);
    return NextResponse.json(party);
  } catch (err) {
    console.error("[rsvp] save failed", err);
    return NextResponse.json(
      { error: "We couldn't save your RSVP. Please try again." },
      { status: 500 }
    );
  }
}
