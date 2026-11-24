"use client";

import type { Ref } from "react";
import { motion } from "framer-motion";
import { CallaLily, lilyTransform, type LilyColors } from "./calla-lily";
import { palette } from "./palette";
import { revealContainer, revealItem } from "./reveal";
import { Ribbon } from "./ribbon";

const EMBOSS_FILTER = "invite-emboss";

const LILY_EMBOSSED: LilyColors = {
  spathe: palette.card,
  lip: "#f4f1e9",
  spadix: palette.card,
  stem: palette.card,
  line: "#d6cfbf",
};

/** Blind-embossed calla lily with swirling leaves, drawn for the top-left corner. */
function EmbossedCorner({ flipX = false, flipY = false }: { flipX?: boolean; flipY?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className="absolute"
      style={{
        width: "36%",
        left: flipX ? undefined : 0,
        right: flipX ? 0 : undefined,
        top: flipY ? undefined : 0,
        bottom: flipY ? 0 : undefined,
        transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
      }}
      aria-hidden="true"
    >
      <g filter={`url(#${EMBOSS_FILTER})`}>
        <g fill={palette.card}>
          <path d="M58 30C72 22 92 26 104 40C88 42 70 40 58 30Z" />
          <path d="M24 66C22 80 28 96 42 106C40 90 34 76 24 66Z" />
        </g>
        <g fill="none" stroke={palette.card} strokeWidth={2.4} strokeLinecap="round">
          <path d="M69 88C80 98 96 96 98 84C99 75 88 71 84 79" />
          <path d="M52 14C66 4 88 6 96 18C102 28 92 36 85 30" />
          <path d="M12 62C4 76 8 98 20 104C30 108 36 98 29 92" />
        </g>
        <CallaLily colors={LILY_EMBOSSED} transform={lilyTransform(30, 34, -40, 0.6)} />
      </g>
    </svg>
  );
}

const capsLine = {
  color: palette.ink,
  // About 12px on a 390px phone and 11px on a 360px one.
  fontSize: "3.5cqw",
  letterSpacing: "0.11em",
  // Tracked caps: indent by the tracking so each line stays optically centred.
  textIndent: "0.11em",
  lineHeight: 1.9,
} as const;

/**
 * The main invitation: soft white card with blind-embossed corners, the names
 * in burgundy script and the sage ribbon tied down the left edge.
 */
export function MainCard({
  headingRef,
  textVisible,
  ribbonUntied,
  reducedMotion,
}: {
  /** Focus target when this card is brought forward from the keyboard. */
  headingRef?: Ref<HTMLHeadingElement>;
  textVisible: boolean;
  ribbonUntied: boolean;
  reducedMotion: boolean;
}) {
  const item = revealItem(reducedMotion);

  return (
    <div className="relative h-full w-full" style={{ containerType: "inline-size" }}>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          background: `linear-gradient(160deg, #fffefb 0%, ${palette.card} 55%, #f3f0e8 100%)`,
          borderRadius: "0.8cqw",
          // Lit top edge and a faint darkening towards the edges, as on thick cotton stock.
          boxShadow:
            "inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 0 26px rgba(120, 105, 80, 0.07), 0 1px 2px rgba(60, 50, 40, 0.16), 0 22px 44px -14px rgba(60, 50, 40, 0.38)",
        }}
      >
        <div className="invite-grain" aria-hidden="true" />
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <defs>
            <filter id={EMBOSS_FILTER} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0.8" dy="1" stdDeviation="0.55" floodColor="#7d7565" floodOpacity="0.5" />
              <feDropShadow dx="-0.7" dy="-0.8" stdDeviation="0.4" floodColor="#ffffff" floodOpacity="1" />
            </filter>
          </defs>
        </svg>
        <EmbossedCorner />
        <EmbossedCorner flipX />
        <EmbossedCorner flipY />
        <EmbossedCorner flipX flipY />
      </div>

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{ padding: "0 12cqw" }}
        variants={revealContainer(0.15)}
        initial="hidden"
        animate={textVisible ? "show" : "hidden"}
      >
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="invite-script invite-focus-heading"
          style={{ color: palette.wax, fontSize: "11.5cqw", lineHeight: 1.2 }}
        >
          <motion.span className="block whitespace-nowrap" variants={item}>
            Dinal Perera
          </motion.span>
          {/* The ampersand is a flourish between the names: nearly their size, set tight. */}
          <motion.span
            className="block"
            style={{ fontSize: "0.86em", lineHeight: 1, margin: "0.04em 0 0.1em" }}
            variants={item}
          >
            &amp;
          </motion.span>
          <motion.span className="block whitespace-nowrap" variants={item}>
            Shayani Jasinge
          </motion.span>
        </h1>

        <div className="invite-caps invite-balance" style={{ marginTop: "6.5cqw" }}>
          <motion.p style={capsLine} variants={item}>
            INVITE YOU TO
          </motion.p>
          <motion.p style={capsLine} variants={item}>
            THEIR WEDDING CELEBRATIONS
          </motion.p>
          <motion.p
            style={{
              ...capsLine,
              fontSize: "4.1cqw",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textIndent: "0.12em",
              lineHeight: 1.6,
              margin: "2.6cqw 0",
            }}
            variants={item}
          >
            19TH - 21ST MAY 2027
          </motion.p>
          <motion.p style={capsLine} variants={item}>
            STONE VILLAS
          </motion.p>
          <motion.p style={capsLine} variants={item}>
            ULUWATU
          </motion.p>
        </div>
      </motion.div>

      <Ribbon untied={ribbonUntied} />
    </div>
  );
}
