import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const BASE = "https://surfbible.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicPlans = await db
    .select({ id: plans.id, updatedAt: plans.updatedAt })
    .from(plans)
    .where(eq(plans.isPublic, true));

  return [
    { url: BASE,             lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/plans`,  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    ...publicPlans.map(p => ({
      url: `${BASE}/plans/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
