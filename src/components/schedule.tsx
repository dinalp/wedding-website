"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll } from "framer-motion";

const DAYS = [
  {
    date: "19",
    weekday: "Wednesday",
    title: "Welcome Dinner",
    photo: "/photos/bali-v2-7.jpg",
    alt: "Dinner tables under a pink Bali sunset",
    body: "Arrive in Bali and settle in. Join us for an intimate welcome dinner as we gather together for the first time. It's the perfect opportunity to catch up, meet fellow guests, and begin the celebrations with good food, drinks, and company.",
    details: [
      ["When", "4:00 PM – 9:00 PM"],
      ["Where", "Stone Villas Uluwatu"],
    ],
    wear: "Island semi-formal",
    dressCode: "welcome-dinner",
  },
  {
    date: "20",
    weekday: "Thursday",
    title: "Wedding Day",
    photo: "/photos/bali-v2-8.jpg",
    alt: "Green clifftops above the ocean at Uluwatu",
    body: "The moment we've all been waiting for. Join us as we exchange vows in a beautiful ceremony overlooking the cliffs of Uluwatu. Cocktail hour follows as the sun goes down, and then we celebrate with an evening reception filled with dinner, dancing, and memories to last a lifetime.",
    details: [
      ["When", "Ceremony begins at 4:30 PM, please arrive at 4:00 PM"],
      ["Where", "Stone Villas Uluwatu"],
      ["What", "Ceremony, cocktail hour, then the reception"],
    ],
    wear: "Island formal",
    dressCode: "wedding",
  },
  {
    date: "20",
    weekday: "Thursday night",
    title: "After Party",
    photo: "/photos/bali-v2-4.jpg",
    alt: "A lively crowd at a Bali bar at night",
    body: "When the reception winds down, the night isn't over. Head downstairs to the underground party bunker at Stone Villas and keep dancing until late.",
    details: [
      ["When", "From 11:00 PM"],
      ["Where", "The underground party bunker at Stone Villas"],
    ],
    wear: null,
    dressCode: null,
  },
  {
    date: "21",
    weekday: "Friday",
    title: "Recovery Day",
    photo: "/photos/bali-v2-3.jpg",
    alt: "A white-sand Bali beach and turquoise water",
    body: "One last day together before everyone heads home. We're still finalising the plan: it may be a boat party out on the water, or a reserved area at a beach club for all of our guests. Either way, expect sun, food, and a slow, easy end to the celebrations. Details to follow closer to the date.",
    details: [
      ["When", "All day"],
      ["Where", "To be confirmed"],
    ],
    wear: "Boat party vibes",
    dressCode: "recovery-day",
  },
] as const;

export default function Schedule() {
  const listRef = useRef<HTMLOListElement>(null);
  const reduceMotion = useReducedMotion();
  // The thread between the days draws itself as you scroll down the schedule.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 70%", "end 70%"],
  });

  return (
    <section
      id="itinerary"
      className="py-16 md:py-32 px-4 md:px-8 bg-cream overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-[0.2em] md:tracking-[0.3em] text-xs mb-4">
            THREE DAYS OF CELEBRATION
          </p>
          <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-light text-charcoal">
            The Schedule
          </h2>
          <div className="divider mx-auto mt-6" />
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-accent/15"
          >
            <motion.div
              className="absolute inset-0 bg-accent origin-top"
              style={{ scaleY: reduceMotion ? 1 : scrollYProgress }}
            />
          </div>

          <ol ref={listRef} className="relative space-y-20 md:space-y-32">
            {DAYS.map((day, i) => (
              <li
                key={day.title}
                className="relative grid md:grid-cols-2 gap-8 md:gap-24 items-center"
              >
                <span
                  aria-hidden
                  className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent ring-8 ring-cream"
                />

                <div
                  className={`relative w-full max-w-sm mx-auto ${i % 2 ? "md:order-2" : ""}`}
                >
                  <div className="relative aspect-[4/5] rounded-t-full overflow-hidden shadow-[0_30px_60px_-30px_rgba(42,51,24,0.45)]">
                    <Image
                      src={day.photo}
                      alt={day.alt}
                      fill
                      sizes="(min-width: 768px) 384px, 100vw"
                      quality={85}
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className={i % 2 ? "md:order-1" : ""}>
                  <div className="flex items-end gap-4">
                    <span className="font-[family-name:var(--font-cormorant)] font-light text-accent text-[6.5rem] md:text-[9rem] leading-[0.75]">
                      {day.date}
                    </span>
                    <span className="font-[family-name:var(--font-montserrat)] text-charcoal/60 text-sm leading-snug pb-1">
                      {day.weekday}
                      <br />
                      May 2027
                    </span>
                  </div>

                  <h3 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl text-charcoal mt-12 md:mt-14">
                    {day.title}
                  </h3>
                  <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 leading-relaxed mt-4">
                    {day.body}
                  </p>

                  <dl className="mt-8 border-t border-charcoal/10 font-[family-name:var(--font-montserrat)] text-sm">
                    {[
                      ...day.details,
                      ...(day.wear ? [["Wear", day.wear] as const] : []),
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex gap-6 py-3 border-b border-charcoal/10"
                      >
                        <dt className="w-14 shrink-0 text-accent">{label}</dt>
                        <dd className="text-charcoal">
                          {value}
                          {label === "Wear" && (
                            <Link
                              href={`/dress-code#${day.dressCode}`}
                              className="ml-3 text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent"
                            >
                              See the dress code
                            </Link>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
