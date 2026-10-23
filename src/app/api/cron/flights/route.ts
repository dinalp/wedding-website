import { revalidatePath } from "next/cache";
import { at } from "@/lib/airtable";

// Runs daily via vercel.json. Looks up Google Flights (through SerpApi) for each suggested trip
// from Sydney and logs the cheapest few fares to the Flight Options table the Flights page reads.
// ponytail: 3 searches a day (~90 a month) keeps SerpApi on its free plan.

const FLIGHT_OPTIONS = "tblA9A5l4U3cLAANV";
const TRIPS = [
  ["2027-05-15", "2027-05-23"],
  ["2027-05-18", "2027-05-23"],
  ["2027-05-19", "2027-05-22"],
] as const;
const PER_TRIP = 4;

interface Segment {
  airline: string;
}
interface Itinerary {
  flights: Segment[];
  total_duration: number;
  price?: number;
}
interface SerpResult {
  best_flights?: Itinerary[];
  other_flights?: Itinerary[];
  search_metadata?: { google_flights_url?: string };
  error?: string;
}

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const key = process.env.SERPAPI_KEY;
  if (!key) return new Response("SERPAPI_KEY is not set", { status: 500 });

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });

  // Already ran today (e.g. a retry): don't spend more searches, just refresh the page.
  const existing = await at<{ records: unknown[] }>(FLIGHT_OPTIONS, {
    query: {
      filterByFormula: `AND({Check Date}='${today}', FIND('Google Flights', {Details}))`,
      maxRecords: "1",
    },
  });
  if (existing.records.length) {
    revalidatePath("/flights");
    return Response.json({ date: today, logged: 0, skipped: "already ran today" });
  }
  const records: { fields: Record<string, string | number> }[] = [];
  const errors: string[] = [];

  for (const [out, back] of TRIPS) {
    const url = new URL("https://serpapi.com/search.json");
    Object.entries({
      engine: "google_flights",
      departure_id: "SYD",
      arrival_id: "DPS",
      outbound_date: out,
      return_date: back,
      currency: "AUD",
      gl: "au",
      hl: "en",
      api_key: key,
    }).forEach(([k, v]) => url.searchParams.set(k, v));

    const data: SerpResult = await fetch(url, { cache: "no-store" }).then((r) => r.json());
    if (data.error) {
      errors.push(`${out}: ${data.error}`);
      continue;
    }

    const seen = new Set<string>();
    const fares = [...(data.best_flights ?? []), ...(data.other_flights ?? [])]
      .filter((f) => f.price != null)
      .sort((a, b) => a.price! - b.price!)
      .filter((f) => {
        // One fare per airline combination and stop count, so the list isn't five near-identical Jetstars.
        const k = `${f.flights.map((s) => s.airline).join("+")}/${f.flights.length}`;
        return !seen.has(k) && seen.add(k);
      })
      .slice(0, PER_TRIP);

    for (const f of fares) {
      const stops = f.flights.length - 1;
      const hours = `${Math.floor(f.total_duration / 60)}h ${f.total_duration % 60}m`;
      records.push({
        fields: {
          Airline: [...new Set(f.flights.map((s) => s.airline))].join(" + "),
          "Check Date": today,
          From: "SYD",
          Depart: out,
          Return: back,
          "Price (A$)": f.price!,
          Stops: stops,
          Details: `${stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}, ${hours} to Bali · Google Flights`,
          Link: data.search_metadata?.google_flights_url ?? "",
        },
      });
    }
  }

  // Airtable takes at most 10 records per request.
  for (let i = 0; i < records.length; i += 10) {
    await at(FLIGHT_OPTIONS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records: records.slice(i, i + 10), typecast: true }),
    });
  }

  revalidatePath("/flights");
  return Response.json({ date: today, logged: records.length, errors });
}
