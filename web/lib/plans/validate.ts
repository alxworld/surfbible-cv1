export type PassageInput = { book: string; ref: string };
export type DayInput = { dayNumber: number; title?: string; passages: PassageInput[] };

export function validateDays(days: unknown[]): string | null {
  for (const d of days as DayInput[]) {
    if (typeof d.dayNumber !== "number") return "Each day must have a numeric dayNumber";
    if (!Array.isArray(d.passages) || d.passages.length === 0) {
      return `Day ${d.dayNumber} must have at least one passage`;
    }
    for (const p of d.passages) {
      if (typeof p.book !== "string" || p.book.trim() === "") {
        return `Day ${d.dayNumber}: passage missing book`;
      }
      if (typeof p.ref !== "string" || p.ref.trim() === "") {
        return `Day ${d.dayNumber}: passage missing ref`;
      }
    }
  }
  return null;
}
