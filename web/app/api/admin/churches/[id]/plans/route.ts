import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { churches, users, plans, planDays, userPlans } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: churchId } = await params;
  const [church] = await db.select().from(churches).where(eq(churches.id, churchId));
  if (!church) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (church.createdBy !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, days } = await req.json();
  if (!title || !Array.isArray(days) || days.length === 0) {
    return NextResponse.json({ error: "title and days required" }, { status: 400 });
  }

  const [plan] = await db.insert(plans).values({
    title,
    description: description ?? null,
    type: "church_assigned",
    totalDays: days.length,
    isPublic: false,
    createdBy: user.id,
    churchId,
  }).returning();

  await db.insert(planDays).values(
    days.map((d: { dayNumber: number; title?: string; passages: { book: string; ref: string }[] }) => ({
      planId: plan.id,
      dayNumber: d.dayNumber,
      title: d.title ?? null,
      passages: d.passages,
    }))
  );

  // auto-enroll all church members
  const members = await db.select({ id: users.id }).from(users).where(eq(users.churchId, churchId));
  if (members.length > 0) {
    await db.insert(userPlans)
      .values(members.map(m => ({ userId: m.id, planId: plan.id, status: "active", currentDay: 1 })))
      .onConflictDoNothing();
  }

  return NextResponse.json({ plan, enrolled: members.length }, { status: 201 });
}
