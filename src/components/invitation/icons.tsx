import type { ReactNode } from "react";

/** Thin white line icons for the timeline, stroke only. */
function LineIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width="100%"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function Flute() {
  return (
    <g transform="translate(-1.5 2) rotate(14 16 26)">
      <path d="M11 8H21L19.8 19.5A3.8 4 0 0 1 12.2 19.5Z" />
      <path d="M11.6 13.5H20.4" />
      <path d="M16 23.5V36M11.5 36.5H20.5" />
    </g>
  );
}

/** Two champagne flutes clinking. */
export function ChampagneIcon() {
  return (
    <LineIcon>
      <Flute />
      <g transform="translate(48 0) scale(-1 1)">
        <Flute />
      </g>
      <path d="M24 3V6.5M19.4 4.4L20.8 7.2M28.6 4.4L27.2 7.2" />
    </LineIcon>
  );
}

/** Two interlocked wedding rings, one set with a stone. */
export function RingsIcon() {
  return (
    <LineIcon>
      <circle cx={18.5} cy={29} r={10.5} />
      <circle cx={30} cy={29} r={10.5} />
      <path d="M18.5 18.5L15.4 15.2L17 12.8H20L21.6 15.2Z" />
      <path d="M15.4 15.2H21.6" />
    </LineIcon>
  );
}

/** A beach lounger under the sun. */
export function LoungerIcon() {
  return (
    <LineIcon>
      <path d="M5 31H33L42 16" />
      <path d="M5 34H34.4L44 18" />
      <path d="M10 34V40M31 34V40M35 34L39 40" />
      <circle cx={12} cy={13} r={4} />
      <path d="M12 5V6.8M12 19.2V21M4 13H5.8M18.2 13H20M6.4 7.4L7.6 8.6M16.4 17.4L17.6 18.6M17.6 7.4L16.4 8.6M7.6 17.4L6.4 18.6" />
    </LineIcon>
  );
}
