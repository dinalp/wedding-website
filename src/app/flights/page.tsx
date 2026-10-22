import type { Metadata } from "next";
import { getFlightChecks, type FlightCheck } from "@/lib/travel";
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
  try {
    checks = await getFlightChecks();
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
          We check return economy fares every morning for the wedding week. Our ideal trip is
          Tue 18 May to Sun 23 May 2027.
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
              <a
                href="https://www.skyscanner.com.au/transport/flights/syd/dps/270518/270523/?adultsv2=1&cabinclass=economy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-sans text-xs tracking-wider text-white bg-accent hover:bg-accent/90 transition-colors px-5 py-3 rounded-full"
              >
                SEARCH 18 TO 23 MAY ON SKYSCANNER
              </a>
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

        <SubscribeNote />
      </div>
    </main>
  );
}

function offsetDate(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function change(diff: number) {
  if (diff === 0) return "no change";
  return `${diff > 0 ? "up" : "down"} ${aud(Math.abs(diff))}`;
}

