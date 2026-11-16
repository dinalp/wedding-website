import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "__Host-rsvp-session";
export const CHALLENGE_COOKIE = "__Host-rsvp-challenge";
export const SESSION_SECONDS = 30 * 60;
export const OTP_SECONDS = 10 * 60;
export const MAX_ATTEMPTS = 5;
export const HELP = "Please check your full name, or contact Dinal & Shayani for help with your invitation.";

export class RSVPError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

function secret() {
  const value = process.env.RSVP_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("RSVP session configuration unavailable");
  return value;
}

export function digest(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function randomToken() { return randomBytes(32).toString("base64url"); }

export interface Session {
  partyId: string;
  guestId: string;
  visitHash: string;
  submittedAt: string | null;
  expires: number;
  emailVerified?: boolean;
}

export function signSession(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${digest(`session:${payload}`)}`;
}

export function readSession(token: string | undefined, visit: string | null, now = Date.now()): Session | null {
  if (!token || !visit || token.length > 2048 || visit.length > 128) return null;
  const [payload, signature, extra] = token.split(".");
  if (extra || !signature || !/^[a-f0-9]{64}$/.test(signature)) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(digest(`session:${payload}`)))) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if (!/^rec[A-Za-z0-9]{14}$/.test(s.partyId) || !/^rec[A-Za-z0-9]{14}$/.test(s.guestId) ||
        !Number.isFinite(s.expires) || s.expires <= now || s.expires > now + SESSION_SECONDS * 1000 ||
        !(s.submittedAt === null || typeof s.submittedAt === "string") || s.visitHash !== digest(`visit:${visit}`)) return null;
    return s;
  } catch { return null; }
}

export function cookieValue(request: Request, name: string): string | undefined {
  return request.headers.get("cookie")?.split(";").map((v) => v.trim()).find((v) => v.startsWith(`${name}=`))?.slice(name.length + 1);
}

export function cookie(name: string, value: string, seconds: number): string {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${seconds}`;
}

export function assertOrigin(request: Request) {
  const origin = request.headers.get("origin");
  // Next may reconstruct request.url with an internal host. Compare against
  // trusted configuration, never the caller's Host / X-Forwarded-Host headers.
  const allowed = new Set([process.env.RSVP_SITE_ORIGIN || "https://dinalandshayani.vercel.app"]);
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) allowed.add(`https://${process.env.VERCEL_URL}`);
  if (!origin || !allowed.has(origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new RSVPError("Please reopen the RSVP page and try again.", 403);
  }
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 1)}***@${domain}`;
}
