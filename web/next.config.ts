import type { NextConfig } from "next";

// CSP is set dynamically per-request in proxy.ts (with a nonce).
// These headers cover everything else and apply to all routes including static assets.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), display-capture=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      // Next.js serves ImageResponse routes without extension (/opengraph-image),
      // but social crawlers and browsers often request the .png URL.
      { source: "/opengraph-image.png", destination: "/opengraph-image" },
      { source: "/plans/:id/opengraph-image.png", destination: "/plans/:id/opengraph-image" },
    ];
  },
};

export default nextConfig;
