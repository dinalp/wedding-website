import type { Metadata } from "next";
import { getStays, stayTrend, type Stay } from "@/lib/travel";
import { Stat, SubscribeNote, TravelHeader, TrendChart, aud, shortDate } from "@/components/travel";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Stays | Dinal & Shayani",
  description: "Places to stay near Stone Villas, Uluwatu, with prices tracked twice a week",
};

const CATEGORIES = ["Couples", "Families", "Groups", "Big group villa"];

export default async function StaysPage() {
  let stays: Stay[] = [];
  try {
    stays = await getStays();
  } catch (err) {
    console.error("[stays] load failed", err);
  }
  const trend = stayTrend(stays);
  const first = trend[0];
  const latest = trend.at(-1);
  const current = latest ? stays.filter((s) => s.date === latest.date) : [];
  const groups = [
    ...CATEGORIES,
    ...new Set(current.map((s) => s.category).filter((c) => !CATEGORIES.includes(c))),
  ]
    .map((cat) => ({
      cat,
      items: current
        .filter((s) => s.category === cat)
        .sort((a, b) => (a.perPerson ?? Infinity) - (b.perPerson ?? Infinity)),
    }))
    .filter((g) => g.items.length);

  return (
    <main className="min-h-screen bg-background">
      <TravelHeader active="/stays" />
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
        <p className="font-sans text-accent tracking-[0.3em] text-xs">ULUWATU, NEAR STONE VILLAS</p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-light text-charcoal mt-2">
          Stays
        </h1>
        <p className="font-sans text-charcoal/70 mt-4 max-w-2xl leading-relaxed">
          Villas, boutique hotels and resorts within about 15 minutes of the venue, aiming for
          about A$100 per person per night or less. We re-check prices every Monday and
          Thursday for 17 to 23 May 2027.
        </p>

        {!latest ? (
          <p className="font-sans text-charcoal/60 mt-10">
            Prices aren&rsquo;t available right now. Please check back soon.
          </p>
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mt-10">
              <Stat label="Typical, per person" value={aud(latest.median)}>
                per night (median of {current.length} stays)
                {first && first !== latest && <> · was {aud(first.median)} on {shortDate(first.date)}</>}
              </Stat>
              <Stat label="Cheapest, per person" value={aud(latest.min)}>
                per night
              </Stat>
              <Stat label="Last checked" value={shortDate(latest.date)}>
                Indicative prices in A$
              </Stat>
            </div>

            <div className="bg-white rounded-sm p-4 md:p-6 mt-6">
              <TrendChart
                dates={trend.map((t) => t.date)}
                series={[
                  { label: "Typical (median)", color: "#c2703d", values: trend.map((t) => t.median) },
                  { label: "Cheapest", color: "#5B6F35", values: trend.map((t) => t.min) },
                ]}
                cap={100}
                capLabel="A$100 budget"
              />
            </div>

            {groups.map((g) => (
              <section key={g.cat} className="mt-12">
                <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-charcoal">{g.cat}</h2>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {g.items.map((s) => (
                    <a
                      key={s.property}
                      href={s.link || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white rounded-sm p-5 border border-transparent hover:border-accent-light transition-colors"
                    >
                      <div className="flex justify-between gap-4">
                        <h3 className="font-sans text-charcoal font-medium">{s.property}</h3>
                        {s.perPerson != null && (
                          <p className="font-sans text-charcoal whitespace-nowrap">
                            {aud(s.perPerson)}
                            <span className="text-charcoal/50 text-xs"> pp/night</span>
                          </p>
                        )}
                      </div>
                      <p className="font-sans text-xs text-charcoal/60 mt-2 leading-relaxed">
                        {[
                          s.area,
                          s.sleeps && `sleeps ${s.sleeps}`,
                          s.nightly != null && `${aud(s.nightly)}/night total`,
                          s.rating,
                          s.platform !== "Other" && s.platform,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {s.estimate && (
                        <p className="font-sans text-[11px] text-[#c2703d] mt-2">
                          Estimated rate, confirm when booking
                        </p>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            ))}

            <p className="font-sans text-xs text-charcoal/50 mt-8">
              Prices are indicative and change often. Book directly with the property or platform.
            </p>
          </>
        )}

        <SubscribeNote />
      </div>
    </main>
  );
}
