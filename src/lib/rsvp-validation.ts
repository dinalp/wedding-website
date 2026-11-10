import type { RSVPSubmission } from "./types";

/** Shared browser/server checks; accepts local and international phone formats. */
export function rsvpDetailsError(body: Record<string, unknown>): string | null {
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!phone) return "Please add a mobile number so we can reach you about the wedding.";
  const digits = phone.replace(/\D/g, "");
  if (phone.length > 40 || !/^\+?[\d\s().-]+$/.test(phone) || digits.length < 7 || digits.length > 15) {
    return "Please enter a valid mobile number, including your country code if possible.";
  }
  for (const key of ["baliArrival", "baliDeparture"]) {
    const value = body[key];
    if (value === undefined || value === "") continue;
    if (typeof value !== "string" || (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000"))) {
      return "Please choose a valid arrival and departure date, or leave them blank.";
    }
    const date = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
      return "Please choose a valid arrival and departure date, or leave them blank.";
    }
  }
  if (typeof body.baliArrival === "string" && typeof body.baliDeparture === "string" &&
      body.baliArrival && body.baliDeparture && body.baliDeparture < body.baliArrival) {
    return "Your departure date must be on or after your arrival date.";
  }
  return null;
}

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Validate the browser payload before it reaches Airtable. */
export function parseSubmission(body: unknown): RSVPSubmission | null {
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
    const events = {
      welcomeDinner: rawEvents.welcomeDinner === true,
      wedding: rawEvents.wedding === true,
      recoveryDay: rawEvents.recoveryDay === true,
    };

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

  if (rsvpDetailsError(b)) return null;

  const email = str(b.email, 320);
  // Preserve the existing email format check; the browser requires this field.
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;

  return {
    partyId,
    email,
    phone: str(b.phone, 40),
    ...(typeof b.baliArrival === "string" ? { baliArrival: b.baliArrival } : {}),
    ...(typeof b.baliDeparture === "string" ? { baliDeparture: b.baliDeparture } : {}),
    songRequest: str(b.songRequest, 2000),
    message: str(b.message, 5000),
    flightEmails: b.flightEmails === true,
    stayEmails: b.stayEmails === true,
    members,
  };
}

