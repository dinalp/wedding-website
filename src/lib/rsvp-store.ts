import { digest, MAX_ATTEMPTS, OTP_SECONDS, RSVPError } from "./rsvp-security.ts";

/** Shared durable store. No process-local fallback: configuration/outages fail closed. */
export async function redis<T = unknown>(...command: (string | number)[]): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url?.startsWith("https://") || !token) throw new Error("RSVP security store unavailable");
  const response = await fetch(url, {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(5000),
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error("RSVP security store unavailable");
  const result = await response.json();
  if (result.error) throw new Error("RSVP security store unavailable");
  return result.result as T;
}

export const LIMIT_SCRIPT = `
local n = redis.call("INCR", KEYS[1])
if n == 1 then redis.call("EXPIRE", KEYS[1], ARGV[1]) end
return n`;

export async function limit(key: string, count: number, seconds: number) {
  const used = await redis<number>("EVAL", LIMIT_SCRIPT, 1, `rsvp:limit:${digest(key)}`, seconds);
  if (used > count) throw new RSVPError("Please wait a little before trying again.", 429);
}

export async function limitRequest(request: Request, action: string) {
  // Vercel overwrites x-vercel-forwarded-for. Do not trust arbitrary x-forwarded-for.
  // Outside Vercel use a shared bucket, never a spoofable caller-selected IP.
  const ip = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() : "local";
  await limit(`${action}:ip:${ip || "unknown"}`, action === "lookup" ? 10 : 15, 600);
}

export interface Challenge { partyId: string; guestId: string }
export async function createChallenge(id: string, value: Challenge) {
  await redis("SET", `rsvp:challenge:${digest(id)}`, JSON.stringify(value), "EX", OTP_SECONDS);
}
export async function getChallenge(id: string): Promise<Challenge | null> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(id)) return null;
  const value = await redis<string | null>("GET", `rsvp:challenge:${digest(id)}`);
  return value ? JSON.parse(value) : null;
}

export interface OTPState { hash: string; expires: number; attempts: number; emailHash: string }
export function otpKey(partyId: string) { return `rsvp:otp:${partyId}`; }

// NX reserves both the cooldown and challenge in one atomic operation. The hash
// is initially inactive; only a successful Airtable write + email send activates it.
export const START_SCRIPT = `
if redis.call("EXISTS", KEYS[2]) == 1 then return 0 end
redis.call("SET", KEYS[2], "1", "EX", 60)
redis.call("HSET", KEYS[1], "hash", ARGV[1], "expires", ARGV[2], "attempts", 0, "emailHash", ARGV[3], "ready", 0)
redis.call("EXPIRE", KEYS[1], ARGV[4])
return 1`;
export async function startOTP(partyId: string, state: OTPState) {
  const started = await redis<number>("EVAL", START_SCRIPT, 2, otpKey(partyId), `${otpKey(partyId)}:cooldown`, state.hash, state.expires, state.emailHash, OTP_SECONDS);
  if (!started) throw new RSVPError("Please wait one minute before requesting another code.", 429);
}
export const ACTIVATE_SCRIPT = `
if redis.call("HGET", KEYS[1], "hash") ~= ARGV[1] then return 0 end
redis.call("HSET", KEYS[1], "ready", 1)
return 1`;
export async function activateOTP(partyId: string, hash: string) {
  if (!await redis<number>("EVAL", ACTIVATE_SCRIPT, 1, otpKey(partyId), hash)) throw new Error("OTP superseded");
}

// Attempts, expiry, destination binding and consumption are checked atomically
// across all instances. Keep consumed state until expiry so replay stays invalid.
export const VERIFY_SCRIPT = `
local hash = redis.call("HGET", KEYS[1], "hash")
if not hash then return {0, "", 0, 0} end
local expires = tonumber(redis.call("HGET", KEYS[1], "expires"))
local attempts = tonumber(redis.call("HGET", KEYS[1], "attempts"))
if expires <= tonumber(ARGV[2]) or attempts >= tonumber(ARGV[4]) or redis.call("HGET", KEYS[1], "ready") ~= "1" then
  return {0, hash, expires, attempts}
end
attempts = redis.call("HINCRBY", KEYS[1], "attempts", 1)
if hash == ARGV[1] and redis.call("HGET", KEYS[1], "emailHash") == ARGV[3] then
  redis.call("HSET", KEYS[1], "ready", 0, "hash", "")
  return {1, "", expires, attempts}
end
return {0, hash, expires, attempts}`;
export async function consumeOTP(partyId: string, hash: string, emailHash: string, now: number) {
  const [ok, storedHash, expires, attempts] = await redis<[number, string, number, number]>("EVAL", VERIFY_SCRIPT, 1, otpKey(partyId), hash, now, emailHash, MAX_ATTEMPTS);
  return { ok: ok === 1, hash: storedHash, expires, attempts };
}
