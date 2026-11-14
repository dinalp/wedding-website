const AIRLINES = [
  {
    name: "Virgin Australia", cabin: "8kg carry-on + a personal item",
    checked: "Lite: no checked bag. Choice & Flex: 1 × 23kg for standard economy passengers.",
    cost: "Adding 23kg to Lite, departing Australia: A$87 online when booking; A$107 online later; A$170 at the airport. The Bali return fee must be checked separately.",
    other: "Compare Lite + baggage with Choice before you pay. Status allowances and partner-operated flights can differ.",
    sources: [["Checked bags & fees", "https://www.virginaustralia.com/au/en/travel-info/baggage/checked-baggage/"], ["Carry-on", "https://www.virginaustralia.com/au/en/travel-info/baggage/carry-on-baggage/"]],
  },
  {
    name: "Jetstar", cabin: "Starter: one underseat bag (40 × 30 × 20cm)",
    checked: "Starter: no checked bag. Add a baggage allowance or choose a bundle that includes it.",
    cost: "No single fixed add-on price: Jetstar prices checked baggage by route and allowance. Check both directions during booking; buying at the airport costs more.",
    other: "For JQ flights from 2 February 2027. Booked before 5 August 2026? Check your original allowance. Seat selection and food/drink are extra on Starter.",
    sources: [["Starter inclusions", "https://www.jetstar.com/AU/EN/help/starter-fare-product-guide"], ["Baggage prices", "https://www.jetstar.com/au/en/flights/baggage/checked-baggage"]],
  },
  {
    name: "Qantas", cabin: "See the allowance for your aircraft and cabin",
    checked: "Qantas-operated economy flights to Bali include up to 30kg checked baggage.",
    cost: "A$0 extra for a checked bag within the included allowance. Extra weight is priced separately. Partner-operated flights can have different allowances.",
    other: "Check the operating airline, particularly when a Qantas booking is operated by Jetstar.",
    sources: [["Checked allowance", "https://www.qantas.com/en-au/baggage/checked"], ["Carry-on", "https://www.qantas.com/en-au/baggage/carry-on"]],
  },
  {
    name: "Scoot", cabin: "10kg cabin baggage across up to two pieces",
    checked: "Basic: no checked bag. Value & Flex: 20kg. ScootPlus: 30kg.",
    cost: "Check the add-on price for your whole connecting journey. We haven’t verified a fixed Sydney–Bali baggage fee.",
    other: "Value and Flex include seat selection, but not meals. Compare the bundle with buying bags separately.",
    sources: [["Fares & inclusions", "https://www.flyscoot.com/en/plan/booking-your-flight/fares-fees"], ["Baggage", "https://www.flyscoot.com/en/plan/booking-your-flight/baggage/"]],
  },
  {
    name: "Batik Air", cabin: "Check whether your flight is ID or OD",
    checked: "Batik Air Indonesia (ID) and Batik Air Malaysia (OD) have different fare rules. The airline name alone doesn’t confirm your allowance.",
    cost: "Check the fare’s included weight and the bag price for both directions. We haven’t verified a single add-on amount for these fares.",
    other: "Look for the operating airline code and baggage allowance on the booking screen before paying.",
    sources: [["Batik Indonesia baggage", "https://help.batikair.com/category/batik-air-baggage"], ["Batik Malaysia baggage", "https://www.batikair.com.my/experience/baggage"]],
  },
  {
    name: "Garuda Indonesia", cabin: "Check the allowance on your ticket",
    checked: "Tickets issued from 1 September 2026 use a piece-based allowance. Earlier tickets may keep their original weight-based allowance.",
    cost: "Check the number of included bags, weight per bag and extra-piece fee for your fare. Don’t rely on the old blanket 30kg rule.",
    other: "The ticket’s issue date and any rebooking can affect which policy applies.",
    sources: [["Current baggage policy", "https://www.garuda-indonesia.com/qa/en/new-baggage-policy"]],
  },
];

export function FlightBaggageGuide() {
  return <section id="baggage-guide" className="mt-14 scroll-mt-24">
    <h2 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl text-charcoal">What&rsquo;s included in your fare?</h2>
    <p className="font-sans text-sm text-charcoal/75 leading-relaxed max-w-2xl mt-3">A cheap fare can cost more once you add bags. These are airline rules, not confirmation of the fare above. Compare the full return cost, including baggage on both legs.</p>
    <p className="font-sans text-xs text-charcoal/70 mt-3 mb-5">Airline guidance checked 14 November 2026 for May 2027 travel. Fees can change.</p>
    <div className="border-t border-charcoal/20">
      {AIRLINES.map((a) => <details key={a.name} className="group border-b border-charcoal/20">
        <summary className="cursor-pointer flex justify-between items-center gap-4 py-5 px-2 hover:bg-cream focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 list-none"><span><span className="font-[family-name:var(--font-cormorant)] text-2xl text-charcoal">{a.name}</span><span className="block font-sans text-sm text-charcoal/75 mt-1">{a.cabin}</span></span><svg aria-hidden="true" className="w-5 h-5 shrink-0 group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 9 6 6 6-6" /></svg></summary>
        <div className="grid md:grid-cols-2 gap-5 px-2 pb-6 font-sans text-sm leading-relaxed text-charcoal/80"><div><h3 className="font-medium text-charcoal">Checked baggage</h3><p className="mt-2">{a.checked}</p><p className="mt-3">{a.other}</p></div><div><h3 className="font-medium text-charcoal">What to budget</h3><p className="mt-2">{a.cost}</p><div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">{a.sources.map(([label, href]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2">{label}</a>)}</div></div></div>
      </details>)}
    </div>
  </section>;
}
