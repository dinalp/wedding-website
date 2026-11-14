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
  itinerary?: FlightItinerary;
}

export interface FlightLeg {
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: number;
  stops: number;
  flights: string[];
}
export interface FlightItinerary {
  version: 1;
  outbound?: FlightLeg;
  inbound?: FlightLeg;
  baggage?: string[];
  seller?: string;
}
const ITINERARY_MARKER = "[flight-details:v1]";
export function encodeFlightDetails(summary: string, itinerary: FlightItinerary): string {
  return summary + " " + ITINERARY_MARKER + " " + JSON.stringify(itinerary);
}

/** Airport-local wall time. Never convert it through the server's timezone. */
function localTimestamp(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value + "Z")) && new Date(value + "Z").toISOString().slice(0, 16) === value;
}
function validLeg(value: unknown): value is FlightLeg {
  if (!value || typeof value !== "object") return false;
  const leg = value as FlightLeg;
  return /^[A-Z]{3}$/.test(leg.from) && /^[A-Z]{3}$/.test(leg.to) &&
    localTimestamp(leg.departure) && localTimestamp(leg.arrival) &&
    Number.isFinite(leg.duration) && leg.duration > 0 && Number.isInteger(leg.stops) && leg.stops >= 0 &&
    Array.isArray(leg.flights) && leg.flights.length === leg.stops + 1 && leg.flights.every((f) => typeof f === "string" && f.length < 100);
}
export function decodeFlightDetails(value: string, depart: string, back: string): { details: string; itinerary?: FlightItinerary } {
  // Airtable single-line text fields normalize newlines to spaces on write.
  const [summary, json] = value.split(ITINERARY_MARKER);
  const details = summary.trim();
  if (!json) return { details };
  try {
    const data = JSON.parse(json) as FlightItinerary;
    if (data.version !== 1) return { details };
    const outbound = validLeg(data.outbound) && data.outbound.from === "SYD" && data.outbound.to === "DPS" && data.outbound.departure.slice(0, 10) === depart ? data.outbound : undefined;
    const inbound = outbound && validLeg(data.inbound) && data.inbound.from === "DPS" && data.inbound.to === "SYD" && data.inbound.departure.slice(0, 10) === back ? data.inbound : undefined;
    const baggage = inbound && Array.isArray(data.baggage) && data.baggage.every((b) => typeof b === "string" && b.length < 500) ? data.baggage.slice(0, 8) : undefined;
    return { details, itinerary: { version: 1, outbound, inbound, baggage, seller: baggage && typeof data.seller === "string" ? data.seller.slice(0, 100) : undefined } };
  } catch { return { details }; }
}

export interface FlightSegment {
  airline?: string;
  flight_number?: string;
  departure_airport?: { id?: string; time?: string };
  arrival_airport?: { id?: string; time?: string };
}
export function toFlightLeg(flights: FlightSegment[], duration: number): FlightLeg | undefined {
  if (!flights.length) return undefined;
  // Do not silently join disjoint segments or substitute guessed flight numbers/times.
  if (flights.some((f, i) => !f.departure_airport?.id || !f.arrival_airport?.id || !localTimestamp(f.departure_airport.time?.replace(" ", "T")) || !localTimestamp(f.arrival_airport.time?.replace(" ", "T")) || (i > 0 && flights[i - 1].arrival_airport?.id !== f.departure_airport.id))) return undefined;
  const leg: FlightLeg = {
    from: flights[0].departure_airport!.id!, to: flights.at(-1)!.arrival_airport!.id!,
    departure: flights[0].departure_airport!.time!.replace(" ", "T"), arrival: flights.at(-1)!.arrival_airport!.time!.replace(" ", "T"),
    duration, stops: flights.length - 1,
    flights: flights.map((f) => f.flight_number || f.airline || "Flight number unconfirmed"),
  };
  return validLeg(leg) ? leg : undefined;
}
export function arrivalDayOffset(leg: FlightLeg): number {
  return Math.round((Date.parse(leg.arrival.slice(0, 10)) - Date.parse(leg.departure.slice(0, 10))) / 86400000);
}

/** Preserve three base searches per day until reset, including today's run. */
export function flightDetailBudget(remaining: number, nextReset: string | undefined, now = Date.now()): number {
  if (!Number.isFinite(remaining) || remaining < 3) return 0;
  const resetDays = Math.ceil((Date.parse(nextReset ?? "") - now) / 86400000);
  const days = Number.isFinite(resetDays) && resetDays > 0 ? resetDays : 31;
  return Math.max(0, Math.min(24, Math.floor(remaining) - 3 * days));
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
      q.stops, q.details, q.link, q.itinerary]);
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
