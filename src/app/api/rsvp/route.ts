import { NextRequest, NextResponse } from "next/server";
import type { Party, RSVPSubmission } from "@/lib/types";

// Mock data for development — will be replaced with Airtable
const mockParties: Record<string, Party> = {
  k7x9m: {
    id: "party_1",
    code: "k7x9m",
    name: "The Smith Family",
    members: [
      {
        id: "m1",
        name: "John Smith",
        attending: false,
        events: { welcomeDinner: false, recoveryDay: false, wedding: false },
        dietaryRequirements: "",
      },
      {
        id: "m2",
        name: "Jane Smith",
        attending: false,
        events: { welcomeDinner: false, recoveryDay: false, wedding: false },
        dietaryRequirements: "",
      },
      {
        id: "m3",
        name: "Timmy Smith",
        attending: false,
        events: { welcomeDinner: false, recoveryDay: false, wedding: false },
        dietaryRequirements: "",
      },
    ],
    email: "",
    songRequest: "",
    message: "",
    submittedAt: null,
    updatedAt: null,
  },
  p3q8r: {
    id: "party_2",
    code: "p3q8r",
    name: "Sarah & Tom",
    members: [
      {
        id: "m4",
        name: "Sarah Jones",
        attending: false,
        events: { welcomeDinner: false, recoveryDay: false, wedding: false },
        dietaryRequirements: "",
      },
      {
        id: "m5",
        name: "Tom Jones",
        attending: false,
        events: { welcomeDinner: false, recoveryDay: false, wedding: false },
        dietaryRequirements: "",
      },
    ],
    email: "",
    songRequest: "",
    message: "",
    submittedAt: null,
    updatedAt: null,
  },
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing party code" }, { status: 400 });
  }

  const party = mockParties[code];

  if (!party) {
    return NextResponse.json({ error: "Party not found" }, { status: 404 });
  }

  return NextResponse.json(party);
}

export async function POST(request: NextRequest) {
  const body: RSVPSubmission = await request.json();

  if (!body.code) {
    return NextResponse.json({ error: "Missing party code" }, { status: 400 });
  }

  const party = mockParties[body.code];

  if (!party) {
    return NextResponse.json({ error: "Party not found" }, { status: 404 });
  }

  // Update mock data in memory
  party.email = body.email;
  party.songRequest = body.songRequest;
  party.message = body.message;

  for (const memberUpdate of body.members) {
    const member = party.members.find((m) => m.id === memberUpdate.id);
    if (member) {
      member.attending = memberUpdate.attending;
      member.events = memberUpdate.events;
      member.dietaryRequirements = memberUpdate.dietaryRequirements;
    }
  }

  const now = new Date().toISOString();
  if (!party.submittedAt) {
    party.submittedAt = now;
  }
  party.updatedAt = now;

  return NextResponse.json({ success: true, party });
}
