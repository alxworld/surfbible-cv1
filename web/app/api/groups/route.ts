import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readingGroups, readingGroupMembers, plans } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function GET() {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({
      id: readingGroups.id,
      name: readingGroups.name,
      inviteCode: readingGroups.inviteCode,
      createdBy: readingGroups.createdBy,
      createdAt: readingGroups.createdAt,
      plan: { id: plans.id, title: plans.title, totalDays: plans.totalDays },
    })
    .from(readingGroupMembers)
    .innerJoin(readingGroups, eq(readingGroupMembers.groupId, readingGroups.id))
    .innerJoin(plans, eq(readingGroups.planId, plans.id))
    .where(eq(readingGroupMembers.userId, user.id));

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, planId } = await req.json();
  if (!name || !planId) return NextResponse.json({ error: "name and planId required" }, { status: 400 });
  if (name.length > 200) return NextResponse.json({ error: "name too long (max 200)" }, { status: 400 });

  const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const inviteCode = randomBytes(6).toString("hex");

  const [group] = await db.insert(readingGroups).values({
    name,
    planId,
    createdBy: user.id,
    inviteCode,
  }).returning();

  await db.insert(readingGroupMembers).values({
    groupId: group.id,
    userId: user.id,
    role: "admin",
  });

  return NextResponse.json(group, { status: 201 });
}
