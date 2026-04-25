const isDev = process.env.NODE_ENV === "development";

const appHost = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://surfbible.in").hostname;
const clerkOrigin = isDev ? "https://*.clerk.accounts.dev" : `https://clerk.${appHost}`;
const clerkAccountsOrigin = isDev ? "https://*.clerk.accounts.dev" : `https://accounts.${appHost}`;
const clerkScriptSrc = `${clerkOrigin} https://*.clerk.com`;
const clerkConnectSrc = `${clerkOrigin} ${clerkAccountsOrigin} https://clerk.com https://*.clerk.com`;

export function buildCsp(nonce: string): string {
  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline' ${clerkScriptSrc} https://challenges.cloudflare.com`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${clerkScriptSrc} https://challenges.cloudflare.com`;

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    `connect-src 'self' https://api.esv.org ${clerkConnectSrc} https://challenges.cloudflare.com`,
    `frame-src ${clerkScriptSrc} https://challenges.cloudflare.com`,
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
  ].join("; ");
}
