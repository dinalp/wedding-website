import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Film-grain photos smear at the default 75, which shows on retina phones.
    // 90 for the full-height hero, 85 for everything else.
    qualities: [85, 90],
    // AVIF keeps more detail than WebP at the same size; browsers without it get WebP.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
