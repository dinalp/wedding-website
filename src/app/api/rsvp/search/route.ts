import { NextRequest, NextResponse } from "next/server";
import { searchParties } from "@/lib/airtable";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();

  // Three characters minimum, so a single letter can't walk the guest list.
  if (q.length < 3) {
    return NextResponse.json({ matches: [] });
  }

  try {
    return NextResponse.json({ matches: await searchParties(q.slice(0, 100)) });
  } catch (err) {
    console.error("[rsvp] search failed", err);
    return NextResponse.json(
      { error: "Search is unavailable right now. Please try again." },
      { status: 500 }
    );
  }
}
