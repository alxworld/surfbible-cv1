import { db } from "@/lib/db";
import { plans, planDays } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { bookName } from "@/lib/osis";
import Link from "next/link";
import EnrollButton from "../EnrollButton";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getDbUser();

  const [plan] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  if (!plan) notFound();

  const isOwner = user?.id === plan.createdBy;

  const previewDays = await db
    .select()
    .from(planDays)
    .where(eq(planDays.planId, id))
    .orderBy(asc(planDays.dayNumber))
    .limit(7);

  return (
    <main className="bg-green-50 min-h-[calc(100svh-3.5rem)]">
      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Back */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/plans" className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            ← All plans
          </Link>
          {isOwner && plan.type === "topical" && (
            <Link href={`/plans/${id}/edit`} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-white border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm">
              Edit plan
            </Link>
          )}
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
              {plan.totalDays} days
            </span>
            <span className="text-xs text-stone-400 font-medium uppercase tracking-wide">
              {plan.type.replace(/_/g, " ")}
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-stone-900 mb-2">{plan.title}</h1>
          {plan.description && (
            <p className="text-stone-500 text-sm leading-relaxed">{plan.description}</p>
          )}
        </div>

        {/* Enroll CTA */}
        <div className="mb-6">
          <EnrollButton planId={plan.id} />
        </div>

        {/* Day preview */}
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-4 uppercase tracking-wide">
            First 7 days
          </h2>
          <div className="flex flex-col gap-2">
            {previewDays.map((day) => {
              const passages = day.passages as { book: string; ref: string }[];
              return (
                <div key={day.id} className="flex items-start gap-3 rounded-xl bg-green-50 px-3 py-2.5">
                  <span className="text-xs font-bold text-emerald-500 w-12 shrink-0 mt-0.5">
                    Day {day.dayNumber}
                  </span>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {passages.map((p, i) => (
                      <span key={i} className="flex items-center gap-1.5 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="font-medium text-stone-800">{bookName(p.book)}</span>
                        <span className="text-stone-400">{p.ref}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {plan.totalDays > 7 && (
            <p className="text-xs text-stone-400 text-center mt-3">
              + {plan.totalDays - 7} more days after you enroll
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
