import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../lib/db";
import { plans, planDays } from "../lib/db/schema";
import { PSALMS_PROVERBS_PLAN_META, PSALMS_PROVERBS_DAYS } from "../lib/plans/psalms-proverbs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding Psalms & Proverbs plan...");
  const [existing] = await db.select({ id: plans.id }).from(plans).where(eq(plans.type, "psalms_proverbs")).limit(1);
  if (existing) { console.log("Already exists, skipping."); return; }

  const [plan] = await db.insert(plans).values(PSALMS_PROVERBS_PLAN_META).returning({ id: plans.id });
  const rows = PSALMS_PROVERBS_DAYS.map((d) => ({ planId: plan.id, dayNumber: d.day, title: `Day ${d.day}`, passages: d.passages }));
  await db.insert(planDays).values(rows);
  console.log(`Inserted ${rows.length} days.`);
}

seed().catch(console.error);
