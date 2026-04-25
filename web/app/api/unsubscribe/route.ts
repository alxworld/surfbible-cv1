import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyUnsubscribeToken } from "@/lib/email";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const userId = verifyUnsubscribeToken(token);

  if (!userId) {
    return new NextResponse("Invalid or expired unsubscribe link.", { status: 400 });
  }

  await db.update(users).set({ reminderTime: null }).where(eq(users.id, userId));

  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unsubscribed</title></head>
<body style="font-family:Georgia,serif;text-align:center;padding:80px 24px;color:#333;">
  <h2 style="color:#2d6a4f;">You've been unsubscribed.</h2>
  <p>You won't receive daily reminders from SurfBible anymore.</p>
  <p>You can re-enable reminders anytime in <a href="https://surfbible.in/settings" style="color:#2d6a4f;">Settings</a>.</p>
</body></html>`,
    { headers: { "Content-Type": "text/html" } },
  );
}
