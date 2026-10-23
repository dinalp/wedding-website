import type { Metadata } from "next";
import { getFlightChecks, getFlightOptions, type FlightCheck, type FlightOption } from "@/lib/travel";
import { FlightSearch } from "@/components/flight-search";
import { Stat, SubscribeNote, PageHeader, TrendChart, aud, shortDate } from "@/components/travel";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Flights | Dinal & Shayani",
  description: "Sydney to Bali fares for the wedding week, checked daily",
};

const SIGNAL_TEXT: Record<string, string> = {
  "BOOK NOW": "Book now",
  "GOOD TIME": "Good time to book",
  "WAIT AND WATCH": "Wait and watch",
};

// The routine appends a long "(nearest fit: ...)" explanation; guests only need the dates.
const tidy = (s: string) => s.split(" (")[0];

export default async function FlightsPage() {
  let checks: FlightCheck[] = [];
  let options: FlightOption[] = [];
  try {
    [checks, options] = await Promise.all([getFlightChecks(), getFlightOptions()]);
  } catch (err) {
    console.error("[flights] load failed", err);
  }
  const latest = checks.at(-1);
  const floors = checks.filter((c) => c.cheapest != null);
  const lowest = floors.reduce<FlightCheck | null>(
    (best, c) => (best && best.cheapest! <= c.cheapest! ? best : c),
    null
  );
  // Some days the routine finds no fare for the wedding dates; show the most recent day that did.
  const priced = floors.at(-1);
  const weekAgo = floors.findLast((c) => priced && c.date <= offsetDate(priced.date, -7));

  return (
    <main className="min-h-screen bg-background">
      <PageHeader active="/flights" />
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
        <p className="font-sans text-accent tracking-[0.3em] text-xs">SYDNEY TO BALI</p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-light text-charcoal mt-2">
          Flights
        </h1>
        <p className="font-sans text-charcoal/70 mt-4 max-w-2xl leading-relaxed">
          We check return economy fares every morning for the wedding week. We suggest flying
          in Tue 18 May and home Sun 23 May 2027, or making a week of it from Sat 15 May.
        </p>

        {!latest || !priced ? (
          <p className="font-sans text-charcoal/60 mt-10">
            Prices aren&rsquo;t available right now. Please check back soon.
          </p>
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mt-10">
              <Stat label="Cheapest return" value={aud(priced.cheapest!)}>
                {priced.cheapestAirline}
                {weekAgo && <> · {change(priced.cheapest! - weekAgo.cheapest!)} vs last week</>}
              </Stat>
              <Stat label="Direct, full service" value={priced.fullService != null ? aud(priced.fullService) : "n/a"}>
                {tidy(priced.fullServiceAirline)}
              </Stat>
              <Stat label="Our take" value={SIGNAL_TEXT[latest.signal] ?? latest.signal}>
                {lowest && <>Lowest seen: {aud(lowest.cheapest!)} on {shortDate(lowest.date)}</>}
              </Stat>
            </div>

            <div className="bg-white rounded-sm p-4 md:p-6 mt-6">
              <TrendChart
                dates={checks.map((c) => c.date)}
                series={[
                  { label: "Cheapest return", color: "#c2703d", values: checks.map((c) => c.cheapest) },
                  { label: "Direct full service", color: "#5B6F35", values: checks.map((c) => c.fullService) },
                ]}
              />
            </div>

            <div className="font-sans text-sm text-charcoal/70 mt-6 space-y-2 leading-relaxed">
              <p>
                <span className="text-charcoal">Cheapest dates:</span> {tidy(priced.cheapestDates)}
              </p>
              {priced !== latest && (
                <p className="text-xs text-charcoal/60">
                  Our latest check on {shortDate(latest.date)} found no fares for the wedding dates, so
                  these prices are from {shortDate(priced.date)}.
                </p>
              )}
              {latest.sale && (
                <details>
                  <summary className="cursor-pointer text-charcoal">Fare sales we&rsquo;re watching</summary>
                  <p className="mt-2">{latest.sale}</p>
                </details>
              )}
              <p className="text-xs text-charcoal/50">
                Per adult, A$, return economy. Prices are indicative and change quickly, so check
                with the airline before booking. Last checked {shortDate(latest.date)}.
              </p>
            </div>
          </>
        )}

        {options.length > 0 && (
          <section className="mt-14">
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl text-charcoal">
              Latest fares
            </h2>
            <p className="font-sans text-sm text-charcoal/60 mt-1">
              {options.length} fares we found on {shortDate(options[0].date)}, cheapest first. Tap one to
              see it.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {options.map((o, i) => (
                <a
                  key={i}
                  href={o.link || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-sm p-5 border border-transparent hover:border-accent-light transition-colors"
                >
                  <div className="flex justify-between gap-4">
                    <h3 className="font-sans text-charcoal font-medium">{o.airline}</h3>
                    {o.price != null && <p className="font-sans text-charcoal whitespace-nowrap">{aud(o.price)}</p>}
                  </div>
                  <p className="font-sans text-sm text-charcoal/70 mt-2">
                    {o.from} to Bali · {o.depart && dayDate(o.depart)}
                    {o.return && <> to {dayDate(o.return)}</>}
                  </p>
                  <p className="font-sans text-xs text-charcoal/60 mt-1">
                    {[o.stops === 0 ? "Direct" : o.stops != null && `${o.stops} stop${o.stops > 1 ? "s" : ""}`, o.details]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {o.link && (
                    <p className="font-sans text-xs tracking-wider text-accent mt-3">VIEW FARE &rarr;</p>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="mt-14">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl text-charcoal">
            Search for yourself
          </h2>
          <p className="font-sans text-sm text-charcoal/60 mt-1 mb-6">
            Pick where you&rsquo;re flying from, then open a search with the dates already filled in.
          </p>
          <FlightSearch />
          <p className="font-sans text-sm text-charcoal/70 mt-6 leading-relaxed">
            <span className="text-charcoal">Flying direct from Sydney:</span>{" "}
            {DIRECT.map(([name, url], i) => (
              <span key={name}>
                {i > 0 && ", "}
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent">
                  {name}
                </a>
              </span>
            ))}
            . Booking with the airline directly can make changes easier.
          </p>
        </section>

        <SubscribeNote />
      </div>
    </main>
  );
}

const DIRECT = [
  ["Jetstar", "https://www.jetstar.com/au/en/home"],
  ["Virgin Australia", "https://www.virginaustralia.com/au/en/"],
  ["Qantas", "https://www.qantas.com/au/en.html"],
  ["Garuda Indonesia", "https://www.garuda-indonesia.com/au/en/"],
] as const;

const dayDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });

function offsetDate(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function change(diff: number) {
  if (diff === 0) return "no change";
  return `${diff > 0 ? "up" : "down"} ${aud(Math.abs(diff))}`;
}

