"use client";

import Image, { type ImageProps } from "next/image";

// Unsplash originals can be 25MB+, too slow for Vercel's optimiser to fetch and convert on a
// cold cache. Unsplash resizes and converts on its own CDN, so ask it for each srcset width directly.
// ponytail: capped at 2048px. Retina screens ask for 3840 (1.6MB for the hero) and the difference
// doesn't show under the page's overlays. Raise the cap if a photo ever looks soft.
const loader: ImageProps["loader"] = ({ src, width, quality }) =>
  `${src}?auto=format&fit=crop&w=${Math.min(width, 2048)}&q=${quality ?? 75}`;

export function UnsplashImage(props: Omit<ImageProps, "loader">) {
  return <Image {...props} loader={loader} />;
}
