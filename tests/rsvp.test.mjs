import "./rsvp-ui.test.mjs";
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSubmission, rsvpDetailsError } from '../src/lib/rsvp-validation.ts';
import { findExactGuest, normalizeName, getParty, saveRSVP } from '../src/lib/airtable.ts';

const payload = {
  partyId: 'rec00000000000001', email: 'guest@example.test', phone: '+61 400 000 000',
  songRequest: '', message: '', flightEmails: false, stayEmails: false,
  members: [{ id: 'rec00000000000002', attending: true,
    events: { welcomeDinner: true, wedding: true, recoveryDay: true }, dietary: [], dietaryNotes: '' }],
};

test('mobile is required and accepts local/international formatting without accepting garbage', () => {
  for (const phone of [undefined, null, '', '   ', 'hello12345678', '123', '+'.repeat(10), '1'.repeat(16)]) {
    assert.equal(parseSubmission({ ...payload, phone }), null);
    assert.ok(rsvpDetailsError({ phone }));
  }
  for (const phone of ['0400 000 000', '+94 77 123 4567', '+1 (202) 555-0123']) {
    assert.equal(parseSubmission({ ...payload, phone }).phone, phone);
  }
});

test('dates are optional, permit one known date and reject impossible or reversed dates', () => {
  assert.ok(parseSubmission(payload));
  for (const dates of [{ baliArrival: '', baliDeparture: '' }, { baliArrival: '2027-05-18' },
    { baliDeparture: '2027-05-23' }, { baliArrival: '2027-05-18', baliDeparture: '2027-05-18' },
    { baliArrival: '2028-02-29', baliDeparture: '2028-03-01' }]) {
    assert.ok(parseSubmission({ ...payload, ...dates }));
  }
  for (const dates of [{ baliArrival: '2027-02-29' }, { baliDeparture: '2027-04-31' },
    { baliArrival: '2027-13-10' }, { baliArrival: '18/05/2027' }, { baliDeparture: 123 },
    { baliArrival: null }, { baliArrival: '2027-05-20', baliDeparture: '2027-05-19' }]) {
    assert.equal(parseSubmission({ ...payload, ...dates }), null);
  }
});

