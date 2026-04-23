import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../lib/db";
import { plans, planDays } from "../lib/db/schema";
import { NAVIGATORS_DAYS, NAVIGATORS_PLAN_META } from "../lib/plans/navigators";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding Navigators Bible Reading Plan...");

  const [existing] = await db
    .select({ id: plans.id })
    .from(plans)
    .where(eq(plans.type, "navigators"))
    .limit(1);

  if (existing) {
    console.log("Plan already exists, skipping.");
    return;
  }

  const [plan] = await db
    .insert(plans)
    .values(NAVIGATORS_PLAN_META)
    .returning({ id: plans.id });

  console.log(`Created plan: ${plan.id}`);

  const rows = NAVIGATORS_DAYS.map((d) => ({
    planId: plan.id,
    dayNumber: d.day,
    title: `Day ${d.day}`,
    passages: d.passages,
  }));

  await db.insert(planDays).values(rows);
  console.log(`Inserted ${rows.length} days.`);
}

seed().catch(console.error);
