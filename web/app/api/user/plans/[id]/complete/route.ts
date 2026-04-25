import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userPlans, userDayProgress } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { calcStreak } from "@/lib/streak";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { notes } = await req.json().catch(() => ({ notes: undefined }));

  const [enrollment] = await db
    .select()
    .from(userPlans)
    .where(and(eq(userPlans.id, id), eq(userPlans.userId, user.id)));

  if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { streakCount, longestStreak } = calcStreak(
    enrollment.streakCount,
    enrollment.longestStreak,
    enrollment.lastReadAt,
    user.timezone
  );

  const now = new Date();

  // upsert progress record
  await db
    .insert(userDayProgress)
    .values({
      userPlanId: enrollment.id,
      dayNumber: enrollment.currentDay,
      notes: notes ?? null,
    })
    .onConflictDoNothing();

  const [updated] = await db
    .update(userPlans)
    .set({
      currentDay: enrollment.currentDay + 1,
      lastReadAt: now,
      streakCount,
      longestStreak,
      ...(enrollment.currentDay + 1 > enrollment.currentDay
        ? {}
        : { status: "completed", completedAt: now }),
    })
    .where(eq(userPlans.id, id))
    .returning();

  return NextResponse.json(updated);
}
