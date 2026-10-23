import type { Metadata } from "next";
import { UnsplashImage as Image } from "@/components/unsplash-image";
import { PageHeader } from "@/components/travel";

export const metadata: Metadata = {
  title: "Bali Guide | Dinal & Shayani",
  description:
    "Make a week of it: things to do in Uluwatu, where to eat and swim, working remotely, money and getting around",
};

// Free-to-use photos from Unsplash (Unsplash License), resized by Unsplash's CDN.
const photo = (id: string) => `https://images.unsplash.com/photo-${id}`;

// A 24px copy of the hero, shown blurred while the full image loads.
const HERO_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gKISUNDX1BST0ZJTEUAAQEAAAJ4AAAAAAQwAABtbnRyUkdCIFhZWiAH5gAHAAEAAAAAAABhY3NwU0VDAAAAAABTRUMAAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLVNFQwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApkZXNjAAAA/AAAAGRjcHJ0AAABYAAAAHx3dHB0AAAB3AAAABRjaGFkAAAB8AAAACxyWFlaAAACHAAAABRnWFlaAAACMAAAABRiWFlaAAACRAAAABRyVFJDAAACWAAAACBnVFJDAAACWAAAACBiVFJDAAACWAAAACBtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAEYAAAAcAEQAQwBJAC0AUAAzACAARAA2ADUAIABHAGEAbQB1AHQAIAB3AGkAdABoACAAcwBSAEcAQgAgAFQAcgBhAG4AcwBmAGUAcgAAbWx1YwAAAAAAAAABAAAADGVuVVMAAABgAAAAHABDAG8AcAB5AHIAaQBnAGgAdAAgACgAYwApACAAMgAwADIAMgAgAFMAYQBtAHMAdQBuAGcAIABFAGwAZQBjAHQAcgBvAG4AaQBjAHMAIABDAG8ALgAsACAATAB0AGQALlhZWiAAAAAAAAD21gABAAAAANMtc2YzMgAAAAAAAQw9AAAF3P//8ysAAAeQAAD9kP//+6P///2jAAAD2gAAwIxYWVogAAAAAAAAg9wAAD29////u1hZWiAAAAAAAABKvQAAsTYAAAq5WFlaIAAAAAAAACg9AAARDAAAyNhwYXJhAAAAAAADAAAAAmZmAADypwAADVkAABPQAAAKW//bAIQABgcHCQsJDA0NDBAREBEQGBYUFBYYIxkbGRsZIzUhJyEhJyE1LzkvKy85L1RCOztCVGFSTlJhdmlpdpSNlMHB/wEGBwcJCwkMDQ0MEBEQERAYFhQUFhgjGRsZGxkjNSEnISEnITUvOS8rLzkvVEI7O0JUYVJOUmF2aWl2lI2UwcH//8AAEQgADgAYAwEiAAIRAQMRAf/EAGUAAAMBAAAAAAAAAAAAAAAAAAAEBgUQAAIBBAAGAwAAAAAAAAAAAAECAwAEBREGEhRBUWEhNGMBAQEBAAAAAAAAAAAAAAAAAAQCAxEAAgIDAQAAAAAAAAAAAAAAAQIAAwQRIRL/2gAMAwEAAhEDEQA/AFLbJThtPGr+xta0Ic6Y3+pojsSRS046C4fkAYLAu9/pV/FFb5O3WC9hV3VNiQfDa9HsayxcuxlYNJuoUEak7DxeUct0g3556KheI8ZNi7tUE5eNwSnkAdjRTfQPYfo5P//Z";

const SECTIONS = [
  ["week", "Make a week of it"],
  ["do", "Things to do"],
  ["clubs", "Clubs and cliffside dining"],
  ["work", "Working remotely"],
  ["money", "Money"],
  ["getting-around", "Getting around"],
] as const;

