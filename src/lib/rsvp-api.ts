import { randomInt } from "node:crypto";
import { findExactGuest, getParty, saveOTPState, saveRSVP } from "./airtable.ts";
import { parseSubmission, rsvpDetailsError, validEmail } from "./rsvp-validation.ts";
import { sendCode } from "./rsvp-email.ts";
import * as store from "./rsvp-store.ts";
import {
  assertOrigin, CHALLENGE_COOKIE, cookie, cookieValue, digest, HELP,
  OTP_SECONDS, randomToken, readSession, RSVPError, SESSION_COOKIE, SESSION_SECONDS, signSession,
  type Session,
} from "./rsvp-security.ts";

const defaults = { findExactGuest, getParty, saveRSVP, saveOTPState, sendCode, ...store.createRSVPStore(),
  now: () => Date.now(), code: () => randomInt(0, 1_000_000).toString().padStart(6, "0") };

function json(body: unknown, status = 200, cookies: string[] = []) {
  const headers = new Headers({ "Content-Type": "application/json", "Cache-Control": "private, no-store, max-age=0",
    "CDN-Cache-Control": "no-store", "Vercel-CDN-Cache-Control": "no-store", "Vary": "Cookie, Origin", "X-Content-Type-Options": "nosniff" });
  for (const value of cookies) headers.append("Set-Cookie", value);
  if (status === 429) headers.set("Retry-After", "60");
  return new Response(JSON.stringify(body), { status, headers });
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new RSVPError("Invalid request.");
  // Read with a bound even when content-length is missing or forged.
  const reader = request.body?.getReader();
  if (!reader) throw new RSVPError("Invalid request.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 64_000) { await reader.cancel(); throw new RSVPError("Your RSVP is too large.", 413); }
    chunks.push(value);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString());
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new RSVPError("Invalid request."); }
}

