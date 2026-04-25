import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userPlans, plans } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({
      id: userPlans.id,
      planId: userPlans.planId,
      status: userPlans.status,
      currentDay: userPlans.currentDay,
      streakCount: userPlans.streakCount,
      longestStreak: userPlans.longestStreak,
      startedAt: userPlans.startedAt,
      lastReadAt: userPlans.lastReadAt,
      plan: {
        title: plans.title,
        type: plans.type,
        totalDays: plans.totalDays,
      },
    })
    .from(userPlans)
    .innerJoin(plans, eq(userPlans.planId, plans.id))
    .where(eq(userPlans.userId, user.id));

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planId, startDate } = await req.json();
  if (!planId) return NextResponse.json({ error: "planId required" }, { status: 400 });

  // check plan exists
  const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  // prevent duplicate enrollment
  const [existing] = await db
    .select()
    .from(userPlans)
    .where(and(eq(userPlans.userId, user.id), eq(userPlans.planId, planId)));
  if (existing) return NextResponse.json(existing);

  // enforce one active plan at a time
  const [activePlan] = await db
    .select({ id: userPlans.id, title: plans.title })
    .from(userPlans)
    .innerJoin(plans, eq(userPlans.planId, plans.id))
    .where(and(eq(userPlans.userId, user.id), eq(userPlans.status, "active")));
  if (activePlan) {
    return NextResponse.json(
      { error: "active_plan_exists", enrollmentId: activePlan.id, planTitle: activePlan.title },
      { status: 409 }
    );
  }

  const [enrolled] = await db.insert(userPlans).values({
    userId: user.id,
    planId,
    status: "active",
    currentDay: 1,
    ...(startDate ? { startedAt: new Date(startDate) } : {}),
  }).returning();

  return NextResponse.json(enrolled, { status: 201 });
}
