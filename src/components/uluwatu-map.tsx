"use client";

import { useRef, useState } from "react";

const AREAS = [
  { id: "bingin", name: "Bingin & Padang Padang", short: "Cafés, boutique stays & surf", description: "Villas, guesthouses and boutique hotels around cafés and restaurants. A good base for exploring Padang Padang and the west-coast surf spots.", path: "M160 246 257 165 395 190 403 280 322 357 197 328Z", label: [310, 310] },
  { id: "suluban", name: "Suluban & the western cliffs", short: "Sunset drinks & the temple", description: "Stay around the western cliffs for Suluban Beach, sunset drinks at Single Fin and the Kecak dance at Uluwatu Temple. Expect steep paths and steps to some beaches.", path: "M62 337 160 246 197 328 322 357 280 448 121 455 52 410Z", label: [178, 377] },
  { id: "balangan", name: "Balangan & Dreamland", short: "Beach stays & resorts", description: "Beach stays and resorts a little further from the main café strip. Sandy beaches and surf are the draw; plan on driving for more dining options.", path: "M257 165 345 50 460 30 525 152 395 190Z", label: [400, 123] },
  { id: "ungasan", name: "Ungasan & Melasti", short: "Villas, beach clubs & pool days", description: "Spacious villas and clifftop resorts along the southern coast. Melasti Beach, Sundays Beach Club and Savaya make this a good fit for pool days and beach-club outings.", path: "M403 280 525 152 720 135 760 508 517 523 280 448 322 357Z", label: [563, 355] },
] as const;
const PLACES = [
  { name: "Balangan", area: "balangan", x: 347, y: 72, query: "Balangan Beach Bali" },
  { name: "Dreamland", area: "balangan", x: 285, y: 166, query: "Dreamland Beach Bali" },
  { name: "Bingin", area: "bingin", x: 235, y: 225, query: "Bingin Beach Bali" },
  { name: "Padang Padang", area: "bingin", x: 166, y: 290, query: "Padang Padang Beach Bali" },
  { name: "Single Fin / Suluban", area: "suluban", x: 72, y: 355, query: "Single Fin Uluwatu" },
  { name: "Uluwatu Temple", area: "suluban", x: 54, y: 427, query: "Uluwatu Temple Bali" },
  { name: "Savaya", area: "ungasan", x: 419, y: 499, query: "Savaya Bali" },
  { name: "Sundays Beach Club", area: "ungasan", x: 578, y: 516, query: "Sundays Beach Club Bali" },
  { name: "Melasti Beach", area: "ungasan", x: 698, y: 500, query: "Melasti Beach Bali" },
];
const directions = "https://www.google.com/maps?cid=17866104928983940569";
const maps = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

