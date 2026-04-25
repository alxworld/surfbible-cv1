import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../lib/db";
import { plans, planDays } from "../lib/db/schema";
import { OT_NT_PLAN_META, OT_NT_DAYS } from "../lib/plans/ot-nt";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding OT + NT Parallel plan...");
  const [existing] = await db.select({ id: plans.id }).from(plans).where(eq(plans.type, "ot_nt")).limit(1);
  if (existing) { console.log("Already exists, skipping."); return; }

  const [plan] = await db.insert(plans).values(OT_NT_PLAN_META).returning({ id: plans.id });

  // Insert in batches of 100 to stay within Neon parameter limits
  const rows = OT_NT_DAYS.map((d) => ({ planId: plan.id, dayNumber: d.day, title: `Day ${d.day}`, passages: d.passages }));
  for (let i = 0; i < rows.length; i += 100) {
    await db.insert(planDays).values(rows.slice(i, i + 100));
  }
  console.log(`Inserted ${rows.length} days.`);
}

seed().catch(console.error);
