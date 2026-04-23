import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { plans, planDays } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [plan] = await db.select().from(plans).where(eq(plans.id, id));
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const days = await db
    .select()
    .from(planDays)
    .where(eq(planDays.planId, id))
    .orderBy(planDays.dayNumber);

  return NextResponse.json({ ...plan, days });
}
