import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readingGroups, readingGroupMembers, users, userPlans } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [group] = await db.select().from(readingGroups).where(eq(readingGroups.id, id));
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // must be a member
  const [membership] = await db
    .select()
    .from(readingGroupMembers)
    .where(and(eq(readingGroupMembers.groupId, id), eq(readingGroupMembers.userId, user.id)));
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const members = await db
    .select({
      userId: users.id,
      displayName: users.displayName,
      email: users.email,
      role: readingGroupMembers.role,
      joinedAt: readingGroupMembers.joinedAt,
      currentDay: userPlans.currentDay,
      streakCount: userPlans.streakCount,
      lastReadAt: userPlans.lastReadAt,
      planStatus: userPlans.status,
    })
    .from(readingGroupMembers)
    .innerJoin(users, eq(readingGroupMembers.userId, users.id))
    .leftJoin(
      userPlans,
      and(eq(userPlans.userId, users.id), eq(userPlans.planId, group.planId))
    )
    .where(eq(readingGroupMembers.groupId, id));

  return NextResponse.json({ group, members });
}
