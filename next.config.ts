import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/api/rsvp/:path*", headers: [
      { key: "Cache-Control", value: "private, no-store, max-age=0" },
      { key: "CDN-Cache-Control", value: "no-store" },
      { key: "Vercel-CDN-Cache-Control", value: "no-store" },
    ] }];
  },
  images: {
    // Film-grain photos smear at the default 75, which shows on retina phones.
    // 90 for the full-height hero, 85 for everything else.
    qualities: [85, 90],
    // AVIF keeps more detail than WebP at the same size; browsers without it get WebP.
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [{ source: "/getting-around", destination: "/bali#getting-around", permanent: true }];
  },
};

export default nextConfig;
