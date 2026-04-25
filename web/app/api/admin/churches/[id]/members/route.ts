import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { churches, users } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [church] = await db.select().from(churches).where(eq(churches.id, id));
  if (!church) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (church.createdBy !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const members = await db
    .select({ id: users.id, email: users.email, displayName: users.displayName, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.churchId, id));

  return NextResponse.json(members);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [church] = await db.select().from(churches).where(eq(churches.id, id));
  if (!church) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (church.createdBy !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const [target] = await db.select().from(users).where(eq(users.email, email));
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.churchId) return NextResponse.json({ error: "User already belongs to a church" }, { status: 409 });

  const [updated] = await db.update(users).set({ churchId: id }).where(eq(users.id, target.id)).returning();

  return NextResponse.json(updated);
}
