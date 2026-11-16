import { digest, MAX_ATTEMPTS, OTP_SECONDS, RSVPError } from "./rsvp-security.ts";

// This database is shared. All key construction and Redis access stays here.
export const REDIS_PREFIX = "wedding:";
const key = (suffix: string) => `${REDIS_PREFIX}rsvp:${suffix}`;
export const otpKey = (partyId: string, challengeId: string) => key(`otp:${partyId}:${digest(challengeId)}`);
export const PARTY_SEND_LIMIT = 5;
export const PARTY_SEND_WINDOW = 3600;

/** Shared durable store. No process-local fallback: configuration/outages fail closed. */
export async function redis<T = unknown>(...command: (string | number)[]): Promise<T> {
  const [operation, script, count] = command;
  const keys = operation === "EVAL" ? command.slice(3, 3 + Number(count)) : command.slice(1, 2);
  if (!(operation === "GET" || operation === "SET" ||
      (operation === "EVAL" && [LIMIT_SCRIPT, START_SCRIPT, ACTIVATE_SCRIPT, VERIFY_SCRIPT, FIRST_SUBMIT_SCRIPT].includes(String(script)) &&
        Number.isInteger(count) && Number(count) > 0)) ||
      !keys.length || keys.some((value) => typeof value !== "string" || !value.startsWith(REDIS_PREFIX))) {
    throw new Error("Unsafe RSVP Redis command");
  }
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

// Cooldown admission and the party send reservation are atomic. Rejected requests
// spend no party quota and never extend the fixed one-hour window. Failed provider
// deliveries retain their reservation: an uncertain delivery must still count.
export const START_SCRIPT = `
if redis.call("EXISTS", KEYS[2]) == 1 then return 0 end
local sends = tonumber(redis.call("GET", KEYS[3]) or "0")
if sends >= tonumber(ARGV[5]) then return -1 end
sends = redis.call("INCR", KEYS[3])
if sends == 1 then redis.call("EXPIRE", KEYS[3], ARGV[6]) end
redis.call("SET", KEYS[2], "1", "EX", 60)
redis.call("HSET", KEYS[1], "hash", ARGV[1], "expires", ARGV[2], "attempts", 0, "emailHash", ARGV[3], "ready", 0)
redis.call("EXPIRE", KEYS[1], ARGV[4])
return 1`;

export const ACTIVATE_SCRIPT = `
if redis.call("HGET", KEYS[1], "hash") ~= ARGV[1] then return 0 end
redis.call("HSET", KEYS[1], "ready", 1)
return 1`;

// Each challenge owns its attempts and single-use code. No other browser's
// challenge can consume attempts, replace a delivery or invalidate a ready code.
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

export const FIRST_SUBMIT_SCRIPT = `
local owner = redis.call("GET", KEYS[1])
if not owner then
  redis.call("SET", KEYS[1], ARGV[1], "EX", 1800)
  return ARGV[1]
end
return owner`;

export interface Challenge { partyId: string; guestId: string }
export interface OTPState { hash: string; expires: number; attempts: number; emailHash: string }

/** Injectable transport lets offline tests exercise the exact production scripts and keys. */
export function createRSVPStore(command = redis) {
  async function limit(bucket: string, count: number, seconds: number) {
    const used = await command<number>("EVAL", LIMIT_SCRIPT, 1, key(`limit:${digest(bucket)}`), seconds);
    if (used > count) throw new RSVPError("Please wait a little before trying again.", 429);
  }
  return {
    limit,
    async limitRequest(request: Request, action: string) {
      // Only trust the IP header overwritten by Vercel, never arbitrary forwarded-for.
      const ip = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() : "local";
      await limit(`${action}:ip:${ip || "unknown"}`, action === "lookup" ? 10 : 15, 600);
    },
    async createChallenge(id: string, value: Challenge) {
      await command("SET", key(`challenge:${digest(id)}`), JSON.stringify(value), "EX", OTP_SECONDS);
    },
    async getChallenge(id: string): Promise<Challenge | null> {
      if (!/^[A-Za-z0-9_-]{43}$/.test(id)) return null;
      const value = await command<string | null>("GET", key(`challenge:${digest(id)}`));
      return value ? JSON.parse(value) : null;
    },
    async reserveFirstSubmit(partyId: string, visitHash: string) {
      const owner = await command<string>("EVAL", FIRST_SUBMIT_SCRIPT, 1, key(`first-submit:${partyId}`), visitHash);
      if (owner !== visitHash) throw new RSVPError("Please find your invitation again to continue.", 401);
    },
    async startOTP(partyId: string, challengeId: string, state: OTPState) {
      const otp = otpKey(partyId, challengeId);
      const started = await command<number>("EVAL", START_SCRIPT, 3, otp, `${otp}:cooldown`, key(`limit:send:party:${partyId}`),
        state.hash, state.expires, state.emailHash, OTP_SECONDS, PARTY_SEND_LIMIT, PARTY_SEND_WINDOW);
      if (started === 0) throw new RSVPError("Please wait one minute before requesting another code.", 429);
      if (started === -1) throw new RSVPError("Too many codes requested. Please try again in an hour, or contact Dinal & Shayani.", 429);
      if (started !== 1) throw new Error("RSVP security store unavailable");
    },
    async activateOTP(partyId: string, challengeId: string, hash: string) {
      if (!await command<number>("EVAL", ACTIVATE_SCRIPT, 1, otpKey(partyId, challengeId), hash)) throw new Error("OTP superseded");
    },
    async consumeOTP(partyId: string, challengeId: string, hash: string, emailHash: string, now: number) {
      const [ok, storedHash, expires, attempts] = await command<[number, string, number, number]>("EVAL", VERIFY_SCRIPT, 1,
        otpKey(partyId, challengeId), hash, now, emailHash, MAX_ATTEMPTS);
      return { ok: ok === 1, hash: storedHash, expires, attempts };
    },
  };
}

export const { limit, limitRequest, createChallenge, getChallenge, reserveFirstSubmit, startOTP, activateOTP, consumeOTP } = createRSVPStore();
