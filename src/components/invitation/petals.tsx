"use client";

import { motion } from "framer-motion";
import { EASE_FALL, EASE_OUT } from "./palette";

/** One calla petal. Sized by its wrapper. */
function Petal({ tone }: { tone: string }) {
  return (
    <svg viewBox="0 0 24 32" className="block w-full" aria-hidden="true">
      <path d="M12 1C20 9 22 20 12 31C2 20 4 9 12 1Z" fill={tone} />
      <path d="M12 5C13 13 13 21 12 28" fill="none" stroke="#d9cba6" strokeWidth={0.7} strokeLinecap="round" />
    </svg>
  );
}

const TONES = ["#f8f1de", "#f1e6cb", "#fbf6ea"];

// Fixed values (not random) so server and client render the same markup.
// Drift (6) + burst (8) keeps the page at 14 particles in total.
const DRIFT = [
  { left: "9%", size: 18, duration: 19, delay: 0, sway: 26, spin: 210 },
  { left: "27%", size: 13, duration: 24, delay: 5.5, sway: -20, spin: -160 },
  { left: "46%", size: 16, duration: 21, delay: 2.5, sway: 18, spin: 240 },
  { left: "63%", size: 12, duration: 26, delay: 9, sway: -24, spin: -200 },
  { left: "79%", size: 19, duration: 20, delay: 1.2, sway: 22, spin: 180 },
  { left: "91%", size: 14, duration: 23, delay: 7, sway: -16, spin: -230 },
];

const BURST = [
  { dx: -150, dy: -190, spin: -170, size: 17, duration: 2.7 },
  { dx: -92, dy: -250, spin: 140, size: 13, duration: 3.1 },
  { dx: -34, dy: -215, spin: -110, size: 15, duration: 2.5 },
  { dx: 30, dy: -260, spin: 190, size: 12, duration: 3.2 },
  { dx: 88, dy: -225, spin: -150, size: 16, duration: 2.8 },
  { dx: 148, dy: -180, spin: 120, size: 14, duration: 2.6 },
  { dx: -122, dy: -120, spin: 200, size: 12, duration: 3 },
  { dx: 118, dy: -130, spin: -190, size: 13, duration: 2.9 },
];

/** A few petals drifting slowly down the backdrop. Transform and opacity only. */
export function DriftingPetals() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {DRIFT.map((petal, index) => (
        <motion.span
          key={petal.left}
          className="absolute top-0 block"
          style={{ left: petal.left, width: petal.size }}
          initial={{ y: "-12vh", x: 0, rotate: 0, opacity: 0 }}
          animate={{
            y: "112vh",
            x: [0, petal.sway, -petal.sway * 0.6, petal.sway * 0.4],
            rotate: petal.spin,
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            repeatDelay: 1.5,
            ease: "linear",
          }}
        >
          <Petal tone={TONES[index % TONES.length]} />
        </motion.span>
      ))}
    </div>
  );
}

/**
 * Each petal is tossed up quickly, slows to its peak about a third of the way
 * through, then drifts down gathering a little speed as it fades.
 */
function burstTransition(duration: number, delay: number) {
  const arc = { duration, delay, times: [0, 0.36, 1] };
  return {
    duration,
    delay,
    ease: EASE_OUT,
    x: { ...arc, ease: [EASE_OUT, "linear" as const] },
    y: { ...arc, ease: [EASE_OUT, EASE_FALL] },
    opacity: { duration, delay, times: [0, 0.1, 0.62, 1], ease: "linear" as const },
  };
}

/** A one-off flurry of petals from the envelope as it opens. */
export function PetalBurst({ active }: { active: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {BURST.map((petal, index) => (
        <motion.span
          key={petal.dx}
          className="absolute left-1/2 block"
          style={{ top: "calc(50% - var(--lift) + var(--rise-drop) - 36px)", width: petal.size, marginLeft: -petal.size / 2 }}
          initial={false}
          animate={
            active
              ? {
                  x: [0, petal.dx * 0.75, petal.dx],
                  y: [0, petal.dy, petal.dy + 190],
                  rotate: petal.spin,
                  scale: 1,
                  opacity: [0, 1, 0.9, 0],
                }
              : { x: 0, y: 0, rotate: 0, scale: 0.4, opacity: 0 }
          }
          transition={active ? burstTransition(petal.duration, index * 0.05) : { duration: 0 }}
        >
          <Petal tone={TONES[index % TONES.length]} />
        </motion.span>
      ))}
    </div>
  );
}
