export const EVENT_KEYS = ["welcomeDinner", "wedding", "recoveryDay"] as const;
export type EventKey = (typeof EVENT_KEYS)[number];

export interface PartyMember {
  /** Airtable record id of the guest. */
  id: string;
  name: string;
  attending: boolean;
  events: Record<EventKey, boolean>;
  dietary: string[];
  dietaryNotes: string;
}

export interface Party {
  /** Airtable record id of the party. Doubles as the URL handle. */
  id: string;
  code: string;
  name: string;
  /** Only these events are shown on the form. Not every party is invited to all three. */
  invitedTo: EventKey[];
  members: PartyMember[];
  email: string;
  phone: string;
  songRequest: string;
  message: string;
  /** Opt-ins for the Bali Flight Watch / Uluwatu Stay Watch guest emails. */
  flightEmails: boolean;
  stayEmails: boolean;
  submittedAt: string | null;
  updatedAt: string | null;
}

export interface RSVPSubmission {
  partyId: string;
  email: string;
  phone: string;
  songRequest: string;
  message: string;
  flightEmails: boolean;
  stayEmails: boolean;
  members: {
    id: string;
    attending: boolean;
    events: Record<EventKey, boolean>;
    dietary: string[];
    dietaryNotes: string;
  }[];
}

/** Search hit — deliberately thin, this endpoint is public. */
export interface PartyMatch {
  id: string;
  name: string;
  memberNames: string[];
  alreadySubmitted: boolean;
}

export const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Gluten Free",
  "Dairy Free",
  "Nut Allergy",
  "Shellfish Allergy",
  "Halal",
  "No Pork",
  "No Beef",
  "Other",
] as const;
