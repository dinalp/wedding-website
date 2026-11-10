"use client";

const SUGGESTED_STAYS = [
  { label: "Full week", dates: "15–23 May", arrival: "2027-05-15", departure: "2027-05-23" },
  { label: "Comfortable", dates: "18–23 May", arrival: "2027-05-18", departure: "2027-05-23" },
  { label: "Bare minimum", dates: "19–22 May", arrival: "2027-05-19", departure: "2027-05-22" },
];

export function BaliDates({ arrival, departure, onArrivalChange, onDepartureChange }: {
  arrival: string;
  departure: string;
  onArrivalChange: (value: string) => void;
  onDepartureChange: (value: string) => void;
}) {
  return (
    <fieldset className="my-10 border-y border-white/15 py-8 min-w-0" aria-describedby="bali-dates-help">
      <legend className="font-sans text-white/80 text-xs tracking-wider px-2">
        YOUR BALI DATES <span className="text-white/60">(OPTIONAL)</span>
      </legend>
      <p id="bali-dates-help" className="font-sans text-sm text-white/70 leading-relaxed mb-5">
        When do you think you&rsquo;ll be in Bali? A rough idea helps us see who&rsquo;ll
        be around Uluwatu and when. Pick a suggested stay in May 2027 or choose your
        own dates below. No need to have flights booked — you can leave this blank
        and update it later, even after sending your RSVP.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5" role="group" aria-label="Suggested Bali stays in May 2027">
        {SUGGESTED_STAYS.map((stay) => {
          const selected = arrival === stay.arrival && departure === stay.departure;
          return (
            <button key={stay.label} type="button" aria-pressed={selected}
              onClick={() => { onArrivalChange(stay.arrival); onDepartureChange(stay.departure); }}
              className={`text-left rounded-sm border px-4 py-3 font-sans transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${selected ? "border-accent bg-accent/20 text-white" : "border-white/25 text-white/75 hover:border-white/60"}`}>
              <span className="block text-sm font-medium">{stay.label}{selected ? " ✓" : ""}</span>
              <span className="block text-sm mt-1">{stay.dates} 2027</span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { id: "bali-arrival", label: "Arriving in Bali", value: arrival, change: onArrivalChange },
          { id: "bali-departure", label: "Leaving Bali", value: departure, change: onDepartureChange },
        ].map(({ id, label, value, change }) => (
          <div key={id} className="min-w-0">
            <label htmlFor={id} className="block font-sans text-sm text-white/80 mb-2">{label}</label>
            <input id={id} type="date" value={value} onChange={(e) => change(e.target.value)}
              min={id === "bali-departure" && arrival ? arrival : undefined}
              className="w-full min-w-0 bg-white/10 border border-white/25 rounded-sm px-3 py-3 text-white font-sans text-sm [color-scheme:dark] focus:border-accent focus:outline-none" />
          </div>
        ))}
      </div>
      {(arrival || departure) && (
        <button type="button" onClick={() => { onArrivalChange(""); onDepartureChange(""); }}
          className="font-sans text-sm text-accent-light underline underline-offset-4 mt-4 py-2 focus-visible:outline-2 focus-visible:outline-accent">
          Not sure yet — clear dates
        </button>
      )}
      <p className="font-sans text-xs leading-relaxed text-white/60 mt-4">
        These dates are for your party. If you&rsquo;re travelling separately or only
        spending part of your trip in Uluwatu, let us know in the message below.
      </p>
    </fieldset>
  );
}
