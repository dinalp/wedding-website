# Bali travel preview — 14 November 2026

Preview only. No website code changed, committed or deployed. Roma untouched.

## Visuals

- [Uluwatu map](uluwatu-map.png): Stone Villas highlighted; west-coast beach areas and south-coast venues shown together. Illustrative geography, not navigation. Final implementation needs verified POI coordinates and a real map baselayer, with an accessible place list.
- [Flights and visa links](flights-and-visa.png): example flight times and fare; baggage distinction; prominent separate visa/levy buttons. Corrected version uses Virgin's current 8kg carry-on allowance.
- Generated with built-in imagegen. Exact prompts in prompts.txt.

## Flight data findings

The current FlightOption schema stores travel dates, airline, price, outbound stops and free-text duration, but no flight numbers, local departure/arrival timestamps, fare brands or baggage.
The SerpApi collector discards the available segment times. Round-trip initial results describe outbound choices; return itineraries need a follow-up using departure_token. Booking options may expose baggage prices. Do not infer the return schedule from the return date or attach an arbitrary return to a quoted price. Additional requests need a quota check before changing the daily collector.
Source: https://serpapi.com/google-flights-api and https://github.com/serpapi/google-flights-scraper

Latest live list inspected 14 November: Virgin, Jetstar, Batik Air, Qantas and Scoot. The airline display name "Batik Air" is ambiguous: resolve operating IATA code ID versus OD before applying policies. The site also lists Garuda among direct airline search links.

Proposed display: local departure and arrival time for each leg, arrival date/+1, duration, stops, included cabin bag, checked allowance, verified add-on price with weight/direction/currency and date. Missing values remain explicitly unconfirmed. Only calculate an inclusive return total when both directions and fare inclusions are confirmed. Never assume the cheapest displayed fare is a specific fare brand.

## Airline research so far

| Airline | Verified baseline | Add-on pricing / remaining work |
| --- | --- | --- |
| Virgin Australia | Economy carry-on 8kg plus a personal item. Lite has no checked bag; standard Choice/Flex include 1 × 23kg. | Published Australia-departing international fee for 23kg: A$87 at online booking, A$107 online later, A$170 at airport. Return fee not verified; do not double A$87 automatically. |
| Jetstar | For JQ departures from 2 February 2027, directly booked Starter includes an underseat bag 40 × 30 × 20cm. Earlier-booking exception applies. Checked baggage, selected seats and food/drink are extra. | Checked baggage price varies by route; quote the actual trip and bundle. No universal airline surcharge verified. |
| Qantas | Qantas-operated international economy outside the Americas includes up to 30kg checked baggage. | No add-on needed for a standard 20/23kg case within that allowance; partner-operated allowances can differ. Extra weight requires separate pricing. |
| Scoot | Economy cabin allowance 10kg. Basic no checked bag; Value/Flex include 20kg; ScootPlus 30kg. | Add-on rate for these connecting Sydney–Bali trips not yet verified. Obtain journey-specific amount, not a Singapore departure or airport fee. |
| Batik | ID and OD have separate policies; ID official material describes 20kg economy allowance, subject to ticket. | Resolve operating code and exact fare. OD official baggage page returned 403; don't use conflicting third-party 15/20/25/30kg claims. No verified price yet. |
| Garuda Indonesia | Tickets issued on/after 1 September 2026 follow piece-based allowances; older tickets may retain weight-based allowance. | Exact Australian fare allowance and extra-piece price need further confirmation. Do not publish the legacy universal 30kg assumption. |

Sources:
- Virgin checked: https://www.virginaustralia.com/au/en/travel-info/baggage/checked-baggage/
- Virgin cabin: https://www.virginaustralia.com/au/en/travel-info/baggage/carry-on-baggage/
- Jetstar Starter: https://www.jetstar.com/AU/EN/help/starter-fare-product-guide
- Jetstar baggage: https://www.jetstar.com/id/en/flights/baggage/checked-baggage
- Qantas: https://www.qantas.com/en-au/baggage/checked
- Scoot: https://www.flyscoot.com/en/plan/booking-your-flight/fares-fees
- Batik ID: https://help.batikair.com/article/things-to-pay-attention-to-for-checked-baggage/741
- Batik OD (blocked): https://www.batikair.com.my/experience/baggage
- Garuda transition: https://www.garuda-indonesia.com/qa/en/new-baggage-policy

## Map evidence and implementation

Stone Villas official site https://stonevillasuluwatu.com/ includes a Google map embed for place ID 0x2dd25b082d160e0f:0xf7f127c633f17dd9 (CID 17866104928983940569). Embed viewport centre is approximately -8.840304, 115.099615; it is not proof of exact venue coordinates. Final map must resolve the place, not treat viewport centre as its pin.
Show Bingin/Padang Padang, Suluban, Balangan/Dreamland and Ungasan/Melasti with concise descriptions. Suggested venue pins: Stone Villas, Uluwatu Temple, Single Fin, Savaya and Sundays, plus key beaches. These names follow the existing guide. Verify coordinates and operating status before implementation. Avoid blanket 20-minute guarantees; keep the traffic qualification.

## Visa links

Two equal prominent actions with official domains visible:
1. Apply for your tourist visa → https://evisa.imigrasi.go.id/
2. Pay the Bali tourist levy → https://lovebali.baliprov.go.id/

Keep eligibility caveat and a separate subordinate link for the free All Indonesia arrival card.
Visa 30-day VOA/e-VOA fee IDR500,000 plus e-VOA online processing fee verified through Smartraveller: https://www.smartraveller.gov.au/destinations/asia/indonesia
Levy IDR150,000 verified through Bali government: https://disnakeresdm.baliprov.go.id/greeting-from-the-governor-of-bali/
Direct visa/levy sites returned 403 in research tool. Use official URLs above; no third-party application service.

## Next phase

Review mockups with user; then implement flight schema/collector changes, verified baggage guide and costs, geographic map and clear visa actions. Retain the user's commit/deploy authorization for implementation, while respecting their explicit mockup-first request.

