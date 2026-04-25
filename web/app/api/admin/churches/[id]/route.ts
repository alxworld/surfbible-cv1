import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { churches } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

async function requireAdmin(churchId: string) {
  const user = await getDbUser();
  if (!user) return { error: "Unauthorized", status: 401, user: null };
  const [church] = await db.select().from(churches).where(eq(churches.id, churchId));
  if (!church) return { error: "Not found", status: 404, user: null };
  if (church.createdBy !== user.id) return { error: "Forbidden", status: 403, user: null };
  return { error: null, status: 200, user, church };
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, church } = await requireAdmin(id);
  if (error) return NextResponse.json({ error }, { status });

  const { name, city, country } = await req.json();

  const [updated] = await db
    .update(churches)
    .set({
      ...(name !== undefined && { name }),
      ...(city !== undefined && { city }),
      ...(country !== undefined && { country }),
    })
    .where(eq(churches.id, id))
    .returning();

  return NextResponse.json(updated);
}
