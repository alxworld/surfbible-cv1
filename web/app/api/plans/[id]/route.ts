import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { plans, planDays, userPlans } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and, ne } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [plan] = await db.select().from(plans).where(eq(plans.id, id));
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const days = await db
    .select()
    .from(planDays)
    .where(eq(planDays.planId, id))
    .orderBy(planDays.dayNumber);

  return NextResponse.json({ ...plan, days });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [plan] = await db.select().from(plans).where(eq(plans.id, id));
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (plan.createdBy !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // reject if other users have enrolled
  const [otherEnrollment] = await db
    .select()
    .from(userPlans)
    .where(and(eq(userPlans.planId, id), ne(userPlans.userId, user.id)));
  if (otherEnrollment) {
    return NextResponse.json({ error: "Cannot edit a plan that others have enrolled in" }, { status: 409 });
  }

  const { title, description, isPublic, days } = await req.json();

  const [updated] = await db
    .update(plans)
    .set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(isPublic !== undefined && { isPublic }),
      ...(days !== undefined && { totalDays: days.length }),
      updatedAt: new Date(),
    })
    .where(eq(plans.id, id))
    .returning();

  if (days !== undefined) {
    await db.delete(planDays).where(eq(planDays.planId, id));
    await db.insert(planDays).values(
      days.map((d: { dayNumber: number; title?: string; passages: { book: string; ref: string }[] }) => ({
        planId: id,
        dayNumber: d.dayNumber,
        title: d.title ?? null,
        passages: d.passages,
      }))
    );
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [plan] = await db.select().from(plans).where(eq(plans.id, id));
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (plan.createdBy !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // cascade: planDays and userPlans both have onDelete: cascade in schema
  await db.delete(plans).where(eq(plans.id, id));

  return new NextResponse(null, { status: 204 });
}
