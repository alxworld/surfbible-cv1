import { timingSafeEqual } from "crypto";

export function isCronAuthorized(req: Request): boolean {
  const header = req.headers.get("Authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (header.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}