test('Airtable round trip saves, edits, preserves omitted dates and clears explicit blank dates', async (t) => {
  const oldBase = process.env.AIRTABLE_BASE_ID;
  const oldPat = process.env.AIRTABLE_PAT;
  process.env.AIRTABLE_BASE_ID = 'test-base';
  process.env.AIRTABLE_PAT = 'test-token';
  t.after(() => {
    if (oldBase === undefined) delete process.env.AIRTABLE_BASE_ID;
    else process.env.AIRTABLE_BASE_ID = oldBase;
    if (oldPat === undefined) delete process.env.AIRTABLE_PAT;
    else process.env.AIRTABLE_PAT = oldPat;
  });
  const party = { id: payload.partyId, fields: {
    'Party Name': 'Test Party', Code: 'test-code', Guests: [payload.members[0].id],
    'Invited To': ['Wedding Day'],
  } };
  const guest = { id: payload.members[0].id, fields: { 'Full Name': 'Test Guest' } };
  const writes = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(new URL(url).hostname, 'api.airtable.com');
    const table = new URL(url).pathname.split('/')[3];
    if (init?.method === 'PATCH') {
      const records = JSON.parse(init.body).records;
      writes.push({ table, records: structuredClone(records) });
      for (const record of records) {
        const target = table === 'Parties' ? party : guest;
        assert.equal(record.id, target.id, 'must only update linked test records');
        Object.assign(target.fields, record.fields);
      }
      return Response.json({ records });
    }
    return Response.json(table === 'Guests' ? { records: [guest] } : party);
  });
  const initial = await getParty(payload.partyId);
  assert.equal(initial.baliArrival, '');
  assert.equal(initial.baliDeparture, '');
  const first = await saveRSVP({ ...payload, baliArrival: '2027-05-18', baliDeparture: '2027-05-23',
    members: payload.members }, payload.partyId);
  assert.equal(first.baliArrival, '2027-05-18');
  assert.equal(first.baliDeparture, '2027-05-23');
  assert.equal(first.members[0].events.wedding, true);
  assert.equal(first.members[0].events.welcomeDinner, false, 'invitation limits are preserved');
  const submittedAt = first.submittedAt;
  const edited = await saveRSVP({ ...payload, baliArrival: '2027-05-15', baliDeparture: '2027-05-22' }, payload.partyId);
  assert.equal(edited.baliArrival, '2027-05-15');
  assert.equal(edited.baliDeparture, '2027-05-22');
  assert.equal(edited.submittedAt, submittedAt);
  const legacy = await saveRSVP(payload, payload.partyId);
  assert.equal(legacy.baliArrival, '2027-05-15');
  assert.equal(legacy.baliDeparture, '2027-05-22');
  const cleared = await saveRSVP({ ...payload, baliArrival: '', baliDeparture: '' }, payload.partyId);
  assert.equal(cleared.baliArrival, '');
  assert.equal(cleared.baliDeparture, '');
  const finalPatch = writes.filter((write) => write.table === 'Parties').at(-1).records[0].fields;
  assert.equal(finalPatch['Bali Arrival'], null);
  assert.equal(finalPatch['Bali Departure'], null);
  assert.equal(finalPatch.Phone, payload.phone);
  const contact = { ...payload.members[0], email: 'other@example.test', phone: '+61 411 222 333' };
  const added = await saveRSVP({ ...payload, members: [contact] }, payload.partyId);
  assert.equal(added.members[0].email, contact.email);
  assert.equal(added.members[0].phone, contact.phone);
  const omitted = await saveRSVP(payload, payload.partyId);
  assert.equal(omitted.members[0].email, contact.email);
  assert.equal(omitted.members[0].phone, contact.phone);
  const blank = await saveRSVP({ ...payload, members: [{ ...contact, email: '', phone: '' }] }, payload.partyId);
  assert.equal(blank.members[0].email, '');
  assert.equal(blank.members[0].phone, '');
  party.fields.Email = 'host-provided@example.test';
  delete party.fields['Submitted At'];
  const protectedFirst = await saveRSVP({ ...payload, email: 'claimant@example.test' }, payload.partyId, true);
  assert.equal(protectedFirst.email, 'host-provided@example.test');
  assert.ok(!Object.hasOwn(writes.filter((w) => w.table === 'Parties').at(-1).records[0].fields, 'Email'));
  const protectedEdit = await saveRSVP({ ...payload, email: 'claimant@example.test' }, payload.partyId);
  assert.equal(protectedEdit.email, 'host-provided@example.test');
  const verifiedEdit = await saveRSVP({ ...payload, email: 'verified@example.test' }, payload.partyId, true);
  assert.equal(verifiedEdit.email, 'verified@example.test');
  party.fields.Email = '';
  const clearedByHost = await saveRSVP(payload, payload.partyId);
  assert.equal(clearedByHost.email, '', 'only first enrollment or OTP proof may set Email');
  const writeCount = writes.length;
  await assert.rejects(saveRSVP({ ...payload, members: [{ ...contact, id: 'recUNRELATED00000' }] }, payload.partyId), /Unauthorized guest/);
  await assert.rejects(saveRSVP(payload, 'rec00000000000099'), /Unauthorized party/);
  assert.equal(writes.length, writeCount, 'reject the entire request before any writes');

});

import { createRSVPAPI } from "../src/lib/rsvp-api.ts";
import { SESSION_COOKIE, CHALLENGE_COOKIE, cookieValue, digest, signSession, readSession, HELP } from "../src/lib/rsvp-security.ts";
import { createRSVPStore, otpKey, REDIS_PREFIX, PARTY_SEND_LIMIT, limitRequest, redis as realRedis } from "../src/lib/rsvp-store.ts";
import { fakeRedis } from "./helpers/redis.mjs";
import { readFile } from "node:fs/promises";