const ACTIVITIES = [
  {
    title: "Learn to surf",
    photo: "1654137065490-6d3c0a9c52e8",
    body: "Uluwatu is one of the world's great surf spots. Beginner lessons run at Dreamland, Balangan and Padang Padang, six people to a coach.",
    price: "About A$52 for a two-hour lesson",
  },
  {
    title: "ATVs and paragliding",
    photo: "1582959746698-660400376dd6",
    body: "Quad bikes through the Pecatu jungle trails near Uluwatu Temple, or a tandem paraglide off the Timbis cliffs. May is right in paragliding season.",
    price: "Paragliding about A$71 to A$78. ATVs on quote",
  },
  {
    title: "Kecak fire dance",
    photo: "1588625224664-a561c1f5f619",
    body: "A hypnotic chant-and-fire performance at Uluwatu Temple as the sun sets over the cliffs. Follow it with seafood on the sand at Jimbaran Bay.",
    price: "About A$15 including temple entry",
  },
  {
    title: "Cook, craft and create",
    photo: "1638569099509-2f46eb4bb94e",
    body: "A Balinese cooking class with a market tour, make your own silver ring, or paint a pot at Jenggala in Jimbaran (fired and ready in four or five days).",
    price: "Cooking about A$83. Silver rings about A$57",
  },
  {
    title: "Yoga and sound healing",
    photo: "1506126613408-eca07ce68773",
    body: "Clifftop studios like The Istana and La Tribu run sunrise yoga, breathwork and sound baths. Spa mornings at Six Senses, Alila and Umana.",
    price: "Drop-in classes, or private groups on quote",
  },
  {
    title: "Boats and islands",
    photo: "1700512825803-b2569dc8e094",
    body: "Charter a catamaran for a sunset cruise past the Uluwatu cliffs, or take a speedboat day trip to Nusa Penida's famous cliffs and manta rays.",
    price: "Catamarans about A$45 to A$300 each, split across a group",
  },
];

const CLUBS = [
  [
    "Single Fin",
    "The original clifftop surf bar above Uluwatu beach. Sunset drinks, with DJs and live music on Sundays.",
  ],
  [
    "Sundays Beach Club",
    "Ride the cliff lift down to a white-sand cove with free kayaks, paddleboards and snorkels, and sunset bonfires.",
  ],
  ["Ulu Cliffhouse", "A clifftop pool day with no entry fee, just a minimum spend on daybeds."],
  ["El Kabron", "Spanish food, a cliff-edge pool and a 180-degree ocean view, best at sunset."],
  ["One Eighty at The Edge", "The splurge: a glass-bottomed sky pool hanging over the ocean."],
  [
    "Melasti Beach",
    "Palmilla, White Rock and Tropical Temptation line a white-sand beach under limestone cliffs. Swim in the sea and the pool.",
  ],
  ["Savaya", "Bali's big clifftop day club, for the night you want to dance."],
];

const DINING = [
  ["Mana Uluwatu", "Cliffside restaurant by an infinity pool, made for watching the waves at sunset."],
  ["Cliff Bar, Six Senses", "Mediterranean plates high on the Pecatu cliffs as the sky changes colour."],
  ["Jimbaran Bay", "Grilled seafood at tables on the sand, the classic dinner after the Kecak dance."],
];

const h2 = "font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-charcoal";
const body = "font-sans text-charcoal/70 leading-relaxed";
const link = "text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent";

