import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 85 is for the full-height hero photos; everything else stays at the default 75
  images: { qualities: [75, 85] },
};

export default nextConfig;
