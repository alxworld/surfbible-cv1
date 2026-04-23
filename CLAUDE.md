@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SurfBible (`surfbible.in`) — church Bible reading platform. This is the Next.js 16 web app. See `../CLAUDE.md` for full project context.

## Commands

```bash
npm run dev          # start dev server
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint

npm run db:push      # push Drizzle schema to Neon DB
npm run db:migrate   # run migrations from drizzle/
npm run db:seed      # seed Navigators reading plan (idempotent)
```

Requires `DATABASE_URL` in `.env.local`.

## Key Files

- `lib/db/schema.ts` — Drizzle schema: `plans`, `plan_days`, `users`, `churches`, `user_plans`, `user_day_progress`, `reading_groups`, `reading_group_members`, `streak_freezes`, `notifications`
- `lib/db/index.ts` — Neon + Drizzle client (`db` export)
- `lib/plans/navigators.ts` — Navigators plan data: 300 days × 4 passages/day (2 NT + 2 OT). `NAVIGATORS_PLAN_META` + `NAVIGATORS_DAYS`
- `scripts/seed-navigators.ts` — inserts the Navigators plan if not already present
- `app/api/plans/route.ts` — `GET /api/plans?type=<type>`
- `app/api/plans/[id]/route.ts` — `GET /api/plans/:id` (plan + all days)

## Architecture Notes

- `passages` in `plan_days` is a JSONB array of `{ book: string, ref: string }` — OSIS book codes (GEN, MAT, JHN…), ref is a string like `"1:1-17"` or `"1-3"`
- Bible text is never stored — fetched at read time from external APIs (ESV/NIV/KJV)
- All route handler params are `Promise<{…}>` — must `await params` (Next.js 16)
- Use `req.nextUrl.searchParams` (not `new URL(req.url)`) in route handlers
- Streak logic: 03:00 local-time grace window, server-side only, one freeze/month/plan

## Next Actions

### Immediate — see `docs/setup.md` for full step-by-step detail
- [ ] Step 1 — Create Vercel project (root dir = `web`)
- [ ] Step 2 — Provision Neon DB → `vercel env pull .env.local`
- [ ] Step 3 — `npm run db:push` + `npm run db:seed`
- [ ] Step 4 — Create Clerk app → add keys to `.env.local` + Vercel env vars
- [ ] Step 5 — Get ESV API key → add `ESV_API_KEY` to `.env.local`
- [ ] Step 6 — `npm run dev` → verify `GET /api/plans` returns plan JSON
- [ ] Step 7 — Confirm all 6 keys are in `.env.local`

### Phase 1.0 — MVP (`docs/phase-1.0.md` has full detail)
- [ ] `middleware.ts` — Clerk auth guard (public: `/`, `/plans`, `/sign-in`, `/sign-up`)
- [ ] `app/sign-in/[[...sign-in]]/page.tsx` + `app/sign-up/[[...sign-up]]/page.tsx`
- [ ] `lib/auth.ts` — `getDbUser()` helper (get-or-create user from Clerk session)
- [ ] `app/api/user/plans/route.ts` — `GET` (list enrollments) + `POST` (enroll)
- [ ] `app/api/user/plans/[id]/complete/route.ts` — mark day done + update streak
- [ ] `lib/streak.ts` — pure streak calculation (grace window, freeze logic)
- [ ] `lib/osis.ts` — OSIS code → full book name (GEN → Genesis, etc.)
- [ ] `lib/bible.ts` — ESV API fetch, cached 24h via `next: { revalidate: 86400 }`
- [ ] `app/plans/page.tsx` — plan browser (Server Component)
- [ ] `app/dashboard/page.tsx` — today's reading card + streak badge
- [ ] `app/read/[planId]/page.tsx` — passage reader + notes + mark complete

### Phase 1.1 — Calendar & Reminders
- [ ] `app/dashboard/calendar/page.tsx` — monthly grid
- [ ] `app/dashboard/stats/page.tsx` — 66-book grid, streak chart
- [ ] `app/api/crons/reminder/route.ts` — daily reminder (Vercel Cron, hourly)
- [ ] `app/api/crons/streak-alert/route.ts` — streak-at-risk (21:00 per user tz)
- [ ] `app/api/crons/weekly/route.ts` — weekly summary (Sunday 08:00 per user tz)

### Phase 1.2 — Recovery & Pause
- [ ] Missed-day recovery UI (catch up / skip / restart)
- [ ] `PUT /api/user/plans/[id]` — pause / resume / abandon
- [ ] `POST /api/user/plans/[id]/freeze` — apply streak freeze
- [ ] Cron: auto-freeze missed day, reset freeze on 1st of month

### Phase 1.3+ — Custom Plans, Groups, Mobile
See `../CLAUDE.md` → Next Actions for phases 1.3–2.0.

## Reading Plans

| type | description |
|------|-------------|
| `navigators` | The Navigators Plan — 300 days, 25/month, 4 passages/day |
| `chronological` | 365-day chronological (not yet seeded) |
| `ot_nt` | OT + NT parallel, 365 days (not yet seeded) |
| `nt_90` | NT in 90 days (not yet seeded) |
| `psalms_proverbs` | Psalms + Proverbs, 30 days (not yet seeded) |
| `topical` | User/leader-created topical plans |
| `church_assigned` | Pastor-assigned congregation-wide plan |
