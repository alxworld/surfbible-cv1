import type { PlanDay } from "./navigators";

export const PSALMS_PROVERBS_PLAN_META = {
  title: "Psalms & Proverbs",
  description:
    "Read all 150 Psalms and the first 30 chapters of Proverbs in 30 days — five Psalms and one chapter of Proverbs each day. A perfect month of wisdom and worship.",
  type: "psalms_proverbs",
  totalDays: 30,
  isPublic: true,
};

export const PSALMS_PROVERBS_DAYS: PlanDay[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const psStart = i * 5 + 1;
  const psEnd = psStart + 4;
  return {
    day,
    passages: [
      { book: "PSA", ref: `${psStart}-${psEnd}` },
      { book: "PRO", ref: String(day) },
    ],
  };
});
