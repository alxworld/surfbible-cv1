import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, userPlans, streakFreezes } from "@/lib/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { hasMissedDay } from "@/lib/streak";

// Runs hourly. At 03:xx local time, auto-applies a streak freeze for users who
// missed yesterday and still have their monthly freeze available.
export async function GET(req: Request) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nowUtc = new Date();

  const activeEnrollments = await db
    .select({
      id: userPlans.id,
      userId: userPlans.userId,
      streakCount: userPlans.streakCount,
      lastReadAt: userPlans.lastReadAt,
      freezeUsedThisMonth: userPlans.freezeUsedThisMonth,
      timezone: users.timezone,
    })
    .from(userPlans)
    .innerJoin(users, eq(users.id, userPlans.userId))
    .where(and(eq(userPlans.status, "active"), isNotNull(userPlans.lastReadAt)));

  const frozen: string[] = [];

  for (const row of activeEnrollments) {
    if (row.streakCount === 0 || row.freezeUsedThisMonth) continue;

    const localHour = Number(
      new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: row.timezone })
        .format(nowUtc)
    );
    if (localHour !== 3) continue;

    if (!hasMissedDay(row.lastReadAt, row.timezone, nowUtc)) continue;

    const freezeDate = nowUtc.toLocaleDateString("en-CA", { timeZone: row.timezone });

    await db
      .insert(streakFreezes)
      .values({ userPlanId: row.id, freezeDate })
      .onConflictDoNothing();

    await db
      .update(userPlans)
      .set({ freezeUsedThisMonth: true })
      .where(eq(userPlans.id, row.id));

    frozen.push(row.id);
  }

  return NextResponse.json({ frozen: frozen.length });
}
