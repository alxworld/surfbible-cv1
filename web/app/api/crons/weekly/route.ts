import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, plans, userPlans, userDayProgress, notifications } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { sendEmail, unsubscribeUrl } from "@/lib/email";
import { weeklySummaryEmail } from "@/lib/emails/templates";

// Runs hourly on Sundays. Sends a weekly summary to users for whom it is 08:00 local.
export async function GET(req: Request) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nowUtc = new Date();
  const isSunday = nowUtc.getUTCDay() === 0;
  if (!isSunday) return NextResponse.json({ skipped: "not Sunday" });

  const activeEnrollments = await db
    .select({
      id: userPlans.id,
      userId: userPlans.userId,
      streakCount: userPlans.streakCount,
      currentDay: userPlans.currentDay,
      timezone: users.timezone,
      email: users.email,
      displayName: users.displayName,
      totalDays: plans.totalDays,
    })
    .from(userPlans)
    .innerJoin(users, eq(users.id, userPlans.userId))
    .innerJoin(plans, eq(plans.id, userPlans.planId))
    .where(eq(userPlans.status, "active"));

  const results: { userId: string; status: string }[] = [];

  for (const row of activeEnrollments) {
    const localHour = Number(
      new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: row.timezone })
        .format(nowUtc)
    );
    if (localHour !== 8) continue;

    const sevenDaysAgo = new Date(nowUtc.getTime() - 7 * 24 * 60 * 60 * 1000);
    const week = await db
      .select({ dayNumber: userDayProgress.dayNumber })
      .from(userDayProgress)
      .where(and(eq(userDayProgress.userPlanId, row.id), gte(userDayProgress.completedAt, sevenDaysAgo)));

    let status = "sent";
    try {
      await sendEmail(
        row.email,
        "Your SurfBible weekly recap",
        weeklySummaryEmail(row.displayName, week.length, row.currentDay, row.totalDays, row.streakCount, unsubscribeUrl(row.userId)),
      );
    } catch {
      status = "failed";
    }

    await db.insert(notifications).values({
      userId: row.userId,
      type: "weekly_summary",
      channel: "email",
      payload: { daysThisWeek: week.length, currentDay: row.currentDay, streakCount: row.streakCount },
      scheduledAt: nowUtc,
      sentAt: status === "sent" ? nowUtc : null,
      status,
    });
    results.push({ userId: row.userId, status });
  }

  return NextResponse.json({ sent: results.filter(r => r.status === "sent").length, failed: results.filter(r => r.status === "failed").length });
}
