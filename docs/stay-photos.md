# Stay photos

The Stays page uses reviewed local photos for known properties. Daily Airtable price updates cannot replace them with broken external image URLs.

`src/lib/stay-photos.json` records each property's local asset, original source and source page, dimensions and SHA-256 digest. Assets live in `public/photos/stays/`. Matching ignores case, punctuation, accents and the “adults only” qualifier.

To add or replace a photo:

1. Verify the property on its own site or a listing page. Download the actual photo, keeping the full URL including query parameters. Booking CDN images return HTTP 401 when their required query parameters are stripped.
2. Decode and visually inspect it. Resize to at most 1200px wide, export WebP, and save it in `public/photos/stays/`.
3. Add or update the manifest entry, including the verified dimensions and SHA-256 digest. Use the property name recorded in Airtable.
4. Run `node --test tests/stay-images.test.mjs` and check the rendered card. The same checks run before every production build, blocking missing or changed assets until reviewed.

New properties without a local photo retain their complete HTTPS image URL. If it is absent or fails, the card shows “Photo unavailable” with guidance to view the property listing, rather than leaving a broken image or substituting an unrelated property.

Verified on 10 November 2026: Padawatu Villas, PinkCoco Uluwatu, Melali Bingin and Lexington Palace had incomplete external URLs returning HTTP 401. All currently listed properties now have local photos. External providers can still fail for newly added properties; add a reviewed local photo when extending the shortlist.
