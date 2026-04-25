import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Runs on the 1st of each month at 00:05 UTC. Resets freezeUsedThisMonth for all active plans.
export async function GET(req: Request) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rowCount } = await db
    .update(userPlans)
    .set({ freezeUsedThisMonth: false })
    .where(eq(userPlans.freezeUsedThisMonth, true));

  return NextResponse.json({ reset: rowCount ?? 0 });
}
