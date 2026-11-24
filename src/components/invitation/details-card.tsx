"use client";

import type { ReactNode, Ref } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChampagneIcon, LoungerIcon, RingsIcon } from "./icons";
import { palette } from "./palette";
import { revealContainer, revealItem } from "./reveal";

const CARD = { width: 250, height: 350 };

/**
 * Die-cut label outline: stepped corners with concave scoops and a raised
 * bracket curve at the centre of the top and bottom edges.
 */
function framePath(insetX: number, insetY: number, scoop: number, step: number, bump: number) {
  const left = insetX;
  const right = CARD.width - insetX;
  const top = insetY;
  const bottom = CARD.height - insetY;
  const corner = scoop + step;
  const centre = CARD.width / 2;
  const half = 30;
  const arc = `a${scoop} ${scoop} 0 0 0`;
  return [
    `M${left + corner} ${top}`,
    `H${centre - half}`,
    `c10 0 14 ${-bump} ${half} ${-bump}`,
    `s20 ${bump} ${half} ${bump}`,
    `H${right - corner}`,
    `v${step}`,
    `${arc} ${scoop} ${scoop}`,
    `h${step}`,
    `V${bottom - corner}`,
    `h${-step}`,
    `${arc} ${-scoop} ${scoop}`,
    `v${step}`,
    `H${centre + half}`,
    `c-10 0 -14 ${bump} ${-half} ${bump}`,
    `s-20 ${-bump} ${-half} ${-bump}`,
    `H${left + corner}`,
    `v${-step}`,
    `${arc} ${-scoop} ${-scoop}`,
    `h${-step}`,
    `V${top + corner}`,
    `h${step}`,
    `${arc} ${scoop} ${-scoop}`,
    `v${-step}`,
    "Z",
  ].join("");
}

const OUTER_FRAME = framePath(2, 9, 15, 6, 7);
const INNER_FRAME = framePath(9, 16, 13, 5, 6);

const TIMELINE: ReadonlyArray<{ date: string; label: string; icon: ReactNode }> = [
  { date: "19/5", label: "WELCOME DINNER", icon: <ChampagneIcon /> },
  { date: "20/5", label: "WEDDING DAY", icon: <RingsIcon /> },
  { date: "21/5", label: "RECOVERY DAY", icon: <LoungerIcon /> },
];

/** Section headings. Indented by their tracking so they stay optically centred. */
const heading = {
  fontSize: "3.6cqw",
  fontWeight: 500,
  letterSpacing: "0.26em",
  textIndent: "0.26em",
  lineHeight: 1.3,
} as const;

/** Smallest caps on the card: about 12px on a 390px phone and 11px on a 360px one. */
const smallCaps = { fontSize: "3.5cqw", lineHeight: 1.28 } as const;

/** Space above each section, so the card keeps one vertical rhythm. */
const SECTION_GAP = "3.6cqw";

/**
 * The burgundy details card: timeline, dress code and the RSVP call to action
 * (a button to the wedding website's landing page in place of the printed
 * card's QR code; guests find the RSVP from there).
 */
export function DetailsCard({
  headingRef,
  textVisible,
  reducedMotion,
}: {
  /** Focus target when this card is brought forward from the keyboard. */
  headingRef?: Ref<HTMLHeadingElement>;
  textVisible: boolean;
  reducedMotion: boolean;
}) {
  const item = revealItem(reducedMotion);

  return (
    <div className="invite-details relative h-full w-full" style={{ containerType: "inline-size" }}>
      <svg
        viewBox={`0 0 ${CARD.width} ${CARD.height}`}
        className="absolute inset-0 h-full w-full"
        style={{ filter: "drop-shadow(0 16px 22px rgba(50, 20, 24, 0.38))" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="invite-details-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#84222f" />
            <stop offset="0.5" stopColor={palette.burgundy} />
            <stop offset="1" stopColor="#6c1a28" />
          </linearGradient>
        </defs>
        <path d={OUTER_FRAME} fill="url(#invite-details-fill)" />
        <path d={INNER_FRAME} fill="none" stroke={palette.ivory} strokeOpacity={0.85} strokeWidth={0.7} />
      </svg>

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{ padding: "9.5cqw 10cqw", color: palette.ivory }}
        variants={revealContainer(0.45)}
        initial="hidden"
        animate={textVisible ? "show" : "hidden"}
      >
        <motion.h2
          ref={headingRef}
          tabIndex={-1}
          className="invite-script invite-focus-heading"
          style={{ fontSize: "12cqw", lineHeight: 1 }}
          variants={item}
        >
          Details
        </motion.h2>

        <motion.section className="w-full" style={{ marginTop: "2.4cqw" }} variants={item}>
          <h3 className="invite-caps" style={heading}>
            TIMELINE
          </h3>
          <ul className="grid grid-cols-3" style={{ gap: "1cqw", marginTop: "1.2cqw" }}>
            {TIMELINE.map((event) => (
              <li key={event.date} className="flex flex-col items-center">
                <span className="block" style={{ width: "11.5cqw" }}>
                  {event.icon}
                </span>
                <span className="invite-serif" style={{ fontSize: "5.2cqw", lineHeight: 1.15 }}>
                  {event.date}
                </span>
                {/* One word per line, so all three labels break the same way. */}
                <span
                  className="invite-caps"
                  style={{
                    ...smallCaps,
                    width: "min-content",
                    marginTop: "0.6cqw",
                    letterSpacing: "0.08em",
                  }}
                >
                  {event.label}
                </span>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section style={{ marginTop: SECTION_GAP }} variants={item}>
          <h3 className="invite-caps" style={heading}>
            DRESS CODE
          </h3>
          <p className="invite-italic" style={{ fontSize: "5.4cqw", lineHeight: 1.25, marginTop: "0.4cqw" }}>
            Island Formal
          </p>
        </motion.section>

        <motion.section style={{ marginTop: SECTION_GAP }} variants={item}>
          <h3 className="invite-caps" style={heading}>
            RSVP
          </h3>
          <p
            className="invite-serif invite-balance"
            style={{ fontSize: "4.5cqw", lineHeight: 1.24, maxWidth: "66cqw", marginTop: "0.6cqw" }}
          >
            Please kindly RSVP by 20th January 2027 on our wedding website
          </p>
        </motion.section>

        <motion.div style={{ marginTop: "3.4cqw" }} variants={item}>
          <Link href="/" className="invite-caps invite-rsvp" style={{ fontSize: "max(11px, 3.4cqw)" }}>
            RSVP on our website
          </Link>
        </motion.div>

        <motion.p
          className="invite-caps invite-balance"
          style={{
            ...smallCaps,
            letterSpacing: "0.13em",
            lineHeight: 1.5,
            maxWidth: "68cqw",
            marginTop: "3.2cqw",
          }}
          variants={item}
        >
          WE ARE SO EXCITED TO CELEBRATE WITH YOU!
        </motion.p>
      </motion.div>
    </div>
  );
}
