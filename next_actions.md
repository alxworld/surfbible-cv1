# SurfBible — Next Actions

Living document. Update checkboxes as steps are completed.

**Last updated:** 2026-04-25  
**Status:** Phases 0–1.9 complete. Active work starts at Phase 2.0.

---

## Completion Summary

| Phase | Description | Status |
|---|---|---|
| 0 | Environment setup | Partial (Vercel deploy manual) |
| 1.0 | MVP — enroll, read, streak | Complete |
| 1.1 | Calendar, Stats, Cron reminders | Complete |
| 1.2 | Recovery, Pause, Freeze | Complete |
| 1.3 | All 5 reading plans seeded | Complete |
| 1.4 | User settings & profile | Complete |
| 1.5 | Reading groups | Complete |
| 1.6 | Custom (topical) plans | Complete |
| 1.7 | Church admin | Complete |
| 1.8 | Notes & Reflections | Complete |
| 1.9 | Email delivery (Resend) | Complete |
| 2.0 | PWA & Offline reading | Not started |

**Total routes:** 41 (verified clean build 2026-04-25)  
**TypeScript errors:** 0  
**Test report:** `test_reports.md` — 31 automated HTTP tests, all pass

---

## Phase 0 — Environment Setup

### Step 1 — Create Vercel Project
- [ ] Go to [vercel.com](https://vercel.com) and sign in
- [ ] Click **Add New → Project**, import your GitHub repo
- [ ] Set **Root Directory** to `web`
- [ ] Click **Deploy** (first deploy may fail — that's fine, you just need the project linked)

### Step 2 — Provision Neon Database
- [x] Neon DB provisioned, env vars pulled to `.env.local`

### Step 3 — Create Tables and Seed Data
- [x] `npm run db:push` — schema applied to Neon
- [x] `npm run db:seed` — 300 days of Navigators plan inserted

### Step 4 — Set Up Clerk Authentication
- [x] Clerk app created, keys added to `.env.local` and Vercel env vars
- [x] `@clerk/nextjs` installed

### Step 5 — Get ESV Bible API Key
- [x] `ESV_API_KEY` added to `.env.local` and Vercel env vars

### Step 6 — Verify Locally
- [x] `GET /api/plans` returns Navigators plan JSON

### Step 7 — Confirm `.env.local` is Complete
- [x] All keys present: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `CLERK_SECRET_KEY`, `ESV_API_KEY`, `CRON_SECRET`

---

## Phase 1.0 — MVP Features

Goal: user can enroll in the Navigators plan, read daily passages, mark days complete, and track their streak.

### Step 1 — Clerk Proxy + User Sync
- [x] `web/proxy.ts` — Clerk auth guard (Next.js 16 uses `proxy.ts` not `middleware.ts`)
- [x] `web/lib/auth.ts` — `getDbUser()` get-or-create DB user from Clerk session
- [x] `web/app/layout.tsx` — `ClerkProvider` wraps body, updated metadata

### Step 2 — Auth Pages
- [x] `web/app/sign-in/[[...sign-in]]/page.tsx`
- [x] `web/app/sign-up/[[...sign-up]]/page.tsx`

### Step 3 — User Enrollment API
- [x] `web/app/api/user/plans/route.ts` — `GET` (list enrollments) + `POST` (enroll)

### Step 4 — Mark Complete API + Streak Logic
- [x] `web/lib/streak.ts` — pure streak calculation (grace window 03:00 local time, freeze logic)
- [x] `web/app/api/user/plans/[id]/complete/route.ts` — mark day done, update streak

### Step 5 — OSIS + Bible Text
- [x] `web/lib/osis.ts` — OSIS code → full book name map (66 books)
- [x] `web/lib/bible.ts` — ESV API fetch with 24h cache

### Step 6 — Frontend Pages
- [x] `web/app/plans/page.tsx` — plan browser (Server Component) + `EnrollButton` client component
- [x] `web/app/dashboard/page.tsx` — today's reading card + streak badge + `MarkCompleteButton`
- [x] `web/app/read/[planId]/page.tsx` — passage reader with ESV text

### Phase 1.0 Verification
- [x] TypeScript: `npm run typecheck` — 0 errors
- [x] `GET /api/plans` → 200, returns plan JSON
- [x] `GET /plans` → 200
- [x] `GET /dashboard` → 307 redirect to sign-in (Clerk auth working)
- [x] `GET /sign-in` → 200, Clerk widget renders
- [x] `GET /sign-up` → 200, sign-up + CAPTCHA working
- [x] Home page (`/`) — SurfBible landing with Browse Plans + My Dashboard links

### Phase 1.0 Notes
- Next.js 16 uses `proxy.ts` (not `middleware.ts`) — export must be default
- CSP in `next.config.ts` must allow: `*.clerk.accounts.dev` (script/frame/connect), `challenges.cloudflare.com` (Turnstile CAPTCHA), `'unsafe-eval'` in dev

---

## Phase 1.1 — Calendar & Reminders

- [x] `app/dashboard/calendar/page.tsx` — monthly reading grid
- [x] `app/dashboard/stats/page.tsx` — 66-book grid, streak chart, progress bar
- [x] `app/api/crons/reminder/route.ts` — daily reminder (Vercel Cron, hourly); queues `notifications` row per due user
- [x] `app/api/crons/streak-alert/route.ts` — streak-at-risk alert (21:00 per user tz)
- [x] `app/api/crons/weekly/route.ts` — weekly summary (Sunday 08:00 per user tz); skips on non-Sunday
- [x] `vercel.json` — cron schedules configured
- [x] Dashboard links to Calendar + Stats pages

### Phase 1.1 Notes
- Added `/api/crons(.*)` to `proxy.ts` public matcher — cron routes use `CRON_SECRET`, not Clerk sessions
- `CRON_SECRET` must be in Vercel env vars before deploying; cron routes return 401 without it
- Cron routes queue `notifications` rows but do not yet send emails (Phase 1.9)

---

## Phase 1.2 — Recovery & Pause

- [x] `PUT /api/user/plans/[id]` — pause / resume / abandon
- [x] `POST /api/user/plans/[id]/freeze` — apply streak freeze (one per month)
- [x] `POST /api/user/plans/[id]/recover` — skip missed day or restart plan
- [x] Dashboard recovery banner — shown when user missed a day; offers freeze / skip / restart
- [x] `app/api/crons/auto-freeze/route.ts` — at 03:xx local, auto-freeze if freeze available
- [x] `app/api/crons/monthly-reset/route.ts` — 1st of month, resets `freezeUsedThisMonth`
- [x] `vercel.json` — auto-freeze (hourly) + monthly-reset (`5 0 1 * *`) crons added

### Phase 1.2 Notes
- `hasMissedDay()` exported from `lib/streak.ts` — uses same 03:00 grace window as streak calc
- Unauthenticated calls to plan mutation routes correctly 307-redirect to sign-in via Clerk proxy

---

## Phase 1.3 — More Reading Plans

Goal: users can choose from all seeded plans, not just Navigators.

- [x] `scripts/seed-chronological.ts` — 365-day chronological plan data + seed script
- [x] `scripts/seed-ot-nt.ts` — 365-day OT + NT parallel plan data + seed script
- [x] `scripts/seed-nt-90.ts` — NT in 90 days plan data + seed script
- [x] `scripts/seed-psalms-proverbs.ts` — Psalms + Proverbs 30-day plan data + seed script
- [x] `package.json` — `db:seed:all` script runs all 5 seed scripts sequentially
- [x] `app/plans/page.tsx` — queries `plans` table (not hardcoded); plan card shows type badge + total days + description
- [x] `app/plans/[id]/page.tsx` — plan detail page: description, first-7-days preview, enroll button

### Phase 1.3 Notes
- All seed scripts are idempotent (skip if plan exists by `type`)
- `passages` JSONB uses OSIS codes (GEN, PSA, PRO, MAT, REV…)
- All 5 plans confirmed seeded and returned by `GET /api/plans`

---

## Phase 1.4 — User Settings & Profile

Goal: users can set timezone, display name, and reminder time.

- [x] `PUT /api/user/profile` — update `displayName`, `timezone`, `reminderTime`
- [x] `app/settings/page.tsx` — settings form: display name, timezone (IANA select), reminder time (time picker)
- [x] Dashboard nav links to Settings
- [x] `/settings` behind auth (Clerk proxy default guard)

### Phase 1.4 Notes
- Timezone field uses IANA names (e.g., `Asia/Kolkata`) — `Intl.supportedValuesOf("timeZone")` for select options
- `reminderTime` is a `time` column (HH:MM) — used by cron reminder routes to filter users

---

## Phase 1.5 — Reading Groups (Small Groups)

Goal: users can form or join a small group and see each other's reading progress.

- [x] `POST /api/groups` — create group (name, planId); generates 12-char hex `inviteCode`; creator added as `admin` member
- [x] `GET /api/groups` — list groups the current user belongs to
- [x] `GET /api/groups/[id]` — group detail: members + `currentDay`, `streakCount`, `lastReadAt` per member; 403 if not a member
- [x] `POST /api/groups/join` — join by `inviteCode`; auto-enrolls user in group's plan if not already enrolled
- [x] `DELETE /api/groups/[id]/members/[userId]` — leave (self) or remove member (admin only)
- [x] `app/groups/page.tsx` — my groups list + collapsible Create + Join forms
- [x] `app/groups/[id]/page.tsx` — member table with streak counts, streak leader highlight, copyable invite code, leave button
- [x] Dashboard nav — "Groups" link

### Phase 1.5 Notes
- `inviteCode` generated with `crypto.randomBytes(6).toString("hex")` (12 hex chars)
- Group creator is implicit admin (`createdBy` field on `reading_groups`)
- Members with no enrollment show "Not started" (left join on `user_plans`)

---

## Phase 1.6 — Custom (Topical) Plans

Goal: any user can create a custom reading plan with their own passage list.

- [x] `POST /api/plans` — create plan (`type: "topical"`, `isPublic`, days array with passages)
- [x] `PUT /api/plans/[id]` — update plan (owner only; 409 if other users enrolled)
- [x] `DELETE /api/plans/[id]` — delete plan (owner only; DB cascade handles enrolled users + days)
- [x] `GET /api/plans` — updated to include authenticated user's own private plans
- [x] `app/plans/create/page.tsx` — `PlanBuilder` client component: title, description, public toggle, dynamic days, book selector + ref input per passage
- [x] `app/plans/[id]/edit/page.tsx` — same builder pre-filled; includes Delete button
- [x] `app/plans/page.tsx` — "My private plans" section for authenticated users; "+ Create" button; "Edit plan" on owned topical plans
- [x] `app/plans/[id]/page.tsx` — "Edit plan" pill shown to owner of topical plans

### Phase 1.6 Notes
- Book picker is a `<select>` over all 66 OSIS codes from `lib/osis.ts`
- Owner check: `plans.createdBy === dbUser.id`
- Private plans visible only to creator (and enrolled members via `GET /api/plans` auth logic)

---

## Phase 1.7 — Church Admin

Goal: a church admin can create a church, invite members, and push a church-assigned reading plan to all members.

- [x] Schema: added `inviteCode` (12-char hex, unique) + `createdBy` to `churches` table; pushed to Neon
- [x] `POST /api/admin/churches` — create church; generates invite code; links creator as member
- [x] `PUT /api/admin/churches/[id]` — update name/city/country (admin only)
- [x] `GET /api/admin/churches/[id]/members` — list all church members (admin only)
- [x] `POST /api/admin/churches/[id]/members` — add member by email; user must have existing account; 409 if already in a church
- [x] `POST /api/admin/churches/[id]/plans` — create `church_assigned` plan + auto-enroll all current church members
- [x] `POST /api/user/church` — join church by invite code (sets `users.churchId`)
- [x] `DELETE /api/user/church` — leave current church
- [x] `app/admin/page.tsx` — if no church: create form; if admin: invite code, stats, invite-by-email, plans list; if member: read-only
- [x] `app/admin/members/page.tsx` — full member roster with per-plan day + streak progress
- [x] `app/settings/page.tsx` — Church section: join form (no church) or church name + Admin link (has church)
- [x] Dashboard nav — "Church" link

### Phase 1.7 Notes
- Admin = `churches.createdBy === user.id`; no separate roles table
- Auto-enroll inserts `user_plans` rows for all `users` where `churchId` matches; uses `onConflictDoNothing`
- `churches.createdBy` has no FK to avoid circular dependency with `users`

---

## Phase 1.8 — Notes & Reflections UI

Goal: users can write and review personal notes per day of reading.

- [x] `PATCH /api/user/plans/[id]/progress/[day]` — upsert `user_day_progress` row; update `notes` and/or `reflection`
- [x] `app/read/[planId]/page.tsx` — `NotesEditor` client component added below passages; two textareas (Notes + Reflection); 1s debounce auto-save; "Saving…" / "Saved" indicator; pre-populated from existing progress row
- [x] `app/dashboard/reflections/page.tsx` — reverse-chronological list of days with notes/reflection; passage chips; book filter bar (link-based, server-rendered); entry count
- [x] Dashboard nav — "Reflections" link

### Phase 1.8 Notes
- Auto-save: debounces 1s, PATCHes only when content differs from last saved value
- PATCH upserts an `in_progress` row first (via `onConflictDoNothing`), then updates fields
- Reflections page filters server-side using `isNotNull(notes) OR isNotNull(reflection)`
- Book filter uses `?book=<OSIS>` query param; "All" clears filter

---

## Phase 1.9 — Email Notifications (Resend)

Goal: cron-triggered notification emails actually get delivered; users can unsubscribe.

The cron routes already exist and queue `notifications` rows. This phase wires up actual delivery.

- [x] Install Resend: already in package.json (v6.12.2)
- [x] Add `RESEND_API_KEY` to `.env.local` and Vercel env vars
- [x] `lib/email.ts` — `sendEmail(to, subject, html)` wrapper; HMAC-SHA256 unsubscribe token helpers
- [x] `app/api/crons/reminder/route.ts` — calls `sendEmail()` for each due user
- [x] `app/api/crons/streak-alert/route.ts` — calls `sendEmail()` for at-risk users
- [x] `app/api/crons/weekly/route.ts` — calls `sendEmail()` with weekly summary
- [x] `GET /api/unsubscribe?token=<hmac>` — verifies token, sets `users.reminderTime = null`
- [x] HTML email templates in `lib/emails/templates.ts` (reminder, streak-alert, weekly summary)
- [x] `notifications.status` set to `"sent"` or `"failed"` with `sentAt` timestamp

### Phase 1.9 Notes
- Resend free tier: 3,000 emails/month — sufficient for early users
- `@react-email/components` for HTML templating
- Unsubscribe token should be signed with `CRON_SECRET` or a dedicated `JWT_SECRET`

---

## Phase 2.0 — PWA & Offline Reading

Goal: users can install SurfBible on their phone homescreen and read cached passages offline.

- [ ] `public/manifest.json` — web app manifest (name, icons, theme_color, display: standalone)
- [ ] `public/icon-192.png` + `public/icon-512.png` — app icons
- [ ] `app/layout.tsx` — add `<link rel="manifest">` and `<meta name="theme-color">`
- [ ] `public/sw.js` — service worker: cache-first for Bible passage responses, network-first for everything else
- [ ] `app/layout.tsx` — register service worker on mount (client component island)
- [ ] `app/read/[planId]/page.tsx` — "Reading offline" banner when `navigator.onLine === false`
- [ ] Test on Android Chrome (Add to Homescreen) and iOS Safari (Share → Add to Homescreen)

### Phase 2.0 Notes
- Cache key for ESV passages: URL of the ESV API call
- Service worker scope `/` — cache Bible fetch responses + static assets; skip auth routes
- iOS Safari does not support push notifications via service worker — email (Phase 1.9) covers this gap
