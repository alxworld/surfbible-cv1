# SurfBible — SEO Action Plan

**Date:** 2026-04-25  
**Base URL:** https://surfbible.in  
**Framework:** Next.js 16 App Router

---

## Current State

| Item | Status |
|------|--------|
| Global title + description | ✅ Basic only — `layout.tsx` |
| Per-page metadata | ❌ None |
| Open Graph tags | ❌ None |
| Twitter/X card tags | ❌ None |
| robots.txt | ❌ None |
| sitemap.xml | ❌ None |
| JSON-LD structured data | ❌ None |
| Canonical URLs | ❌ None |
| Favicon / app icons | ❌ Generic Next.js SVGs only |
| noindex on private pages | ❌ Not set |
| og:image (social share) | ❌ None |

**Publicly indexable pages today:** `/`, `/plans`, `/plans/[id]` (public plans only)  
**Should be noindex:** `/sign-in`, `/sign-up`, `/dashboard`, `/settings`, `/admin`, `/groups`, `/read/*`

---

## Priority 1 — Quick Wins (do these first)

### 1.1 — robots.txt

**File to create:** `web/app/robots.ts`

Next.js generates `robots.txt` automatically from this file.

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/plans"],
        disallow: ["/dashboard", "/settings", "/admin", "/groups", "/read/", "/sign-in", "/sign-up"],
      },
    ],
    sitemap: "https://surfbible.in/sitemap.xml",
  };
}
```

---

### 1.2 — Dynamic sitemap

**File to create:** `web/app/sitemap.ts`

Includes the homepage, plans listing, and every public plan detail page fetched from the DB.

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const BASE = "https://surfbible.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicPlans = await db
    .select({ id: plans.id, updatedAt: plans.updatedAt })
    .from(plans)
    .where(eq(plans.isPublic, true));

  return [
    { url: BASE,           lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/plans`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    ...publicPlans.map(p => ({
      url: `${BASE}/plans/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
```

---

### 1.3 — Favicon and app icons

**Why it matters:** browsers, search results, and social previews all use the favicon. The current `public/` folder only has generic Next.js SVGs.

**Steps:**
1. Create a 512×512 PNG of the SurfBible logo (gold cross on dark background)
2. Place files in `web/app/`:
   - `icon.png` — 512×512 (Next.js uses this as the base favicon)
   - `apple-icon.png` — 180×180 (iOS home screen)
   - `opengraph-image.png` — 1200×630 (social share image — see 2.3)
3. Next.js App Router auto-detects these filenames and generates the correct `<link>` tags — no code needed.

Alternatively, create `web/app/icon.tsx` to generate the favicon programmatically using Next.js ImageResponse:

```tsx
// app/icon.tsx
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ background: "#080d1a", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#d4a843", fontSize: 20, fontWeight: "bold" }}>✝</div>
    </div>,
    { ...size }
  );
}
```

---

### 1.4 — Richer global metadata

**File to update:** `web/app/layout.tsx`

Replace the minimal metadata export with a full baseline that all pages inherit:

```ts
export const metadata: Metadata = {
  metadataBase: new URL("https://surfbible.in"),
  title: {
    default: "SurfBible — Daily Bible Reading",
    template: "%s | SurfBible",          // page titles become "Navigators Plan | SurfBible"
  },
  description: "Structured daily Bible reading plans for churches and individuals. Track your streak, read together, grow in the Word.",
  keywords: ["bible reading plan", "daily bible reading", "church bible study", "navigators plan", "bible streak"],
  openGraph: {
    type: "website",
    siteName: "SurfBible",
    locale: "en_US",
    url: "https://surfbible.in",
    title: "SurfBible — Daily Bible Reading",
    description: "Structured daily Bible reading plans for churches and individuals.",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "SurfBible" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SurfBible — Daily Bible Reading",
    description: "Structured daily Bible reading plans for churches and individuals.",
    images: ["/opengraph-image.png"],
  },
  robots: { index: true, follow: true },
};
```

---

## Priority 2 — Per-page Metadata

### 2.1 — Homepage (`app/page.tsx`)

Add explicit metadata to override the layout default with homepage-specific copy:

```ts
// app/page.tsx
export const metadata: Metadata = {
  title: "SurfBible — Read the Bible Every Day",
  description: "Daily Bible reading plans for your church. Track streaks, read in groups, and grow together in the Word. Free forever.",
  openGraph: {
    url: "https://surfbible.in",
    title: "SurfBible — Read the Bible Every Day",
    description: "Daily Bible reading plans for your church.",
  },
};
```

---

### 2.2 — Plans listing (`app/plans/page.tsx`)

```ts
export const metadata: Metadata = {
  title: "Bible Reading Plans",
  description: "Choose from the Navigators Plan, NT in 90 Days, Psalms & Proverbs, and more. Free structured reading plans for every season of faith.",
  openGraph: {
    url: "https://surfbible.in/plans",
    title: "Bible Reading Plans — SurfBible",
  },
};
```

---

### 2.3 — Plan detail pages (`app/plans/[id]/page.tsx`)

Use `generateMetadata` to pull the plan title and description from the DB dynamically:

```ts
// app/plans/[id]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const [plan] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  if (!plan) return {};

  const title = plan.title;
  const description = plan.description
    ?? `A ${plan.totalDays}-day Bible reading plan. Read structured passages every day and track your progress.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} — SurfBible`,
      description,
      url: `https://surfbible.in/plans/${id}`,
    },
    // Private plans should not be indexed
    robots: plan.isPublic ? { index: true, follow: true } : { index: false },
  };
}
```

---

### 2.4 — noindex on auth and private pages

Auth and app pages should never appear in search results. Add this to `sign-in`, `sign-up`, `dashboard`, `settings`, `admin`, `groups`, and `read` pages:

```ts
// e.g. app/sign-in/[[...sign-in]]/page.tsx
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
```

For dashboard and other app pages, a single addition to the nearest layout or page file is enough. The quickest way is to add a `robots.ts` noindex rule (done in 1.1) which handles crawlers, and add `<meta name="robots" content="noindex">` at the page level as a belt-and-braces measure.

---

## Priority 3 — Structured Data (JSON-LD)

JSON-LD tells Google what your site *is*, enabling rich results and better entity understanding.

### 3.1 — WebApplication schema on homepage

Add to `app/page.tsx` inside the `<main>` component:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "SurfBible",
      "url": "https://surfbible.in",
      "description": "Daily Bible reading plans for churches and individuals.",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web, iOS, Android",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    }),
  }}
/>
```

