// Colours taken from the physical invitation suite.
export const palette = {
  sage: "#9aa58f",
  sageLight: "#a9b39e",
  sageDark: "#828d78",
  sageInk: "#4c5644",
  wax: "#6e1a24",
  plum: "#4a1f2a",
  burgundy: "#7a1e2e",
  ivory: "#fbf8f1",
  card: "#faf8f3",
  gold: "#c9a45c",
  ink: "#2f2a26",
} as const;

export type Bezier = [number, number, number, number];

/** Soft "settle" curve used for most of the sequence. */
export const EASE_OUT: Bezier = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT: Bezier = [0.45, 0, 0.2, 1];
export const EASE_IN: Bezier = [0.5, 0, 0.8, 0.3];
/** Sine in-out, for the slow loops that breathe: the envelope's float, the seal's glow. */
export const EASE_SINE: Bezier = [0.37, 0, 0.63, 1];
/** A light thing falling through air: gathers a little speed and never brakes. */
export const EASE_FALL: Bezier = [0.3, 0, 0.7, 0.7];

/** Shared durations, in seconds, so every part of the sequence moves at a related pace. */
export const DURATION = {
  /** Feedback and exits: presses, hints leaving. */
  quick: 0.25,
  /** Things arriving and coming to rest: text, controls. */
  settle: 0.8,
  /** Paper travelling a distance: the flap, the card, a swap. */
  travel: 1.05,
} as const;
