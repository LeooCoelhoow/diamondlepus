import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow SVG placeholder images and future photos
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // When you add real JPEG/PNG product photos, remove unoptimized
    unoptimized: true,
  },
};

export default nextConfig;
