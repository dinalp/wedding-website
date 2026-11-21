import { ImageResponse } from "next/og";

export const alt =
  "Wedding invitation: Dinal Perera & Shayani Jasinge, 19–21 May 2027, Stone Villas, Uluwatu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SAGE = "#9aa58f";
const SAGE_DARK = "#87927c";
const WAX = "#6e1a24";
const IVORY = "#fbf8f1";
const GOLD = "#c9a45c";
const INK = "#2f2a26";

/**
 * Share card for the invitation link. Uses next/og's bundled font only, so
 * nothing is fetched at build time.
 */
export default function InvitationOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          backgroundColor: SAGE,
        }}
      >
        {/* Envelope flap lines behind the card. */}
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <path
            d="M0 0L600 400L1200 0M0 630L470 300M1200 630L730 300"
            fill="none"
            stroke={SAGE_DARK}
            strokeWidth="3"
          />
        </svg>

        <div
          style={{
            width: 900,
            height: 480,
            display: "flex",
            backgroundColor: IVORY,
            padding: 14,
            boxShadow: "0 30px 60px rgba(40, 50, 34, 0.35)",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${GOLD}`,
              paddingTop: 34,
            }}
          >
            <div style={{ display: "flex", fontSize: 22, letterSpacing: 10, color: INK }}>
              YOU’RE INVITED
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                marginTop: 26,
                fontSize: 70,
                letterSpacing: 2,
                color: WAX,
              }}
            >
              Dinal Perera
              <span style={{ margin: "0 26px", fontSize: 46, color: GOLD }}>&</span>
              Shayani Jasinge
            </div>
            <div style={{ display: "flex", width: 120, height: 2, marginTop: 30, backgroundColor: GOLD }} />
            <div style={{ display: "flex", marginTop: 30, fontSize: 30, letterSpacing: 9, color: INK }}>
              19TH – 21ST MAY 2027
            </div>
            <div style={{ display: "flex", marginTop: 16, fontSize: 24, letterSpacing: 9, color: WAX }}>
              STONE VILLAS · ULUWATU
            </div>
          </div>
        </div>

        {/* Wax seal over the top edge of the card. */}
        <div
          style={{
            position: "absolute",
            left: 548,
            top: 24,
            width: 104,
            height: 104,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 52,
            backgroundColor: WAX,
            boxShadow: "0 8px 16px rgba(40, 10, 14, 0.45)",
          }}
        >
          <div
            style={{
              width: 78,
              height: 78,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 39,
              border: "2px solid #8f3340",
              color: "#d9a3ab",
              fontSize: 22,
              letterSpacing: 2,
            }}
          >
            D&S
          </div>
        </div>
      </div>
    ),
    size,
  );
}
