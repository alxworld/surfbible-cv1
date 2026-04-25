import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userPlans, streakFreezes } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [enrollment] = await db
    .select()
    .from(userPlans)
    .where(and(eq(userPlans.id, id), eq(userPlans.userId, user.id)));

  if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (enrollment.status !== "active")
    return NextResponse.json({ error: "Plan is not active" }, { status: 400 });
  if (enrollment.streakCount === 0)
    return NextResponse.json({ error: "No streak to protect" }, { status: 400 });
  if (enrollment.freezeUsedThisMonth)
    return NextResponse.json({ error: "Freeze already used this month" }, { status: 400 });

  const freezeDate = new Date().toLocaleDateString("en-CA", { timeZone: user.timezone });

  await db
    .insert(streakFreezes)
    .values({ userPlanId: id, freezeDate })
    .onConflictDoNothing();

  await db
    .update(userPlans)
    .set({ freezeUsedThisMonth: true })
    .where(eq(userPlans.id, id));

  return NextResponse.json({ freezeDate, streakCount: enrollment.streakCount });
}
