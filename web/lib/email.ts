import { Resend } from "resend";
import { createHmac } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM =
  process.env.RESEND_FROM_EMAIL ?? "SurfBible <onboarding@resend.dev>";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://surfbible.in";

export async function sendEmail(to: string, subject: string, html: string) {
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(error.message);
}

export function makeUnsubscribeToken(userId: string): string {
  const payload = `${userId}:${Date.now()}`;
  const sig = createHmac("sha256", process.env.CRON_SECRET!).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const lastDot = decoded.lastIndexOf(".");
    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    const expected = createHmac("sha256", process.env.CRON_SECRET!).update(payload).digest("hex");
    if (sig !== expected) return null;
    const [userId] = payload.split(":");
    return userId;
  } catch {
    return null;
  }
}

export function unsubscribeUrl(userId: string): string {
  return `${APP_URL}/api/unsubscribe?token=${makeUnsubscribeToken(userId)}`;
}
