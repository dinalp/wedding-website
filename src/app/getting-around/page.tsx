import type { Metadata } from "next";
import { PageHeader } from "@/components/travel";

export const metadata: Metadata = {
  title: "Getting Around | Dinal & Shayani",
  description: "Using Grab and Gojek for rides and food delivery in Bali",
};

export default function GettingAroundPage() {
  return (
    <main className="min-h-screen bg-background">
      <PageHeader active="/getting-around" />
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
        <p className="font-sans text-accent tracking-[0.3em] text-xs">GRAB AND GOJEK</p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-light text-charcoal mt-2">
          Getting around Bali
        </h1>
        <p className="font-sans text-charcoal/70 mt-4 max-w-2xl leading-relaxed">
          There&rsquo;s no Uber in Bali. Everyone uses{" "}
          <strong className="font-medium text-charcoal">Grab</strong> and{" "}
          <strong className="font-medium text-charcoal">Gojek</strong>, two apps that do rides and food
          delivery. We highly recommend downloading both before you fly: they&rsquo;re the easiest and
          cheapest way to get around, and to eat in.
        </p>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mt-10">
          {[
            {
              title: "Scooter taxi",
              apps: "GrabBike · GoRide",
              body: "You ride on the back of a scooter. Drivers wear the app's green jacket and hand you a helmet. The quickest way through traffic, best for one person with a small bag.",
              price: "Short trips around Uluwatu: about IDR 15,000 to 40,000 (A$1.50 to A$4)",
            },
            {
              title: "Car",
              apps: "GrabCar · GoCar",
              body: "A regular air-conditioned car, often a seven-seater like a Toyota Avanza. Best for groups, kids, luggage and dressed-up nights out.",
              price:
                "Around Uluwatu: about IDR 50,000 to 150,000 (A$5 to A$15). Airport to Uluwatu: about IDR 200,000 to 350,000 (A$20 to A$35)",
            },
            {
              title: "Food delivery",
              apps: "GrabFood · GoFood",
              body: "Order from local warungs, cafes and even supermarkets straight to your villa. Perfect for a slow recovery-day breakfast.",
              price: "Delivery fees are usually under A$2",
            },
          ].map((c) => (
            <div key={c.title} className="bg-cream rounded-sm p-6 md:p-8">
              <h4 className="font-[family-name:var(--font-cormorant)] text-2xl text-charcoal">{c.title}</h4>
              <p className="font-[family-name:var(--font-montserrat)] text-accent text-xs mt-1">{c.apps}</p>
              <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 text-sm mt-4 leading-relaxed">
                {c.body}
              </p>
              <p className="font-[family-name:var(--font-montserrat)] text-charcoal text-sm mt-4 leading-relaxed">
                {c.price}
              </p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mt-10 font-[family-name:var(--font-montserrat)] text-sm text-charcoal/70 leading-relaxed">
          <div>
            <h4 className="font-[family-name:var(--font-cormorant)] text-2xl text-charcoal mb-3">
              How to book a ride
            </h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Download Grab and Gojek and sign up with your Australian mobile number before you leave home.
              </li>
              <li>Add a card, or choose cash and carry small notes.</li>
              <li>
                Enter where you are and where you&rsquo;re going, then pick bike or car. You&rsquo;ll see the
                price before you book.
              </li>
              <li>Check the number plate and driver photo in the app match before you hop in.</li>
            </ol>
          </div>
          <div>
            <h4 className="font-[family-name:var(--font-cormorant)] text-2xl text-charcoal mb-3">
              Why we recommend them
            </h4>
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
        <p className="font-[family-name:var(--font-montserrat)] text-xs text-charcoal/50 mt-8">
          Prices are approximate and change with demand. The app always shows the exact fare before you book.
        </p>
      </div>
    </main>
  );
}
