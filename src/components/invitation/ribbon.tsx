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

/** The strands wrap just over the card's top and bottom edges and never show beyond them. */
const STRAND_TOP = -3;
const STRAND_BOTTOM = 353;
const KNOT_Y = 172;
/** Far enough to carry each strand completely past its edge of the card. */
const STRAND_TRAVEL = 190;

const TIED = { duration: 0 };

/** A piece leaving: three keyframes at `times`, solid for the first two and faded out by the last. */
function leaving(duration: number, delay: number, times: number[]) {
  return {
    duration,
    delay,
    ease: EASE_IN_OUT,
    times,
    opacity: { duration, delay, ease: "linear" as const, times },
  };
}

const outline = { stroke: palette.sageDark, strokeOpacity: 0.45, strokeWidth: 0.5 } as const;

/**
 * Sheer sage organza ribbon running down the left edge of the card and tied in
 * a bow near the middle. Drawn in the card's 250 x 350 coordinate space.
 *
 * Untying takes about 1.25s: the loops loosen and are drawn into the knot, the
 * knot lets go, the tails fall, and the two strands slip off over the card's
 * top and bottom edges. The strands are clipped to the card, so nothing ever
 * extends past it.
 */
export function Ribbon({ untied }: { untied: boolean }) {
  const id = useId();
  const sheer = `url(#${id})`;
  const clip = `${id}-clip`;

  const loopOut = (rotate: number) =>
    untied
      ? { scale: [1, 1.08, 0.12], rotate: [0, rotate * 0.3, rotate], opacity: [1, 1, 0] }
      : { scale: 1, rotate: 0, opacity: 1 };
  const strandOut = (y: number) => (untied ? { y: [0, y * 0.7, y], opacity: [1, 1, 0] } : { y: 0, opacity: 1 });

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
        <clipPath id={clip}>
          <rect x={0} y={STRAND_TOP} width={250} height={STRAND_BOTTOM - STRAND_TOP} />
        </clipPath>
      </defs>

      {/* Strands: clipped to the card, they slide off its ends and fade last. */}
      <g clipPath={`url(#${clip})`}>
        <motion.g
          initial={false}
          animate={strandOut(-STRAND_TRAVEL)}
          transition={untied ? leaving(0.9, 0.35, [0, 0.6, 1]) : TIED}
        >
          <rect x={12} y={STRAND_TOP} width={17} height={KNOT_Y + 2 - STRAND_TOP} fill={sheer} />
          <path d={`M12 ${STRAND_TOP}V${KNOT_Y + 2}M29 ${STRAND_TOP}V${KNOT_Y + 2}`} fill="none" {...outline} />
          <Glitter flecks={UPPER_GLITTER} offset={0} />
        </motion.g>

        <motion.g
          initial={false}
          animate={strandOut(STRAND_TRAVEL)}
          transition={untied ? leaving(0.9, 0.35, [0, 0.6, 1]) : TIED}
        >
          <rect x={12} y={KNOT_Y} width={17} height={STRAND_BOTTOM - KNOT_Y} fill={sheer} />
          <path d={`M12 ${KNOT_Y}V${STRAND_BOTTOM}M29 ${KNOT_Y}V${STRAND_BOTTOM}`} fill="none" {...outline} />
          <Glitter flecks={LOWER_GLITTER} offset={3} />
        </motion.g>
      </g>

      {/* Tails fall a little way down the card once the knot lets go. */}
      <motion.g
        initial={false}
        animate={
          untied ? { y: [0, 14, 64], rotate: [0, 3, 9], opacity: [1, 1, 0] } : { y: 0, rotate: 0, opacity: 1 }
        }
        transition={untied ? leaving(0.9, 0.3, [0, 0.4, 1]) : TIED}
      >
        <path
          d="M18 175C14 196 6 212 -2 226L8 225L10 234C18 216 23 196 23 176Z"
          fill={sheer}
          {...outline}
          strokeOpacity={0.4}
        />
        <path
          d="M22 176C24 196 30 214 40 230L41 221L50 222C40 208 30 192 24 175Z"
          fill={sheer}
          {...outline}
          strokeOpacity={0.4}
        />
      </motion.g>

      {/* Bow loops loosen first, each drawn back into the knot. */}
      <motion.g
        style={{ originX: 1, originY: 0.65 }}
        initial={false}
        animate={loopOut(-20)}
        transition={untied ? leaving(0.8, 0, [0, 0.3, 1]) : TIED}
      >
        <path d="M20 172C8 152 -18 150 -17 166C-16 182 6 186 20 172Z" fill={sheer} {...outline} />
        <path d="M12 170C4 162 -9 161 -9 167C-9 174 3 176 12 170Z" fill={palette.sageDark} opacity={0.28} />
        <circle className="invite-twinkle" cx={-6} cy={160} r={0.8} fill="#fff" />
      </motion.g>
      <motion.g
        style={{ originX: 0, originY: 0.65 }}
        initial={false}
        animate={loopOut(20)}
        transition={untied ? leaving(0.8, 0.08, [0, 0.3, 1]) : TIED}
      >
        <path d="M21 172C33 152 59 150 58 166C57 182 35 186 21 172Z" fill={sheer} {...outline} />
        <path d="M29 170C37 162 50 161 50 167C50 174 38 176 29 170Z" fill={palette.sageDark} opacity={0.28} />
        <circle className="invite-twinkle" style={{ animationDelay: "1.1s" }} cx={46} cy={162} r={0.8} fill="#fff" />
      </motion.g>

      {/* The knot gives way as the loops come through it. */}
      <motion.g
        initial={false}
        animate={untied ? { scale: [1, 1, 0.3], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }}
        transition={untied ? leaving(0.5, 0.4, [0, 0.2, 1]) : TIED}
      >
        <rect x={15} y={166} width={11} height={12} rx={4} fill={palette.sage} />
        <rect x={15} y={166} width={11} height={12} rx={4} fill="#fff" opacity={0.18} />
      </motion.g>
    </svg>
  );
}
