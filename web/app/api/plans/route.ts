import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");

  const query = db.select().from(plans);
  const rows = await (type ? query.where(eq(plans.type, type)) : query);

  return NextResponse.json(rows);
}
