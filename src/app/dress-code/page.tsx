import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/travel";

export const metadata: Metadata = {
  title: "Dress Code | Dinal & Shayani",
  description: "What to wear to each of the wedding celebrations in Uluwatu",
};

interface Look {
  label: string;
  /** Drop the image in public/photos and set src here. No src shows a "coming soon" slot. */
  src?: string;
  alt?: string;
}

const EVENTS: { id: string; day: string; title: string; venue: string; code?: string; looks: Look[] }[] = [
  {
    id: "welcome-dinner",
    day: "Wednesday 19 May",
    title: "Welcome Dinner",
    venue: "Stone Villas Uluwatu",
    code: "Island semi-formal · Sarees welcome · Bright colours preferred",
    looks: [
      { label: "For her", src: "/photos/dress-code-2.jpg", alt: "Dress code inspiration: flowing printed and pastel island dresses" },
      { label: "For him", src: "/photos/dress-code-v2.jpg", alt: "Dress code inspiration: linen and patterned island shirts in earthy tones" },
    ],
  },
  {
    id: "wedding",
    day: "Thursday 20 May",
    title: "Wedding Day",
    venue: "Stone Villas Uluwatu",
    code: "Island formal · Sarees welcome · Suits (open collar, ties optional) · We love to see some colour",
    looks: [{ label: "For her" }, { label: "For him" }],
  },
  {
    id: "recovery-day",
    day: "Friday 21 May",
    title: "Recovery Day",
    venue: "Venue to be confirmed",
    looks: [{ label: "For her" }, { label: "For him" }],
  },
];

export default function DressCodePage() {
  return (
    <main className="min-h-screen bg-background">
      <PageHeader active="/dress-code" />
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
        <p className="font-sans text-accent tracking-[0.3em] text-xs">WHAT TO WEAR</p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-light text-charcoal mt-2">
          Dress Code
        </h1>
        <nav className="flex flex-wrap gap-3 mt-6">
          {EVENTS.map((e) => (
            <a
              key={e.id}
              href={`#${e.id}`}
              className="font-sans text-xs tracking-wider text-accent bg-accent/10 hover:bg-accent/20 transition-colors px-4 py-2 rounded-full"
            >
              {e.title.toUpperCase()}
            </a>
          ))}
        </nav>

        {EVENTS.map((e) => (
          <section key={e.id} id={e.id} className="mt-16 scroll-mt-8">
            <p className="font-sans text-accent tracking-[0.2em] text-xs">{e.day.toUpperCase()}</p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl text-charcoal mt-1">
              {e.title}
            </h2>
            <p className="font-sans text-sm text-charcoal/60 mt-1">
              {e.venue}
              {e.code && <> · {e.code}</>}
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {e.looks.map((look) => (
                <div key={look.label}>
                  <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-charcoal/70 mb-2">
                    {look.label}
                  </p>
                  {look.src ? (
                    <div className="relative aspect-[1308/736] rounded-2xl overflow-hidden">
                      <Image
                        src={look.src}
                        alt={look.alt ?? `${e.title} dress code, ${look.label.toLowerCase()}`}
                        fill
                        sizes="(min-width: 768px) 480px, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[1308/736] rounded-2xl border border-dashed border-charcoal/20 bg-cream flex items-center justify-center">
                      <p className="font-sans text-xs tracking-wider text-charcoal/40">INSPIRATION COMING SOON</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
