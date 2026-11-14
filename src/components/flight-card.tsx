import { arrivalDayOffset, quoteSource, type FlightLeg, type FlightOption } from "@/lib/flight-data";
import { aud } from "@/components/travel";

const dayDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

function Leg({ label, date, leg }: { label: string; date: string; leg?: FlightLeg }) {
  const offset = leg ? arrivalDayOffset(leg) : 0;
  return <div className="py-4 border-t border-charcoal/15">
    <h4 className="font-sans text-xs font-semibold tracking-wider text-accent">{label} · {dayDate(date)}</h4>
    {leg ? <>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mt-3">
        <div><p className="font-[family-name:var(--font-cormorant)] text-4xl tabular-nums leading-none">{leg.departure.slice(11)}</p><p className="font-sans text-xs text-charcoal/75 mt-2">{leg.from === "SYD" ? "Sydney" : "Bali"} · {leg.from}</p></div>
        <div className="text-center"><p className="font-sans text-xs text-charcoal/75">{Math.floor(leg.duration / 60)}h {leg.duration % 60}m</p><svg aria-hidden="true" className="w-16 sm:w-24 h-5 my-1 mx-auto" viewBox="0 0 100 20" fill="none" stroke="currentColor"><path d="M0 10h96m-7-6 7 6-7 6" /></svg><p className="font-sans text-xs text-charcoal/75">{leg.stops ? `${leg.stops} stop${leg.stops > 1 ? "s" : ""}` : "Direct"}</p></div>
        <div className="text-right"><p className="font-[family-name:var(--font-cormorant)] text-4xl tabular-nums leading-none">{leg.arrival.slice(11)}{offset !== 0 && <span className="text-lg align-top ml-1" aria-label={`arrives ${Math.abs(offset)} day${Math.abs(offset) > 1 ? "s" : ""} ${offset > 0 ? "later" : "earlier"}`}>{offset > 0 ? "+" : ""}{offset}</span>}</p><p className="font-sans text-xs text-charcoal/75 mt-2">{leg.to === "DPS" ? "Bali" : "Sydney"} · {leg.to}</p>{offset !== 0 && <p className="font-sans text-xs text-accent mt-1">{dayDate(leg.arrival.slice(0, 10))}</p>}</div>
      </div>
      <p className="font-sans text-xs text-charcoal/70 mt-3">{leg.flights.join(" · ")}</p>
    </> : <p className="font-sans text-sm text-charcoal/70 mt-3">Departure &amp; arrival times not supplied by this source.</p>}
  </div>;
}

export function FlightCard({ option: o }: { option: FlightOption }) {
  const itinerary = o.itinerary;
  return <article className="bg-white rounded-sm p-5 md:p-6 border border-charcoal/15 flex flex-col text-charcoal">
    <div className="flex justify-between items-start gap-3 pb-5"><h3 className="font-[family-name:var(--font-cormorant)] text-3xl leading-tight">{o.airline}</h3><div className="shrink-0 text-right"><p className="font-[family-name:var(--font-cormorant)] text-3xl leading-tight tabular-nums">{o.price == null ? "Check fare" : aud(o.price)}</p><p className="font-sans text-xs text-charcoal/70 mt-1">return · per person</p></div></div>
    <Leg label="Outbound" date={o.depart} leg={itinerary?.outbound} />
    <Leg label="Return" date={o.return} leg={itinerary?.inbound} />
    {(itinerary?.outbound || itinerary?.inbound) && <p className="font-sans text-xs text-charcoal/75 mb-4">All times local to each airport. Schedules can change.</p>}
    <div className="bg-cream px-4 py-4 mt-1 mb-5">
      <h4 className="font-sans text-sm font-medium">Baggage &amp; inclusions</h4>
      {itinerary?.baggage?.length ? <><ul className="font-sans text-sm text-charcoal/80 mt-2 space-y-1">{itinerary.baggage.map((b) => <li key={b}>{b}</li>)}</ul><p className="font-sans text-xs text-charcoal/70 mt-2">Reported by {itinerary.seller || "Google Flights"} for this itinerary. Confirm allowance and any fees at checkout.</p></> : <p className="font-sans text-sm text-charcoal/80 mt-2">This source hasn&rsquo;t confirmed the bags included in this fare. Check the fare type before booking.</p>}
      <a href="#baggage-guide" className="inline-block font-sans text-sm text-accent underline underline-offset-4 mt-3 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-4">Airline baggage guide &amp; add-on costs</a>
    </div>
    <p className="font-sans text-xs text-charcoal/70 mb-3">Source: {quoteSource(o)}{!itinerary?.outbound && o.details ? ` · ${o.details}` : ""}</p>
    {o.link && <a href={o.link} target="_blank" rel="noopener noreferrer" className="mt-auto bg-accent hover:bg-accent-dark text-white font-sans text-sm text-center px-4 py-3 min-h-12 rounded-sm flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-4">Search these flights<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 18 18 6M6 6h12v12" /></svg></a>}
  </article>;
}
