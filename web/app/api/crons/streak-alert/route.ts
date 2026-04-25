import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, userPlans, notifications } from "@/lib/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { sendEmail, unsubscribeUrl } from "@/lib/email";
import { streakAlertEmail } from "@/lib/emails/templates";

// Runs hourly. At 21:00 local, alerts users with an active streak who haven't read today.
export async function GET(req: Request) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nowUtc = new Date();

  const activeEnrollments = await db
    .select({
      userId: userPlans.userId,
      streakCount: userPlans.streakCount,
      lastReadAt: userPlans.lastReadAt,
      timezone: users.timezone,
      email: users.email,
      displayName: users.displayName,
    })
    .from(userPlans)
    .innerJoin(users, eq(users.id, userPlans.userId))
    .where(and(eq(userPlans.status, "active"), isNotNull(userPlans.lastReadAt)));

  const results: { userId: string; status: string }[] = [];

  for (const row of activeEnrollments) {
    if (row.streakCount === 0) continue;

    const localHour = Number(
      new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: row.timezone })
        .format(nowUtc)
    );
    if (localHour !== 21) continue;

    const localToday = nowUtc.toLocaleDateString("en-CA", { timeZone: row.timezone });
    const lastReadLocal = row.lastReadAt
      ? new Date(row.lastReadAt).toLocaleDateString("en-CA", { timeZone: row.timezone })
      : null;
    if (lastReadLocal === localToday) continue;

    let status = "sent";
    try {
      await sendEmail(
        row.email,
        `Your ${row.streakCount}-day streak is at risk!`,
        streakAlertEmail(row.displayName, row.streakCount, unsubscribeUrl(row.userId)),
      );
    } catch {
      status = "failed";
    }

    await db.insert(notifications).values({
      userId: row.userId,
      type: "streak_alert",
      channel: "email",
      payload: { streakCount: row.streakCount },
      scheduledAt: nowUtc,
      sentAt: status === "sent" ? nowUtc : null,
      status,
    });
    results.push({ userId: row.userId, status });
  }

  return NextResponse.json({ sent: results.filter(r => r.status === "sent").length, failed: results.filter(r => r.status === "failed").length });
}
