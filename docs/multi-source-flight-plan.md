# Multi-source flight collection

Researched 4 November 2026. The graph correction is implemented; the additional-source service remains a pilot and is not activated.

## Desired behaviour

Each morning, search the same configured SYD–DPS return trips, one adult, economy, AUD, through every enabled collector. Store all valid quotes. The daily graph point is the lowest fresh qualifying total across those quotes; the flight list uses the same dataset. Keep cheap connecting options, but label stops, separate tickets and baggage accurately. Preserve per-seller alternatives for the same itinerary.

The existing displayed trip pairs are 15–23, 18–23 and 19–22 May 2027. The legacy summary excludes 19 May and used other dates historically. Make that policy explicit in shared configuration before rebuilding history; do not merge unlike windows silently.

## Source choices

- Existing SerpApi Google Flights: retain the current baseline. Stop discarding all but four airline/stop combinations at ingestion. Preserve flight identity and source metadata. Search results already cover several carriers; booking-options requests add named airline/agent sellers and baggage information. These are Google-sourced seller quotes, not an independent Skyscanner or IWTF check.
- Skyscanner official Live Prices API: unsuitable for this personal project under current published access criteria, which exclude non-commercial individuals and low-traffic sites (100,000 monthly active users minimum).
- I Want That Flight: canonical route URL works in Chrome, but exact-date search reached Cloudflare verification during the audit. A browser collector is a candidate, not a proven solution. No public quote API was identified in the affiliate documentation reviewed.
- Virgin/Garuda: use exact-date booking results if accessible; do not extract headline route/calendar floors as wedding quotes.
- Hosted Chromium/Playwright, e.g. Browserbase: separates scheduled collection from the user's computer and executes JavaScript. It does not guarantee exact-date access on these sites. Pilot each source before enabling it; record verification challenges as blocked instead of claiming successful checks.
- Independent price aggregator, e.g. FlightAPI: published round-trip endpoint provides multiple airline/vendor quotes and uses two credits per request. Trial must verify SYD–DPS coverage, seller identities, usable booking links, freshness, currency and total round-trip prices. Do not assume it includes every named source.

## Architecture

1. A daily scheduler creates a run and dispatches each source/trip collector independently.
2. Each collector returns quotes plus a status: success, no_results, blocked, timeout, invalid_response. Retry transient errors with a bounded budget; retries must not duplicate observations or skip unfinished trips.
3. Validate exact route, departure and return dates, passengers, cabin, currency, positive finite total, observation timestamp and valid booking/search link. Reject route-level “from” prices and incomplete one-way results. Baggage unknown remains unknown.
4. Store source, seller, itinerary ID/flight numbers, both legs and stop counts, total AUD, baggage/fare conditions, observation time, travel dates, link and run ID. Keep source-run status even when zero quotes were produced.
5. Deduplicate the same source/seller/itinerary/fare/run. Retain competing sellers and genuinely different flights; apply display limits only after calculating minima.
6. Compute summaries directly from accepted observations. No AI copying values into a second daily log. Never carry yesterday's price into today's minimum.
7. Publish a partial-data indicator when configured sources fail. If all fail, create a gap. Rebuild missing historical summaries only from original dated observations, keeping legacy flexible-date history separate.
8. The guest list sorts the same accepted quotes by total and exposes travel dates, seller/source and relevant restrictions. Use pagination or “show more” for the larger list.

## Proving unattended reliability

Require a small repeated pilot (for example seven consecutive daily runs per source) before describing a collector as reliable. Inspect complete exact-date quotes against the source UI, verify booking links, and measure failed/blocked runs. A successful route-page load or a single successful search does not establish reliability. Run source failures without interrupting the remaining collectors.

## Published costs and request budget

- SerpApi currently advertises 250 searches/month free, Starter $25/month for 1,000. Confirm the existing account's actual allowance. Three baseline searches/day cost 93 searches in a 31-day month. Illustratively, resolving two selected round trips with one return-selection and one booking-options request each adds 124, for 217 total before retries. Actual token flow must be checked; this does not price every itinerary.
- Browserbase advertises a free one-browser-hour tier and a $20/month Developer tier with 100 browser hours, with additional usage charges. Trial access and exact site success remain unverified.
- FlightAPI advertises a free trial and a $49/month entry plan. This is a candidate for evaluation, not a recommendation to subscribe without proving coverage.
- Prices above are the providers' displayed dollar prices, not AUD conversions. No account was created, subscription activated, or paid usage enabled.

## References

- https://serpapi.com/google-flights-booking-options
- https://serpapi.com/pricing
- https://www.partners.skyscanner.net/contact/travel-api
- https://iwantthatflight.com.au/Affiliates.aspx
- https://www.browserbase.com/pricing
- https://www.flightapi.io/documentation/round-trip-api/
- https://www.flightapi.io/

## Implementation checkpoint — 4 November 2026

