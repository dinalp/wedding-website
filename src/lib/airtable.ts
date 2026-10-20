import type {
  EventKey,
  Party,
  PartyMatch,
  PartyMember,
  RSVPSubmission,
} from "./types";

// ponytail: raw REST over the airtable SDK — this is four endpoints, not an app.
const API = "https://api.airtable.com/v0";
const PARTIES = "Parties";
const GUESTS = "Guests";

/** Airtable field names, kept in one place so a rename in the base is a one-line fix here. */
const EVENT_FIELD: Record<EventKey, string> = {
  welcomeDinner: "Welcome Dinner",
  wedding: "Wedding Day",
  recoveryDay: "Recovery Day",
};

function config() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const pat = process.env.AIRTABLE_PAT;
  if (!baseId || !pat) {
    throw new Error("AIRTABLE_BASE_ID and AIRTABLE_PAT must be set");
  }
  return { baseId, pat };
}

export async function at<T>(
  path: string,
  init?: RequestInit & { query?: Record<string, string | string[]> }
): Promise<T> {
  const { baseId, pat } = config();
  const url = new URL(`${API}/${baseId}/${path}`);
  for (const [k, v] of Object.entries(init?.query ?? {})) {
    if (Array.isArray(v)) v.forEach((item) => url.searchParams.append(k, item));
    else url.searchParams.set(k, v);
  }

  const res = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Airtable ${res.status} on ${path}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

/** Escape a value for interpolation into an Airtable formula string literal. */
function esc(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

type Rec<F> = { id: string; fields: F };
type List<F> = { records: Rec<F>[] };

interface GuestFields {
  "Full Name"?: string;
  "RSVP Status"?: string;
  "Welcome Dinner"?: boolean;
  "Wedding Day"?: boolean;
  "Recovery Day"?: boolean;
  Dietary?: string[];
  "Dietary Notes"?: string;
  "Nickname / Also Known As"?: string;
  Parties?: string[];
}

interface PartyFields {
  "Party Name"?: string;
  Code?: string;
  Guests?: string[];
  "Invited To"?: string[];
  Email?: string;
  Phone?: string;
  "Song Request"?: string;
  Message?: string;
  "Flight Price Emails"?: boolean;
  "Stay Price Emails"?: boolean;
  "Submitted At"?: string;
  "Updated At"?: string;
}

const EVENT_BY_LABEL: Record<string, EventKey> = {
  "Welcome Dinner": "welcomeDinner",
  "Wedding Day": "wedding",
  "Recovery Day": "recoveryDay",
};

function toMember(rec: Rec<GuestFields>): PartyMember {
  const f = rec.fields;
  return {
    id: rec.id,
    name: f["Full Name"] ?? "",
    attending: f["RSVP Status"] === "Attending",
    events: {
      welcomeDinner: !!f["Welcome Dinner"],
      wedding: !!f["Wedding Day"],
      recoveryDay: !!f["Recovery Day"],
    },
    dietary: f.Dietary ?? [],
    dietaryNotes: f["Dietary Notes"] ?? "",
  };
}

async function fetchGuests(ids: string[]): Promise<Rec<GuestFields>[]> {
  if (ids.length === 0) return [];
  const formula = `OR(${ids.map((id) => `RECORD_ID()='${esc(id)}'`).join(",")})`;
  const { records } = await at<List<GuestFields>>(GUESTS, {
    query: { filterByFormula: formula, pageSize: "100" },
  });
  // Airtable returns these in its own order; restore the party's ordering.
  const byId = new Map(records.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter((r): r is Rec<GuestFields> => !!r);
}

function toParty(rec: Rec<PartyFields>, guests: Rec<GuestFields>[]): Party {
  const f = rec.fields;
  const invitedTo = (f["Invited To"] ?? [])
    .map((label) => EVENT_BY_LABEL[label])
    .filter(Boolean);
  return {
    id: rec.id,
    code: f.Code ?? "",
    name: f["Party Name"] ?? "",
    // A party with nothing set is assumed invited to everything, so a blank
    // column in Airtable never silently hides events from a guest.
    invitedTo: invitedTo.length ? invitedTo : ["welcomeDinner", "wedding", "recoveryDay"],
    members: guests.map(toMember),
    email: f.Email ?? "",
    phone: f.Phone ?? "",
    songRequest: f["Song Request"] ?? "",
    message: f.Message ?? "",
    flightEmails: !!f["Flight Price Emails"],
    stayEmails: !!f["Stay Price Emails"],
    submittedAt: f["Submitted At"] ?? null,
    updatedAt: f["Updated At"] ?? null,
  };
}

/** Look up a party by Airtable record id, or by the short Code used in direct links. */
export async function getParty(handle: string): Promise<Party | null> {
  let rec: Rec<PartyFields> | null = null;

  if (/^rec[A-Za-z0-9]{14}$/.test(handle)) {
    try {
      rec = await at<Rec<PartyFields>>(`${PARTIES}/${handle}`);
    } catch {
      rec = null;
    }
  }

  if (!rec) {
    const { records } = await at<List<PartyFields>>(PARTIES, {
      query: {
        filterByFormula: `LOWER({Code})=LOWER('${esc(handle)}')`,
        maxRecords: "1",
      },
    });
    rec = records[0] ?? null;
  }

  if (!rec) return null;
  return toParty(rec, await fetchGuests(rec.fields.Guests ?? []));
}

/**
 * Find parties by guest name. Public endpoint, so this returns only what the
 * "is this you?" step needs and caps how much of the guest list one query can reveal.
 */
export async function searchParties(query: string): Promise<PartyMatch[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const needle = esc(q.toLowerCase());
  const { records } = await at<List<GuestFields>>(GUESTS, {
    query: {
      filterByFormula: `OR(FIND('${needle}',LOWER({Full Name})),FIND('${needle}',LOWER({Nickname / Also Known As})))`,
      pageSize: "25",
    },
  });

  const partyIds = [...new Set(records.flatMap((r) => r.fields.Parties ?? []))].slice(0, 5);
  if (partyIds.length === 0) return [];

  const formula = `OR(${partyIds.map((id) => `RECORD_ID()='${esc(id)}'`).join(",")})`;
  const { records: parties } = await at<List<PartyFields>>(PARTIES, {
    query: { filterByFormula: formula, pageSize: "25" },
  });

  const guestIds = [...new Set(parties.flatMap((p) => p.fields.Guests ?? []))];
  const guests = await fetchGuests(guestIds);
  const guestById = new Map(guests.map((g) => [g.id, g]));

  return parties.map((p) => ({
    id: p.id,
    name: p.fields["Party Name"] ?? "",
    memberNames: (p.fields.Guests ?? [])
      .map((id) => guestById.get(id)?.fields["Full Name"] ?? "")
      .filter(Boolean),
    alreadySubmitted: !!p.fields["Submitted At"],
  }));
}

export async function saveRSVP(submission: RSVPSubmission): Promise<Party> {
  const party = await getParty(submission.partyId);
  if (!party) throw new Error("Party not found");

  // Only accept answers for guests actually on this invitation, and only for
  // events the party was invited to. Both are trust boundaries — the payload
  // is whatever the browser sent.
  const allowedMembers = new Set(party.members.map((m) => m.id));
  const invited = new Set(party.invitedTo);

  const guestUpdates = submission.members
    .filter((m) => allowedMembers.has(m.id))
    .map((m) => {
      const fields: GuestFields = {
        "RSVP Status": m.attending ? "Attending" : "Not Attending",
        Dietary: m.attending ? m.dietary : [],
        "Dietary Notes": m.attending ? m.dietaryNotes.slice(0, 2000) : "",
      };
      for (const key of Object.keys(EVENT_FIELD) as EventKey[]) {
        const attending = m.attending && invited.has(key) && m.events[key];
        (fields as Record<string, unknown>)[EVENT_FIELD[key]] = attending;
      }
      return { id: m.id, fields };
    });

  if (guestUpdates.length > 0) {
    // Airtable caps a batch at 10 records.
    for (let i = 0; i < guestUpdates.length; i += 10) {
      await at(GUESTS, {
        method: "PATCH",
        body: JSON.stringify({ records: guestUpdates.slice(i, i + 10) }),
      });
    }
  }

  const now = new Date().toISOString();
  const partyFields: PartyFields = {
    Email: submission.email.slice(0, 320),
    Phone: submission.phone.slice(0, 40),
    "Song Request": submission.songRequest.slice(0, 2000),
    Message: submission.message.slice(0, 5000),
    // The price routines email whoever has these ticked, so no email means no subscription.
    "Flight Price Emails": submission.flightEmails && !!submission.email,
    "Stay Price Emails": submission.stayEmails && !!submission.email,
    "Updated At": now,
  };
  // Submitted At records the first response and is never overwritten on edits.
  if (!party.submittedAt) partyFields["Submitted At"] = now;

  await at(PARTIES, {
    method: "PATCH",
    body: JSON.stringify({
      records: [{ id: party.id, fields: partyFields }],
    }),
  });

  const saved = await getParty(party.id);
  if (!saved) throw new Error("Party disappeared after save");
  return saved;
}
