"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, MotionConfig, motion, type PanInfo } from "framer-motion";
import { DetailsCard } from "./details-card";
import { EnvelopeFlap, EnvelopeInterior, EnvelopePocket } from "./envelope";
import { MainCard } from "./main-card";
import { EASE_IN, EASE_IN_OUT, EASE_OUT } from "./palette";
import { DriftingPetals, PetalBurst } from "./petals";
import { WaxSeal } from "./wax-seal";

/**
 * Sequence steps:
 * 0 sealed · 1 seal cracks · 2 flap lifts · 3 card slides out ·
 * 4 envelope drops away, card settles · 5 ribbon unties · 6 details revealed (interactive)
 */
const SEALED = 0;
const CRACKING = 1;
const FLAP_OPEN = 2;
const CARD_RISING = 3;
const CARD_SETTLED = 4;
const RIBBON_UNTIED = 5;
const REVEALED = 6;

/** When each step after the tap begins, in ms. The last one finishes at about 5.4s. */
const SEQUENCE: ReadonlyArray<readonly [number, number]> = [
  [550, FLAP_OPEN],
  [1350, CARD_RISING],
  [2250, CARD_SETTLED],
  [3150, RIBBON_UNTIED],
  [4500, REVEALED],
];

/** How long a card swap takes, and when the cards trade places in depth. */
const SWAP_SECONDS = 0.85;
const SWAP_DEPTH_MS = 400;

type View = "main" | "details";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Hydration-safe reduced-motion preference (false on the server, real value after). */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

// Card offsets are percentages of the card's own height, measured from the
// centre of the envelope: tucked inside, then risen until its foot clears the
// envelope's bottom edge, then centred.
const INSIDE = { x: "0%", y: "19.4%", scale: 0.86, rotate: 0, opacity: 1 };
const RISEN = { x: "0%", y: "-19.6%", scale: 0.86, rotate: 0, opacity: 1 };
const CENTRED = { x: "0%", y: "0%", scale: 1, rotate: 0, opacity: 1 };
const TUCKED_BEHIND = { x: "-4%", y: "0%", scale: 0.95, rotate: -2.5, opacity: 0 };

/** Where a card sits in the finished stack. Swaps slide out sideways and back. */
function stackPose(front: boolean, reducedMotion: boolean) {
  if (reducedMotion) return { x: "0%", y: "0%", scale: 1, rotate: 0, opacity: front ? 1 : 0 };
  return front
    ? { x: ["-4%", "56%", "0%"], y: "0%", scale: [0.95, 1, 1], rotate: [-2.5, 4, 0], opacity: 1 }
    : { x: ["0%", "-22%", "-4%"], y: "0%", scale: [1, 0.97, 0.95], rotate: [0, -4, -2.5], opacity: 1 };
}

const SWAP_TRANSITION = { duration: SWAP_SECONDS, ease: EASE_IN_OUT, opacity: { duration: 0.35 } };

function mainCardTransition(step: number) {
  if (step === CARD_RISING) return { duration: 1, ease: EASE_OUT };
  if (step < REVEALED) return { duration: 1, delay: 0.12, ease: EASE_IN_OUT };
  return SWAP_TRANSITION;
}

