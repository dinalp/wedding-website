"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { EASE_IN_OUT, palette } from "./palette";

/** Glitter flecks caught in the organza: [x, y, radius]. */
const UPPER_GLITTER: ReadonlyArray<readonly [number, number, number]> = [
  [16, 14, 0.7],
  [24, 38, 0.6],
  [18, 66, 0.8],
  [25, 92, 0.6],
  [15, 118, 0.7],
  [22, 146, 0.6],
];
const LOWER_GLITTER: ReadonlyArray<readonly [number, number, number]> = [
  [23, 206, 0.7],
  [16, 232, 0.6],
  [25, 262, 0.8],
  [17, 290, 0.6],
  [22, 318, 0.7],
  [15, 340, 0.6],
];

function Glitter({ flecks, offset }: { flecks: ReadonlyArray<readonly [number, number, number]>; offset: number }) {
  return (
    <>
      {flecks.map(([cx, cy, r], index) => (
        <circle
          key={`${cx}-${cy}`}
          className="invite-twinkle"
          style={{ animationDelay: `${((index + offset) * 0.43).toFixed(2)}s` }}
          cx={cx}
          cy={cy}
          r={r}
          fill="#fff"
        />
      ))}
    </>
  );
}

/**
 * Sheer sage organza ribbon running down the left edge of the card and tied in
 * a bow near the middle. Drawn in the card's 250 x 350 coordinate space.
 * When `untied` the bow loosens, then the two strands slide away.
 */
export function Ribbon({ untied }: { untied: boolean }) {
  const id = useId();
  const sheer = `url(#${id})`;
  const strand = { duration: 0.95, delay: 0.3, ease: EASE_IN_OUT };

  return (
    <svg
      viewBox="0 0 250 350"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={palette.sage} stopOpacity={0.82} />
          <stop offset="0.45" stopColor="#c3ccb8" stopOpacity={0.5} />
          <stop offset="1" stopColor={palette.sage} stopOpacity={0.76} />
        </linearGradient>
      </defs>

      <motion.g initial={false} animate={untied ? { y: -230, opacity: 0 } : { y: 0, opacity: 1 }} transition={strand}>
        <rect x={12} y={-3} width={17} height={177} fill={sheer} />
        <path d="M12 -3V174M29 -3V174" stroke={palette.sageDark} strokeOpacity={0.45} strokeWidth={0.5} />
        <Glitter flecks={UPPER_GLITTER} offset={0} />
      </motion.g>

      <motion.g initial={false} animate={untied ? { y: 230, opacity: 0 } : { y: 0, opacity: 1 }} transition={strand}>
        <rect x={12} y={172} width={17} height={181} fill={sheer} />
        <path d="M12 172V353M29 172V353" stroke={palette.sageDark} strokeOpacity={0.45} strokeWidth={0.5} />
        <Glitter flecks={LOWER_GLITTER} offset={3} />
      </motion.g>

      {/* Tails fall away just after the loops let go. */}
      <motion.g
        initial={false}
        animate={untied ? { y: 70, rotate: 10, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE_IN_OUT }}
      >
        <path
          d="M18 175C14 196 6 212 -2 226L8 225L10 234C18 216 23 196 23 176Z"
          fill={sheer}
          stroke={palette.sageDark}
          strokeOpacity={0.4}
          strokeWidth={0.5}
        />
        <path
          d="M22 176C24 196 30 214 40 230L41 221L50 222C40 208 30 192 24 175Z"
          fill={sheer}
          stroke={palette.sageDark}
          strokeOpacity={0.4}
          strokeWidth={0.5}
        />
      </motion.g>

      {/* Bow loops and knot loosen first. */}
      <motion.g
        initial={false}
        animate={untied ? { scale: 0.15, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: EASE_IN_OUT }}
      >
        <path
          d="M20 172C8 152 -18 150 -17 166C-16 182 6 186 20 172Z"
          fill={sheer}
          stroke={palette.sageDark}
          strokeOpacity={0.45}
          strokeWidth={0.5}
        />
        <path
          d="M21 172C33 152 59 150 58 166C57 182 35 186 21 172Z"
          fill={sheer}
          stroke={palette.sageDark}
          strokeOpacity={0.45}
          strokeWidth={0.5}
        />
        <path d="M12 170C4 162 -9 161 -9 167C-9 174 3 176 12 170Z" fill={palette.sageDark} opacity={0.28} />
        <path d="M29 170C37 162 50 161 50 167C50 174 38 176 29 170Z" fill={palette.sageDark} opacity={0.28} />
        <rect x={15} y={166} width={11} height={12} rx={4} fill={palette.sage} />
        <rect x={15} y={166} width={11} height={12} rx={4} fill="#fff" opacity={0.18} />
        <circle className="invite-twinkle" cx={-6} cy={160} r={0.8} fill="#fff" />
        <circle className="invite-twinkle" style={{ animationDelay: "1.1s" }} cx={46} cy={162} r={0.8} fill="#fff" />
      </motion.g>
    </svg>
  );
}
