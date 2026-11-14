import { FlightCard } from "@/components/flight-card";
import { FlightBaggageGuide } from "@/components/flight-baggage-guide";
import type { Metadata } from "next";
import { getFlightData, type FlightOption } from "@/lib/travel";
import { type FlightDay, type FlightTrendPoint } from "@/lib/flight-data";
import { FlightSearch } from "@/components/flight-search";
import { Stat, SubscribeNote, PageHeader, TrendChart, aud, shortDate } from "@/components/travel";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Flights | Dinal & Shayani",
  description: "Sydney to Bali fares for the wedding week, checked daily",
};

export default async function FlightsPage() {
  let checks: FlightDay[] = [];
  let trend: FlightTrendPoint[] = [];
  let options: FlightOption[] = [];
  let publishedStatus = "";
  try {
    ({ checks, trend, options, publishedStatus } = await getFlightData());
  } catch (err) {
    console.error("[flights] load failed", err);
  }
  const latest = checks.at(-1);
  const floors = checks.filter((c) => c.cheapest != null);
  const lowest = floors.reduce<FlightDay | null>(
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

        <section aria-labelledby="points-heading" className="mt-10 bg-cream rounded-sm p-5 md:p-8 text-charcoal">
          <h2 id="points-heading" className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl">
            Got points? Start here
          </h2>
          <p className="font-sans text-base mt-3 leading-relaxed max-w-2xl">
            Have Qantas, Velocity or other airline points? Check reward seats first —
            they could save you a lot on flights to Bali.
          </p>
          <table className="w-full mt-6 font-sans text-sm sm:text-base text-left leading-relaxed">
            <caption className="text-left text-sm text-charcoal/80 pb-3">
              Sydney → Bali · one way · economy · per person
            </caption>
            <thead>
              <tr className="border-b border-charcoal/20">
                <th scope="col" className="pb-3 pr-4 font-medium w-1/2">Airline &amp; programme</th>
                <th scope="col" className="pb-3 font-medium">Points + cash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/15">
              <tr>
                <th scope="row" className="py-4 pr-4 align-top font-normal">
                  <span className="block font-medium">Jetstar</span>
                  <span className="block text-sm text-charcoal/80">Qantas · Classic Reward</span>
                </th>
                <td className="py-4 align-top">
                  <span className="block font-semibold tabular-nums">20,700 points</span>
                  <span className="block">+ A$154</span>
                </td>
              </tr>
              <tr>
                <th scope="row" className="py-4 pr-4 align-top font-normal">
                  <span className="block font-medium">Qantas</span>
                  <span className="block text-sm text-charcoal/80">Qantas · Classic Plus</span>
                </th>
                <td className="py-4 align-top">
                  <span className="block font-semibold tabular-nums">37,700 points</span>
                  <span className="block">+ A$158</span>
                </td>
              </tr>
              <tr>
                <th scope="row" className="py-4 pr-4 align-top font-normal">
                  <span className="block font-medium">Virgin Australia</span>
                  <span className="block text-sm text-charcoal/80">Velocity · Reward Seat</span>
                </th>
                <td className="py-4 align-top">
                  <span className="block font-semibold tabular-nums">From 22,500 points</span>
                  <span className="block">+ taxes &amp; fees</span>
                </td>
              </tr>
            </tbody>
          </table>
          <p className="font-sans text-sm text-charcoal/80 mt-3 leading-relaxed max-w-2xl">
            Qantas search examples and Velocity&rsquo;s published rate, checked 4 Nov 2026.
            Prices and seats vary; May 2027 availability isn&rsquo;t confirmed. Compare with cash fares.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 font-sans text-base font-medium">
            <a href="https://www.qantas.com/au/en.html" target="_blank" rel="noopener noreferrer" className="py-2 underline underline-offset-4 decoration-charcoal/40 hover:decoration-charcoal">
              Search Qantas &rarr;
            </a>
            <a href="https://www.virginaustralia.com/au/en/" target="_blank" rel="noopener noreferrer" className="py-2 underline underline-offset-4 decoration-charcoal/40 hover:decoration-charcoal">
              Search Virgin Australia &rarr;
            </a>
          </div>
        </section>

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
              <Stat label="Fares found" value={String(priced.quoteCount)}>
                {priced.sources.join(" · ")}
              </Stat>
              <Stat label="Lowest recorded" value={lowest ? aud(lowest.cheapest!) : "n/a"}>
                {lowest && shortDate(lowest.date)}
              </Stat>
            </div>

            <div className="bg-white rounded-sm p-4 md:p-6 mt-6">
              <TrendChart
                dates={trend.map((c) => c.date)}
                series={[
                  { label: "Cheapest return", color: "#c2703d", values: trend.map((c) => c.cheapest) },
                ]}
              />
            </div>

            <div className="font-sans text-sm text-charcoal/70 mt-6 space-y-2 leading-relaxed">
              <p>
                <span className="text-charcoal">Cheapest dates:</span> {priced.cheapestDates.split(" to ").map(dayDate).join(" to ")}
              </p>
              {priced !== latest && (
                <p className="text-xs text-charcoal/60">
                  No new quotes have been recorded since {shortDate(priced.date)}. These are the most recent prices available.
                </p>
              )}
              <p>
                Earlier checks used a wider range of travel dates, so the full history is a guide
                to the overall trend. From 23 October, prices cover departures 15–19 May and returns 22–23 May 2027.
              </p>
              <p>{publishedStatus} Skyscanner and Garuda searches are currently unavailable.</p>
              <p className="text-xs text-charcoal/50">
                Per adult, A$, return economy. Prices are indicative and change quickly, so check
                with the airline before booking. Last quotes recorded {shortDate(priced.date)}.
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
              {options.length} fares we found on {shortDate(options[0].date)}, cheapest first. Times are local to each airport; check the fare and schedule before booking.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {options.map((o, i) => <FlightCard key={i} option={o} />)}
            </div>
          </section>
        )}

        <FlightBaggageGuide />

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

