import { at } from "./airtable";
import { buildFlightData, withHistoricalTrend, type FlightOption } from "./flight-data";
export type { FlightOption } from "./flight-data";

// Written by the "Bali Flight Watch" and "Uluwatu Stay Watch" Claude routines.
const STAY_LOG = "tblEvqcQM4JsxlaB5";

// The routines log at most once a day, so an hourly refresh is plenty.
const HOURLY = { cache: "force-cache", next: { revalidate: 3600 } } as const;

async function listAll<F>(table: string, fields: string[]): Promise<F[]> {
  const out: F[] = [];
  let offset: string | undefined;
  do {
    const page = await at<{ records: { fields: F }[]; offset?: string }>(table, {
      ...HOURLY,
      query: {
        "fields[]": fields,
        "sort[0][field]": "Check Date",
        ...(offset ? { offset } : {}),
      },
    });
    out.push(...page.records.map((r) => r.fields));
    offset = page.offset;
  } while (offset);
  return out;
}

export interface Stay {
  date: string;
  property: string;
  category: string;
  area: string;
  sleeps: number | null;
  nightly: number | null;
  perPerson: number | null;
  rating: string;
  platform: string;
  link: string;
  image: string;
  estimate: boolean;
}

interface StayFields {
  "Check Date"?: string;
  Property?: string;
  Category?: string;
  Area?: string;
  Sleeps?: number;
  "Nightly (A$)"?: number;
  "Per Person Per Night (A$)"?: number;
  Rating?: string;
  Platform?: string;
  Link?: string;
  Image?: string;
  Estimate?: boolean;
}

export async function getStays(): Promise<Stay[]> {
  const rows = await listAll<StayFields>(STAY_LOG, [
    "Check Date",
    "Property",
    "Category",
    "Area",
    "Sleeps",
    "Nightly (A$)",
    "Per Person Per Night (A$)",
    "Rating",
    "Platform",
    "Link",
    "Image",
    "Estimate",
  ]);
  return rows
    .filter((f) => f["Check Date"] && f.Property)
    .map((f) => ({
      date: f["Check Date"]!,
      property: f.Property!,
      category: f.Category ?? "",
      area: f.Area ?? "",
      sleeps: f.Sleeps ?? null,
      nightly: f["Nightly (A$)"] ?? null,
      perPerson: f["Per Person Per Night (A$)"] ?? null,
      rating: f.Rating ?? "",
      platform: f.Platform ?? "",
      link: f.Link ?? "",
      image: f.Image ?? "",
      estimate: f.Estimate === true,
    }));
}

/** Per check date: median and cheapest A$ per person per night, oldest first. */
export function stayTrend(stays: Stay[]) {
  const byDate = new Map<string, number[]>();
  for (const s of stays) {
    if (s.perPerson == null) continue;
    byDate.set(s.date, [...(byDate.get(s.date) ?? []), s.perPerson]);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => {
      v.sort((a, b) => a - b);
      const mid = v.length >> 1;
      const median = v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
      return { date, median: Math.round(median), min: v[0] };
    });
}

const FLIGHT_OPTIONS = "tblA9A5l4U3cLAANV";

interface FlightOptionFields {
  Airline?: string;
  "Check Date"?: string;
  From?: string;
  Depart?: string;
  Return?: string;
  "Price (A$)"?: number;
  Stops?: number;
  Details?: string;
  Link?: string;
}

/** Derive both the trend and latest list from individual fare observations. */
export async function getFlightData() {
  const [rows, published, history] = await Promise.all([listAll<FlightOptionFields>(FLIGHT_OPTIONS, [
    "Airline",
    "Check Date",
    "From",
    "Depart",
    "Return",
    "Price (A$)",
    "Stops",
    "Details",
    "Link",
  ]).catch(() => [] as FlightOptionFields[]), getPublishedFlights(),
    listAll<{ "Check Date"?: string; "Cheapest Return (A$)"?: number }>("tblXg2RRTEgBPD7D8", [
      "Check Date", "Cheapest Return (A$)",
    ]).catch(() => []),
  ]);
  const raw: FlightOption[] = rows.map((f) => ({
    date: f["Check Date"] ?? "",
    airline: f.Airline ?? "",
    from: f.From ?? "",
    depart: f.Depart ?? "",
    return: f.Return ?? "",
    price: f["Price (A$)"] ?? null,
    stops: f.Stops ?? null,
    details: f.Details ?? "",
    link: f.Link ?? "",
  }));
  const data = buildFlightData([...raw, ...published.quotes], new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" }));
  return {
    ...data,
    trend: withHistoricalTrend(data.checks, history.map((f) => ({ date: f["Check Date"] ?? "", cheapest: f["Cheapest Return (A$)"] ?? null }))),
    publishedStatus: published.status,
  };
}

/** Public observations only; the scheduled collector has no access to wedding guest data. */
async function getPublishedFlights(): Promise<{ quotes: FlightOption[]; status: string }> {
  try {
    const response = await fetch("https://raw.githubusercontent.com/dinalp/wedding-website/flight-data/quotes.json", {
      ...HOURLY, signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Source feed unavailable");
    const data = await response.json();
    if (data.version !== 1 || !Array.isArray(data.runs)) throw new Error("Invalid source feed");
    const quotes: FlightOption[] = [];
    for (const run of data.runs) {
      if (run.source !== "I Want That Flight" || run.status !== "success" || !Array.isArray(run.quotes)) continue;
      for (const quote of run.quotes) {
        if (!quote || quote.date !== run.date || quote.from !== "SYD" || quote.stops !== null ||
            ![quote.date, quote.airline, quote.depart, quote.return, quote.details, quote.link].every((s) => typeof s === "string") ||
            typeof quote.price !== "number") continue;
        try {
          const link = new URL(quote.link);
          if (link.protocol !== "https:" || link.hostname !== "fly.iwantthatflight.com.au") continue;
        } catch { continue; }
        quotes.push(quote);
      }
    }
    const attempt = data.lastAttempt;
    const age = Date.now() - Date.parse(attempt?.checkedAt ?? "");
    const status = !Number.isFinite(age) || age > 36 * 3600_000 || age < -300_000
      ? "I Want That Flight has no recent collection result."
      : attempt.status === "success"
        ? "I Want That Flight prices come from searches in the previous 24 hours; recheck before booking."
        : "I Want That Flight returned no usable wedding-date listings on its latest check.";
    return { quotes, status };
  } catch {
    return { quotes: [], status: "I Want That Flight is temporarily unavailable." };
  }
}
