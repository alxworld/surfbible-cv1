import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, or } from "drizzle-orm";
import Link from "next/link";

const PLAN_META: Record<string, { accent: string; tag: string }> = {
  navigators:      { accent: "border-emerald-200 hover:border-emerald-400", tag: "300 days" },
  psalms_proverbs: { accent: "border-teal-200 hover:border-teal-400",       tag: "30 days"  },
  nt_90:           { accent: "border-green-200 hover:border-green-400",     tag: "90 days"  },
  ot_nt:           { accent: "border-emerald-200 hover:border-emerald-400", tag: "365 days" },
  chronological:   { accent: "border-teal-200 hover:border-teal-400",       tag: "365 days" },
};

const TYPE_ORDER = ["navigators", "nt_90", "psalms_proverbs", "ot_nt", "chronological"];

export default async function PlansPage() {
  const user = await getDbUser();

  const where = user
    ? or(eq(plans.isPublic, true), eq(plans.createdBy, user.id))
    : eq(plans.isPublic, true);

  const rows = await db.select().from(plans).where(where);

  const publicPlans = rows
    .filter(p => p.isPublic)
    .sort((a, b) => (TYPE_ORDER.indexOf(a.type) ?? 99) - (TYPE_ORDER.indexOf(b.type) ?? 99));

  const myPrivatePlans = rows.filter(p => !p.isPublic && p.createdBy === user?.id);

  return (
    <main className="bg-green-50 min-h-[calc(100svh-3.5rem)]">
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Bible Reading Plans</h1>
            <p className="text-stone-500 text-sm">Choose a plan and build a daily habit in the Word.</p>
          </div>
          {user && (
            <Link
              href="/plans/create"
              className="shrink-0 bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              + Create
            </Link>
          )}
        </div>

        {myPrivatePlans.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">My private plans</h2>
            <div className="flex flex-col gap-3">
              {myPrivatePlans.map(plan => (
                <PlanCard key={plan.id} plan={plan} isOwner />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {publicPlans.map(plan => (
            <PlanCard key={plan.id} plan={plan} isOwner={plan.createdBy === user?.id} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            Go to my dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}

function PlanCard({
  plan,
  isOwner,
}: {
  plan: { id: string; title: string; description: string | null; type: string; totalDays: number; isPublic: boolean };
  isOwner: boolean;
}) {
  const meta = PLAN_META[plan.type] ?? {
    accent: "border-emerald-200 hover:border-emerald-400",
    tag: `${plan.totalDays} days`,
  };

  return (
    <div className={`rounded-2xl border-2 bg-white ${meta.accent} shadow-sm transition-all`}>
      <Link href={`/plans/${plan.id}`} className="block p-5 active:scale-[0.99]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h2 className="font-semibold text-stone-900">{plan.title}</h2>
              <span className="text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full">
                {meta.tag}
              </span>
              {!plan.isPublic && (
                <span className="text-xs font-medium bg-stone-100 border border-stone-200 text-stone-500 px-2 py-0.5 rounded-full">
                  private
                </span>
              )}
            </div>
            {plan.description && (
              <p className="text-sm text-stone-500 leading-relaxed line-clamp-2">{plan.description}</p>
            )}
          </div>
          <span className="text-emerald-400 text-xl mt-0.5">›</span>
        </div>
      </Link>
      {isOwner && plan.type === "topical" && (
        <div className="border-t border-emerald-50 px-5 py-2">
          <Link href={`/plans/${plan.id}/edit`} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
            Edit plan
          </Link>
        </div>
      )}
    </div>
  );
}
