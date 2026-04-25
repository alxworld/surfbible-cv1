import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../lib/db";
import { plans, planDays } from "../lib/db/schema";
import { NT90_PLAN_META, NT90_DAYS } from "../lib/plans/nt-90";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding NT in 90 Days plan...");
  const [existing] = await db.select({ id: plans.id }).from(plans).where(eq(plans.type, "nt_90")).limit(1);
  if (existing) { console.log("Already exists, skipping."); return; }

  const [plan] = await db.insert(plans).values(NT90_PLAN_META).returning({ id: plans.id });
  const rows = NT90_DAYS.map((d) => ({ planId: plan.id, dayNumber: d.day, title: `Day ${d.day}`, passages: d.passages }));
  await db.insert(planDays).values(rows);
  console.log(`Inserted ${rows.length} days.`);
}

seed().catch(console.error);