export default function BaliPage() {
  return (
    <main className="min-h-screen bg-background">
      <PageHeader active="/bali" />

      <section className="relative h-[70vh] min-h-[420px] max-h-[720px] bg-[#2f4a4c]">
        <Image
          src={photo("1759657231646-32109da61330")}
          alt="Waves rolling in beneath the green cliffs of Uluwatu"
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={HERO_BLUR}
          quality={85}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 max-w-5xl mx-auto px-4 md:px-8 pb-10 md:pb-16 text-white">
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-7xl font-light">
            Your week in Uluwatu
          </h1>
          <p className="font-sans text-white/85 text-lg md:text-xl mt-4 max-w-2xl leading-relaxed">
            Clifftop surf breaks, sunset beach clubs and some of the best food in Bali. Here&rsquo;s how to
            make the most of it.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
        <nav className="flex flex-wrap gap-2 mt-8" aria-label="On this page">
          {SECTIONS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="font-sans text-xs tracking-wider text-accent bg-accent/10 hover:bg-accent/20 transition-colors px-4 py-2 rounded-full"
            >
              {label.toUpperCase()}
            </a>
          ))}
        </nav>

        <section id="week" className="mt-16 scroll-mt-8">
          <h2 className={h2}>Make a week of it</h2>
          <p className={`${body} text-lg mt-4 max-w-3xl`}>
            You&rsquo;re flying all this way, so stay a while. Come early, explore Uluwatu with us, celebrate
            for three days, then stay on for one more surf.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {[
              [
                "Sat 15 to Tue 18 May",
                "Arrive and explore",
                "Settle in, find your favourite beach club, and join us for group outings like surfing, ATVs and the Kecak dance.",
              ],
              [
                "Wed 19 to Fri 21 May",
                "The celebrations",
                "The welcome dinner, the wedding and the recovery day. Three days we're hosting, all planned for you.",
              ],
              [
                "Sat 22 to Sun 23 May",
                "One last day",
                "A final surf or a long brunch, then the Savaya send-off for anyone with energy left.",
              ],
            ].map(([dates, title, text], i) => (
              <div
                key={title}
                className={`rounded-sm p-6 md:p-8 ${i === 1 ? "bg-accent text-white" : "bg-cream"}`}
              >
                <p
                  className={`font-sans text-xs tracking-wider ${i === 1 ? "text-white/70" : "text-accent"}`}
                >
                  {dates.toUpperCase()}
                </p>
                <h3 className="font-[family-name:var(--font-cormorant)] text-3xl mt-2">{title}</h3>
                <p
                  className={`font-sans text-sm leading-relaxed mt-3 ${i === 1 ? "text-white/85" : "text-charcoal/70"}`}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
          <p className="font-sans text-sm text-charcoal/60 mt-4">
            We&rsquo;re planning a few group outings for the week. Details and sign-ups are coming soon.
          </p>
        </section>

        <section id="do" className="mt-20 scroll-mt-8">
          <h2 className={h2}>Things to do</h2>
          <p className={`${body} mt-4 max-w-3xl`}>
            Everything here is within about 40 minutes of Stone Villas, and most of it works for groups.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {ACTIVITIES.map((a) => (
              <article key={a.title}>
                <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                  <Image
                    src={photo(a.photo)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                    quality={85}
                    className="object-cover"
                  />
                </div>
                <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-charcoal mt-4">
                  {a.title}
                </h3>
                <p className="font-sans text-sm text-charcoal/70 leading-relaxed mt-2">{a.body}</p>
                <p className="font-sans text-sm text-charcoal mt-2">{a.price}</p>
              </article>
            ))}
          </div>
          <p className="font-sans text-xs text-charcoal/50 mt-6">
            Prices are approximate, per person, converted at about A$1 = IDR 12,700.
          </p>
        </section>

        <section id="clubs" className="mt-20 scroll-mt-8">
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-sm overflow-hidden">
            <Image
              src={photo("1546484458-6904289cd4f0")}
              alt="An infinity pool at a beach club at sunset"
              fill
              sizes="(min-width: 1024px) 1024px, 100vw"
              quality={85}
              className="object-cover"
            />
          </div>
          <h2 className={`${h2} mt-10`}>Beach clubs, bars and cliffside dining</h2>
          <p className={`${body} mt-4 max-w-3xl`}>
            Uluwatu does sunsets better than anywhere. Book a daybed, swim between pool and ocean, and stay
            for dinner on the cliff edge.
          </p>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-5 mt-8">
            {CLUBS.map(([name, text]) => (
              <div key={name} className="border-t border-charcoal/10 pt-4">
                <h3 className="font-sans font-medium text-charcoal">{name}</h3>
                <p className="font-sans text-sm text-charcoal/70 leading-relaxed mt-1">{text}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-14 items-center">
            <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
              <Image
                src={photo("1662950267280-0cdf5f7139b4")}
                alt="Diners under palm trees at sunset"
                fill
                sizes="(min-width: 768px) 480px, 100vw"
                quality={85}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-cormorant)] text-3xl text-charcoal">
                Dinner with a view
              </h3>
              <div className="space-y-4 mt-4">
                {DINING.map(([name, text]) => (
                  <div key={name}>
                    <p className="font-sans font-medium text-charcoal">{name}</p>
                    <p className="font-sans text-sm text-charcoal/70 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
              <p className="font-sans text-sm text-charcoal/60 mt-4">
                Sunset is around 6 PM, so book for 5:30 and arrive early for a drink.
              </p>
            </div>
          </div>
        </section>

        <section id="work" className="mt-20 scroll-mt-8 grid md:grid-cols-2 gap-8 items-center">
          <div className="md:order-2 relative aspect-[4/3] rounded-sm overflow-hidden">
            <Image
              src={photo("1585261450021-b8b6c798b093")}
              alt="A bright cafe filled with plants and wicker chairs"
              fill
              sizes="(min-width: 768px) 480px, 100vw"
              quality={85}
              className="object-cover"
            />
          </div>
          <div>
            <h2 className={h2}>Working remotely</h2>
            <p className={`${body} mt-4`}>
              Can&rsquo;t take the whole week off? Bring the laptop. Bali is one of the world&rsquo;s
              favourite places to work remotely, and Uluwatu&rsquo;s cafes are made for it.
            </p>
            <ul className="font-sans text-sm text-charcoal/70 leading-relaxed mt-4 space-y-2 list-disc pl-5">
              <li>
                Bali is two hours behind Sydney in May, so a 9 to 5 Sydney day runs 7 AM to 3 PM in Bali. You
                still get the afternoon at the beach.
              </li>
              <li>
                Bingin and Pecatu have the most laptop-friendly cafes and coworking spaces, many on fibre
                (often 50 to 150 Mbps).
              </li>
              <li>
                Get an eSIM or a local Telkomsel SIM at the airport so you can hotspot if the wifi drops.
              </li>
              <li>Book a villa that lists its internet speed, and ask for a screenshot of a speed test.</li>
            </ul>
          </div>
        </section>

        <section id="money" className="mt-20 scroll-mt-8">
          <h2 className={h2}>Money</h2>
          <p className={`${body} mt-4 max-w-3xl`}>
            Bali runs on Indonesian rupiah (IDR). Most Australian bank cards charge about 3% on every overseas
            purchase and ATM withdrawal, so set up a travel-friendly account before you fly.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[
              [
                "Up",
                "https://up.com.au",
                "Our pick for everyday spending and ATMs: no Up fees on international purchases or withdrawals.",
              ],
              [
                "Wise",
                "https://wise.com/au",
                "Great exchange rates and a multi-currency wallet. A good backup card.",
              ],
              [
                "Revolut",
                "https://www.revolut.com/en-AU/",
                "Similar to Wise, with a monthly allowance of free ATM withdrawals.",
              ],
              [
                "YouTrip",
                "https://www.you.co/au/",
                "A travel card with a generous free overseas ATM allowance each month.",
              ],
            ].map(([name, url, text]) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-cream rounded-sm p-6 border border-transparent hover:border-accent-light transition-colors"
              >
                <h3 className="font-[family-name:var(--font-cormorant)] text-3xl text-charcoal">{name}</h3>
                <p className="font-sans text-sm text-charcoal/70 leading-relaxed mt-2">{text}</p>
              </a>
            ))}
          </div>
          <ul className="font-sans text-sm text-charcoal/70 leading-relaxed mt-6 space-y-2 list-disc pl-5 max-w-3xl">
            <li>Bring two cards from different providers in case one gets blocked or eaten by an ATM.</li>
            <li>
              When a card machine or ATM offers to charge you in AUD, always choose IDR. The AUD option comes
              with a poor exchange rate.
            </li>
            <li>
              Use ATMs inside banks or minimarts (BCA and Mandiri are reliable). Carry some cash for warungs,
              tips and markets.
            </li>
            <li>
              Fees and free allowances change, so check each provider&rsquo;s current terms before you go.
            </li>
          </ul>
        </section>

        <section id="getting-around" className="mt-20 scroll-mt-8">
          <h2 className={h2}>Getting around</h2>
          <p className={`${body} mt-4 max-w-3xl`}>
            There&rsquo;s no Uber in Bali. Everyone uses{" "}
            <strong className="font-medium text-charcoal">Grab</strong> and{" "}
            <strong className="font-medium text-charcoal">Gojek</strong>, two apps that do rides and food
            delivery. We highly recommend downloading both before you fly: they&rsquo;re the easiest and
            cheapest way to get around, and to eat in.
          </p>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 mt-8">
            {[
              {
                title: "Scooter taxi",
                apps: "GrabBike · GoRide",
                text: "You ride on the back of a scooter. Drivers wear the app's green jacket and hand you a helmet. The quickest way through traffic, best for one person with a small bag.",
                price: "Short trips around Uluwatu: about IDR 15,000 to 40,000 (A$1 to A$3)",
              },
              {
                title: "Car",
                apps: "GrabCar · GoCar",
                text: "A regular air-conditioned car, often a seven-seater like a Toyota Avanza. Best for groups, kids, luggage and dressed-up nights out.",
                price:
                  "Around Uluwatu: about IDR 50,000 to 150,000 (A$4 to A$12). Airport to Uluwatu: about IDR 200,000 to 350,000 (A$16 to A$28)",
              },
              {
                title: "Food delivery",
                apps: "GrabFood · GoFood",
                text: "Order from local warungs, cafes and even supermarkets straight to your villa. Perfect for a slow recovery-day breakfast.",
                price: "Delivery fees are usually under A$2",
              },
            ].map((c) => (
              <div key={c.title} className="bg-cream rounded-sm p-6 md:p-8">
                <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-charcoal">{c.title}</h3>
                <p className="font-sans text-accent text-xs mt-1">{c.apps}</p>
                <p className="font-sans text-charcoal/70 text-sm mt-4 leading-relaxed">{c.text}</p>
                <p className="font-sans text-charcoal text-sm mt-4 leading-relaxed">{c.price}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 mt-10 font-sans text-sm text-charcoal/70 leading-relaxed">
            <div>
              <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-charcoal mb-3">
                How to book a ride
              </h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Download Grab and Gojek and sign up with your Australian mobile number before you leave
                  home.
                </li>
                <li>Add a card, or choose cash and carry small notes.</li>
                <li>
                  Enter where you are and where you&rsquo;re going, then pick bike or car. You&rsquo;ll see
                  the price before you book.
                </li>
                <li>Check the number plate and driver photo in the app match before you hop in.</li>
              </ol>
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-charcoal mb-3">
                Why we recommend them
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>The price is fixed upfront, so there&rsquo;s no haggling and no surprises.</li>
                <li>Every trip is tracked and drivers are rated, so you know who&rsquo;s picking you up.</li>
                <li>
                  Prices jump around sunset (roughly 3 to 6 PM) when Uluwatu traffic peaks, so leave a little
                  earlier.
                </li>
                <li>
                  A few spots, including the airport, have local taxi zones where app drivers can&rsquo;t pick
                  up. Follow the signs to the app pickup point or walk a short way out.
                </li>
              </ul>
            </div>
          </div>
          <p className="font-sans text-xs text-charcoal/50 mt-8">
            Prices are approximate and change with demand. The app always shows the exact fare before you
            book.
          </p>
        </section>

        <p className="font-sans text-xs text-charcoal/40 mt-16">
          Photos from{" "}
          <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className={link}>
            Unsplash
          </a>
          .
        </p>
      </div>
    </main>
  );
}
