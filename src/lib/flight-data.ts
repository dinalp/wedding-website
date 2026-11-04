/** All collectors and the display use the same wedding travel window. */
export const FLIGHT_TRIPS = [
  ["2027-05-15", "2027-05-23"],
  ["2027-05-18", "2027-05-23"],
  ["2027-05-19", "2027-05-22"],
] as const;

export interface FlightOption {
  date: string;
  airline: string;
  from: string;
  depart: string;
  return: string;
  price: number | null;
  /** Historical Google observations describe outbound stops only. */
  stops: number | null;
  details: string;
  link: string;
}

export interface FlightDay {
  date: string;
  cheapest: number | null;
  cheapestAirline: string;
  cheapestDates: string;
  quoteCount: number;
  sources: string[];
}

function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export interface FlightTrendPoint { date: string; cheapest: number | null }

/** Keep the earlier broad price history on the same line without replacing newer quotes. */
export function withHistoricalTrend(current: FlightTrendPoint[], history: FlightTrendPoint[]): FlightTrendPoint[] {
  if (!current.length) return [];
  const start = current[0].date;
  const end = current.at(-1)!.date;
  const byDate = new Map<string, number | null>();
  for (const point of history) {
    if (isDate(point.date) && point.date < start) {
      byDate.set(point.date, typeof point.cheapest === "number" && Number.isFinite(point.cheapest) && point.cheapest > 0 ? point.cheapest : null);
    }
  }
  for (const point of current) byDate.set(point.date, point.cheapest);
  const first = [...byDate.keys()].sort()[0];
  const trend: FlightTrendPoint[] = [];
  for (let date = first; date <= end;) {
    trend.push({ date, cheapest: byDate.get(date) ?? null });
    const next = new Date(`${date}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    date = next.toISOString().slice(0, 10);
  }
  return trend;
}

export function quoteSource(quote: FlightOption): string {
  if (/Google Flights/i.test(quote.details)) return "Google Flights";
  try {
    const host = new URL(quote.link).hostname.replace(/^www\./, "");
    const names: Record<string, string> = {
      "fly.iwantthatflight.com.au": "I Want That Flight",
      "iwantthatflight.com.au": "I Want That Flight",
      "skyscanner.com.au": "Skyscanner",
      "virginaustralia.com": "Virgin Australia",
      "garuda-indonesia.com": "Garuda Indonesia",
      "qantas.com": "Qantas",
      "jetstar.com": "Jetstar",
    };
    return names[host] ?? host;
  } catch {
    return "Other recorded quotes";
  }
}

export function isWeddingQuote(quote: FlightOption): boolean {
  return isDate(quote.date) && isDate(quote.depart) && isDate(quote.return) &&
    quote.from === "SYD" && quote.airline.trim().length > 0 &&
    quote.depart >= "2027-05-15" && quote.depart <= "2027-05-19" &&
    (quote.return === "2027-05-22" || quote.return === "2027-05-23") &&
    typeof quote.price === "number" && Number.isFinite(quote.price) && quote.price > 0 &&
    !/\bestimate[ds]?\b|\bfrom\s+(?:A?\$|AUD)|\bone[- ]way\b/i.test(quote.details);
}

/** No previous-day prices, legacy route averages, or AI-written summaries enter this series. */
export function buildFlightData(raw: FlightOption[], today: string) {
  if (!isDate(today)) throw new Error("Invalid observation cutoff");
  const seen = new Set<string>();
  const quotes = raw.filter((q) => {
    if (!isWeddingQuote(q) || q.date > today) return false;
    // Keep distinct sources, sellers and schedules even at the same price.
    const key = JSON.stringify([q.date, q.airline, q.from, q.depart, q.return, q.price,
      q.stops, q.details, q.link]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date) || a.price! - b.price!);
  const byDate = new Map<string, FlightOption[]>();
  for (const quote of quotes) {
    const group = byDate.get(quote.date) ?? [];
    group.push(quote);
    byDate.set(quote.date, group);
  }
  const checks: FlightDay[] = [];
  const first = quotes[0]?.date;
  if (first) {
    for (let date = first; date <= today;) {
      const group = byDate.get(date) ?? [];
      const cheapest = group[0];
      checks.push({
        date, cheapest: cheapest?.price ?? null,
        cheapestAirline: cheapest?.airline ?? "",
        cheapestDates: cheapest ? `${cheapest.depart} to ${cheapest.return}` : "",
        quoteCount: group.length,
        sources: [...new Set(group.map(quoteSource))].sort(),
      });
      const next = new Date(`${date}T00:00:00Z`);
      next.setUTCDate(next.getUTCDate() + 1);
      date = next.toISOString().slice(0, 10);
    }
  }
  const latestDate = quotes.at(-1)?.date;
  return { checks, options: latestDate ? byDate.get(latestDate)! : [] };
}
