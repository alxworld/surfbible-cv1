import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../lib/db";
import { plans, planDays } from "../lib/db/schema";
import { CHRONOLOGICAL_PLAN_META, CHRONOLOGICAL_DAYS } from "../lib/plans/chronological";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding Chronological Bible plan...");
  const [existing] = await db.select({ id: plans.id }).from(plans).where(eq(plans.type, "chronological")).limit(1);
  if (existing) { console.log("Already exists, skipping."); return; }

  const [plan] = await db.insert(plans).values(CHRONOLOGICAL_PLAN_META).returning({ id: plans.id });

  const rows = CHRONOLOGICAL_DAYS.map((d) => ({ planId: plan.id, dayNumber: d.day, title: `Day ${d.day}`, passages: d.passages }));
  for (let i = 0; i < rows.length; i += 100) {
    await db.insert(planDays).values(rows.slice(i, i + 100));
  }
  console.log(`Inserted ${rows.length} days.`);
}

seed().catch(console.error);
