import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userPlans, userDayProgress, plans } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json(); // "skip" | "restart"

  const [enrollment] = await db
    .select({
      id: userPlans.id,
      currentDay: userPlans.currentDay,
      status: userPlans.status,
      totalDays: plans.totalDays,
    })
    .from(userPlans)
    .innerJoin(plans, eq(userPlans.planId, plans.id))
    .where(and(eq(userPlans.id, id), eq(userPlans.userId, user.id)));

  if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (enrollment.status !== "active")
    return NextResponse.json({ error: "Plan is not active" }, { status: 400 });

  if (action === "skip") {
    await db
      .insert(userDayProgress)
      .values({ userPlanId: id, dayNumber: enrollment.currentDay, status: "skipped" })
      .onConflictDoNothing();

    const nextDay = enrollment.currentDay + 1;
    const isFinished = nextDay > enrollment.totalDays;
    const [updated] = await db
      .update(userPlans)
      .set({
        currentDay: nextDay,
        streakCount: 0,
        ...(isFinished ? { status: "completed", completedAt: new Date() } : {}),
      })
      .where(eq(userPlans.id, id))
      .returning();
    return NextResponse.json(updated);
  }

  if (action === "restart") {
    const [updated] = await db
      .update(userPlans)
      .set({ currentDay: 1, streakCount: 0, lastReadAt: null })
      .where(eq(userPlans.id, id))
      .returning();
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
