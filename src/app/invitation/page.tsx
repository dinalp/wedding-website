import type { Metadata, Viewport } from "next";
import { Cinzel, Pinyon_Script } from "next/font/google";
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
    <div className={`${script.variable} ${caps.variable}`}>
      <InvitationExperience />
    </div>
  );
}
