import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userPlans, plans } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and, ne } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json();

  const [enrollment] = await db
    .select()
    .from(userPlans)
    .where(and(eq(userPlans.id, id), eq(userPlans.userId, user.id)));

  if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();

  if (action === "pause") {
    if (enrollment.status !== "active")
      return NextResponse.json({ error: "Plan is not active" }, { status: 400 });
    const [updated] = await db
      .update(userPlans)
      .set({ status: "paused", pausedAt: now })
      .where(eq(userPlans.id, id))
      .returning();
    return NextResponse.json(updated);
  }

  if (action === "resume") {
    if (enrollment.status !== "paused")
      return NextResponse.json({ error: "Plan is not paused" }, { status: 400 });

    const [activePlan] = await db
      .select({ id: userPlans.id, title: plans.title })
      .from(userPlans)
      .innerJoin(plans, eq(userPlans.planId, plans.id))
      .where(and(eq(userPlans.userId, user.id), eq(userPlans.status, "active"), ne(userPlans.id, id)));
    if (activePlan) {
      return NextResponse.json(
        { error: "active_plan_exists", enrollmentId: activePlan.id, planTitle: activePlan.title },
        { status: 409 }
      );
    }

    const [updated] = await db
      .update(userPlans)
      .set({ status: "active", pausedAt: null })
      .where(eq(userPlans.id, id))
      .returning();
    return NextResponse.json(updated);
  }

  if (action === "abandon") {
    const [updated] = await db
      .update(userPlans)
      .set({ status: "abandoned" })
      .where(eq(userPlans.id, id))
      .returning();
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
