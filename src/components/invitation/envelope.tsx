"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { LinerArt, LINER_SIZE } from "./liner";
import { EASE_IN_OUT, palette } from "./palette";

/** All envelope layers share this 1.41:1 coordinate space. */
const VIEW = { width: 564, height: 400 };
const VIEW_BOX = `0 0 ${VIEW.width} ${VIEW.height}`;

/** Top edge of the front pocket. */
const POCKET_TOP = 70;
/**
 * Where the flap's edge meets the envelope's sides. It sits just below the
 * pocket's top edge so the closed flap and pocket overlap at the corners and
 * none of the dark inside shows beside the flap's shoulders.
 */
const FLAP_SHOULDER = POCKET_TOP + 4;
/** Scalloped shoulders curving down to a rounded point in the centre. */
const FLAP_CURVE = `Q548 108 486 112Q470 168 392 170Q372 226 300 240Q282 258 264 240Q192 226 172 170Q94 168 78 112Q16 108 0 ${FLAP_SHOULDER}`;
const FLAP_EDGE = `M564 ${FLAP_SHOULDER}${FLAP_CURVE}`;
const FLAP_PATH = `M0 0H564V${FLAP_SHOULDER}${FLAP_CURVE}Z`;
/** Sage card showing around the dark inside, so the envelope's outer edge is never burgundy. */
const INTERIOR_RIM = 3;
/** The same flap mirrored upwards, as it sits once opened (hinge along the bottom). */
const FLIP = `translate(0 ${VIEW.height}) scale(1 -1)`;

/** Where the flap's point (and so the wax seal) sits, as a fraction of the envelope. */
export const SEAL_POSITION = { left: "50%", top: "59%" };

const layer = "absolute inset-0 h-full w-full";

/** Inside of the envelope, seen above the pocket once the flap lifts. */
export function EnvelopeInterior() {
  return (
    <svg
      viewBox={VIEW_BOX}
      className={layer}
      style={{ borderRadius: 4, boxShadow: "0 26px 44px -20px rgba(52, 62, 44, 0.55)" }}
      aria-hidden="true"
    >
      <rect width={VIEW.width} height={VIEW.height} rx={5} fill={palette.sage} />
      <rect
        x={INTERIOR_RIM}
        y={INTERIOR_RIM}
        width={VIEW.width - INTERIOR_RIM * 2}
        height={VIEW.height - INTERIOR_RIM * 2}
        rx={3}
        fill="#3d1822"
      />
      <rect
        x={INTERIOR_RIM}
        y={INTERIOR_RIM}
        width={VIEW.width - INTERIOR_RIM * 2}
        height={90 - INTERIOR_RIM}
        rx={3}
        fill="#000"
        opacity={0.18}
      />
    </svg>
  );
}

/** Front pocket with the half-moon thumb notch at the top centre. */
export function EnvelopePocket() {
  const id = useId();
  return (
    <svg viewBox={VIEW_BOX} className={layer} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a0ab95" />
          <stop offset="1" stopColor="#929d87" />
        </linearGradient>
      </defs>
      <path
        d={`M0 ${POCKET_TOP}H252A30 30 0 0 0 312 ${POCKET_TOP}H564V395Q564 400 559 400H5Q0 400 0 395Z`}
        fill={`url(#${id})`}
      />
      {/* Side-flap folds meeting under the main flap. */}
      <path
        d="M0 400L246 214M564 400L318 214"
        fill="none"
        stroke={palette.sageDark}
        strokeOpacity={0.45}
        strokeWidth={1.2}
      />
      <path
        d={`M0 ${POCKET_TOP}H252A30 30 0 0 0 312 ${POCKET_TOP}H564`}
        fill="none"
        stroke="#fff"
        strokeOpacity={0.3}
        strokeWidth={1.2}
      />
    </svg>
  );
}

/**
 * The back flap. Rotates open in 3D around its top edge; the outer face is
 * sage card and the inner face carries the botanical liner.
 */
export function EnvelopeFlap({ open }: { open: boolean }) {
  const id = useId();
  const gradient = `${id}-g`;
  const shadow = `${id}-s`;
  const clip = `${id}-c`;
  const face = {
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  } as const;

  return (
    <div className="absolute inset-0" style={{ perspective: "1100px", perspectiveOrigin: "50% 0%" }}>
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", originX: 0.5, originY: 0 }}
        initial={false}
        animate={{ rotateX: open ? 180 : 0 }}
        transition={{ duration: 1.05, ease: EASE_IN_OUT }}
      >
        <div className="absolute inset-0" style={face}>
          <svg viewBox={VIEW_BOX} className={layer} style={{ overflow: "visible" }} aria-hidden="true">
            <defs>
              <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={palette.sageLight} />
                <stop offset="0.7" stopColor={palette.sage} />
              </linearGradient>
              <filter id={shadow} x="-10%" y="-10%" width="120%" height="135%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
            </defs>
            <path d={FLAP_PATH} transform="translate(0 5)" fill="#2c3326" opacity={0.3} filter={`url(#${shadow})`} />
            <path d={FLAP_PATH} fill={`url(#${gradient})`} />
            <path d={FLAP_EDGE} fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={1.2} />
          </svg>
        </div>

        <div className="absolute inset-0" style={{ ...face, transform: "rotateX(180deg)" }}>
          <svg viewBox={VIEW_BOX} className={layer} style={{ overflow: "visible" }} aria-hidden="true">
            <defs>
              <clipPath id={clip}>
                <path d={FLAP_PATH} transform={FLIP} />
              </clipPath>
            </defs>
            <g clipPath={`url(#${clip})`}>
              <g transform={`translate(0 ${VIEW.height - LINER_SIZE.height})`}>
                <LinerArt />
              </g>
            </g>
            {/* Sage rim where the card shows around the liner. */}
            <path d={FLAP_PATH} transform={FLIP} fill="none" stroke={palette.sage} strokeWidth={5} />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
