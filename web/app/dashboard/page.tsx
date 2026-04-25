import { db } from "@/lib/db";
import { userPlans, plans, planDays } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { bookName } from "@/lib/osis";
import { hasMissedDay } from "@/lib/streak";
import Link from "next/link";
import { redirect } from "next/navigation";
import MarkCompleteButton from "./MarkCompleteButton";
import RecoveryBanner from "./RecoveryBanner";

export default async function DashboardPage() {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const enrollments = await db
    .select({
      id: userPlans.id,
      planId: userPlans.planId,
      currentDay: userPlans.currentDay,
      streakCount: userPlans.streakCount,
      longestStreak: userPlans.longestStreak,
      status: userPlans.status,
      lastReadAt: userPlans.lastReadAt,
      freezeUsedThisMonth: userPlans.freezeUsedThisMonth,
      plan: { title: plans.title, totalDays: plans.totalDays },
    })
    .from(userPlans)
    .innerJoin(plans, eq(userPlans.planId, plans.id))
    .where(and(eq(userPlans.userId, user.id), eq(userPlans.status, "active")));

  if (enrollments.length === 0) {
    return (
      <main className="bg-[#0f172a] min-h-[calc(100svh-3.5rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#d4a843]/15 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#d4a843]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">No active plans</h1>
          <p className="text-slate-400 text-sm mb-5">Pick a plan to start your daily reading.</p>
          <Link href="/plans" className="inline-block bg-[#d4a843] text-[#080d1a] text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#e0bc60] transition-colors">
            Browse reading plans
          </Link>
        </div>
      </main>
    );
  }

  const enrollment = enrollments[0];

  const [today] = await db
    .select()
    .from(planDays)
    .where(
      and(
        eq(planDays.planId, enrollment.planId),
        eq(planDays.dayNumber, enrollment.currentDay)
      )
    );

  const passages = today
    ? (today.passages as { book: string; ref: string }[])
    : [];

  const missed = hasMissedDay(enrollment.lastReadAt, user.timezone);
  const freezeAvailable = !enrollment.freezeUsedThisMonth && enrollment.streakCount > 0;
  const pct = Math.round((enrollment.currentDay / enrollment.plan.totalDays) * 100);

  return (
    <main className="bg-[#0f172a] min-h-[calc(100svh-3.5rem)]">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-100">{enrollment.plan.title}</h1>
            <p className="text-slate-400 text-sm mt-0.5">Day {enrollment.currentDay} of {enrollment.plan.totalDays}</p>
          </div>
          {/* Streak badge */}
          <div className="flex flex-col items-center bg-[#162033] border border-[#d4a843]/20 rounded-2xl px-4 py-2 shadow-sm min-w-[60px]">
            <span className="text-2xl font-bold text-[#d4a843] leading-none">{enrollment.streakCount}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">streak</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="h-1.5 bg-[#d4a843]/15 rounded-full overflow-hidden">
            <div className="h-full bg-[#d4a843] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-1 text-right">{pct}% complete</p>
        </div>

        {missed && (
          <RecoveryBanner enrollmentId={enrollment.id} freezeAvailable={freezeAvailable} />
        )}

        {/* Today's readings */}
        <div className="bg-[#162033] rounded-2xl border border-[#d4a843]/15 shadow-sm p-5 mb-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Today&apos;s readings</h2>
          <ul className="space-y-2.5">
            {passages.map((p, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm">
                <span className="w-2 h-2 rounded-full bg-[#d4a843] shrink-0" />
                <span className="font-semibold text-slate-100">{bookName(p.book)}</span>
                <span className="text-slate-400">{p.ref}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <Link
            href={`/read/${enrollment.id}`}
            className="flex-1 text-center bg-[#162033] border-2 border-[#d4a843] text-[#d4a843] py-3 rounded-xl hover:bg-[#d4a843]/8 text-sm font-semibold transition-colors"
          >
            Read passages
          </Link>
          <MarkCompleteButton enrollmentId={enrollment.id} />
        </div>

        {/* Sub-nav */}
        <div className="flex gap-3 justify-center">
          {[
            { href: "/dashboard/calendar", label: "Calendar" },
            { href: "/dashboard/stats", label: "Stats" },
            { href: "/dashboard/reflections", label: "Reflections" },
            { href: "/groups", label: "Groups" },
            { href: "/plans", label: "All plans" },
            { href: "/admin", label: "Church" },
            { href: "/settings", label: "Settings" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs font-medium text-[#d4a843] hover:text-[#e0bc60] bg-[#162033] border border-[#d4a843]/20 px-3 py-1.5 rounded-full hover:border-[#d4a843]/40 transition-all"
            >
              {label}
            </Link>
          ))}
        </div>

        {enrollments.length > 1 && (
          <p className="text-xs text-slate-400 mt-4 text-center">
            +{enrollments.length - 1} more active plan(s)
          </p>
        )}
      </div>
    </main>
  );
}