export function InvitationExperience() {
  const reducedMotion = usePrefersReducedMotion();
  const [step, setStep] = useState(SEALED);
  const [view, setView] = useState<View>("main");
  /** Which card is on top. Lags `view` so the swap happens while the cards are apart. */
  const [topCard, setTopCard] = useState<View>("main");
  /** True when the sequence was skipped (or motion is reduced): cards simply fade in. */
  const [instant, setInstant] = useState(false);
  const [runId, setRunId] = useState(0);
  const timers = useRef<number[]>([]);
  const lastSwap = useRef(0);
  const stackRef = useRef<HTMLDivElement>(null);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Once the cards are interactive, hand keyboard and screen-reader focus to them.
  useEffect(() => {
    if (step === REVEALED) stackRef.current?.focus({ preventScroll: true });
  }, [step]);

  const showView = useCallback(
    (next: View) => {
      const now = Date.now();
      if (now - lastSwap.current < SWAP_SECONDS * 1000) return;
      lastSwap.current = now;
      setView(next);
      if (reducedMotion) setTopCard(next);
      else timers.current.push(window.setTimeout(() => setTopCard(next), SWAP_DEPTH_MS));
    },
    [reducedMotion],
  );

  const finish = () => {
    clearTimers();
    setInstant(true);
    setStep(REVEALED);
    setView("details");
    setTopCard("details");
  };

  const open = () => {
    if (step !== SEALED) return;
    if (reducedMotion) {
      finish();
      return;
    }
    setStep(CRACKING);
    for (const [delay, next] of SEQUENCE) {
      timers.current.push(
        window.setTimeout(() => {
          setStep(next);
          if (next === REVEALED) showView("details");
        }, delay),
      );
    }
  };

  const replay = () => {
    clearTimers();
    lastSwap.current = 0;
    setInstant(false);
    setStep(SEALED);
    setView("main");
    setTopCard("main");
    setRunId((id) => id + 1);
  };

  const toggleView = () => showView(view === "details" ? "main" : "details");

  const onPanEnd = (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (step !== REVEALED) return;
    const { x, y } = info.offset;
    if (Math.abs(x) > 48 && Math.abs(x) > Math.abs(y) * 1.5) toggleView();
  };

  const revealed = step === REVEALED;
  const envelopeGone = step >= CARD_SETTLED;
  const idle = step === SEALED && !reducedMotion;

  // Every envelope layer drops and fades together once the card is out.
  const envelopeLayer = {
    initial: false as const,
    animate: envelopeGone
      ? { y: "70%", rotate: -3, opacity: [1, 0.9, 0] }
      : { y: "0%", rotate: 0, opacity: 1 },
    transition: { duration: 0.85, ease: EASE_IN },
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="invite-stage relative w-full overflow-hidden">
        {!reducedMotion && <DriftingPetals />}
        {!reducedMotion && !instant && <PetalBurst key={runId} active={step >= FLAP_OPEN} />}

        <div
          key={runId}
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ top: "calc(50% - 24px)", width: "var(--ew)", height: "var(--eh)" }}
        >
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={idle ? { y: [0, -7, 0] } : { y: 0 }}
            transition={idle ? { duration: 4.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
          >
            {!revealed && (
              <motion.div className="pointer-events-none absolute inset-0" style={{ zIndex: 0 }} {...envelopeLayer}>
                <EnvelopeInterior />
              </motion.div>
            )}

            {/* The flap starts on top; once open it sits behind the card as it rises. */}
            {!revealed && (
              <motion.div
                className="pointer-events-none absolute inset-0"
                style={{ zIndex: step >= CARD_RISING ? 1 : 30 }}
                {...envelopeLayer}
              >
                <EnvelopeFlap open={step >= FLAP_OPEN} />
              </motion.div>
            )}

            {/* Clips the card at the envelope's bottom edge while it is still inside. */}
            <div
              className="pointer-events-none absolute"
              style={{
                zIndex: 10,
                top: "-100vh",
                bottom: 0,
                left: "-50vw",
                right: "-50vw",
                overflow: envelopeGone ? "visible" : "hidden",
              }}
            >
              <motion.div
                key={instant ? "instant" : "sequence"}
                ref={stackRef}
                role="group"
                aria-label="Your invitation"
                tabIndex={-1}
                inert={!revealed}
                className="absolute left-1/2 -translate-x-1/2 translate-y-1/2 outline-none"
                style={{
                  bottom: "calc(var(--eh) / 2)",
                  width: "var(--cw)",
                  height: "var(--ch)",
                  pointerEvents: revealed ? "auto" : "none",
                  touchAction: "pan-y",
                }}
                initial={instant ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                onPanEnd={onPanEnd}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ zIndex: topCard === "main" ? 2 : 1 }}
                  inert={revealed && view !== "main"}
                  initial={false}
                  animate={
                    step < CARD_RISING
                      ? INSIDE
                      : step === CARD_RISING
                        ? RISEN
                        : step < REVEALED
                          ? CENTRED
                          : stackPose(view === "main", reducedMotion)
                  }
                  transition={mainCardTransition(step)}
                >
                  <MainCard
                    textVisible={step >= CARD_SETTLED}
                    ribbonUntied={step >= RIBBON_UNTIED}
                    reducedMotion={reducedMotion}
                  />
                </motion.div>

                <motion.div
                  className="absolute inset-0"
                  style={{ zIndex: topCard === "details" ? 2 : 1 }}
                  inert={view !== "details"}
                  initial={false}
                  animate={revealed ? stackPose(view === "details", reducedMotion) : TUCKED_BEHIND}
                  transition={SWAP_TRANSITION}
                >
                  <DetailsCard textVisible={revealed} reducedMotion={reducedMotion} />
                </motion.div>
              </motion.div>
            </div>

            {!revealed && (
              <motion.div className="pointer-events-none absolute inset-0" style={{ zIndex: 20 }} {...envelopeLayer}>
                <EnvelopePocket />
              </motion.div>
            )}

            {!revealed && (
              <motion.div className="pointer-events-none absolute inset-0" style={{ zIndex: 40 }} {...envelopeLayer}>
                <WaxSeal broken={step >= CRACKING} reducedMotion={reducedMotion} onOpen={open} />
              </motion.div>
            )}
          </motion.div>

          <AnimatePresence>
            {step === SEALED && (
              <motion.div
                className="absolute inset-x-0 top-full flex flex-col items-center gap-2 pt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="invite-caps" style={{ fontSize: 11, letterSpacing: "0.28em", color: "#4c5644" }}>
                  Tap the seal to open
                </p>
                <button type="button" className="invite-caps invite-link" onClick={finish}>
                  Skip animation
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {revealed && (
          <motion.div
            className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 px-4"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: instant ? 0.3 : 0.9 }}
          >
            <button type="button" className="invite-caps invite-btn" onClick={toggleView}>
              {view === "details" ? "Back to invitation" : "View details"}
            </button>
            <button type="button" className="invite-caps invite-link" onClick={replay}>
              Replay
            </button>
          </motion.div>
        )}
      </main>
    </MotionConfig>
  );
}
