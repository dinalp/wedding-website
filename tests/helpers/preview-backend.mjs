// Optional local browser QA: intercept every provider with synthetic records.
// Enable explicitly via RSVP_SYNTHETIC_PREVIEW=1 and NODE_OPTIONS=--import=./tests/helpers/preview-backend.mjs.
import { fakeRedis } from "./redis.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
if (process.env.RSVP_SYNTHETIC_PREVIEW !== "1") throw new Error("Synthetic preview must be explicitly enabled");
Object.assign(process.env, {
  AIRTABLE_BASE_ID: "synthetic-base", AIRTABLE_PAT: "synthetic-token",
  RSVP_SESSION_SECRET: "synthetic-only-session-secret-at-least-32-characters",
  RSVP_SITE_ORIGIN: "http://127.0.0.1:3137",
  UPSTASH_REDIS_REST_URL: "https://synthetic-redis.invalid", UPSTASH_REDIS_REST_TOKEN: "synthetic-token",
  RESEND_API_KEY: "synthetic-token", RSVP_FROM_EMAIL: "Wedding Test <rsvp@example.test>",
});
const redis = fakeRedis(() => Date.now());
const party = { id: "rec00000000000001", fields: { "Party Name": "Test Party", Code: "test-code",
  Guests: ["rec00000000000002", "rec00000000000003"], "Invited To": ["Wedding Day"] } };
const guests = [
  { id: "rec00000000000002", fields: { "Full Name": "Test Guest", Parties: [party.id] } },
  { id: "rec00000000000003", fields: { "Full Name": "Other Guest", Parties: [party.id] } },
];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  if (url.hostname === "synthetic-redis.invalid") return Response.json({ result: await redis(...JSON.parse(init.body)) });
  if (url.hostname === "api.resend.com") {
    const body = JSON.parse(init.body);
    mkdirSync("output", { recursive: true });
    writeFileSync("output/rsvp-preview-code.txt", body.text.match(/code is (\d{6})/)[1]);
    return Response.json({ id: "synthetic-email-only" });
  }
  if (url.hostname === "api.airtable.com") {
    const [, , base, table, id] = url.pathname.split("/");
    if (base !== "synthetic-base") throw new Error("Real Airtable traffic is forbidden in synthetic preview");
    if (init?.method === "PATCH") {
      const { records } = JSON.parse(init.body);
      for (const record of records) {
        const target = table === "Parties" ? party : guests.find((g) => g.id === record.id);
        if (!target || target.id !== record.id) throw new Error("Foreign synthetic record");
        Object.assign(target.fields, record.fields);
      }
      return Response.json({ records });
    }
    if (table === "Parties") return Response.json(id ? party : { records: [party] });
    if (table === "Guests") {
      const formula = url.searchParams.get("filterByFormula") || "";
      const records = formula.includes("REGEX_REPLACE") ? guests.filter((g) => formula.includes(`='${g.fields["Full Name"].toLowerCase()}'`)) : guests;
      return Response.json({ records });
    }
    return Response.json({ records: [] });
  }
  if (["localhost", "127.0.0.1", "::1"].includes(url.hostname)) return originalFetch(input, init);
  throw new Error("External traffic is disabled in synthetic preview");
};
