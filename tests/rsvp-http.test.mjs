import test from "node:test";
import assert from "node:assert/strict";
import { readFile, unlink } from "node:fs/promises";

const origin = process.env.RSVP_TEST_ORIGIN;
test("built Next app: first response, return visit, OTP and secondary contacts", { skip: !origin }, async (t) => {
  t.after(async () => { await unlink("output/rsvp-preview-code.txt").catch(() => {}); });
  assert.equal(origin, "http://127.0.0.1:3137", "only the documented synthetic local preview may be tested");
  let cookie = "";
  let visit = "";
  const call = async (path, body) => {
    const response = await fetch(origin + path, { method: body === undefined ? "GET" : "POST", redirect: "manual",
      headers: { origin, "content-type": "application/json", cookie, "x-rsvp-visit": visit },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    if (response.headers.getSetCookie().length) cookie = response.headers.getSetCookie().map((v) => v.split(";")[0]).join("; ");
    assert.match(response.headers.get("cache-control") || "", /private, no-store/);
    return { status: response.status, body: await response.json() };
  };
  assert.equal((await call("/api/rsvp?party=rec00000000000001")).status, 401);
  const legacy = await fetch(origin + "/rsvp/test-code", { redirect: "manual" });
  assert.equal(legacy.status, 307); assert.equal(legacy.headers.get("location"), "/rsvp");
  const lookup = await call("/api/rsvp/search", { name: "Test Guest" });
  assert.equal(lookup.body.next, "continue");
  const first = await call("/api/rsvp/otp/send", {});
  assert.equal(first.body.next, "form"); visit = first.body.visit;
  const initial = await call("/api/rsvp");
  assert.equal(initial.status, 200); assert.equal(initial.body.name, "Test Party");
  assert.equal(initial.body.respondingGuestId, "rec00000000000002");
  const save = await call("/api/rsvp", { ...initial.body, email: "primary@example.test", phone: "+61 400 000 000",
    members: initial.body.members.map((m, i) => ({ ...m, attending: true, events: { wedding: true },
      ...(i === 1 ? { email: "secondary@example.test", phone: "+61 411 222 333" } : {}) })) });
  assert.equal(save.status, 200); assert.ok(save.body.submittedAt);
  assert.equal(save.body.members[1].email, "secondary@example.test");
  assert.equal(save.body.members[1].phone, "+61 411 222 333");
  assert.equal((await call("/api/rsvp")).status, 200, "confirmation continues in current visit");
  visit = "";
  assert.equal((await call("/api/rsvp")).status, 401, "later visit cannot reuse cookie alone");
  const returning = await call("/api/rsvp/search", { name: "Test Guest" });
  assert.deepEqual(returning.body, { next: "continue" });
  assert.equal((await call("/api/rsvp/otp/send", {})).status, 200);
  const code = await readFile("output/rsvp-preview-code.txt", "utf8");
  const verification = await call("/api/rsvp/otp/verify", { code });
  assert.equal(verification.status, 200); visit = verification.body.visit;
  const reopened = await call("/api/rsvp");
  assert.equal(reopened.status, 200);
  assert.equal(reopened.body.members[1].email, "secondary@example.test");
});
