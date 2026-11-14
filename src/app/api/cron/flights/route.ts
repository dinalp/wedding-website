import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { at } from "@/lib/airtable";
import { FLIGHT_TRIPS, decodeFlightDetails, encodeFlightDetails, flightDetailBudget, toFlightLeg, type FlightItinerary, type FlightSegment } from "@/lib/flight-data";

const TABLE = "tblA9A5l4U3cLAANV";
export const maxDuration = 300;
interface Itinerary {
  flights: FlightSegment[];
  total_duration: number;
  price?: number;
  departure_token?: string;
  booking_token?: string;
}
interface Result {
  best_flights?: Itinerary[];
  other_flights?: Itinerary[];
  booking_options?: { together?: { price?: number; book_with?: string; baggage_prices?: string[] } }[];
  search_metadata?: { google_flights_url?: string };
  error?: string;
}
type Fields = Record<string, string | number>;
type Saved = { id: string; fields: Fields };
function authorized(req: Request, secret?: string) {
  const actual = req.headers.get("authorization") || "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return !!secret && a.length === b.length && timingSafeEqual(a, b);
}
function fares(data: Result) {
  return [...(data.best_flights ?? []), ...(data.other_flights ?? [])]
    .filter((f) => Array.isArray(f.flights) && f.flights.length > 0 && typeof f.price === "number" && Number.isFinite(f.price) && f.price > 0)
    .sort((a, b) => a.price! - b.price!);
}
async function run(manual: boolean) {
  const key = process.env.SERPAPI_KEY;
  if (!key) return Response.json({ error: "Flight search is not configured" }, { status: 503 });
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });
  if (today > "2027-05-19") return Response.json({ skipped: "Wedding search window has ended" });
  const existing = await at<{ records: Saved[] }>(TABLE, { query: { filterByFormula: `AND(DATETIME_FORMAT({Check Date}, 'YYYY-MM-DD')='${today}', FIND('Google Flights', {Details}))`, pageSize: "100" } });
  // Retry partially collected days; old date-only observations can be upgraded in place.
  if (!manual && FLIGHT_TRIPS.every(([out, back]) => existing.records.some((r) => r.fields.Depart === out && r.fields.Return === back && String(r.fields.Details).includes("[flight-details:v1]")))) {
    revalidatePath("/flights");
    return Response.json({ date: today, skipped: "Already collected today's schedules" });
  }
  const errors: string[] = [];
  let extraBudget = 0;
  let remaining: number | null = null;
  // Never enable overages. Protect the original three daily price lookups first.
  try {
    const accountUrl = new URL("https://serpapi.com/account.json");
    accountUrl.searchParams.set("api_key", key);
    const response = await fetch(accountUrl, { cache: "no-store", signal: AbortSignal.timeout(10000) });
    const account = await response.json();
    if (response.ok && Number.isFinite(account.total_searches_left)) {
      remaining = account.total_searches_left;
      extraBudget = flightDetailBudget(remaining!, account.next_reset);
      if (remaining! < 3) return Response.json({ error: "Search allowance too low; existing observations preserved", remaining }, { status: 503 });
    }
  } catch { errors.push("Could not check search allowance; extra lookups disabled"); }
  async function search(out: string, back: string, token?: { departure_token: string } | { booking_token: string }): Promise<Result> {
    const url = new URL("https://serpapi.com/search.json");
    Object.entries({ engine: "google_flights", departure_id: "SYD", arrival_id: "DPS", outbound_date: out, return_date: back, currency: "AUD", gl: "au", hl: "en", type: "1", deep_search: "true", api_key: key!, ...token }).forEach(([k, v]) => url.searchParams.set(k, v));
    try {
      const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(45000) });
      const data: Result = await response.json();
      if (!response.ok || data.error) { errors.push(`${out}: flight source returned an error`); return {}; }
      return data;
    } catch { errors.push(`${out}: flight source timed out`); return {}; }
  }
  const trips = await Promise.all(FLIGHT_TRIPS.map(async ([out, back]) => ({ out, back, data: await search(out, back) })));
  const candidates = trips.flatMap(({ out, back, data }) => {
    const seen = new Set<string>();
    return fares(data).filter((f) => {
      const identity = `${f.flights.map((s) => s.airline).join("+")}/${f.flights.length}`;
      if (seen.has(identity)) return false;
      seen.add(identity); return true;
    }).slice(0, 4).map((fare, rank) => ({ out, back, fare, rank, link: data.search_metadata?.google_flights_url || "https://www.google.com/travel/flights", details: { version: 1, outbound: toFlightLeg(fare.flights, fare.total_duration) } as FlightItinerary, price: fare.price!, airlines: fare.flights.map((f) => f.airline).filter(Boolean) as string[], bookingToken: "" }));
  }).filter((c) => c.details.outbound?.departure.slice(0, 10) === c.out && c.details.outbound?.from === "SYD" && c.details.outbound?.to === "DPS");
  // Round-robin by trip before deepening the list, so one trip cannot consume all detail lookups.
  const ordered = [...candidates].sort((a, b) => a.rank - b.rank);
  const returning = ordered.filter((c) => c.fare.departure_token).slice(0, extraBudget);
  extraBudget -= returning.length;
  await Promise.all(returning.map(async (c) => {
    const data = await search(c.out, c.back, { departure_token: c.fare.departure_token! });
    const selected = fares(data).map((fare) => ({ fare, leg: toFlightLeg(fare.flights, fare.total_duration) })).find(({ leg }) => leg?.from === "DPS" && leg.to === "SYD" && leg.departure.slice(0, 10) === c.back);
    if (!selected) return;
    c.details.inbound = selected.leg;
    // A return lookup is scoped to the selected outbound; its price is the round-trip total.
    c.price = selected.fare.price!;
    c.airlines.push(...selected.fare.flights.map((f) => f.airline).filter(Boolean) as string[]);
    c.bookingToken = selected.fare.booking_token || "";
    c.link = data.search_metadata?.google_flights_url || c.link;
  }));
  const bookings = ordered.filter((c) => c.bookingToken).slice(0, extraBudget);
  await Promise.all(bookings.map(async (c) => {
    const data = await search(c.out, c.back, { booking_token: c.bookingToken });
    const offer = (data.booking_options ?? []).map((o) => o.together).filter((o) => o && typeof o.price === "number" && Number.isFinite(o.price) && o.price > 0).sort((a, b) => a!.price! - b!.price!)[0];
    // Only a together offer covers this entire return itinerary; never combine separate-ticket allowances.
    if (offer && offer.baggage_prices?.length) {
      c.price = offer.price!;
      c.details.baggage = offer.baggage_prices.filter((b) => typeof b === "string").slice(0, 8);
      c.details.seller = offer.book_with;
    }
  }));
  const records = candidates.map((c) => {
    const outboundAirline = [...new Set(c.fare.flights.map((f) => f.airline))].join(" + ");
    const old = existing.records.find((r) => {
      if (r.fields.Depart !== c.out || r.fields.Return !== c.back) return false;
      const parsed = decodeFlightDetails(String(r.fields.Details || ""), c.out, c.back).itinerary;
      return parsed?.outbound ? JSON.stringify(parsed.outbound.flights) === JSON.stringify(c.details.outbound!.flights) : r.fields.Airline === outboundAirline && r.fields.Stops === c.details.outbound!.stops;
    });
    // A quota-limited retry must not erase a previously confirmed return itinerary.
    if (old && !c.details.inbound && decodeFlightDetails(String(old.fields.Details || ""), c.out, c.back).itinerary?.inbound) return { id: old.id, fields: old.fields };
    const leg = c.details.outbound!;
    const summary = `${leg.stops ? `${leg.stops} stop(s)` : "Direct"}, ${Math.floor(leg.duration / 60)}h ${leg.duration % 60}m to Bali · Google Flights`;
    return { ...(old ? { id: old.id } : {}), fields: { Airline: [...new Set(c.airlines)].join(" + "), "Check Date": today, From: "SYD", Depart: c.out, Return: c.back, "Price (A$)": c.price, Stops: leg.stops, Details: encodeFlightDetails(summary, c.details), Link: c.link } };
  });
  if (!records.length) return Response.json({ error: "No usable schedules returned; existing observations preserved", errors }, { status: 502 });
  for (const update of [false, true]) {
    const group = records.filter((r) => !!r.id === update);
    for (let i = 0; i < group.length; i += 10) await at(TABLE, { method: update ? "PATCH" : "POST", body: JSON.stringify({ records: group.slice(i, i + 10), typecast: true }) });
  }
  revalidatePath("/flights");
  return Response.json({ date: today, logged: records.length, outboundTimes: candidates.length, returnTimes: candidates.filter((c) => c.details.inbound).length, baggageQuotes: candidates.filter((c) => c.details.baggage?.length).length, extraSearches: returning.length + bookings.length, remainingBefore: remaining, errors });
}
export async function GET(req: Request) {
  if (!authorized(req, process.env.CRON_SECRET)) return new Response("Unauthorized", { status: 401 });
  return run(false);
}
/** A separate scoped credential supports an immediate refresh without revealing production API keys. */
export async function POST(req: Request) {
  if (!authorized(req, process.env.FLIGHT_REFRESH_SECRET)) return new Response("Unauthorized", { status: 401 });
  return run(true);
}
