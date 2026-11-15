# Checkpoint: footer removal + hero image load/quality work

Paused 2026-10-12. Everything below is **uncommitted** in the working tree (`git diff` shows it).
Live site (dinalandshayani.vercel.app) is still on commit "Replace default favicon with script D&S monogram".
Deploys = push to `main` (Vercel git integration). Never change the Vercel project/domain (QR codes).

## Request
1. Remove "Made with love from Sydney, Australia" from the footer.
2. Pick a load-time goal and hit it on phone and desktop; carousel photos were slow to appear.
3. Work out whether poor hero image quality is the image files or the rendering, and fix it.

## Done (uncommitted)
- `src/app/page.tsx` footer: removed the "Made with love" line and the divider above it.
- `src/app/page.tsx` hero carousel (left and right panels):
  - Dropped `AnimatePresence`/`motion.div`; all 3 slides per panel are now rendered stacked, so slides 2-3
    download up front instead of when their turn comes (that was the visible delay).
  - First slide is server-rendered visible (it used to fade in from opacity 0 after hydration, costing ~660 ms of LCP).
  - Crossfade: active slide `opacity-100 z-10`, others `opacity-0 delay-1000`, so the new slide fades in over
    the old one with no washed-out midpoint. Gradient overlays raised to `z-20` to stay on top.
  - `sizes` was `50vw`; now `heroSizes = "(max-aspect-ratio: 4/3) 67vh, 50vw"`. On phones the 2:3 photo is
    sized by height, so 50vw made the browser fetch a 384px file and stretch it about 3x. This was the main quality problem on mobile.
  - `quality={85}` on hero images.
- `next.config.ts`: `images: { qualities: [75, 85] }` (Next 16 rejects qualities that aren't in this list).
- `npx next build` passes (the 2 warnings about a stray `~/package-lock.json` were already there).
- Verified in Chrome on desktop: all 6 hero images load at `w=1920&q=85`, and the slides rotate and render.

## Findings
- Source JPEGs are fine for compression (about quality 90). They're soft and grainy film-style shots by nature.
- Hero files are only **1333x2000**. A half-screen panel on a retina laptop needs about 1920px wide, so desktop
  still upscales about 1.4x. **Ask Dinal for higher-res originals (at least 2000px wide)** of hero-1,2,3,4,5,7. That's the only
  remaining fix for desktop sharpness.

## Baseline (Lighthouse 12.6.1, live site, before changes)
- Mobile: score 98, FCP 0.9s, **LCP 2.4s** (TTFB 0.6 / load 1.1 / render delay 0.66), 608 KiB
- Desktop: score 100, FCP 0.3s, LCP 0.5s, 701 KiB

## Goals
- Mobile LCP of 1.8s or less, desktop LCP of 0.8s or less, performance score of at least 90 on both.
- No blank or pop-in frame on any slide change; hero images sized correctly for each screen.

## Next steps
1. Optional: in Chrome, confirm one full crossfade looks smooth (the tab must be visible/focused, because
   background tabs pause CSS transitions, which is why earlier checks looked stuck).
2. Check the mobile size choice: resize to about 390x844 and confirm the hero `currentSrc` has `w=` of 1080 or more.
3. Commit, push to `main`, wait for the Vercel deploy to show Ready.
4. Re-run Lighthouse on the live site and compare with the baseline:
   `npx -y lighthouse@12.6.1 https://dinalandshayani.vercel.app --only-categories=performance --chrome-flags="--headless=new" --output=json --output-path=<scratch>/lh-after-mobile.json --quiet`
   (add `--preset=desktop` for desktop). Trade-off to watch: preloading 6 larger hero images adds page
   weight; if mobile LCP gets worse, make slides 2-3 `loading="lazy"` plus a preload after first paint.
5. Optional: the Bali collage images (`bali-v2-*`) all load at page start on mobile; could be lazy-loaded.
6. When higher-res hero originals arrive: replace the files in `public/photos/` (keep the filenames), redeploy.
