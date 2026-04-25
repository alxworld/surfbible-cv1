import { db } from "@/lib/db";
import { userPlans, userDayProgress, planDays, plans } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and, desc, isNotNull, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { bookName } from "@/lib/osis";
import Link from "next/link";
import type { NextRequest } from "next/server";

export default async function ReflectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ book?: string }>;
}) {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const { book: filterBook } = await searchParams;

  // all completed days that have notes or reflection
  const rows = await db
    .select({
      dayNumber: userDayProgress.dayNumber,
      notes: userDayProgress.notes,
      reflection: userDayProgress.reflection,
      completedAt: userDayProgress.completedAt,
      planTitle: plans.title,
      passages: planDays.passages,
      userPlanId: userDayProgress.userPlanId,
    })
    .from(userDayProgress)
    .innerJoin(userPlans, eq(userDayProgress.userPlanId, userPlans.id))
    .innerJoin(plans, eq(userPlans.planId, plans.id))
    .innerJoin(
      planDays,
      and(eq(planDays.planId, userPlans.planId), eq(planDays.dayNumber, userDayProgress.dayNumber))
    )
    .where(
      and(
        eq(userPlans.userId, user.id),
        or(isNotNull(userDayProgress.notes), isNotNull(userDayProgress.reflection))
      )
    )
    .orderBy(desc(userDayProgress.completedAt));

  type Row = typeof rows[number];

  // collect all unique book codes across all rows for the filter UI
  const allBooks = [...new Set(
    rows.flatMap(r => (r.passages as { book: string; ref: string }[]).map(p => p.book))
  )].sort();

  const filtered = filterBook
    ? rows.filter(r =>
        (r.passages as { book: string; ref: string }[]).some(p => p.book === filterBook)
      )
    : rows;

  return (
    <main className="bg-[#0f172a] min-h-[calc(100svh-3.5rem)]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/dashboard" className="text-sm text-[#d4a843] hover:text-[#e0bc60] font-medium">← Dashboard</Link>
            <h1 className="text-2xl font-bold text-slate-100 mt-1">My Reflections</h1>
          </div>
          <span className="text-sm text-slate-400">{filtered.length} entr{filtered.length !== 1 ? "ies" : "y"}</span>
        </div>

        {/* Book filter */}
        {allBooks.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              href="/dashboard/reflections"
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                !filterBook
                  ? "bg-[#d4a843] text-[#080d1a] border-[#d4a843]"
                  : "bg-[#162033] text-slate-400 border-[#d4a843]/20 hover:border-[#d4a843]/50"
              }`}
            >
              All
            </Link>
            {allBooks.map(code => (
              <Link
                key={code}
                href={`/dashboard/reflections?book=${code}`}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  filterBook === code
                    ? "bg-[#d4a843] text-[#080d1a] border-[#d4a843]"
                    : "bg-[#162033] text-slate-400 border-[#d4a843]/20 hover:border-[#d4a843]/50"
                }`}
              >
                {bookName(code)}
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm">No reflections yet.</p>
            <p className="text-slate-400 text-xs mt-1">Notes you write while reading will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((row, i) => {
              const passages = row.passages as { book: string; ref: string }[];
              return (
                <article key={i} className="bg-[#162033] rounded-2xl border border-[#d4a843]/15 shadow-sm p-5">
                  {/* Day meta */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs font-semibold text-[#d4a843] uppercase tracking-wide">{row.planTitle}</p>
                      <p className="text-sm font-bold text-slate-100 mt-0.5">Day {row.dayNumber}</p>
                    </div>
                    <p className="text-xs text-slate-400 shrink-0">
                      {row.completedAt
                        ? new Date(row.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : ""}
                    </p>
                  </div>

                  {/* Passages */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {passages.map((p, j) => (
                      <span key={j} className="text-xs bg-[#0f172a] border border-[#d4a843]/20 text-[#d4a843] px-2 py-0.5 rounded-full">
                        {bookName(p.book)} {p.ref}
                      </span>
                    ))}
                  </div>

                  {/* Notes */}
                  {row.notes && (
                    <div className="mb-2">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Notes</p>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{row.notes}</p>
                    </div>
                  )}

                  {/* Reflection */}
                  {row.reflection && (
                    <div className={row.notes ? "mt-3 pt-3 border-t border-[#d4a843]/10" : ""}>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Reflection</p>
                      <p className="text-sm text-slate-300 italic whitespace-pre-wrap leading-relaxed">{row.reflection}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
