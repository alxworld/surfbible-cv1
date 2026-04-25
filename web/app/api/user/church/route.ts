import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { churches, users } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

// POST /api/user/church — join a church by invite code
export async function POST(req: Request) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.churchId) return NextResponse.json({ error: "Already in a church" }, { status: 409 });

  const { inviteCode } = await req.json();
  if (!inviteCode) return NextResponse.json({ error: "inviteCode required" }, { status: 400 });

  const [church] = await db.select().from(churches).where(eq(churches.inviteCode, inviteCode));
  if (!church) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });

  await db.update(users).set({ churchId: church.id }).where(eq(users.id, user.id));

  return NextResponse.json(church);
}

// DELETE /api/user/church — leave current church
export async function DELETE() {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.update(users).set({ churchId: null }).where(eq(users.id, user.id));
  return new NextResponse(null, { status: 204 });
}
