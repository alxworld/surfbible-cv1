import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { churches, users } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function GET() {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!user.churchId) return NextResponse.json(null);

  const [church] = await db.select().from(churches).where(eq(churches.id, user.churchId));
  return NextResponse.json(church ?? null);
}

export async function POST(req: Request) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.churchId) {
    return NextResponse.json({ error: "You already belong to a church" }, { status: 409 });
  }

  const { name, city, country } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const inviteCode = randomBytes(6).toString("hex");

  const [church] = await db.insert(churches).values({
    name,
    city: city ?? null,
    country: country ?? "India",
    inviteCode,
    createdBy: user.id,
  }).returning();

  // link creator to the church
  await db.update(users).set({ churchId: church.id }).where(eq(users.id, user.id));

  return NextResponse.json(church, { status: 201 });
}
