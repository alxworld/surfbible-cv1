import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, or } from "drizzle-orm";
import Link from "next/link";

const PLAN_META: Record<string, { tag: string }> = {
  navigators:      { tag: "300 days" },
  psalms_proverbs: { tag: "30 days"  },
  nt_90:           { tag: "90 days"  },
  ot_nt:           { tag: "365 days" },
  chronological:   { tag: "365 days" },
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
    <main className="bg-[#0f172a] min-h-[calc(100svh-3.5rem)]">
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-1">Bible Reading Plans</h1>
            <p className="text-slate-400 text-sm">Choose a plan and build a daily habit in the Word.</p>
          </div>
          {user && (
            <Link
              href="/plans/create"
              className="shrink-0 bg-[#d4a843] text-[#080d1a] text-xs font-semibold px-3 py-2 rounded-xl hover:bg-[#e0bc60] transition-colors"
            >
              + Create
            </Link>
          )}
        </div>

        {myPrivatePlans.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">My private plans</h2>
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
          <Link href="/dashboard" className="text-sm text-[#d4a843] hover:text-[#e0bc60] font-medium">
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
  const meta = PLAN_META[plan.type] ?? { tag: `${plan.totalDays} days` };

  return (
    <div className="rounded-2xl border-2 border-[#d4a843]/20 bg-[#162033] hover:border-[#d4a843]/40 shadow-sm transition-all">
      <Link href={`/plans/${plan.id}`} className="block p-5 active:scale-[0.99]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h2 className="font-semibold text-slate-100">{plan.title}</h2>
              <span className="text-xs font-medium bg-[#d4a843]/15 border border-[#d4a843]/20 text-[#d4a843] px-2 py-0.5 rounded-full">
                {meta.tag}
              </span>
              {!plan.isPublic && (
                <span className="text-xs font-medium bg-slate-700 border border-slate-600 text-slate-400 px-2 py-0.5 rounded-full">
                  private
                </span>
              )}
            </div>
            {plan.description && (
              <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{plan.description}</p>
            )}
          </div>
          <span className="text-[#d4a843] text-xl mt-0.5">›</span>
        </div>
      </Link>
      {isOwner && plan.type === "topical" && (
        <div className="border-t border-[#d4a843]/10 px-5 py-2">
          <Link href={`/plans/${plan.id}/edit`} className="text-xs text-[#d4a843] hover:text-[#e0bc60] font-medium">
            Edit plan
          </Link>
        </div>
      )}
    </div>
  );
}
