import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Pinyon_Script } from "next/font/google";
import Link from "next/link";
import { InvitationExperience } from "@/components/invitation/invitation-experience";
import "./invitation.css";

// Invitation-only fonts, loaded for this route rather than the whole site.
const script = Pinyon_Script({
  variable: "--font-invite-script",
  subsets: ["latin"],
  weight: "400",
});

const caps = Cinzel({
  variable: "--font-invite-caps",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// The site loads Cormorant upright only; the true italic gives the ampersand
// between the names its proper form and sets "Island Formal" without a slanted roman.
const italic = Cormorant_Garamond({
  variable: "--font-invite-italic",
  subsets: ["latin"],
  weight: "500",
  style: "italic",
});

const title = "You're invited — Dinal & Shayani | 19–21 May 2027";
const description =
  "Dinal Perera & Shayani Jasinge invite you to their wedding celebrations at Stone Villas, Uluwatu, 19–21 May 2027. Tap to open your invitation.";

export const metadata: Metadata = {
  // Absolute URLs for the share image; scoped here so the rest of the site is untouched.
  metadataBase: new URL("https://dinalandshayani.vercel.app"),
  title,
  description,
  alternates: { canonical: "/invitation" },
  // Shared by private link only.
  robots: { index: false, follow: false },
  openGraph: {
    title,
    description,
    url: "/invitation",
    siteName: "Dinal & Shayani",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#9aa58f",
};

export default function InvitationPage() {
  return (
    <div className={`${script.variable} ${caps.variable} ${italic.variable}`}>
      <InvitationExperience />
      {/* Without JavaScript the envelope can't be opened, so show the invitation as plain text instead. */}
      <noscript>
        <style>{".invite-stage{display:none}"}</style>
        <main className="invite-noscript">
          <h1 className="invite-script invite-noscript-names">
            <span>Dinal Perera</span>
            <span className="invite-amp">&amp;</span>
            <span>Shayani Jasinge</span>
          </h1>
          <p className="invite-caps invite-noscript-line">Invite you to their wedding celebrations</p>
          <p className="invite-caps invite-noscript-date">19th – 21st May 2027</p>
          <p className="invite-caps invite-noscript-line">Stone Villas, Uluwatu</p>

          <h2 className="invite-caps invite-noscript-heading">Timeline</h2>
          <ul className="invite-serif invite-noscript-list">
            <li>19 May: Welcome dinner</li>
            <li>20 May: Wedding day</li>
            <li>21 May: Recovery day</li>
          </ul>

          <h2 className="invite-caps invite-noscript-heading">Dress code</h2>
          <p className="invite-serif invite-noscript-text">Island Formal</p>

          <h2 className="invite-caps invite-noscript-heading">RSVP</h2>
          <p className="invite-serif invite-noscript-text">
            Please kindly RSVP by 20th January 2027 on our wedding website.
          </p>
          <p>
            <Link href="/" className="invite-caps invite-btn">
              RSVP on our website
            </Link>
          </p>
          <p className="invite-italic invite-noscript-note">
            Our wedding website needs JavaScript. If it won’t open, just reply to the message this invitation came
            in and we’ll take care of it.
          </p>
        </main>
      </noscript>
    </div>
  );
}
