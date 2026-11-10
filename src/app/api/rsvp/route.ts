import { NextRequest, NextResponse } from "next/server";
import { getParty, saveRSVP } from "@/lib/airtable";
import { parseSubmission, rsvpDetailsError } from "@/lib/rsvp-validation";

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

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const detailsError = typeof body === "object" && body !== null
    ? rsvpDetailsError(body as Record<string, unknown>) : null;
  if (detailsError) {
    return NextResponse.json({ error: detailsError }, { status: 400 });
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