### Completed

- Built a read-only source probe using checksum-pinned Lightpanda 1.0.2. GitHub workflow uses a standard Linux runner, read-only repository permissions, no secrets, a ten-minute limit, and three-day diagnostic artifact retention. No paid service was enabled.
- Local macOS probe: IWTF route readable; IWTF exact search refused by robots policy; Skyscanner exact search returned an empty result; Virgin route readable but no validated wedding-date quote; Garuda blocked by security verification. These are local results, not evidence of cloud reliability.
- IWTF rendered route HTML exposes individual AUD economy SYD–DPS return listings, including 15–22 May 2027. Its note says prices come from searches in the last 24 hours and may differ now. These remain candidates, not fresh exact-date confirmations; nothing was ingested.
- Replaced the graph's separate daily summary with aggregation of dated Flight Options observations. Departures 15–19 May, returns 22–23 May 2027; reject invalid dates/prices, estimates and one-way entries. The chart uses each observation day's minimum; missing dates remain gaps. Latest list preserves source alternatives and identifies the source.
- Removed the unsupported full-service comparison and booking signal from this graph. Historical summary records were not deleted. The chart starts at the first qualifying individual observation (23 October), so unlike older flexible-date summaries are no longer joined to the current series.
- Read-only verification against 400 stored rows: 13 qualifying days, 12 latest fares, current minimum A$606. Recovered 3 November A$605; corrected 25 October minimum to A$607. The other currently qualifying rows are Google Flights only.
- Four aggregation tests, changed-file ESLint and production build with live Airtable data passed. Existing points table preserved.

### Required user action

GitHub rejected the workflow push because the existing CLI OAuth token has repo scope but lacks workflow scope. Run `gh auth refresh -h github.com -s workflow`, approve GitHub's request and reply done. Do not paste tokens. This is a GitHub permission requirement, not a paid subscription.

### Next after permission

1. Push `codex/flight-source-pilot` and inspect the cloud runner's artifacts.
2. Validate exact dates, currency, route, cabin, return total, freshness and usable links for any working source; keep cached route listings clearly distinguished from newly retrieved quotes.
3. Enable only proven collectors, add source health reporting and bounded retries, then run repeated scheduled checks. Leave blocked sources visibly unavailable.
4. Improve Google collection independently: retain more itinerary alternatives and fix partial-run retry handling. These collector changes are not implemented yet.

Code is saved in the project workspace and committed on local branch `codex/flight-source-pilot` at `bc0d81d`. The branch has not been pushed because of the permission error. No new unattended source is enabled yet.

## Shipped checkpoint — 4 November 2026, after GitHub permission update

This checkpoint supersedes the pending-permission and not-activated notes above.

- GitHub workflow permission granted and verified. Both branches pushed; application main is now `9ab9224`.
- Cloud source pilot succeeded: https://github.com/dinalp/wedding-website/actions/runs/41770838529 . It confirmed the same source access limits as local testing.
- Implemented strict parsing of IWTF's individual rendered return-fare rows, checking AUD, recent-search notice, route, economy cabin, travel window, positive finite price and matching dated search link. It does not substitute the airline group's headline minimum. Stops/baggage remain unknown. Quotes clearly say published searches within the prior 24 hours, not live repricing.
- First unattended collection and publication succeeded: https://github.com/dinalp/wedding-website/actions/runs/41771229027 . It produced TEN qualifying options (the earlier local sample had three). Cheapest published listing: A$579, 18–23 May, Jetstar + Batik Air Malaysia.
- Public observations and collection status are stored on the dedicated `flight-data` branch, https://github.com/dinalp/wedding-website/blob/flight-data/quotes.json . The runner has no Airtable/guest-list access, no added account credentials and no paid browser. Uses only the automatic repository workflow token to publish public flight data.
- Daily schedule is active on main at 20:20 UTC. Collection stops after 19 May 2027. Browser work has a 65-second timeout; job has a five-minute cap. Source failures record status rather than invent prices. A failed same-day retry preserves an earlier successful observation and separately records the failed attempt. Future days do not carry old observations forward.
- Website combines Google observations with this feed before calculating daily minima and listing options. First combined day: 22 options and A$579 minimum, compared with the Google-only A$606. The existing hourly website refresh picks up daily feed updates.
- Skyscanner/Garuda remain unavailable and are labelled as such. Virgin's route page is accessible but no independent exact-date collector was validated; Virgin prices can still appear through Google and IWTF. The manual read-only pilot remains available to retest source access.
- Validation: 3 parser tests cover headline-vs-individual price, currency/freshness failure, invalid values, wrong route/cabin, mismatched links and travel window; 4 aggregation tests pass. Targeted lint, production build with actual data and source publication run pass.
- This establishes a working scheduled integration, not a demonstrated multi-week reliability record. No claim that every source now works. Google collector's existing four-per-trip selection and partial-retry handling are unchanged.