process.env.RSVP_SESSION_SECRET = "test-only-session-secret-with-at-least-32-characters";
process.env.RSVP_SITE_ORIGIN = "https://wedding.example.test";

const origin = "https://wedding.example.test";
const guestId = payload.members[0].id;
const otherParty = "rec00000000000099";
const otherGuest = "rec00000000000098";
function request(path, body, headers = {}) {
  return new Request(origin + path, { method: body === undefined ? "GET" : "POST",
    headers: { origin, "content-type": "application/json", ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
function responseCookies(response) { return response.headers.getSetCookie().map((c) => c.split(";")[0]).join("; "); }
function makeHarness(submitted = false, options = {}) {
  let now = Date.now();
  let state;
  const party = { id: payload.partyId, code: "old-link", name: "Private party", email: submitted ? "guest@example.test" : "", phone: "+61400000000",
    submittedAt: submitted ? "2026-10-01T00:00:00.000Z" : null, members: [{ ...payload.members[0], name: "Test Guest" }], ...options };
  const redis = fakeRedis(() => now);
  const securityStore = createRSVPStore(redis);
  const deliveries = [];
  const writes = [];
  const deps = {
    ...securityStore, now: () => now, code: () => "123456",
    findExactGuest: async (name) => normalizeName(name) === "test guest" ? { partyId: party.id, guestId } : null,
    getParty: async (id) => { assert.equal(id, party.id); return structuredClone(party); },
    saveOTPState: async (id, hash, expires, attempts) => { assert.equal(id, party.id); state = { hash, expires, attempts }; },
    sendCode: async (email, code) => deliveries.push({ email, code }),
    saveRSVP: async (submission, id, emailVerified) => {
      assert.equal(id, party.id); writes.push(submission);
      if (!party.email || emailVerified) party.email = submission.email;
      party.submittedAt ||= new Date(now).toISOString();
      return structuredClone(party);
    },
  };
  return { api: createRSVPAPI(deps), deps, party, deliveries, writes, redis,
    advance: (ms) => { now += ms; }, get state() { return state; } };
}
async function lookup(h, name = "Test Guest") { return h.api.lookup(request("/api/rsvp/search", { name })); }
async function firstSession(h) {
  const response = await send(h, await challengeHeaders(h));
  const data = await response.json();
  assert.equal(data.next, "form");
  return { cookie: responseCookies(response), "x-rsvp-visit": data.visit };
}
async function challengeHeaders(h) {
  const response = await lookup(h);
  assert.deepEqual(await response.json(), { next: "continue" });
  return { cookie: responseCookies(response) };
}
async function send(h, headers) { return h.api.send(request("/api/rsvp/otp/send", {}, headers)); }
async function verify(h, headers, code = "123456") { return h.api.verify(request("/api/rsvp/otp/verify", { code }, headers)); }

// Real Airtable adapter checks: formulas and defensive equality, no live records.
test("lookup matches normalized full names or AKA exactly, never substrings or ambiguous matches", async (t) => {
  process.env.AIRTABLE_BASE_ID = "test-base"; process.env.AIRTABLE_PAT = "test-token";
  let records = [{ id: guestId, fields: { "Full Name": "  Test   Guest  ", "Nickname / Also Known As": "T Guest", Parties: [payload.partyId] } }];
  t.mock.method(globalThis, "fetch", async (url) => {
    const formula = new URL(url).searchParams.get("filterByFormula");
    assert.ok(formula.includes("REGEX_REPLACE")); assert.ok(!formula.includes("FIND("));
    assert.equal(new URL(url).searchParams.get("maxRecords"), "2");
    return Response.json({ records });
  });
  assert.equal(normalizeName(" TEST\t  Guest\n"), "test guest");
  assert.deepEqual(await findExactGuest("TEST  GUEST"), { partyId: payload.partyId, guestId });
  assert.deepEqual(await findExactGuest("t guest"), { partyId: payload.partyId, guestId });
  records[0].fields["Nickname / Also Known As"] = "TG";
  assert.deepEqual(await findExactGuest("tg"), { partyId: payload.partyId, guestId });
  for (const name of ["Test", "Guest", "Guest Test", "Test Guest Other", "x", "x".repeat(101)]) assert.equal(await findExactGuest(name), null);
  records = [...records, { ...records[0], id: otherGuest }];
  assert.equal(await findExactGuest("Test Guest"), null);
  records = [];
  assert.equal(await findExactGuest("Missing Guest"), null);
});

test("public lookup has no enumeration list, ids, party names, or already-replied badges", async () => {
  const h = makeHarness(true);
  const denied = await h.api.searchGET(request("/api/rsvp/search?q=Test"));
  assert.equal(denied.status, 405);
  for (const name of ["Nobody Here", "Test", "Guest", ""]) {
    const response = await lookup(h, name);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { next: "help", message: HELP });
  }
  const response = await lookup(h);
  const raw = await response.text();
  for (const privateValue of [payload.partyId, guestId, "Private party", "guest@example.test", "members", "alreadySubmitted", "matches"]) assert.ok(!raw.includes(privateValue));
  assert.equal(response.headers.get("cache-control"), "private, no-store, max-age=0");
});

test("unsubmitted match gets a scoped session; unauthenticated and cross-party read/write are rejected", async () => {
  const h = makeHarness();
  for (const path of ["/api/rsvp", `/api/rsvp?party=${payload.partyId}`, "/api/rsvp?code=old-link"]) assert.equal((await h.api.get(request(path))).status, 401);
  assert.equal((await h.api.post(request("/api/rsvp", payload))).status, 401);
  const headers = await firstSession(h);
  const response = await h.api.get(request("/api/rsvp", undefined, headers));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).respondingGuestId, guestId);
  assert.equal((await h.api.get(request(`/api/rsvp?party=${otherParty}`, undefined, headers))).status, 403);
  assert.equal((await h.api.get(request("/api/rsvp?code=old-link", undefined, headers))).status, 403);
  assert.equal((await h.api.post(request("/api/rsvp", { ...payload, partyId: otherParty }, headers))).status, 403);
  assert.equal((await h.api.post(request("/api/rsvp", { ...payload, members: [{ ...payload.members[0], id: otherGuest }] }, headers))).status, 403);
  assert.equal(h.writes.length, 0);
  const saved = await h.api.post(request("/api/rsvp", { ...payload, partyId: undefined }, headers));
  assert.equal(saved.status, 200);
  const continued = { ...headers, cookie: responseCookies(saved) };
  assert.equal((await h.api.get(request("/api/rsvp", undefined, continued))).status, 200);
  // Pre-submit tokens and later visits lacking the memory-only visit token cannot reopen it.
  assert.equal((await h.api.get(request("/api/rsvp", undefined, headers))).status, 401);
  assert.equal((await h.api.get(request("/api/rsvp", undefined, { cookie: continued.cookie }))).status, 401);
  assert.equal((await (await lookup(h)).json()).next, "continue");
});

test("session signing rejects tampering, expiry, wrong visit and wrong cookie flags", async () => {
  const h = makeHarness();
  const response = await send(h, await challengeHeaders(h));
  const data = await response.json();
  const setCookie = response.headers.getSetCookie().find((v) => v.startsWith(`${SESSION_COOKIE}=`));
  for (const flag of ["HttpOnly", "Secure", "SameSite=Lax", "Path=/", "Max-Age=1800"]) assert.ok(setCookie.includes(flag));
  const token = setCookie.split(";")[0].slice(SESSION_COOKIE.length + 1);
  assert.ok(readSession(token, data.visit));
  assert.equal(readSession(token + "extra", data.visit), null);
  assert.equal(readSession("x" + token.slice(1), data.visit), null);
  assert.equal(readSession(token, "other-visit"), null);
  assert.equal(readSession(token, data.visit, Date.now() + 1800001), null);
  const forged = signSession({ partyId: otherParty, guestId, visitHash: digest(`visit:${data.visit}`), submittedAt: null, expires: Date.now() - 1 });
  assert.equal(readSession(forged, data.visit), null);
});

test("submitted party requires emailed OTP; destination is Parties.Email and code is single use", async () => {
  const h = makeHarness(true);
  const headers = await challengeHeaders(h);
  assert.equal((await h.api.get(request("/api/rsvp", undefined, headers))).status, 401);
  assert.equal((await send(h, headers)).status, 200);
  assert.deepEqual(h.deliveries, [{ email: "guest@example.test", code: "123456" }]);
  assert.notEqual(h.state.hash, "123456"); assert.equal(h.state.hash.length, 64);
  const results = await Promise.all([verify(h, headers), verify(h, headers)]);
  assert.equal(results.filter((r) => r.status === 200).length, 1, "parallel guesses cannot both consume the code");
  assert.equal((await verify(h, headers)).status, 400);
  const success = results.find((r) => r.status === 200);
  const session = { cookie: responseCookies(success), "x-rsvp-visit": (await success.json()).visit };
  assert.equal((await h.api.get(request("/api/rsvp", undefined, session))).status, 200);
  assert.equal((await h.api.post(request("/api/rsvp", { ...payload, email: "replacement@example.test" }, session))).status, 200);
});

test("OTP expires, counts malformed/wrong attempts, locks at five, and enforces resend cooldown", async () => {
  const h = makeHarness(true); const headers = await challengeHeaders(h);
  assert.equal((await send(h, headers)).status, 200);
  assert.equal((await send(h, headers)).status, 429);
  for (const code of ["999999", "000000", "bad", "111111", "222222"]) assert.equal((await verify(h, headers, code)).status, 400);
  assert.equal(h.state.attempts, 5);
  assert.equal((await verify(h, headers)).status, 400);
  h.advance(61000);
  assert.equal((await send(h, headers)).status, 200);
  h.advance(600001);
  assert.equal((await verify(h, headers)).status, 401);
  // Direct atomic-store expiry check, independent of challenge-cookie expiry.
  const expired = await h.deps.consumeOTP(payload.partyId, cookieValue(request("/", undefined, headers), CHALLENGE_COOKIE), digest(`otp:${payload.partyId}:123456`), digest("email:guest@example.test"), h.deps.now());
  assert.equal(expired.ok, false);
});

test("resend invalidates old code and a changed primary email invalidates an outstanding code", async () => {
  const h = makeHarness(true); const headers = await challengeHeaders(h);
  await send(h, headers); h.advance(61000);
  const newer = createRSVPAPI({ ...h.deps, code: () => "654321" });
  assert.equal((await newer.send(request("/api/rsvp/otp/send", {}, headers))).status, 200);
  assert.equal((await verify(h, headers, "123456")).status, 400);
  h.party.email = "different@example.test";
  assert.equal((await verify(h, headers, "654321")).status, 400);
});

test("sending late in a lookup renews the challenge for the full code lifetime", async () => {
  const h = makeHarness(true); const headers = await challengeHeaders(h);
  h.advance(9 * 60 * 1000);
  const sent = await send(h, headers);
  assert.equal(sent.status, 200);
  assert.match(sent.headers.getSetCookie()[0], /Max-Age=600/);
  h.advance(2 * 60 * 1000);
  assert.equal((await verify(h, headers)).status, 200);
});

test("missing email uses friendly generic help; missing security fields/store fail closed", async () => {
  const missing = makeHarness(true, { email: "" });
  const missingHeaders = await challengeHeaders(missing);
  assert.deepEqual(await (await send(missing, missingHeaders)).json(), { error: HELP });
  const h = makeHarness(true); const headers = await challengeHeaders(h);
  const api = createRSVPAPI({ ...h.deps, saveOTPState: async () => { throw new Error("missing schema"); } });
  assert.equal((await api.send(request("/api/rsvp/otp/send", {}, headers))).status, 503);
  assert.equal(h.deliveries.length, 0);
  assert.equal((await verify(h, headers)).status, 400);
  const unavailable = createRSVPAPI({ ...h.deps, limitRequest: async () => { throw new Error("missing Redis"); } });
  assert.equal((await unavailable.lookup(request("/api/rsvp/search", { name: "Test Guest" }))).status, 503);
});

test("CSRF, lookup/send/verify limits, private caching and malformed body protection", async () => {
  const h = makeHarness();
  for (const method of ["lookup", "send", "verify", "post"]) {
    for (const originHeader of ["https://evil.example", "null", ""]) {
      const response = await h.api[method](request("/api/rsvp", payload, { origin: originHeader }));
      assert.equal(response.status, 403); assert.match(response.headers.get("cache-control"), /private, no-store/);
    }
  }
  for (let n = 0; n < 10; n++) await lookup(h, "Missing Guest");
  assert.equal((await lookup(h)).status, 429);
  const sent = makeHarness(true); const headers = await challengeHeaders(sent);
  for (let n = 0; n < PARTY_SEND_LIMIT; n++) { assert.equal((await send(sent, headers)).status, 200); sent.advance(61000); }
  assert.equal((await send(sent, headers)).status, 429);
  const verifyH = makeHarness(true); const verifyHeaders = await challengeHeaders(verifyH);
  for (let n = 0; n < 15; n++) await verify(verifyH, verifyHeaders);
  assert.equal((await verify(verifyH, verifyHeaders)).status, 429);
  const bad = makeHarness();
  assert.equal((await bad.api.lookup(new Request(origin + "/api/rsvp/search", { method: "POST", headers: { origin, "content-type": "application/json" }, body: "not json" }))).status, 400);
  assert.equal((await bad.api.lookup(request("/api/rsvp/search", { name: "x".repeat(65000) }))).status, 413);
});

test("legacy route always redirects to exact-name flow, including submitted-party codes", async () => {
  const source = await readFile(new URL("../src/app/rsvp/[code]/page.tsx", import.meta.url), "utf8");
  assert.match(source, /redirect\("\/rsvp"\)/); assert.ok(!source.includes("getParty"));
  const h = makeHarness(true);
  assert.equal((await h.api.get(request("/api/rsvp?code=old-link"))).status, 401);
  assert.equal((await (await lookup(h)).json()).next, "continue");
});

test("secondary contact validation preserves omitted fields and permits explicit clearing", () => {
  for (const fields of [{}, { email: "", phone: "" }, { email: "other@example.test" }, { phone: "+94 77 123 4567" }]) {
    const parsed = parseSubmission({ ...payload, members: [{ ...payload.members[0], ...fields }] });
    assert.ok(parsed);
    assert.equal(parsed.members[0].email, fields.email);
    assert.equal(parsed.members[0].phone, fields.phone);
  }
  for (const fields of [{ email: "invalid" }, { email: "a".repeat(321) + "@test.com" }, { email: null }, { phone: "123" }, { phone: "abc12345678" }, { phone: null }]) {
    assert.equal(parseSubmission({ ...payload, members: [{ ...payload.members[0], ...fields }] }), null);
  }
  assert.equal(parseSubmission({ ...payload, members: [payload.members[0], payload.members[0]] }), null);
  assert.equal(parseSubmission({ ...payload, email: "" }), null);
});

test("production shared-store adapter uses atomic Lua and trusted Vercel IP, never in-memory fallback", async (t) => {
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  process.env.VERCEL = "1";
  t.after(() => { delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.UPSTASH_REDIS_REST_TOKEN; delete process.env.VERCEL; });
  const commands = [];
  t.mock.method(globalThis, "fetch", async (_url, init) => {
    commands.push(JSON.parse(init.body)); return Response.json({ result: 1 });
  });
  await limitRequest(request("/api/rsvp", undefined, { "x-vercel-forwarded-for": "1.2.3.4", "x-forwarded-for": "evil" }), "lookup");
  assert.equal(commands[0][0], "EVAL");
  assert.equal(commands[0][3], `${REDIS_PREFIX}rsvp:limit:${digest("lookup:ip:1.2.3.4")}`);
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  await assert.rejects(realRedis("GET", `${REDIS_PREFIX}anything`), /unavailable/);
});


test("lookup has identical bodies and cookie types regardless of submission state or email", async () => {
  const responses = [];
  for (const submitted of [false, true]) {
    for (const email of ["", "guest@example.test", "invalid"]) {
      const h = makeHarness(submitted, { email });
      const response = await lookup(h);
      assert.equal(response.status, 200);
      responses.push(await response.json());
      const cookies = response.headers.getSetCookie();
      assert.ok(cookies.some((c) => c.startsWith(`${SESSION_COOKIE}=;`)));
      assert.ok(cookies.some((c) => c.startsWith(`${CHALLENGE_COOKIE}=`) && c.includes("Max-Age=600")));
    }
  }
  for (const response of responses) assert.deepEqual(response, { next: "continue" });
});

test("email on file requires proof even before first submission, and never leaks a hint", async () => {
  const h = makeHarness(false, { email: "host-provided@example.test" });
  const headers = await challengeHeaders(h);
  const sent = await send(h, headers);
  assert.deepEqual(await sent.json(), { message: "Your code has been sent. It is valid for 10 minutes." });
  assert.equal((await h.api.get(request("/api/rsvp", undefined, headers))).status, 401);
  assert.equal(h.deliveries[0].email, "host-provided@example.test");
  const verified = await verify(h, headers);
  const session = { cookie: responseCookies(verified), "x-rsvp-visit": (await verified.json()).visit };
  assert.equal((await h.api.post(request("/api/rsvp", payload, session))).status, 200);
  assert.equal(h.writes[0].email, "host-provided@example.test");
});

test("name-only first sessions save answers while preserving a newly populated email", async () => {
  const h = makeHarness();
  const headers = await firstSession(h);
  h.party.email = "host-provided@example.test";
  // An older first-visit tab must also be safe if the host populated Email meanwhile.
  const saved = await h.api.post(request("/api/rsvp", { ...payload, email: "attacker@example.test" }, headers));
  assert.equal(saved.status, 200);
  assert.equal(h.writes[0].email, "host-provided@example.test");
  assert.equal(h.party.email, "host-provided@example.test");
  const continued = { ...headers, cookie: responseCookies(saved) };
  assert.equal((await h.api.post(request("/api/rsvp", payload, continued))).status, 200);
  assert.equal(h.party.email, "host-provided@example.test");
  const other = await challengeHeaders(h);
  await send(h, other);
  assert.equal(h.deliveries[0].email, "host-provided@example.test");
});

test("empty Email can be enrolled once; same first-visit session cannot later change it", async () => {
  const h = makeHarness();
  const headers = await firstSession(h);
  const saved = await h.api.post(request("/api/rsvp", payload, headers));
  assert.equal(h.party.email, payload.email);
  const continued = { ...headers, cookie: responseCookies(saved) };
  const edited = await h.api.post(request("/api/rsvp", { ...payload, email: "replacement@example.test" }, continued));
  assert.equal(edited.status, 200);
  assert.equal((await edited.json()).canChangeEmail, false);
  assert.equal(h.party.email, payload.email);
  h.party.email = "";
  assert.equal((await h.api.post(request("/api/rsvp", payload, continued))).status, 400,
    "a continued name-only session cannot re-enroll a host-cleared submitted email");
});

test("another browser cannot spend a delivered code's attempts, even after its own send", async () => {
  const h = makeHarness(true);
  const real = await challengeHeaders(h);
  const attacker = await challengeHeaders(h);
  await send(h, real);
  for (let i = 0; i < 5; i++) assert.equal((await verify(h, attacker, "bad")).status, 400);
  assert.equal(h.state.attempts, 0);
  await send(h, attacker);
  for (let i = 0; i < 5; i++) assert.equal((await verify(h, attacker, "bad")).status, 400);
  assert.equal(h.state.attempts, 5, "party mirror can reflect the other challenge without affecting authorization");
  assert.equal((await verify(h, real)).status, 200);
});

test("codes from independent deliveries coexist; resend only replaces its own challenge", async () => {
  const h = makeHarness(true);
  const first = await challengeHeaders(h), second = await challengeHeaders(h);
  await send(h, first);
  const other = createRSVPAPI({ ...h.deps, code: () => "654321" });
  await other.send(request("/api/rsvp/otp/send", {}, second));
  assert.equal((await verify(h, second, "123456")).status, 400);
  assert.equal((await verify(h, first, "654321")).status, 400);
  assert.equal((await verify(h, first, "123456")).status, 200);
  assert.equal((await verify(h, second, "654321")).status, 200);
});

test("atomic send admission ignores cooldown rejections and caps parallel browsers at five/hour", async () => {
  const h = makeHarness(true);
  const headers = await challengeHeaders(h);
  assert.equal((await send(h, headers)).status, 200);
  for (let i = 0; i < 3; i++) assert.equal((await send(h, headers)).status, 429);
  const browsers = await Promise.all(Array.from({ length: 5 }, () => challengeHeaders(h)));
  const sent = await Promise.all(browsers.map((browser) => send(h, browser)));
  assert.equal(sent.filter((r) => r.status === 200).length, 4);
  assert.equal(h.deliveries.length, 5);
  // Rejected traffic does not renew the party window or invalidate existing codes.
  h.advance(10 * 60 * 1000);
  const fresh = await challengeHeaders(h);
  assert.equal((await send(h, fresh)).status, 429);
  h.advance(50 * 60 * 1000 + 1);
  assert.equal((await send(h, await challengeHeaders(h))).status, 200);
});

test("every production key is namespaced; broad, unknown-script and raw-key commands fail locally", async (t) => {
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  t.after(() => { delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.UPSTASH_REDIS_REST_TOKEN; });
  const commands = [], backend = fakeRedis(() => Date.now());
  t.mock.method(globalThis, "fetch", async (_url, init) => {
    const command = JSON.parse(init.body); commands.push(command);
    const keys = command[0] === "EVAL" ? command.slice(3, 3 + command[2]) : command.slice(1, 2);
    for (const key of keys) assert.ok(key.startsWith("wedding:"), key);
    return Response.json({ result: await backend(...command) });
  });
  const store = createRSVPStore();
  const challenge = "a".repeat(43);
  await store.limit("test", 10, 600);
  await store.createChallenge(challenge, { partyId: payload.partyId, guestId });
  assert.ok(await store.getChallenge(challenge));
  await store.reserveFirstSubmit(payload.partyId, "visit");
  await assert.rejects(store.reserveFirstSubmit(payload.partyId, "other-visit"), /find your invitation/);
  const state = { hash: "test-hash", emailHash: "test-email", expires: Date.now() + 600000, attempts: 0 };
  await store.startOTP(payload.partyId, challenge, state);
  await store.activateOTP(payload.partyId, challenge, state.hash);
  assert.equal((await store.consumeOTP(payload.partyId, challenge, state.hash, state.emailHash, Date.now())).ok, true);
  assert.ok(commands.some((c) => c.includes(otpKey(payload.partyId, challenge))));
  const before = commands.length;
  for (const command of [["KEYS", "*"], ["SCAN", 0], ["FLUSHDB"], ["FLUSHALL"], ["GET", "rsvp:raw"], ["SET", "other-app:key", "bad"], ["EVAL", "return 1", 1, "wedding:test"]]) {
    await assert.rejects(realRedis(...command), /Unsafe/);
  }
  assert.equal(commands.length, before);
});
