import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// In production, Clerk JS is served from the custom clerk subdomain (clerk.<appHost>).
// In dev, it comes from *.clerk.accounts.dev.
const appHost = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://surfbible.in").hostname;
const clerkOrigin = isDev ? "https://*.clerk.accounts.dev" : `https://clerk.${appHost}`;
const clerkAccountsOrigin = isDev ? "https://*.clerk.accounts.dev" : `https://accounts.${appHost}`;

const clerkScriptSrc = `${clerkOrigin} https://*.clerk.com`;
const clerkConnectSrc = `${clerkOrigin} ${clerkAccountsOrigin} https://clerk.com https://*.clerk.com`;

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // unsafe-eval needed by React in dev; Clerk JS loaded from its CDN
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${clerkScriptSrc} https://challenges.cloudflare.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      `connect-src 'self' https://api.esv.org ${clerkConnectSrc} https://challenges.cloudflare.com`,
      // Clerk uses iframes for verification flows and Cloudflare Turnstile for CAPTCHA
      `frame-src ${clerkScriptSrc} https://challenges.cloudflare.com`,
      "frame-ancestors 'none'",
      // Clerk uses blob: workers
      "worker-src 'self' blob:",
    ].join("; "),
  },
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
};

export default nextConfig;
