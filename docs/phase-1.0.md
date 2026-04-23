# Phase 1.0 — MVP Implementation Guide

Goal: a working app where a user can enroll in the Navigators plan, read each day's passages, mark days complete, and see their streak.

---

## Step 1 — Infrastructure setup

### 1a. Neon database

1. Go to [vercel.com/marketplace](https://vercel.com/marketplace) → add Neon integration to your project
2. Copy `DATABASE_URL` from the Neon dashboard (or `vercel env pull .env.local`)
3. Create `web/.env.local`:

   ```
   DATABASE_URL=postgresql://...
   ```

4. From `web/`:

   ```bash
   npm run db:push     # creates all tables
   npm run db:seed     # inserts Navigators plan (300 days)
   ```

### 1b. Clerk auth

1. Create a project at [clerk.com](https://clerk.com)
2. Add to `web/.env.local`:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   ```

3. Install:

   ```bash
   npm install @clerk/nextjs
   ```

---

## Step 2 — Clerk middleware + user sync

**File: `web/middleware.ts`**

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/plans(.*)", "/api/plans(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

> Clerk Core 3 (March 2026): `auth()` is async, `auth.protect()` replaces `auth().protect()`, `clerkMiddleware()` replaces `authMiddleware()`.

**File: `web/lib/auth.ts`** — helper to get/create DB user from Clerk session:

```ts
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const [user] = await db.select().from(users).where(eq(users.clerkUserId, userId));
  if (user) return user;

  const clerkUser = await currentUser();
  const [created] = await db.insert(users).values({
    clerkUserId: userId,
    email: clerkUser!.emailAddresses[0].emailAddress,
    displayName: clerkUser!.fullName ?? undefined,
  }).returning();
  return created;
}
```

**File: `web/app/layout.tsx`** — `ClerkProvider` goes inside `<body>` (Core 3 requirement for cache components):

```tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
```

**Sign-in / sign-up pages:**

```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";
export default function Page() { return <SignIn />; }

// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";
export default function Page() { return <SignUp />; }
```

Add to `.env.local`:

```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

---

## Step 3 — User enrollment API

**File: `web/app/api/user/plans/route.ts`**

```ts
// GET  → list user's enrolled plans
// POST → enroll in a plan { plan_id, start_date? }
```

Key logic:

- `POST`: insert into `user_plans`, set `status = 'active'`, `current_day = 1`
- `GET`: join `user_plans` with `plans`, return active enrollments

---

## Step 4 — Mark complete API + streak logic

**File: `web/app/api/user/plans/[id]/complete/route.ts`**

Streak rules (from spec):

```
grace window: completion before 03:00 local time counts for previous day

effective_date = local date of completion (with grace window)

if last_read_at is NULL or effective_date == yesterday:
    streak_count += 1
elif effective_date == today (already read):
    no change
else:
    streak_count = 1   // broken

longest_streak = MAX(longest_streak, streak_count)
last_read_at = NOW()
current_day += 1
```

Put streak logic in **`web/lib/streak.ts`** — pure function, easy to test.

---

## Step 5 — Frontend pages

### Plan browser — `web/app/plans/page.tsx`

- Server Component
- Fetch all public plans from DB
- Show plan cards: title, description, total days, type badge
- "Start Reading" button → enrolls user and redirects to dashboard

### Dashboard — `web/app/dashboard/page.tsx`

- Server Component (with auth guard)
- Today's reading card: plan title, day X/300, passages list, streak badge
- "Mark Complete" button (Client Component with `useTransition`)

### Reading view — `web/app/read/[planId]/page.tsx`

- Show today's 4 passages
- Fetch Bible text from external API (see Phase 1.1 for caching)
- Notes textarea
- "Mark Complete" CTA

---

## Step 6 — Bible text fetching

**File: `web/lib/bible.ts`**

```ts
// Use ESV API (api.esv.org) — free tier available, requires API key
// Passage format: "John 1:1-17"

export async function fetchPassageText(book: string, ref: string): Promise<string> {
  const query = `${BOOK_NAMES[book]} ${ref}`;
  const res = await fetch(
    `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(query)}&include-headings=false`,
    { headers: { Authorization: `Token ${process.env.ESV_API_KEY}` },
      next: { revalidate: 86400 } }  // cache 24h
  );
  const data = await res.json();
  return data.passages?.[0] ?? "";
}
```

Add `ESV_API_KEY=...` to `.env.local`.

OSIS → human name mapping needed (GEN → Genesis, MAT → Matthew, etc.) — create `web/lib/osis.ts`.

---

## Checklist

- [ ] Neon DB provisioned, `DATABASE_URL` in `.env.local`
- [ ] `npm run db:push` run successfully
- [ ] `npm run db:seed` — Navigators plan in DB
- [ ] Clerk installed, keys in `.env.local`
- [ ] `middleware.ts` with `clerkMiddleware`
- [ ] `app/sign-in/[[...sign-in]]/page.tsx` + `app/sign-up/[[...sign-up]]/page.tsx`
- [ ] `lib/auth.ts` user sync helper
- [ ] `app/layout.tsx` with `ClerkProvider` inside `<body>`
- [ ] `GET/POST /api/user/plans`
- [ ] `POST /api/user/plans/:id/complete` with streak logic
- [ ] `lib/streak.ts` pure streak calculation
- [ ] `/plans` page — plan browser
- [ ] `/dashboard` page — today's reading card
- [ ] `/read/[planId]` — passage reader
- [ ] `lib/bible.ts` — ESV API fetch with caching
- [ ] `lib/osis.ts` — OSIS book code → full name map
