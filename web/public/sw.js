const CACHE_VERSION = "v1";
const STATIC_CACHE = `surfbible-static-${CACHE_VERSION}`;
const BIBLE_CACHE = `surfbible-bible-${CACHE_VERSION}`;
const PAGE_CACHE = `surfbible-pages-${CACHE_VERSION}`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(["/"]))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("surfbible-") && !k.endsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only cache GET requests
  if (request.method !== "GET") return;

  // Skip Clerk, Cloudflare, and other third-party auth requests
  if (
    url.hostname.includes("clerk") ||
    url.hostname.includes("cloudflare") ||
    url.hostname.includes("accounts")
  ) return;

  // Skip cross-origin except ESV Bible API
  if (url.origin !== self.location.origin && url.hostname !== "api.esv.org") return;

  // ESV Bible passages — cache-first (content never changes)
  if (url.hostname === "api.esv.org") {
    event.respondWith(cacheFirst(request, BIBLE_CACHE));
    return;
  }

  // Next.js static assets — cache-first (hashed filenames, safe forever)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Auth, API, and admin routes — never cache
  const skipPaths = ["/sign-in", "/sign-up", "/api/", "/dashboard", "/admin", "/settings"];
  if (skipPaths.some((p) => url.pathname.startsWith(p))) return;

  // Public pages (/plans, /read, /) — network-first with offline fallback
  event.respondWith(networkFirst(request, PAGE_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response("Offline — check your connection.", { status: 503 });
  }
}
