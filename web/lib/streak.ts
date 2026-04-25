/** True if the user's last effective read day is before yesterday (missed at least one day). */
export function hasMissedDay(lastReadAt: Date | null, timezone: string, now = new Date()): boolean {
  if (!lastReadAt) return false;
  const today = localDay(now, timezone);
  const yesterday = dayOffset(today, -1);
  return localDay(lastReadAt, timezone) < yesterday;
}

/** Returns updated streak_count given the last read timestamp and user's timezone. */
export function calcStreak(
  currentStreak: number,
  longestStreak: number,
  lastReadAt: Date | null,
  timezone: string,
  now = new Date()
): { streakCount: number; longestStreak: number } {
  const effectiveDay = localDay(now, timezone);

  if (lastReadAt) {
    const effectiveLastRead = readDay(lastReadAt, timezone);
    if (effectiveLastRead === effectiveDay) {
      // already completed today — no change
      return { streakCount: currentStreak, longestStreak };
    }
    const yesterday = dayOffset(effectiveDay, -1);
    if (effectiveLastRead === yesterday) {
      const next = currentStreak + 1;
      return { streakCount: next, longestStreak: Math.max(longestStreak, next) };
    }
  }

  // broken or first read
  return { streakCount: 1, longestStreak: Math.max(longestStreak, 1) };
}

/** ISO date string (YYYY-MM-DD) for `d` in `timezone`, with 03:00 grace window. */
function localDay(d: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", hour12: false,
  }).formatToParts(d);

  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "12");
  const date = parts
    .filter((p) => ["year", "month", "day"].includes(p.type))
    .map((p) => p.value)
    .join("-");

  // before 03:00 counts as previous day
  return h < 3 ? dayOffset(date, -1) : date;
}

function readDay(d: Date, timezone: string): string {
  return localDay(d, timezone);
}

function dayOffset(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
