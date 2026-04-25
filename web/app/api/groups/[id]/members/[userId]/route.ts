import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readingGroups, readingGroupMembers } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId, userId: targetUserId } = await params;

  const [group] = await db.select().from(readingGroups).where(eq(readingGroups.id, groupId));
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // only admin can remove others; anyone can remove themselves
  const isSelf = user.id === targetUserId;
  const isAdmin = group.createdBy === user.id;
  if (!isSelf && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db
    .delete(readingGroupMembers)
    .where(and(eq(readingGroupMembers.groupId, groupId), eq(readingGroupMembers.userId, targetUserId)));

  return new NextResponse(null, { status: 204 });
}
