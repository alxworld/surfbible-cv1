import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userPlans, userDayProgress } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; day: string }> }
) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, day } = await params;
  const dayNumber = parseInt(day, 10);
  if (isNaN(dayNumber)) return NextResponse.json({ error: "Invalid day" }, { status: 400 });

  const [enrollment] = await db
    .select()
    .from(userPlans)
    .where(and(eq(userPlans.id, id), eq(userPlans.userId, user.id)));
  if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { notes, reflection } = await req.json();

  if (notes !== undefined && notes !== null && notes.length > 10000) {
    return NextResponse.json({ error: "notes too long (max 10000)" }, { status: 400 });
  }
  if (reflection !== undefined && reflection !== null && reflection.length > 10000) {
    return NextResponse.json({ error: "reflection too long (max 10000)" }, { status: 400 });
  }

  // ensure a progress row exists first
  await db
    .insert(userDayProgress)
    .values({ userPlanId: id, dayNumber, status: "in_progress" })
    .onConflictDoNothing();

  const [updated] = await db
    .update(userDayProgress)
    .set({
      ...(notes !== undefined && { notes }),
      ...(reflection !== undefined && { reflection }),
    })
    .where(and(eq(userDayProgress.userPlanId, id), eq(userDayProgress.dayNumber, dayNumber)))
    .returning();

  return NextResponse.json(updated);
}
