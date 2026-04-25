import { db } from "@/lib/db";
import { userPlans, userDayProgress, planDays, plans } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { BOOK_NAMES } from "@/lib/osis";
import Link from "next/link";

export default async function StatsPage() {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const [enrollment] = await db
    .select({
      id: userPlans.id,
      planId: userPlans.planId,
      currentDay: userPlans.currentDay,
      streakCount: userPlans.streakCount,
      longestStreak: userPlans.longestStreak,
      plan: { title: plans.title, totalDays: plans.totalDays },
    })
    .from(userPlans)
    .innerJoin(plans, eq(userPlans.planId, plans.id))
    .where(and(eq(userPlans.userId, user.id), eq(userPlans.status, "active")))
    .limit(1);

  if (!enrollment) redirect("/plans");

  const progress = await db
    .select({ dayNumber: userDayProgress.dayNumber })
    .from(userDayProgress)
    .where(eq(userDayProgress.userPlanId, enrollment.id));

  const completedDays = new Set(progress.map((p) => p.dayNumber));
  const daysRead = completedDays.size;
  const pct = Math.round((daysRead / enrollment.plan.totalDays) * 100);

  const allPlanDays = await db
    .select({ dayNumber: planDays.dayNumber, passages: planDays.passages })
    .from(planDays)
    .where(eq(planDays.planId, enrollment.planId));

  const booksRead = new Set<string>();
  allPlanDays.forEach((row) => {
    if (completedDays.has(row.dayNumber)) {
      (row.passages as { book: string; ref: string }[]).forEach((p) =>
        booksRead.add(p.book)
      );
    }
  });

  const allBooks = Object.keys(BOOK_NAMES);

  return (
    <main className="bg-[#0f172a] min-h-[calc(100svh-3.5rem)]">
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Reading Stats</h1>
          <Link href="/dashboard" className="text-sm text-[#d4a843] hover:text-[#e0bc60] font-medium">
            ← Dashboard
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#162033] rounded-2xl border border-[#d4a843]/15 shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-[#d4a843]">{enrollment.streakCount}</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Streak</div>
          </div>
          <div className="bg-[#162033] rounded-2xl border border-[#d4a843]/15 shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-[#e0bc60]">{enrollment.longestStreak}</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Best</div>
          </div>
          <div className="bg-[#162033] rounded-2xl border border-[#d4a843]/15 shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-[#d4a843]">{pct}%</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wide">{daysRead} days</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-[#162033] rounded-2xl border border-[#d4a843]/15 shadow-sm p-5 mb-6">
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span className="font-medium">{enrollment.plan.title}</span>
            <span className="text-slate-400">Day {enrollment.currentDay} of {enrollment.plan.totalDays}</span>
          </div>
          <div className="h-2.5 bg-[#0f172a] rounded-full overflow-hidden">
            <div className="h-full bg-[#d4a843] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Books grid */}
        <div className="bg-[#162033] rounded-2xl border border-[#d4a843]/15 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">
            Books touched ({booksRead.size}/66)
          </h2>
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-7">
            {allBooks.map((code) => (
              <div
                key={code}
                title={BOOK_NAMES[code]}
                className={[
                  "text-xs px-1.5 py-1.5 rounded-lg text-center font-medium transition-colors",
                  booksRead.has(code)
                    ? "bg-[#d4a843]/20 text-[#d4a843] border border-[#d4a843]/30"
                    : "bg-[#0f172a] text-slate-600",
                ].join(" ")}
              >
                {code}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
