"use client";

import { useState } from "react";

const CITIES = [
  ["SYD", "Sydney"],
  ["MEL", "Melbourne"],
  ["BNE", "Brisbane"],
  ["PER", "Perth"],
  ["ADL", "Adelaide"],
] as const;

const TRIPS = [
  { label: "The full week", out: "2027-05-15", back: "2027-05-23" },
  { label: "Comfortable", out: "2027-05-18", back: "2027-05-23" },
  { label: "Bare minimum", out: "2027-05-19", back: "2027-05-22" },
];

const fmt = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });

const google = (from: string, out: string, back: string) =>
  `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${from} to DPS on ${out} through ${back}`)}&curr=AUD&hl=en-AU&gl=AU`;

const skyscanner = (from: string, out: string, back: string) =>
  `https://www.skyscanner.com.au/transport/flights/${from.toLowerCase()}/dps/${out.slice(2).replaceAll("-", "")}/${back.slice(2).replaceAll("-", "")}/?adultsv2=1&cabinclass=economy`;

/** Pre-filled searches for each suggested trip, from whichever city the guest flies out of. */
export function FlightSearch() {
  const [from, setFrom] = useState<string>("SYD");
  const link =
    "inline-block text-center font-sans text-xs tracking-wider px-4 py-2.5 rounded-full transition-colors";
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Flying from">
        {CITIES.map(([code, name]) => (
          <button
            key={code}
            type="button"
            aria-pressed={from === code}
            onClick={() => setFrom(code)}
            className={`font-sans text-xs tracking-wider px-4 py-2 rounded-full transition-colors ${
              from === code ? "bg-charcoal text-white" : "bg-cream text-charcoal/70 hover:text-charcoal"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="mt-4 divide-y divide-charcoal/10 border-y border-charcoal/10">
        {TRIPS.map((t) => (
          <div key={t.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
            <div>
              <p className="font-[family-name:var(--font-cormorant)] text-2xl text-charcoal">{t.label}</p>
              <p className="font-sans text-sm text-charcoal/60">
                {fmt(t.out)} to {fmt(t.back)}
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href={google(from, t.out, t.back)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${link} bg-accent text-white hover:bg-accent-dark`}
              >
                GOOGLE FLIGHTS
              </a>
              <a
                href={skyscanner(from, t.out, t.back)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${link} border border-accent/40 text-accent hover:border-accent`}
              >
                SKYSCANNER
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
