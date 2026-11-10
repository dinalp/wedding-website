import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/travel";
import { MapLinks } from "@/components/map-links";

export const metadata: Metadata = {
  title: "Dress Code | Dinal & Shayani",
  description: "What to wear to each of the wedding celebrations in Uluwatu",
};

interface Look {
  label: string;
  /** Drop the image in public/photos and set src here. No src shows a "coming soon" slot. */
  src?: string;
  alt?: string;
  caption?: string;
}

interface DressCodeEvent {
  id: string;
  day: string;
  title: string;
  venue: string;
  code?: string;
  description?: string;
  looks: Look[];
  colours?: { src: string; alt: string; description: string };
}

const EVENTS: DressCodeEvent[] = [
  {
    id: "welcome-dinner",
    day: "Wednesday 19 May",
    title: "Welcome Dinner",
    venue: "Stone Villas Uluwatu",
    code: "Tropical cocktail · Bright colours encouraged",
    description: "Think colourful dresses, playful prints, linen shirts and tailored trousers. Light fabrics and relaxed silhouettes, dressed up for an evening of dinner and drinks.",
    looks: [
      {
        label: "Outfit inspiration",
        src: "/photos/welcome-dinner-dress-code.webp",
        alt: "Welcome dinner outfit inspiration: colourful cocktail dresses, floral prints, linen shirts and tailored trousers in earthy tones",
      },
    ],
  },
  {
    id: "wedding",
    day: "Thursday 20 May",
    title: "Wedding Day",
    venue: "Stone Villas Uluwatu",
    code: "Island formal · Sarees welcome · Suits (open collar, ties optional) · We love to see some colour!",
    description: "Dress up with us for an evening by the ocean. Think elegant sarees, flowing formal dresses and suits, with plenty of colour and room to dance.",
    looks: [
      {
        label: "Saree inspiration",
        src: "/photos/wedding-saree-inspiration.webp",
        alt: "Wedding saree inspiration in pink, yellow, green, gold and ruby, with silk draping and embroidered details",
        caption: "Silks, rich colours and beautiful embroidered details.",
      },
      {
        label: "Dress inspiration",
        src: "/photos/wedding-dress-inspiration.webp",
        alt: "Formal wedding guest dresses in fuchsia, orange, plum and soft blue, with flowing skirts and floral details",
        caption: "Flowing gowns, colourful prints and a little drama.",
      },
    ],
    colours: {
      src: "/photos/wedding-colour-inspiration.webp",
      alt: "Wedding colour moodboard with ruby red, tangerine orange, peony pink, marigold yellow, citron green and hydrangea blue flowers and colour swatches",
      description: "Think ruby red, tangerine orange, peony pink, marigold yellow, citron green and hydrangea blue. These are the kinds of tones we mean when we say bright colours. Take inspiration from the palette and choose a shade you love, whether in your outfit, a print or an accessory.",
    },
  },
  {
    id: "recovery-day",
    day: "Friday 21 May",
    title: "Recovery Day",
    venue: "Venue to be confirmed",
    code: "Boat party vibes – light, breezy, and easy to move in. Save your sarees for the wedding!",
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
            {e.description && (
              <p className="max-w-2xl font-sans text-sm leading-relaxed text-charcoal/80 mt-3">
                {e.description}
              </p>
            )}
            {e.venue.includes("Stone Villas") && (
              <p className="font-sans text-sm mt-1">
                <MapLinks />
              </p>
            )}
            <details className="group mt-5">
              <summary className="inline-flex items-center gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-sans text-xs tracking-wider text-accent bg-accent/10 hover:bg-accent/20 transition-colors px-4 py-2 rounded-full">
                <span className="group-open:hidden">SHOW INSPIRATION PHOTOS</span>
                <span className="hidden group-open:inline">HIDE INSPIRATION PHOTOS</span>
                <span aria-hidden className="transition-transform group-open:rotate-180">
                  &#9662;
                </span>
              </summary>
              <div className={`grid ${e.looks.length > 1 ? "md:grid-cols-2 " : ""}gap-6 mt-6`}>
                {e.looks.map((look) => (
                  <div key={look.label}>
                    <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-charcoal/70 mb-2">
                      {look.label}
                    </p>
                    {look.src ? (
                      <a
                        href={look.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${look.label.toLowerCase()} full size (opens in a new tab)`}
                        className="relative block aspect-video rounded-2xl overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                      >
                        <Image
                          src={look.src}
                          alt={look.alt ?? `${e.title} dress code, ${look.label.toLowerCase()}`}
                          fill
                          sizes={e.looks.length === 1 ? "(min-width: 1024px) 960px, 100vw" : "(min-width: 768px) 480px, 100vw"}
                          quality={85}
                          className="object-contain"
                        />
                      </a>
                    ) : (
                      <div className="aspect-[1308/736] rounded-2xl border border-dashed border-charcoal/20 bg-cream flex items-center justify-center">
                        <p className="font-sans text-xs tracking-wider text-charcoal/40">
                          INSPIRATION COMING SOON
                        </p>
                      </div>
                    )}
                    {look.caption && (
                      <p className="font-sans text-sm leading-relaxed text-charcoal/80 mt-3">
                        {look.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {e.colours && (
                <div className="grid md:grid-cols-[1fr_240px] items-center gap-6 md:gap-12 mt-10 pt-8 border-t border-charcoal/15">
                  <div>
                    <h3 className="font-[family-name:var(--font-cormorant)] text-3xl text-charcoal">
                      A little colour inspiration
                    </h3>
                    <p className="max-w-xl font-sans text-sm leading-relaxed text-charcoal/80 mt-3">
                      {e.colours.description}
                    </p>
                    <a
                      href={e.colours.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block font-sans text-sm text-accent underline underline-offset-4 mt-4"
                    >
                      View the colour moodboard full size <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </div>
                  <a
                    href={e.colours.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View the colour moodboard full size (opens in a new tab)"
                    className="block w-full max-w-[280px] mx-auto md:max-w-none rounded-2xl overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    <Image
                      src={e.colours.src}
                      alt={e.colours.alt}
                      width={1080}
                      height={1920}
                      sizes="(min-width: 768px) 240px, 280px"
                      quality={85}
                      className="w-full h-auto"
                    />
                  </a>
                </div>
              )}
            </details>
          </section>
        ))}
      </div>
    </main>
  );
}
