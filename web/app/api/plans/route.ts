import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { plans, planDays } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, or, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const user = await getDbUser();

  // public plans always visible; authenticated user also sees their own private plans
  const where = user
    ? or(eq(plans.isPublic, true), eq(plans.createdBy, user.id))
    : eq(plans.isPublic, true);

  const query = db.select().from(plans).where(type ? and(where, eq(plans.type, type)) : where);
  const rows = await query;

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, isPublic, days } = await req.json();
  if (!title || !Array.isArray(days) || days.length === 0) {
    return NextResponse.json({ error: "title and at least one day required" }, { status: 400 });
  }

  for (const d of days) {
    if (!Array.isArray(d.passages) || d.passages.length === 0) {
      return NextResponse.json({ error: `Day ${d.dayNumber} must have at least one passage` }, { status: 400 });
    }
  }

  const [plan] = await db.insert(plans).values({
    title,
    description: description ?? null,
    type: "topical",
    totalDays: days.length,
    isPublic: isPublic ?? false,
    createdBy: user.id,
  }).returning();

  await db.insert(planDays).values(
    days.map((d: { dayNumber: number; title?: string; passages: { book: string; ref: string }[] }) => ({
      planId: plan.id,
      dayNumber: d.dayNumber,
      title: d.title ?? null,
      passages: d.passages,
    }))
  );

  return NextResponse.json(plan, { status: 201 });
}