/** An authored area diagram: intentionally approximate, with real Maps destinations. */
export function UluwatuMap() {
  const [active, setActive] = useState<string>("bingin");
  const mapViewport = useRef<HTMLDivElement>(null);
  function selectArea(id: string, pan = false) {
    setActive(id);
    if (pan && mapViewport.current) {
      const region = AREAS.find((a) => a.id === id)!;
      const view = mapViewport.current;
      view.scrollTo({ left: region.label[0] / 780 * view.scrollWidth - view.clientWidth / 2, behavior: "instant" });
    }
  }
  const area = AREAS.find((a) => a.id === active)!;
  return (
    <section aria-labelledby="area-guide" className="mt-10">
      <h2 id="area-guide" className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl text-charcoal">Find your corner of Uluwatu</h2>
      <p id="map-help" className="font-sans text-sm text-charcoal/75 mt-2 mb-5">Hover over an area, or tap to explore. You can stay anywhere in Uluwatu.</p>
      <div className="grid lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] gap-6">
        <div className="min-w-0">
          <div ref={mapViewport} className="overflow-x-auto rounded-sm border border-charcoal/10" role="region" aria-label="Uluwatu area map; scroll sideways on small screens" tabIndex={0}>
            <svg viewBox="0 0 780 580" className="w-full min-w-[560px] block bg-[#DFEBE9]" aria-label="Approximate area map of southwest Bali" aria-describedby="map-help">
              <path d="M390 0H780V526L710 521 657 532 578 535 505 527 419 519 358 505 301 500 243 484 193 478 140 467 92 460 55 441 37 414 51 385 52 352 84 330 124 312 153 285 189 262 216 233 243 211 261 178 284 151 305 126 322 96 347 72 361 42Z" fill="#F0EBDB" stroke="#FAF8F0" strokeWidth="5" />
              {AREAS.map((a) => <path key={a.id} d={a.path} role="button" tabIndex={0} aria-label={`Explore ${a.name}`} aria-pressed={active === a.id} onMouseEnter={() => setActive(a.id)} onFocus={() => setActive(a.id)} onClick={() => selectArea(a.id, true)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActive(a.id); } }} fill={active === a.id ? "#b9c69c" : "#d8dcc4"} fillOpacity={active === a.id ? .7 : .35} stroke={active === a.id ? "#5B6F35" : "#ece8d8"} strokeWidth="1.5" className="cursor-pointer transition-colors focus:outline-none focus:stroke-[3]" />)}
              <g fill="none" stroke="#FAF8F0" strokeWidth="4" pointerEvents="none"><path d="M435 0Q420 98 472 183T453 337Q413 405 277 432T111 433M614 0Q551 152 590 277T600 473M344 74Q389 166 356 238T246 318Q198 367 183 446M261 179Q363 198 472 183T780 207M454 337Q578 310 780 371" /></g>
              <g fontFamily="var(--font-montserrat), sans-serif" fontSize="13" fill="#415224" letterSpacing="2" pointerEvents="none">
                {AREAS.map((a) => <text key={a.id} x={a.label[0]} y={a.label[1]} textAnchor="middle">{a.id === "bingin" ? <><tspan x={a.label[0]}>BINGIN &</tspan><tspan x={a.label[0]} dy="20">PADANG PADANG</tspan></> : a.id === "balangan" ? <><tspan x={a.label[0]}>BALANGAN &</tspan><tspan x={a.label[0]} dy="20">DREAMLAND</tspan></> : a.id === "ungasan" ? <><tspan x={a.label[0]}>UNGASAN &</tspan><tspan x={a.label[0]} dy="20">MELASTI</tspan></> : "SULUBAN"}</text>)}
              </g>
              {PLACES.map((p) => <a key={p.name} href={maps(p.query)} target="_blank" rel="noopener noreferrer" aria-label={`${p.name}, open Google Maps`} onMouseEnter={() => setActive(p.area)} onFocus={() => setActive(p.area)} className="group focus:outline-none">
                <circle cx={p.x} cy={p.y} r="20" fill="transparent" />
                <circle cx={p.x} cy={p.y} r="6" fill="#5B6F35" stroke="#FAF8F0" strokeWidth="2" className="group-focus:stroke-charcoal group-focus:stroke-[4]" />
                <text x={p.area === "ungasan" ? p.x : p.x + 12} y={p.area === "ungasan" ? p.y - 27 : p.y - 10} textAnchor={p.area === "ungasan" ? "middle" : "start"} fill="#2A3318" fontFamily="var(--font-montserrat), sans-serif" fontSize="13" fontWeight="500" paintOrder="stroke" stroke="#F0EBDB" strokeWidth="4" strokeLinejoin="round">{p.name === "Sundays Beach Club" ? <><tspan x={p.x}>Sundays</tspan><tspan x={p.x} dy="16">Beach Club</tspan></> : p.name}</text>
              </a>)}
              <a href={directions} target="_blank" rel="noopener noreferrer" aria-label="Stone Villas, our wedding venue, open Google Maps" className="group focus:outline-none">
                <rect x="157" y="438" width="203" height="50" rx="2" fill="#FAF8F0" stroke="#b9b5a4" className="group-focus:stroke-charcoal group-focus:stroke-[3]" />
                <path d="m151 451 4 10 11 1-9 7 3 11-9-6-9 6 3-11-9-7 11-1Z" fill="#A85C3A" />
                <text x="174" y="460" fill="#2A3318" fontFamily="var(--font-cormorant), serif" fontSize="25">Stone Villas</text>
                <text x="174" y="478" fill="#2A3318" fontFamily="var(--font-montserrat), sans-serif" fontSize="10" letterSpacing="1.5">OUR WEDDING VENUE</text>
              </a>
              <g fill="#415224"><text x="40" y="57" fontSize="18" textAnchor="middle">N</text><path d="m40 67-9 28 9-6 9 6Z" /></g>
              <text x="26" y="554" fill="#415224" fontFamily="var(--font-montserrat), sans-serif" fontSize="12">Area guide · approximate locations, not for navigation</text>
            </svg>
          </div>
          <p className="font-sans text-xs text-charcoal/75 mt-3">Select a place to open Google Maps. On a small screen, swipe the map sideways.</p>
        </div>
        <div className="flex flex-col min-w-0">
          <div aria-label="Choose an area" className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {AREAS.map((a) => <button key={a.id} type="button" aria-pressed={active === a.id} aria-controls="area-description" onMouseEnter={() => setActive(a.id)} onFocus={() => setActive(a.id)} onClick={() => selectArea(a.id, true)} className={`text-left px-3 py-3 border rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${active === a.id ? "bg-accent text-white border-accent" : "text-charcoal border-charcoal/20 hover:bg-cream"}`}><span className="font-[family-name:var(--font-cormorant)] text-xl leading-tight block">{a.name}</span><span className="font-sans text-xs leading-relaxed block mt-1">{a.short}</span></button>)}
          </div>
          <div id="area-description" className="py-5 min-h-[170px]" aria-live="polite" aria-atomic="true"><h3 className="font-sans font-medium text-sm text-charcoal">{area.name}</h3><p className="font-sans text-sm leading-relaxed text-charcoal/80 mt-2">{area.description}</p></div>
          <a href={directions} target="_blank" rel="noopener noreferrer" className="mt-auto flex items-center justify-between gap-3 bg-cream px-4 py-4 font-sans text-sm text-charcoal hover:bg-accent hover:text-white focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 transition-colors"><span><strong className="block font-medium">Stone Villas</strong><span className="text-xs block mt-1">Directions to our wedding venue</span></span><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 18 18 6M6 6h12v12" /></svg></a>
        </div>
      </div>
    </section>
  );
}
