import type { ReactNode } from "react";

const heading = "font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-charcoal";
const subheading = "font-[family-name:var(--font-cormorant)] text-2xl text-charcoal";
const body = "font-sans text-charcoal/75 leading-relaxed";
function Source({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent">{children}</a>;
}

export function BaliTravelEssentials() {
  return (
    <>
      <section id="food-safety" className="mt-20 scroll-mt-8">
        <h2 className={heading}>Eat well, stay well</h2>
        <p className={`${body} mt-4 max-w-3xl`}>
          There&rsquo;s so much good food in Bali. A little care helps keep Bali belly
          from becoming part of the itinerary. Our advice: choose established,
          busy venues that look clean, and use the same common sense you would anywhere.
        </p>
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div>
            <h3 className={subheading}>Food, water &amp; a few easy habits</h3>
            <ul className={`${body} text-sm list-disc pl-5 space-y-3 mt-4`}>
              <li>Drink sealed bottled water, or properly treated/filtered drinking water the venue confirms is safe. Avoid tap water, including when brushing your teeth; check that ice is made with safe water.</li>
              <li>Choose food cooked fresh and served hot. Be cautious with raw seafood, lukewarm buffets and salads washed in tap water. Fruit you peel yourself is a safer choice.</li>
              <li>Wash your hands before eating, and carry hand sanitiser for when soap and water aren&rsquo;t available.</li>
              <li>For alcohol, stick to reputable licensed venues and avoid homemade or unlabelled spirits. Methanol poisoning is a risk in Bali.</li>
            </ul>
            <p className="font-sans text-xs leading-relaxed text-charcoal/65 mt-4">
              Read <Source href="https://www.health.nsw.gov.au/travel/Pages/eat-drink.aspx">NSW Health&rsquo;s food and water advice</Source> and <Source href="https://www.smartraveller.gov.au/destinations/asia/indonesia">Smartraveller&rsquo;s Indonesia advice</Source>.
            </p>
          </div>
          <div className="bg-white/60 border border-charcoal/10 rounded-sm p-6">
            <h3 className={subheading}>What about Travelan?</h3>
            <p className={`${body} text-sm mt-4`}>
              We recommend asking your pharmacist about packing Travelan as an extra
              precaution. It&rsquo;s an over-the-counter bovine colostrum product
              containing antibodies against certain E. coli strains that cause
              travellers&rsquo; diarrhoea. Taken before meals as directed, it may
              reduce that risk — which is why we think it&rsquo;s worth considering.
            </p>
            <p className={`${body} text-sm mt-4`}>
              It won&rsquo;t prevent every cause of Bali belly or replace careful
              food and water choices. It contains cow&rsquo;s milk proteins and
              lactose; the manufacturer says not to use it if you have a bovine
              protein allergy or are lactose intolerant. Follow the packet and ask
              a pharmacist about suitability, especially for children or during pregnancy.
            </p>
            <p className="font-sans text-xs leading-relaxed mt-4">
              <Source href="https://www.travelan.com.au/faq/">Travelan ingredients, precautions &amp; FAQs</Source>
            </p>
          </div>
        </div>
      </section>

      <section id="visas" className="mt-20 scroll-mt-8">
        <h2 className={heading}>Visas &amp; arriving in Bali</h2>
        <p className={`${body} mt-4 max-w-3xl`}>
          For Australian ordinary-passport holders visiting as tourists, the usual
          option is a 30-day e-Visa on Arrival (e-VOA). Other passports may have
          different requirements: check eligibility before booking.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="border-y border-charcoal/15 py-5">
            <h3 className={subheading}>Tourist visa</h3>
            <p className="font-sans text-xl text-charcoal mt-2">IDR 500,000 per person</p>
            <p className={`${body} text-sm mt-1`}>Plus a small online processing fee for the e-VOA.</p>
          </div>
          <div className="border-y border-charcoal/15 py-5">
            <h3 className={subheading}>Bali tourist levy</h3>
            <p className="font-sans text-xl text-charcoal mt-2">IDR 150,000 per person</p>
            <p className={`${body} text-sm mt-1`}>Separate from the visa. Pay through <Source href="https://lovebali.baliprov.go.id/">Love Bali</Source>; save the receipt.</p>
          </div>
        </div>
        <ol className={`${body} list-decimal pl-5 space-y-5 mt-7 max-w-3xl`}>
          <li><strong className="text-charcoal">Before flying.</strong> Check your passport has at least six months&rsquo; validity on entry (ideally on departure too), and keep your onward/return booking handy. Apply at least 48 hours before travel on the <Source href="https://evisa.imigrasi.go.id/">official Indonesian e-Visa site</Source>. Select your nationality and tourism purpose, follow the document-upload prompts, check your details, pay and save the issued visa.</li>
          <li><strong className="text-charcoal">Within three days of travel.</strong> Complete the free <Source href="https://allindonesia.imigrasi.go.id/">All Indonesia arrival card</Source> and save its QR code. This is separate from your visa; avoid sites charging to submit it.</li>
          <li><strong className="text-charcoal">At Denpasar airport.</strong> Follow signs to immigration, with your passport and visa ready. Eligible travellers without an e-VOA can buy a VOA at the counter before immigration. Then collect your bags, follow customs instructions with your arrival-card QR ready, and head to arrivals to meet your driver.</li>
        </ol>
        <p className="font-sans text-xs leading-relaxed text-charcoal/65 mt-5">
          Entry rules and fees checked 10 November 2026; recheck before your May 2027 trip.
          {" "}<Source href="https://www.smartraveller.gov.au/destinations/asia/indonesia">Current Australian travel advice</Source>
          {" · "}<Source href="https://travel.state.gov/en/international-travel/travel-advisories/indonesia.html">Airport entry and customs guidance</Source>
        </p>
      </section>

      <section id="insurance" className="mt-20 scroll-mt-8">
        <h2 className={heading}>Travel insurance</h2>
        <p className={`${body} mt-4 max-w-3xl`}>
          Please arrange cover when you book. Look for overseas medical care and
          evacuation as well as cancellation and travel-delay benefits. Check the
          excess, limits, pre-existing medical conditions and any activities you&rsquo;re
          planning — especially scooters or surfing. <Source href="https://www.smartraveller.gov.au/insurance">Smartraveller&rsquo;s insurance guide</Source> is a useful starting point.
        </p>
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div>
            <h3 className={subheading}>Already covered by your credit card?</h3>
            <p className={`${body} text-sm mt-4`}>
              Possibly, but don&rsquo;t assume it&rsquo;s automatic. Confirm your card
              still includes cover, whether you must activate it or pay qualifying
              travel costs on the card, who is insured and how long the cover lasts.
              Ask for confirmation for this trip and read the current Product
              Disclosure Statement (PDS).
            </p>
            <p className={`${body} text-sm mt-4`}>
              Some Australian banks are reducing or removing complimentary cover,
              so check the rules that apply to your booking and travel dates.
              {" "}<Source href="https://www.smartraveller.gov.au/news-and-updates/credit-card-travel-insurance-changing">Read the latest credit-card insurance update</Source>.
            </p>
            <p className={`${body} text-sm mt-4`}>
              Buying a separate policy? Australian providers to compare include
              {" "}<Source href="https://www.covermore.com.au/">Cover-More</Source>,
              {" "}<Source href="https://www.allianz.com.au/travel-insurance.html">Allianz</Source> and
              {" "}<Source href="https://scti.com.au/">Southern Cross Travel Insurance</Source>.
              Compare the policy wording and your eligibility, not just the price.
            </p>
          </div>
          <div className="border-l-2 border-accent/50 pl-6">
            <h3 className={subheading}>If your flight is cancelled</h3>
            <p className={`${body} text-sm mt-4`}>
              Delays and cancellations can happen with any airline, including
              budget carriers. We&rsquo;d leave a buffer before the celebrations
              and avoid a tight connection on separate tickets.
            </p>
            <p className={`${body} text-sm mt-4`}>
              Insurance doesn&rsquo;t automatically pay for every cancelled flight.
              The reason matters: some policies exclude airline rescheduling,
              mechanical faults or other operational issues. Check both cancellation
              and travel-delay benefits, including waiting periods and extra hotel
              or replacement-flight costs. <Source href="https://www.medibank.com.au/travel-insurance/help/cancellations-amendments/">This insurer&rsquo;s exclusions</Source> show why it pays to read the detail.
            </p>
            <p className={`${body} text-sm mt-4`}>
              Ask the airline about rebooking or a refund first. Keep its written
              explanation and your receipts, and contact your insurer before making
              expensive alternative arrangements. Ask specifically how your policy
              handles airline failure and missed connections, too.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
