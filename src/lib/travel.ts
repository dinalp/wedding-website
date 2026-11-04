import { at } from "./airtable";
import { buildFlightData, type FlightOption } from "./flight-data";
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
  const rows = await listAll<FlightOptionFields>(FLIGHT_OPTIONS, [
    "Airline",
    "Check Date",
    "From",
    "Depart",
    "Return",
    "Price (A$)",
    "Stops",
    "Details",
    "Link",
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
  return buildFlightData(raw, new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" }));
}