/** Route handlers share this implementation; tests exercise it with synthetic adapters. */
export function createRSVPAPI(overrides: Partial<typeof defaults> = {}) {
  const d = { ...defaults, ...overrides };
  const guarded = (fn: (request: Request) => Promise<Response>) => async (request: Request) => {
    try { return await fn(request); }
    catch (error) {
      if (error instanceof RSVPError) return json({ error: error.message }, error.status);
      // Never log provider bodies, OTPs, names or party contact data.
      console.error("[rsvp] service unavailable");
      return json({ error: "We couldn’t complete that just now. Please try again shortly, or contact Dinal & Shayani." }, 503);
    }
  };
  function issue(partyId: string, guestId: string, submittedAt: string | null, emailVerified = false) {
    const visit = randomToken();
    const session: Session = { partyId, guestId, submittedAt, emailVerified, visitHash: digest(`visit:${visit}`), expires: d.now() + SESSION_SECONDS * 1000 };
    return json({ next: "form", visit }, 200, [cookie(SESSION_COOKIE, signSession(session), SESSION_SECONDS), cookie(CHALLENGE_COOKIE, "", 0)]);
  }
  async function authorized(request: Request) {
    const session = readSession(cookieValue(request, SESSION_COOKIE), request.headers.get("x-rsvp-visit"), d.now());
    if (!session) throw new RSVPError("Please find your invitation again to continue.", 401);
    const url = new URL(request.url);
    const requestedParty = url.searchParams.get("party");
    if ((requestedParty && requestedParty !== session.partyId) || url.searchParams.has("code")) {
      throw new RSVPError("This invitation is not available in your session.", 403);
    }
    const party = await d.getParty(session.partyId);
    if (!party || party.submittedAt !== session.submittedAt || !party.members.some((m) => m.id === session.guestId)) {
      throw new RSVPError("Please find your invitation again to continue.", 401);
    }
    return { party, session };
  }
  async function challenge(request: Request) {
    const id = cookieValue(request, CHALLENGE_COOKIE) ?? "";
    const value = await d.getChallenge(id);
    if (!value) throw new RSVPError("Please find your invitation again to request a code.", 401);
    const party = await d.getParty(value.partyId);
    if (!party || !party.members.some((m) => m.id === value.guestId)) throw new RSVPError(HELP);
    return { ...value, party, challengeId: id };
  }
  return {
    // The old GET search is deliberately inert, including for cached/bookmarked URLs.
    searchGET: guarded(async () => json({ error: "Please use the invitation form to continue." }, 405)),
    lookup: guarded(async (request) => {
      assertOrigin(request);
      await d.limitRequest(request, "lookup");
      const body = await readBody(request);
      const name = typeof body.name === "string" ? body.name : "";
      const match = name.length <= 100 ? await d.findExactGuest(name) : null;
      const clear = [cookie(SESSION_COOKIE, "", 0), cookie(CHALLENGE_COOKIE, "", 0)];
      if (!match) return json({ next: "help", message: HELP }, 200, clear);
      const party = await d.getParty(match.partyId);
      if (!party || !party.members.some((m) => m.id === match.guestId)) return json({ next: "help", message: HELP }, 200, clear);
      const id = randomToken();
      await d.createChallenge(id, match);
      return json({ next: "continue" }, 200,
        [cookie(SESSION_COOKIE, "", 0), cookie(CHALLENGE_COOKIE, id, OTP_SECONDS)]);
    }),
    send: guarded(async (request) => {
      assertOrigin(request);
      await d.limitRequest(request, "send");
      const { partyId, guestId, party, challengeId } = await challenge(request);
      // Existing emails always require proof, so the send flow also does not
      // distinguish submitted from unsubmitted parties with an email on file.
      if (!party.email.trim() && !party.submittedAt) return issue(partyId, guestId, null);
      if (!validEmail(party.email)) throw new RSVPError(HELP);
      const code = d.code();
      const state = { hash: digest(`otp:${partyId}:${challengeId}:${code}`), expires: d.now() + OTP_SECONDS * 1000,
        attempts: 0, emailHash: digest(`email:${party.email.trim().toLowerCase()}`) };
      await d.startOTP(partyId, challengeId, state);
      await d.saveOTPState(partyId, state.hash, state.expires, 0);
      await d.sendCode(party.email, code);
      await d.activateOTP(partyId, challengeId, state.hash);
      await d.createChallenge(challengeId, { partyId, guestId });
      return json({ message: "Your code has been sent. It is valid for 10 minutes." }, 200,
        [cookie(CHALLENGE_COOKIE, challengeId, OTP_SECONDS)]);
    }),
    verify: guarded(async (request) => {
      assertOrigin(request);
      await d.limitRequest(request, "verify");
      const { partyId, guestId, party, challengeId } = await challenge(request);
      const body = await readBody(request);
      // Malformed guesses count too; never provide a free verification oracle.
      const code = typeof body.code === "string" && /^\d{6}$/.test(body.code) ? body.code : "invalid";
      if (!validEmail(party.email)) throw new RSVPError(HELP);
      // The party-level Airtable mirror is diagnostic only: it cannot represent
      // independent challenges. Redis is the authority for readiness and attempts.
      const result = await d.consumeOTP(partyId, challengeId, digest(`otp:${partyId}:${challengeId}:${code}`), digest(`email:${party.email.trim().toLowerCase()}`), d.now());
      if (result.expires) await d.saveOTPState(partyId, result.hash, result.expires, result.attempts);
      if (!result.ok) throw new RSVPError("That code is invalid or expired. Check it, or request a new code.");
      // Redis consumes first. If the Airtable mirror fails, the code remains spent.
      return issue(partyId, guestId, party.submittedAt, true);
    }),
    get: guarded(async (request) => {
      const { party, session } = await authorized(request);
      return json({ ...party, respondingGuestId: session.guestId, canChangeEmail: !!party.submittedAt && session.emailVerified === true });
    }),
    post: guarded(async (request) => {
      assertOrigin(request);
      const { party, session } = await authorized(request);
      const body = await readBody(request);
      if (body.partyId !== undefined && body.partyId !== session.partyId) throw new RSVPError("This invitation is not available in your session.", 403);
      if (party.submittedAt && !party.email.trim() && !session.emailVerified) throw new RSVPError(HELP);
      const submission = parseSubmission({ ...body, partyId: session.partyId,
        ...((!party.submittedAt || !session.emailVerified) && party.email.trim() ? { email: party.email } : {}) });
      if (!submission) throw new RSVPError(rsvpDetailsError(body) ?? "Please check the email and mobile details for your party and try again.");
      if (submission.members.some((m) => !party.members.some((member) => member.id === m.id))) throw new RSVPError("This guest is not part of your invitation.", 403);
      if (!party.submittedAt) await d.reserveFirstSubmit(party.id, session.visitHash);
      const saved = await d.saveRSVP(submission, session.partyId, session.emailVerified === true);
      const renewed = { ...session, submittedAt: saved.submittedAt };
      return json({ ...saved, respondingGuestId: session.guestId, canChangeEmail: !!saved.submittedAt && session.emailVerified === true }, 200,
        [cookie(SESSION_COOKIE, signSession(renewed), Math.max(0, Math.floor((session.expires - d.now()) / 1000)))]);
    }),
  };
}

export const rsvpAPI = createRSVPAPI();
