import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { displayName, timezone, reminderTime } = body;

  const validTimezones = Intl.supportedValuesOf("timeZone");
  if (timezone && !validTimezones.includes(timezone)) {
    return NextResponse.json({ error: "Invalid timezone" }, { status: 400 });
  }

  // reminderTime must be HH:MM or null
  if (reminderTime !== undefined && reminderTime !== null) {
    if (!/^\d{2}:\d{2}$/.test(reminderTime)) {
      return NextResponse.json({ error: "Invalid reminderTime" }, { status: 400 });
    }
  }

  const update: Record<string, string | null> = {};
  if (displayName !== undefined) update.displayName = displayName || null;
  if (timezone !== undefined) update.timezone = timezone;
  if (reminderTime !== undefined) update.reminderTime = reminderTime ?? null;

  const [updated] = await db
    .update(users)
    .set(update)
    .where(eq(users.id, user.id))
    .returning();

  return NextResponse.json({ user: updated });
}
