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
      <section id="food-safety">
        <h2 className={heading}>Eat well, stay well</h2>
        <p className={`${body} mt-4`}>A few simple habits to help avoid Bali belly.</p>
        <div className="grid md:grid-cols-2 gap-8 mt-7">
          <ul className={`${body} text-sm space-y-4`}>
            <li><strong className="text-charcoal">Water:</strong> sealed bottles or properly treated/filtered drinking water. Skip tap water, even for brushing teeth. Check ice is made with safe water.</li>
            <li><strong className="text-charcoal">Food:</strong> choose established, busy venues and freshly cooked, hot meals. Be cautious with raw seafood, salads and lukewarm buffets.</li>
            <li><strong className="text-charcoal">Hands:</strong> wash before eating. Carry sanitiser for when you can&rsquo;t.</li>
            <li><strong className="text-charcoal">Alcohol:</strong> use reputable licensed venues. Avoid homemade or unlabelled spirits because of the methanol risk.</li>
          </ul>
          <div className="bg-cream p-6 rounded-sm">
            <h3 className={subheading}>Should I pack Travelan?</h3>
            <p className="font-sans text-sm font-semibold text-accent mt-3">
              We highly recommend packing Travelan as an extra precaution.
              Better safe than sorry!
            </p>
            <p className={`${body} text-sm mt-3`}>
              Check with your pharmacist that it&rsquo;s suitable for you.
              It&rsquo;s an over-the-counter cow&rsquo;s colostrum
              product that may help prevent diarrhoea caused by certain E. coli strains.
            </p>
            <ul className={`${body} text-sm list-disc pl-5 space-y-2 mt-4`}>
              <li>Take before meals, following the packet.</li>
              <li>It won&rsquo;t prevent every cause of Bali belly.</li>
              <li>Contains milk proteins and lactose. Don&rsquo;t use if allergic to bovine protein or lactose intolerant. Ask a pharmacist about children or pregnancy.</li>
            </ul>
          </div>
        </div>
        <p className="font-sans text-xs text-charcoal/65 mt-5">
          More detail: <Source href="https://www.health.nsw.gov.au/travel/Pages/eat-drink.aspx">NSW Health</Source>
          {" · "}<Source href="https://www.travelan.com.au/faq/">Travelan FAQs</Source>
          {" · "}<Source href="https://www.smartraveller.gov.au/destinations/asia/indonesia">Smartraveller</Source>
        </p>
      </section>

      <section id="visas">
        <h2 className={heading}>Visas &amp; arriving in Bali</h2>
        <p className={`${body} mt-4 max-w-3xl`}>
          Australian ordinary-passport holders can usually get a 30-day tourist
          e-Visa on Arrival (e-VOA). Travelling on another passport? Check your eligibility first.
        </p>
        <h3 className={`${subheading} mt-7`}>Two payments. Two official sites.</h3>
        <p className={`${body} text-sm mt-2`}>Your tourist visa and Bali tourist levy are separate. Use the official links below.</p>
        <div className="grid sm:grid-cols-2 gap-5 mt-5">
          {[
            { title: "Tourist visa", detail: "30-day e-VOA · eligible passports", fee: "IDR 500,000", note: "Plus an online processing fee", label: "Apply for your tourist visa", href: "https://evisa.imigrasi.go.id/", domain: "evisa.imigrasi.go.id", owner: "Indonesian Immigration" },
            { title: "Bali tourist levy", detail: "Separate from your visa", fee: "IDR 150,000", note: "Save your payment receipt", label: "Pay the Bali tourist levy", href: "https://lovebali.baliprov.go.id/", domain: "lovebali.baliprov.go.id", owner: "Bali Government" },
          ].map((payment) => (
            <div key={payment.title} className="bg-cream border border-charcoal/15 p-5 md:p-6 flex flex-col rounded-sm">
              <h4 className="font-[family-name:var(--font-cormorant)] text-3xl text-charcoal">{payment.title}</h4>
              <p className={`${body} text-sm mt-2`}>{payment.detail}</p>
              <p className="font-[family-name:var(--font-cormorant)] text-4xl mt-5">{payment.fee}</p>
              <p className={`${body} text-xs mt-1 mb-6`}>{payment.note}</p>
              <a href={payment.href} target="_blank" rel="noopener noreferrer" className="mt-auto flex items-center justify-center gap-2 bg-accent text-white hover:bg-accent-dark transition-colors rounded-sm px-4 py-4 font-sans text-sm font-medium text-center min-h-12">
                {payment.label}<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 18 18 6M6 6h12v12" /></svg>
              </a>
              <p className="font-sans text-xs font-medium text-charcoal text-center mt-3 break-all">{payment.domain}</p>
              <p className={`${body} text-xs text-center mt-1`}>Official {payment.owner} website</p>
            </div>
          ))}
        </div>
        <ol className="mt-8 space-y-6">
          {[
            { title: "Before you fly", content: <>Apply on the <Source href="https://evisa.imigrasi.go.id/">official e-Visa site</Source> at least 48 hours before travel. Follow the upload and payment steps; save your visa. Have six months&rsquo; passport validity on entry and an onward/return ticket.</> },
            { title: "Within three days of travel", content: <>Complete the free <Source href="https://allindonesia.imigrasi.go.id/">All Indonesia arrival card</Source>. Save its QR code. This is separate from the visa — don&rsquo;t pay a third-party site.</> },
            { title: "When you land", content: <>Immigration → collect bags → customs → meet your driver. Keep your passport, visa and arrival QR handy. Eligible travellers without an e-VOA can buy a VOA before immigration.</> },
          ].map((step, index) => (
            <li key={step.title} className="grid grid-cols-[2rem_1fr] gap-4">
              <span aria-hidden="true" className="font-[family-name:var(--font-cormorant)] text-3xl text-accent leading-none">{index + 1}</span>
              <div><h3 className="font-sans font-medium text-charcoal">{step.title}</h3><p className={`${body} text-sm mt-2 max-w-3xl`}>{step.content}</p></div>
            </li>
          ))}
        </ol>
        <p className="font-sans text-xs text-charcoal/65 mt-6">
          Checked 10 November 2026. Recheck before flying:
          {" "}<Source href="https://www.smartraveller.gov.au/destinations/asia/indonesia">entry rules</Source>
          {" · "}<Source href="https://travel.state.gov/en/international-travel/travel-advisories/indonesia.html">airport guidance</Source>.
        </p>
      </section>

      <section id="insurance">
        <h2 className={heading}>Travel insurance</h2>
        <p className={`${body} mt-4 max-w-3xl`}>
          Arrange it when you book. Look for medical care, evacuation, cancellations
          and delays. Check your excess, medical conditions and cover for activities like scooters or surfing.
        </p>
        <div className="grid md:grid-cols-2 gap-8 mt-7">
          <div>
            <h3 className={subheading}>Using your credit card&rsquo;s cover?</h3>
            <ul className={`${body} text-sm list-disc pl-5 space-y-2 mt-4`}>
              <li>Check it still includes travel insurance.</li>
              <li>Check activation and card-spend requirements.</li>
              <li>Confirm who&rsquo;s covered and for how long.</li>
            </ul>
            <p className={`${body} text-sm mt-4`}>
              Some banks are reducing cover. Read the current policy and
              {" "}<Source href="https://www.smartraveller.gov.au/news-and-updates/credit-card-travel-insurance-changing">latest update</Source>.
            </p>
            <p className={`${body} text-sm mt-4`}>
              Buying separately? Compare <Source href="https://www.covermore.com.au/">Cover-More</Source>,
              {" "}<Source href="https://www.allianz.com.au/travel-insurance.html">Allianz</Source> or
              {" "}<Source href="https://scti.com.au/">Southern Cross</Source>. Check the policy, not just the price.
            </p>
          </div>
          <div className="bg-cream p-6 rounded-sm">
            <h3 className={subheading}>Flight cancelled — am I covered?</h3>
            <p className={`${body} text-sm mt-3`}>
              <strong className="text-charcoal">Not always.</strong> Some policies exclude airline
              rescheduling or mechanical faults. Check cancellation and delay benefits before buying.
            </p>
            <ul className={`${body} text-sm list-disc pl-5 space-y-2 mt-4`}>
              <li>Leave a buffer before the wedding, whichever airline you choose.</li>
              <li>Ask the airline about rebooking or a refund first.</li>
              <li>Keep receipts and contact your insurer before booking costly alternatives.</li>
            </ul>
          </div>
        </div>
        <p className="font-sans text-xs text-charcoal/65 mt-5">
          Read more: <Source href="https://www.smartraveller.gov.au/insurance">choosing insurance</Source>
          {" · "}<Source href="https://www.medibank.com.au/travel-insurance/help/cancellations-amendments/">examples of cancellation exclusions</Source>.
        </p>
      </section>
    </>
  );
}
