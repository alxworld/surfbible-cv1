import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, userPlans, notifications } from "@/lib/db/schema";
import { eq, and, isNotNull, gte } from "drizzle-orm";
import { sendEmail, unsubscribeUrl } from "@/lib/email";
import { reminderEmail } from "@/lib/emails/templates";
import { isCronAuthorized } from "@/lib/cron-auth";

// Runs hourly. Sends a reminder to users whose reminderTime falls in this UTC hour.
export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nowUtc = new Date();
  const activeUsers = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      timezone: users.timezone,
      reminderTime: users.reminderTime,
    })
    .from(users)
    .innerJoin(userPlans, and(eq(userPlans.userId, users.id), eq(userPlans.status, "active")))
    .where(isNotNull(users.reminderTime));

  const results: { userId: string; status: string }[] = [];

  for (const user of activeUsers) {
    if (!user.reminderTime) continue;

    const localHour = Number(
      new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: user.timezone })
        .format(nowUtc)
    );
    const reminderHour = Number(user.reminderTime.split(":")[0]);
    if (localHour !== reminderHour) continue;

    const todayStart = new Date(nowUtc);
    todayStart.setUTCHours(0, 0, 0, 0);
    const [alreadySent] = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, user.id), eq(notifications.type, "daily_reminder"), eq(notifications.status, "sent"), gte(notifications.scheduledAt, todayStart)));
    if (alreadySent) continue;

    let status = "sent";
    try {
      await sendEmail(
        user.email,
        "Time for your daily Bible reading",
        reminderEmail(user.displayName, unsubscribeUrl(user.id)),
      );
    } catch {
      status = "failed";
    }

    await db.insert(notifications).values({
      userId: user.id,
      type: "daily_reminder",
      channel: "email",
      payload: { message: "Time for your daily Bible reading!" },
      scheduledAt: nowUtc,
      sentAt: status === "sent" ? nowUtc : null,
      status,
    });
    results.push({ userId: user.id, status });
  }

  return NextResponse.json({ sent: results.filter(r => r.status === "sent").length, failed: results.filter(r => r.status === "failed").length });
}
