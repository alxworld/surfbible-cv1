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

See `next_actions.md` — living document with full phase-by-phase checklist.

Phases 0 through 1.2 are complete. Active work starts at Phase 1.3.

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