### 3.2 — Course/LearningResource schema on plan detail pages

Each reading plan maps cleanly to a `Course` schema:

```tsx
// Inside PlanDetailPage
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Course",
      "name": plan.title,
      "description": plan.description ?? "",
      "provider": { "@type": "Organization", "name": "SurfBible", "url": "https://surfbible.in" },
      "url": `https://surfbible.in/plans/${plan.id}`,
      "numberOfCredits": plan.totalDays,
    }),
  }}
/>
```

---

## Priority 4 — Social Share Image (og:image)

Without an `og:image`, WhatsApp, iMessage, and Twitter show a blank preview when someone shares a link. This is especially important for church sharing.

### Option A — Static image (simplest)
Design a 1200×630 PNG in Figma or Canva:
- Dark background (`#080d1a`)
- Gold SurfBible logo and wordmark
- Tagline: "Read the Bible. Every Day."
- Save as `web/app/opengraph-image.png`

Next.js auto-serves it at `/opengraph-image.png`.

### Option B — Dynamic per-plan image (best for sharing)
Use Next.js `ImageResponse` to generate a unique card per plan:

**File to create:** `web/app/plans/[id]/opengraph-image.tsx`

```tsx
import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [plan] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);

  return new ImageResponse(
    <div style={{ background: "#080d1a", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px", fontFamily: "Georgia, serif" }}>
      <div style={{ color: "#d4a843", fontSize: 24, marginBottom: 24 }}>✝ SurfBible</div>
      <div style={{ color: "#ffffff", fontSize: 64, fontWeight: "bold", lineHeight: 1.1, marginBottom: 20 }}>
        {plan?.title ?? "Bible Reading Plan"}
      </div>
      <div style={{ color: "#94a3b8", fontSize: 28 }}>
        {plan?.totalDays} days · surfbible.in
      </div>
    </div>,
    { ...size }
  );
}
```

---

## Priority 5 — Technical SEO

### 5.1 — Canonical URLs

Prevents duplicate content issues if the same page is reachable via multiple URLs. Add to `layout.tsx` metadata:

```ts
alternates: {
  canonical: "https://surfbible.in",
},
```

And in each page's metadata:
```ts
alternates: { canonical: `https://surfbible.in/plans/${id}` },
```

### 5.2 — Verify `metadataBase` is set

Already in the layout metadata update (1.4). This ensures all relative URLs in og:image etc. resolve correctly on Vercel preview deployments. Without it, og:image URLs are broken on preview URLs.

### 5.3 — Page speed (Core Web Vitals)

Current setup is already good:
- ✅ `next/font` for Google Fonts — eliminates render-blocking font requests
- ✅ Server Components by default — minimal JS to client

Remaining actions:
- Replace any `<img>` tags with `next/image` if added in future (auto-optimises, serves WebP, lazy loads)
- Add `loading="lazy"` on any below-fold content
- Keep client components (`"use client"`) minimal — currently limited to buttons and forms only

### 5.4 — Submit to Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property → URL prefix → `https://surfbible.in`
3. Verify via DNS TXT record (add at domain registrar) or HTML file in `public/`
4. Once verified: **Sitemaps → Add sitemap** → enter `https://surfbible.in/sitemap.xml`
5. Monitor **Coverage** report for crawl errors and **Core Web Vitals** for page speed

### 5.5 — Submit to Bing Webmaster Tools

```
https://www.bing.com/webmasters
```
Import from Google Search Console in one click once GSC is set up.

---

## Recommended Implementation Order

| Step | Action | File | Effort |
|------|--------|------|--------|
| 1 | robots.txt | `app/robots.ts` | 5 min |
| 2 | Dynamic sitemap | `app/sitemap.ts` | 15 min |
| 3 | Richer global metadata + OG | `app/layout.tsx` | 15 min |
| 4 | Per-page metadata on `/`, `/plans` | `app/page.tsx`, `app/plans/page.tsx` | 10 min |
| 5 | `generateMetadata` on plan detail | `app/plans/[id]/page.tsx` | 15 min |
| 6 | noindex on auth/app pages | 6 page files | 10 min |
| 7 | Static og:image PNG | Design tool → `app/opengraph-image.png` | 20 min |
| 8 | JSON-LD on homepage + plan pages | `app/page.tsx`, `app/plans/[id]/page.tsx` | 20 min |
| 9 | Dynamic og:image per plan | `app/plans/[id]/opengraph-image.tsx` | 30 min |
| 10 | Favicon + app icons | `app/icon.png`, `app/apple-icon.png` | 15 min |
| 11 | Submit sitemap to GSC + Bing | Browser | 10 min |

Steps 1–6 are pure code, zero design work, and have the highest impact on indexability. Do those first.
