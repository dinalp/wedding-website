import type { Variants } from "framer-motion";
import { EASE_OUT } from "./palette";

/** Parent variants: staggers its children in once `show` is set. */
export function revealContainer(delayChildren: number): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren } },
  };
}

/** Child variants: a soft fade, with a small rise unless motion is reduced. */
export function revealItem(reducedMotion: boolean): Variants {
  return {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
  };
}
