import { db } from "@/lib/db";
import { userPlans, plans, planDays, userDayProgress } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { bookName } from "@/lib/osis";
import { fetchPassageText } from "@/lib/bible";
import Link from "next/link";
import { redirect } from "next/navigation";
import NotesEditor from "./NotesEditor";

export default async function ReadPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const [enrollment] = await db
    .select({
      id: userPlans.id,
      planId: userPlans.planId,
      currentDay: userPlans.currentDay,
      plan: { title: plans.title },
    })
    .from(userPlans)
    .innerJoin(plans, eq(userPlans.planId, plans.id))
    .where(and(eq(userPlans.id, planId), eq(userPlans.userId, user.id)));

  if (!enrollment) redirect("/dashboard");

  const [today] = await db
    .select()
    .from(planDays)
    .where(and(
      eq(planDays.planId, enrollment.planId),
      eq(planDays.dayNumber, enrollment.currentDay)
    ));

  const passages = today ? (today.passages as { book: string; ref: string }[]) : [];

  const texts = await Promise.all(
    passages.map(async (p) => ({
      label: `${bookName(p.book)} ${p.ref}`,
      text: await fetchPassageText(p.book, p.ref),
    }))
  );

  // load existing notes for today if any
  const [progress] = await db
    .select({ notes: userDayProgress.notes, reflection: userDayProgress.reflection })
    .from(userDayProgress)
    .where(and(
      eq(userDayProgress.userPlanId, enrollment.id),
      eq(userDayProgress.dayNumber, enrollment.currentDay)
    ));

  return (
    <main className="bg-green-50 min-h-[calc(100svh-3.5rem)]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-3">
            ← Back to dashboard
          </Link>
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm px-5 py-4">
            <h1 className="text-lg font-bold text-stone-900">{enrollment.plan.title}</h1>
            <p className="text-stone-400 text-sm mt-0.5">Day {enrollment.currentDay}</p>
          </div>
        </div>

        {/* Passages */}
        <div className="space-y-5">
          {texts.map(({ label, text }, i) => (
            <section key={i} className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
              <h2 className="font-display font-bold text-lg text-stone-900 mb-4 pb-3 border-b border-emerald-50">
                {label}
              </h2>
              {text ? (
                <p className="text-[15px] leading-loose whitespace-pre-wrap text-stone-700 font-serif">
                  {text}
                </p>
              ) : (
                <p className="text-sm text-stone-400 italic">Text not available.</p>
              )}
            </section>
          ))}
        </div>

        {/* Notes editor */}
        <NotesEditor
          enrollmentId={enrollment.id}
          dayNumber={enrollment.currentDay}
          initialNotes={progress?.notes ?? ""}
          initialReflection={progress?.reflection ?? ""}
        />

        {/* Back button */}
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="block w-full text-center bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 text-sm font-semibold transition-colors shadow-sm"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
