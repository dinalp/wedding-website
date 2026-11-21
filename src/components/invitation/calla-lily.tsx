export type LilyColors = {
  spathe: string;
  lip: string;
  spadix: string;
  stem: string;
  /** Optional fold line drawn along the lip of the flower. */
  line?: string;
};

export const LILY_CREAM: LilyColors = {
  spathe: "#f7f0dc",
  lip: "#e9dfc4",
  spadix: "#c9a45c",
  stem: "#3d5a3a",
  line: "#cfc2a0",
};

/** Bloom centre in the lily's own coordinates, for placing it with transforms. */
export const LILY_CENTRE = { x: 52, y: 48 };

/**
 * A single calla lily drawn in a 100 x 160 box (bloom at the top, stem below).
 * Renders an SVG group, so it must sit inside an <svg>.
 */
export function CallaLily({
  colors = LILY_CREAM,
  transform,
  stem = true,
}: {
  colors?: LilyColors;
  transform?: string;
  stem?: boolean;
}) {
  return (
    <g transform={transform}>
      {stem && (
        <path
          d="M48 90C45 114 53 136 44 160"
          fill="none"
          stroke={colors.stem}
          strokeWidth={4.5}
          strokeLinecap="round"
        />
      )}
      <path
        d="M48 92C30 78 22 52 34 30C42 14 58 6 72 2C70 16 78 26 76 44C74 66 62 84 48 92Z"
        fill={colors.spathe}
      />
      <ellipse cx={55} cy={40} rx={3.6} ry={14} transform="rotate(10 55 40)" fill={colors.spadix} />
      <path d="M34 30C36 50 44 70 48 92C62 84 74 66 76 44C66 58 46 54 34 30Z" fill={colors.lip} />
      {colors.line && (
        <path
          d="M34 30C46 54 66 58 76 44"
          fill="none"
          stroke={colors.line}
          strokeWidth={1}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

/** Places a lily so its bloom centre lands on (x, y), rotated and scaled. */
export function lilyTransform(x: number, y: number, rotate: number, scale: number, flip = false) {
  return `translate(${x} ${y}) rotate(${rotate}) scale(${flip ? -scale : scale} ${scale}) translate(${-LILY_CENTRE.x} ${-LILY_CENTRE.y})`;
}
