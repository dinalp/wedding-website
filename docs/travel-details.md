# Travel details and Uluwatu area guide

Implemented from the approved 14 November 2026 previews. Uses the existing Cormorant/Montserrat typography, cream background and olive controls.

## Stays map

`UluwatuMap` replaces the old area bullet list at the top of Stays. It is an authored, explicitly approximate area diagram, not a navigation map. North is up; the western beaches run from Balangan down to Suluban and the temple, with Stone Villas on the southern cliffs. Hover, focus, Enter/Space and tap select an area and its description. On small screens the diagram scrolls horizontally; selecting an area also pans to it. All area controls remain available alongside the map on desktop and below it on mobile. Named-place links open Google Maps.

The Stone Villas destination uses CID `17866104928983940569`, from the venue's official embedded map: https://stonevillasuluwatu.com/. Do not substitute its iframe viewport centre as exact venue coordinates. The map deliberately avoids precise distance/drive-time claims. Existing text qualifies the roughly 20-minute local driving guide with route and traffic.

## Flight times

Times are stored as airport-local wall times, with airport code, travel date, duration, stops and flight identity. An explicit next-day marker uses the arrival date; the server's timezone must not alter displayed times. Connection summaries use the first departure and final arrival.

The collector retains outbound schedules from Google Flights. A `departure_token` scopes each return lookup to that specific outbound. Its returned round-trip price replaces the initial quote if a return is selected. A subsequent `booking_token` may supply a seller's complete-return baggage quote. Separate-ticket baggage offers are not combined. Source coverage is not guaranteed: missing schedules, fare brand or bag costs are labelled unconfirmed.

Structured data uses a versioned JSON suffix in the existing Airtable `Details` field, separated by the `[flight-details:v1]` marker (whitespace-independent because Airtable normalizes single-line fields). `decodeFlightDetails` strips this before display and validates dates, airports and fields. No Airtable schema migration or guest-table access is needed. Existing date-only observations remain compatible.

The daily cron remains at its existing schedule. It checks SerpApi allowance before optional return/baggage lookups and reserves three daily base searches until reset (conservative 31 days if the reset date is unavailable). Authenticated manual refreshes retain the same full until-reset baseline reserve. Optional detail requests are capped at 24 per run. No plan purchase or overage is enabled. If the account check fails, only the existing base searches run. SerpApi account and search requests have bounded timeouts. A same-day retry updates matching records and does not downgrade a previously confirmed return to missing data.

GET `/api/cron/flights` retains `CRON_SECRET` authorization. POST uses the separate `FLIGHT_REFRESH_SECRET` bearer credential, configured in Vercel Production, for an immediate manual refresh. Never expose either key in a URL, browser bundle, screenshot or logs. Responses report only counts, quota and non-sensitive errors. Unauthorized requests return 401.

## Baggage guidance

Airline guidance is distinct from a confirmed fare inclusion. Only combine baggage into a flight total when the exact allowance, journey direction, currency and price are known. Do not double an outbound-only fee or assign Lite/Starter from an airline name alone.

Checked 14 November 2026:

- Virgin: standard economy cabin allowance 8kg plus a personal item; Lite excludes checked bags, Choice/Flex include one 23kg bag. Australia-departing international bag prices: A$87 at online booking, A$107 online later, A$170 airport. Return fee remains unconfirmed. Sources: https://www.virginaustralia.com/au/en/travel-info/baggage/checked-baggage/ and https://www.virginaustralia.com/au/en/travel-info/baggage/carry-on-baggage/
- Jetstar: JQ Starter carry-on changes for departures from 2 February 2027; one underseat bag 40 × 30 × 20cm, subject to earlier-booking exception. Checked baggage, selected seats and meals extra. Bag prices depend on route. Sources: https://www.jetstar.com/AU/EN/help/starter-fare-product-guide and https://www.jetstar.com/au/en/flights/baggage/checked-baggage
- Qantas: Qantas-operated economy outside the Americas includes 30kg checked baggage; partner allowances differ. Source: https://www.qantas.com/en-au/baggage/checked
- Scoot: economy cabin 10kg, Basic excludes checked bags, Value/Flex include 20kg, ScootPlus 30kg. Whole-journey add-on price not verified. Source: https://www.flyscoot.com/en/plan/booking-your-flight/fares-fees
- Batik: ID and OD policies differ; resolve operating airline and ticket allowance. No universal add-on fee published here. Sources: https://help.batikair.com/category/batik-air-baggage and https://www.batikair.com.my/experience/baggage
- Garuda: new tickets from 1 September 2026 use piece-based rules. Do not reuse the old universal 30kg assumption. Source: https://www.garuda-indonesia.com/qa/en/new-baggage-policy

API documentation: https://serpapi.com/google-flights-api and https://serpapi.com/google-flights-booking-options

## Visa actions

Separate prominent buttons target `https://evisa.imigrasi.go.id/` and `https://lovebali.baliprov.go.id/`. Fees and official domains are visible alongside each action. The free All Indonesia arrival card remains a separate later step. Existing passport eligibility advice is retained.

## Validation

Prebuild now runs flight aggregation and itinerary tests alongside existing RSVP and stay-image tests. Itinerary tests cover local times, overnight arrivals, connections, invalid/missing data, mismatched dates, legacy compatibility and schedule-aware deduplication. Desktop and mobile browser checks exercise area selection, official visa links, baggage accordions, overflow and unauthenticated refresh rejection.
