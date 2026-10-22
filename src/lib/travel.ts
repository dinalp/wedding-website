import { at } from "./airtable";

// Written by the "Bali Flight Watch" and "Uluwatu Stay Watch" Claude routines.
const FLIGHT_LOG = "tblXg2RRTEgBPD7D8";
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

export interface FlightCheck {
  date: string;
  cheapest: number | null;
  cheapestAirline: string;
  cheapestDates: string;
  fullService: number | null;
  fullServiceAirline: string;
  signal: string;
  sale: string;
}

interface FlightFields {
  "Check Date"?: string;
  "Cheapest Return (A$)"?: number;
  "Cheapest Airline"?: string;
  "Cheapest Dates"?: string;
  "Full-Service Direct (A$)"?: number;
  "Full-Service Airline"?: string;
  Signal?: string;
  "Active Sale"?: string;
}

/** One row per check date, oldest first. Notes/Source are couple-only and never fetched. */
export async function getFlightChecks(): Promise<FlightCheck[]> {
  const rows = await listAll<FlightFields>(FLIGHT_LOG, [
    "Check Date",
    "Cheapest Return (A$)",
    "Cheapest Airline",
    "Cheapest Dates",
    "Full-Service Direct (A$)",
    "Full-Service Airline",
    "Signal",
    "Active Sale",
  ]);
  const byDate = new Map<string, FlightCheck>();
  for (const f of rows) {
    if (!f["Check Date"]) continue;
    byDate.set(f["Check Date"], {
      date: f["Check Date"],
      cheapest: f["Cheapest Return (A$)"] ?? null,
      cheapestAirline: f["Cheapest Airline"] ?? "",
      cheapestDates: f["Cheapest Dates"] ?? "",
      fullService: f["Full-Service Direct (A$)"] ?? null,
      fullServiceAirline: f["Full-Service Airline"] ?? "",
      signal: f.Signal ?? "",
      sale: f["Active Sale"] ?? "",
    });
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
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
