import { db } from "@/lib/db";
import { plans, planDays } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import PlanBuilder from "../../PlanBuilder";

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;

  const [plan] = await db.select().from(plans).where(eq(plans.id, id));
  if (!plan) notFound();
  if (plan.createdBy !== user.id) redirect(`/plans/${id}`);

  const days = await db
    .select()
    .from(planDays)
    .where(eq(planDays.planId, id))
    .orderBy(asc(planDays.dayNumber));

  const initial = {
    title: plan.title,
    description: plan.description ?? "",
    isPublic: plan.isPublic,
    days: days.map(d => ({ passages: d.passages as { book: string; ref: string }[] })),
  };

  return (
    <main className="bg-green-50 min-h-[calc(100svh-3.5rem)]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link href={`/plans/${id}`} className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 mb-6 font-medium">
          ← Back to plan
        </Link>
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Edit plan</h1>
        <PlanBuilder initial={initial} planId={id} />
      </div>
    </main>
  );
}
