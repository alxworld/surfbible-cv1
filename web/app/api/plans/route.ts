import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { plans, planDays } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, or, and } from "drizzle-orm";
import { validateDays } from "@/lib/plans/validate";

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
  if (title.length > 200) return NextResponse.json({ error: "title too long (max 200)" }, { status: 400 });
  if (description && description.length > 2000) return NextResponse.json({ error: "description too long (max 2000)" }, { status: 400 });

  const dayErr = validateDays(days);
  if (dayErr) return NextResponse.json({ error: dayErr }, { status: 400 });

  // User-created plans are always private — public plans are seeded by admins only.
  const [plan] = await db.insert(plans).values({
    title,
    description: description ?? null,
    type: "topical",
    totalDays: days.length,
    isPublic: false,
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
