import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isCronAuthorized } from "@/lib/cron-auth";

// Runs on the 1st of each month at 00:05 UTC. Resets freezeUsedThisMonth for all active plans.
export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rowCount } = await db
    .update(userPlans)
    .set({ freezeUsedThisMonth: false })
    .where(eq(userPlans.freezeUsedThisMonth, true));

  return NextResponse.json({ reset: rowCount ?? 0 });
}
