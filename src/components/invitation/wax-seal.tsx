"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { CallaLily, type LilyColors } from "./calla-lily";
import { SEAL_POSITION } from "./envelope";
import { EASE_IN, palette } from "./palette";

/** Smooth closed blob through uneven radii, for the irregular poured-wax edge. */
function blobPath(radii: number[]) {
  const points = radii.map((radius, index) => {
    const angle = (index / radii.length) * Math.PI * 2;
    return [50 + radius * Math.cos(angle), 50 + radius * Math.sin(angle)] as const;
  });
  const fmt = (point: readonly [number, number]) => `${point[0].toFixed(1)} ${point[1].toFixed(1)}`;
  const mid = (a: readonly [number, number], b: readonly [number, number]) =>
    [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as const;
  const count = points.length;
  let d = `M${fmt(mid(points[count - 1], points[0]))}`;
  for (let i = 0; i < count; i += 1) {
    d += `Q${fmt(points[i])} ${fmt(mid(points[i], points[(i + 1) % count]))}`;
  }
  return `${d}Z`;
}

const WAX_EDGE = blobPath([47, 44, 48, 45, 43, 46, 48, 45, 44, 47, 45, 43, 46, 48, 44, 45]);

const LILY_PRESSED: LilyColors = {
  spathe: "#8c2634",
  lip: "#7b1f2b",
  spadix: "#5a121b",
  stem: "#5a121b",
  line: "#b65361",
};
const LILY_SHADOW: LilyColors = {
  spathe: "#470c14",
  lip: "#470c14",
  spadix: "#470c14",
  stem: "#470c14",
};
const LILY_PLACEMENT = "translate(32 21) scale(0.36)";

/** Jagged crack down the middle; the two halves are complementary polygons. */
const LEFT_HALF = "polygon(0 0, 52% 0, 46% 22%, 55% 40%, 45% 58%, 54% 78%, 48% 100%, 0 100%)";
const RIGHT_HALF = "polygon(52% 0, 100% 0, 100% 100%, 48% 100%, 54% 78%, 45% 58%, 55% 40%, 46% 22%)";

const CRUMBS = [
  { x: -16, y: 34, size: 5 },
  { x: 10, y: 44, size: 4 },
  { x: -4, y: 54, size: 3 },
  { x: 22, y: 30, size: 3 },
  { x: -26, y: 22, size: 4 },
];

function SealFace() {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" className="block h-full w-full" style={{ overflow: "visible" }} aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="0.38" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#9c2d3c" />
          <stop offset="0.55" stopColor={palette.wax} />
          <stop offset="1" stopColor="#4d0f18" />
        </radialGradient>
      </defs>
      <path d={WAX_EDGE} transform="translate(1.5 3)" fill="#1d0508" opacity={0.3} />
      <path d={WAX_EDGE} fill={`url(#${id})`} />
      {/* Pressed inner ring: dark groove with a lit edge. */}
      <circle cx={50} cy={50} r={32} fill="none" stroke="#470c14" strokeOpacity={0.7} strokeWidth={1.4} />
      <circle cx={49.4} cy={49.2} r={32} fill="none" stroke="#b65361" strokeOpacity={0.5} strokeWidth={0.7} />
      <g transform="translate(0.9 1.1)">
        <CallaLily colors={LILY_SHADOW} transform={LILY_PLACEMENT} />
      </g>
      <CallaLily colors={LILY_PRESSED} transform={LILY_PLACEMENT} />
      <ellipse cx={33} cy={26} rx={15} ry={6} transform="rotate(-32 33 26)" fill="#fff" opacity={0.16} />
      <ellipse cx={70} cy={76} rx={9} ry={3.5} transform="rotate(-38 70 76)" fill="#fff" opacity={0.07} />
    </svg>
  );
}

/**
 * The wax seal is the control that opens the invitation. When `broken` it
 * cracks into two halves that split, tumble and fade, with a few wax crumbs.
 */
export function WaxSeal({
  broken,
  reducedMotion,
  onOpen,
}: {
  broken: boolean;
  reducedMotion: boolean;
  onOpen: () => void;
}) {
  const idle = !broken && !reducedMotion;
  const split = { duration: 0.8, ease: EASE_IN };

  return (
    <button
      type="button"
      aria-label="Open the invitation"
      disabled={broken}
      onClick={onOpen}
      className="invite-seal absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        ...SEAL_POSITION,
        width: "21%",
        minWidth: 56,
        cursor: broken ? "default" : "pointer",
        pointerEvents: broken ? "none" : "auto",
      }}
    >
      <motion.span
        aria-hidden="true"
        className="absolute rounded-full"
        style={{
          inset: "-38%",
          background: `radial-gradient(circle, ${palette.gold}99 0%, ${palette.gold}33 38%, transparent 66%)`,
        }}
        initial={false}
        animate={
          idle
            ? { opacity: [0.35, 0.85, 0.35], scale: [0.92, 1.08, 0.92] }
            : { opacity: broken ? 0 : 0.5, scale: 1 }
        }
        transition={idle ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      />

      <motion.span
        className="absolute inset-0 block"
        whileHover={broken ? undefined : { scale: 1.05 }}
        whileTap={broken ? undefined : { scale: 0.95 }}
        transition={{ duration: 0.25 }}
      >
        <motion.span
          className="absolute inset-0 block"
          style={{ clipPath: LEFT_HALF }}
          initial={false}
          animate={
            broken
              ? { x: "-34%", y: "78%", rotate: -34, opacity: [1, 1, 0] }
              : { x: "0%", y: "0%", rotate: 0, opacity: 1 }
          }
          transition={split}
        >
          <SealFace />
        </motion.span>
        <motion.span
          className="absolute inset-0 block"
          style={{ clipPath: RIGHT_HALF }}
          initial={false}
          animate={
            broken
              ? { x: "38%", y: "92%", rotate: 40, opacity: [1, 1, 0] }
              : { x: "0%", y: "0%", rotate: 0, opacity: 1 }
          }
          transition={{ ...split, delay: 0.04 }}
        >
          <SealFace />
        </motion.span>
      </motion.span>

      {CRUMBS.map((crumb, index) => (
        <motion.span
          key={`${crumb.x}-${crumb.y}`}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{ width: crumb.size, height: crumb.size, background: palette.wax }}
          initial={false}
          animate={
            broken
              ? { x: [0, crumb.x * 0.6, crumb.x], y: [0, crumb.y * 0.4, crumb.y + 26], opacity: [0, 1, 0] }
              : { x: 0, y: 0, opacity: 0 }
          }
          transition={{ duration: 0.75, delay: 0.05 + index * 0.03, ease: "easeIn" }}
        />
      ))}
    </button>
  );
}
