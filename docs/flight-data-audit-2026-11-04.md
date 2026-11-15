# Flight data audit — 4 November 2026

## Finding

The recent plateau matches the stored Google Flights observations, but the graph joins two different collection methods without explaining the change. The older sources have degraded access and date coverage; they are not all permanently unavailable. No collection settings, production data or website code were changed during this audit.

## Evidence

- Reviewed all 47 Flight Price Log rows and all 400 Flight Options rows in the Wedding Airtable base. The log records that the routine switched to Google Flights on 1 November and backfilled 23–31 October from existing options.
- For the current summary window (depart 15–18 May, return 22/23 May 2027), recorded cheapest fares from 23 October through 4 November are A$608, 608, 609, 608, 603, 603, 602, 604, 603, 604, 604, 605, 606. Virgin's recorded minimum stays A$628.
- The older history used a broader, changing window, including returns 26–30 May and nearest-fit dates outside the window. Some full-service figures were route-level “from” prices; some direct status was inferred from the carrier. Earlier fluctuations are therefore not a like-for-like market trend.
- The cron writes only Flight Options. A separate Claude routine copies summaries into Flight Price Log. The routine's instructions/runtime were not available through the connected tools; its historical decisions were recovered from Airtable Notes/Source fields.
- 3 November has 12 options, including an in-window A$605 Jetstar fare, but no summary log row. The website chart reads only the summary log.
- `TrendChart` removes null values before drawing a single polyline, connecting across missing checks. Dates are equally spaced by record index rather than elapsed days.
- The collector retains only four cheapest airline/stop combinations per trip, so an absent airline does not mean it was not searched. It checks only three trip pairs: 15–23, 18–23, 19–22 May. Only the first two qualify for the current summary window.
- The collector does not retain baggage inclusions or return-leg details. “Full-service direct” with bags is stronger than this feed alone proves.
- A local SerpApi key was unavailable, so this audit verified stored daily observations, not a new API quote. SerpApi documents a one-hour cache, which does not explain a 13-day plateau.

## Original sources, tested today

| Source | Result | Usable role |
|---|---|---|
| I Want That Flight | Old route URL redirects to `/cheap-flights/SYD/DPS/sydney-to-bali`. Direct HTTP requests return 403. The canonical page loads in Chrome, showing recent-search fares; exact 18–23 May search reaches Cloudflare verification. Indexed search content differs from the current browser page. | Browser-assisted supplementary checks; not yet proven reliable for unattended exact-date collection. |
| Skyscanner | Search-indexed route page readable; direct request redirects to CAPTCHA. A$527 May example is 5–19 May, unsuitable for the wedding. | Discovery/context, with exact dates verified separately. |
| Virgin Australia | Correct route URL ends `flights-from-sydney-to-bali-dps`; readable through web retrieval. Default displayed calendar runs November–April, not May. | Direct booking searches needed for May; generic route floor is not a wedding quote. |
| Garuda | Correct route URL ends `flights-from-sydney-to-bali-denpasar`; web fetch returned 502. | Intermittent availability; do not carry an old quote forward. |

## Recommended repair

1. Keep exact-date Google Flights as the reproducible baseline. Generate its daily summary deterministically from stored observations, avoiding dependence on an AI routine copying the figures.
2. Separate legacy flexible-date history from the fixed-date series. Show gaps for failed/missing checks, and use actual date spacing. Recover 3 November only from its original stored observations.
3. Retain original sources as a separate supplementary layer, with source URL, retrieval time, exact travel dates, currency and collection status. Record blocked/no matching dates distinctly; never substitute generic “from” prices or cached search snippets as fresh quotes.
4. Use the corrected source URLs and browser-assisted checks where allowed. Exact-date IWTF automation remains unverified because of Cloudflare. Do not implement an unattended scraper that silently fails or bypasses verification.
5. Preserve enough returned results for airline coverage and verify baggage/return legs before labelling a fare full-service/direct. Display only a short list if desired, but do not discard research coverage at ingestion.

## Sources

- [Airtable Flight Price Log](https://airtable.com/appm3kvFJqSThm2rj/tblXg2RRTEgBPD7D8)
- [Airtable Flight Options](https://airtable.com/appm3kvFJqSThm2rj/tblA9A5l4U3cLAANV)
- [I Want That Flight](https://iwantthatflight.com.au/cheap-flights/SYD/DPS/sydney-to-bali)
- [Skyscanner](https://www.skyscanner.com.au/routes/syd/dps/sydney-to-bali-denpasar.html)
- [Virgin Australia](https://www.virginaustralia.com/en-au/flights-from-sydney-to-bali-dps)
- [Garuda](https://www.garuda-indonesia.com/flights/en-au/flights-from-sydney-to-bali-denpasar)
- [SerpApi cache and response documentation](https://serpapi.com/google-flights-api)
