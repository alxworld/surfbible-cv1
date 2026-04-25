import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readingGroups, readingGroupMembers, userPlans } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inviteCode } = await req.json();
  if (!inviteCode) return NextResponse.json({ error: "inviteCode required" }, { status: 400 });

  const [group] = await db.select().from(readingGroups).where(eq(readingGroups.inviteCode, inviteCode));
  if (!group) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });

  // idempotent — already a member
  const [existing] = await db
    .select()
    .from(readingGroupMembers)
    .where(and(eq(readingGroupMembers.groupId, group.id), eq(readingGroupMembers.userId, user.id)));
  if (existing) return NextResponse.json({ group, alreadyMember: true });

  await db.insert(readingGroupMembers).values({ groupId: group.id, userId: user.id });

  // auto-enroll in the group's plan if not already enrolled
  const [enrollment] = await db
    .select()
    .from(userPlans)
    .where(and(eq(userPlans.userId, user.id), eq(userPlans.planId, group.planId)));
  if (!enrollment) {
    await db.insert(userPlans).values({
      userId: user.id,
      planId: group.planId,
      status: "active",
      currentDay: 1,
    });
  }

  return NextResponse.json({ group }, { status: 201 });
}
