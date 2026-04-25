import { db } from "@/lib/db";
import { userPlans, userDayProgress } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import MonthGrid from "./MonthGrid";

export default async function CalendarPage() {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const [enrollment] = await db
    .select()
    .from(userPlans)
    .where(and(eq(userPlans.userId, user.id), eq(userPlans.status, "active")))
    .limit(1);

  if (!enrollment) redirect("/plans");

  const progress = await db
    .select({ completedAt: userDayProgress.completedAt })
    .from(userDayProgress)
    .where(eq(userDayProgress.userPlanId, enrollment.id));

  const completedDates = progress.map((r) =>
    new Date(r.completedAt).toLocaleDateString("en-CA", {
      timeZone: user.timezone,
    })
  );

  return (
    <main className="bg-green-50 min-h-[calc(100svh-3.5rem)]">
      <div className="max-w-md mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Reading Calendar</h1>
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
          <MonthGrid completedDates={completedDates} />
        </div>
      </div>
    </main>
  );
}
