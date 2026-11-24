import { CallaLily, lilyTransform } from "./calla-lily";
import { palette } from "./palette";

/** Artwork is drawn for a 564 x 260 area: wide at the bottom, narrowing to a point at the top. */
export const LINER_SIZE = { width: 564, height: 260 };

const LILIES = [
  { x: 282, y: 112, rotate: 0, scale: 1.45, flip: false },
  { x: 168, y: 178, rotate: -38, scale: 1.15, flip: false },
  { x: 396, y: 178, rotate: 38, scale: 1.15, flip: true },
  { x: 62, y: 232, rotate: -62, scale: 0.95, flip: false },
  { x: 502, y: 232, rotate: 62, scale: 0.95, flip: true },
];

const LEAVES = [
  { x: 262, y: 172, rotate: -140, scale: 1 },
  { x: 302, y: 172, rotate: -40, scale: 1 },
  { x: 196, y: 226, rotate: 160, scale: 1.1 },
  { x: 368, y: 226, rotate: 20, scale: 1.1 },
  { x: 96, y: 206, rotate: -110, scale: 0.9 },
  { x: 468, y: 206, rotate: -70, scale: 0.9 },
  { x: 282, y: 250, rotate: -90, scale: 1.2 },
];

const SPRIGS = [
  { x: 222, y: 142, rotate: -25, scale: 1 },
  { x: 342, y: 142, rotate: 25, scale: 1 },
  { x: 140, y: 244, rotate: -50, scale: 1 },
  { x: 424, y: 244, rotate: 50, scale: 1 },
  { x: 282, y: 66, rotate: 0, scale: 0.8 },
];

const BERRIES: ReadonlyArray<readonly [number, number]> = [
  [3, -34],
  [-4, -24],
  [6, -20],
  [-3, -12],
  [5, -8],
];

const CLUSTERS: ReadonlyArray<readonly [number, number]> = [
  [228, 198],
  [338, 198],
  [282, 228],
  [118, 240],
  [446, 240],
];

const BLOSSOMS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [9, -5],
  [-9, -4],
  [5, 8],
  [-6, 8],
  [14, 5],
  [-14, 4],
];

const PINKS = ["#e6bcc3", "#d9a0ac", "#efd0d4"];

/**
 * Vintage botanical liner: cream calla lilies, pink hydrangea clusters, berry
 * sprigs and dark leaves on plum. Renders an SVG group for the caller to clip.
 */
export function LinerArt() {
  return (
    <g>
      <rect width={LINER_SIZE.width} height={LINER_SIZE.height} fill={palette.plum} />

      {LEAVES.map((leaf) => (
        <g
          key={`leaf-${leaf.x}-${leaf.y}`}
          transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotate}) scale(${leaf.scale})`}
        >
          <path d="M0 0C10 -11 30 -12 44 0C30 12 10 11 0 0Z" fill="#2c4732" />
          <path d="M2 0H41" stroke="#52714f" strokeWidth={0.9} strokeLinecap="round" />
        </g>
      ))}

      {SPRIGS.map((sprig) => (
        <g
          key={`sprig-${sprig.x}-${sprig.y}`}
          transform={`translate(${sprig.x} ${sprig.y}) rotate(${sprig.rotate}) scale(${sprig.scale})`}
        >
          <path
            d="M0 0C2 -12 -2 -22 3 -34M0 -9L5 -8M0 -14L-3 -12M1 -21L6 -20M0 -25L-4 -24"
            fill="none"
            stroke="#8a9a78"
            strokeWidth={0.9}
            strokeLinecap="round"
          />
          {BERRIES.map(([bx, by]) => (
            <circle key={`${bx}-${by}`} cx={bx} cy={by} r={2.4} fill="#f3ead2" />
          ))}
        </g>
      ))}

      {LILIES.map((lily) => (
        <CallaLily
          key={`lily-${lily.x}-${lily.y}`}
          transform={lilyTransform(lily.x, lily.y, lily.rotate, lily.scale, lily.flip)}
        />
      ))}

      {CLUSTERS.map(([cx, cy]) => (
        <g key={`cluster-${cx}-${cy}`} transform={`translate(${cx} ${cy})`}>
          {BLOSSOMS.map(([bx, by], index) => (
            <g key={`${bx}-${by}`} transform={`translate(${bx} ${by})`} fill={PINKS[index % PINKS.length]}>
              <circle cx={-3} cy={0} r={3.4} />
              <circle cx={3} cy={0} r={3.4} />
              <circle cx={0} cy={-3} r={3.4} />
              <circle cx={0} cy={3} r={3.4} />
              <circle r={1.2} fill={palette.gold} />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
}
