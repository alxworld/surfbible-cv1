import type { Passage, PlanDay } from "./navigators";

export const CHRONOLOGICAL_PLAN_META = {
  title: "Chronological Bible",
  description:
    "Read through the entire Bible in the order events occurred — from Creation through Revelation — in 365 days. Roughly three to four chapters per day.",
  type: "chronological",
  totalDays: 365,
  isPublic: true,
};

// Books in approximate chronological order.
// Key deviations from canonical order:
//   - Job placed in the patriarchal era (before Exodus)
//   - Psalms grouped after the historical books that occasioned them
//   - Prophets placed alongside the kings they served
//   - Poetry/wisdom books (Proverbs, Ecclesiastes, Song) follow Solomon
type BookSpec = { osis: string; chapters: number };

const CHRONO_BOOKS: BookSpec[] = [
  // Creation & early patriarchs
  { osis: "GEN", chapters: 11 },  // Gen 1-11
  { osis: "JOB", chapters: 42 },  // Job (patriarchal era)
  { osis: "GEN", chapters: 39 },  // Gen 12-50 (Abraham → Joseph) [ref starts at ch 12]
  // Moses & the Law
  { osis: "EXO", chapters: 40 },
  { osis: "LEV", chapters: 27 },
  { osis: "NUM", chapters: 36 },
  { osis: "DEU", chapters: 34 },
  // Conquest & judges
  { osis: "JOS", chapters: 24 },
  { osis: "JDG", chapters: 21 },
  { osis: "RUT", chapters: 4  },
  // United monarchy
  { osis: "1SA", chapters: 31 },
  { osis: "2SA", chapters: 24 },
  { osis: "PSA", chapters: 72 },  // Psalms 1-72 (David era)
  { osis: "PRO", chapters: 31 },  // Proverbs (Solomon)
  { osis: "ECC", chapters: 12 },  // Ecclesiastes (Solomon)
  { osis: "SNG", chapters: 8  },  // Song of Solomon
  { osis: "1KI", chapters: 22 },
  // Divided monarchy (prophets interspersed)
  { osis: "2KI", chapters: 25 },
  { osis: "ISA", chapters: 66 },
  { osis: "HOS", chapters: 14 },
  { osis: "JOL", chapters: 3  },
  { osis: "AMO", chapters: 9  },
  { osis: "OBA", chapters: 1  },
  { osis: "JON", chapters: 4  },
  { osis: "MIC", chapters: 7  },
  { osis: "NAM", chapters: 3  },
  { osis: "HAB", chapters: 3  },
  { osis: "ZEP", chapters: 3  },
  // Parallel history
  { osis: "1CH", chapters: 29 },
  { osis: "2CH", chapters: 36 },
  { osis: "PSA", chapters: 78 },  // Psalms 73-150 (kingdom/exile era)
  // Exile & prophets
  { osis: "JER", chapters: 52 },
  { osis: "LAM", chapters: 5  },
  { osis: "EZK", chapters: 48 },
  { osis: "DAN", chapters: 12 },
  // Post-exile return
  { osis: "HAG", chapters: 2  },
  { osis: "ZEC", chapters: 14 },
  { osis: "EZR", chapters: 10 },
  { osis: "NEH", chapters: 13 },
  { osis: "EST", chapters: 10 },
  { osis: "MAL", chapters: 4  },
  // New Testament — Gospels
  { osis: "MAT", chapters: 28 },
  { osis: "MRK", chapters: 16 },
  { osis: "LUK", chapters: 24 },
  { osis: "JHN", chapters: 21 },
  // Early church
  { osis: "ACT", chapters: 28 },
  // Epistles
  { osis: "JAM", chapters: 5  }, // James (early epistle, ~AD 49)
  { osis: "GAL", chapters: 6  },
  { osis: "1TH", chapters: 5  },
  { osis: "2TH", chapters: 3  },
  { osis: "1CO", chapters: 16 },
  { osis: "2CO", chapters: 13 },
  { osis: "ROM", chapters: 16 },
  { osis: "EPH", chapters: 6  },
  { osis: "PHP", chapters: 4  },
  { osis: "COL", chapters: 4  },
  { osis: "PHM", chapters: 1  },
  { osis: "1TI", chapters: 6  },
  { osis: "2TI", chapters: 4  },
  { osis: "TIT", chapters: 3  },
  { osis: "1PE", chapters: 5  },
  { osis: "2PE", chapters: 3  },
  { osis: "HEB", chapters: 13 },
  { osis: "1JN", chapters: 5  },
  { osis: "2JN", chapters: 1  },
  { osis: "3JN", chapters: 1  },
  { osis: "JUD", chapters: 1  },
  { osis: "REV", chapters: 22 },
];

// Note: "JAM" is used here for James in the chronological ordering.
// The OSIS code in osis.ts is "JAS" — we remap below.
const OSIS_REMAP: Record<string, string> = { JAM: "JAS" };

type ChRef = { book: string; ch: number };

function expandBooks(books: BookSpec[]): ChRef[] {
  let genOffset = 0; // track Genesis split (ch 1-11, then 12-50)
  return books.flatMap((b) => {
    const osis = OSIS_REMAP[b.osis] ?? b.osis;
    if (b.osis === "GEN") {
      const start = genOffset + 1;
      genOffset += b.chapters;
      return Array.from({ length: b.chapters }, (_, i) => ({ book: osis, ch: start + i }));
    }
    if (b.osis === "PSA") {
      // Track Psalm offset for the two PSA splits (72 + 78 = 150)
      const start = psalmOffset + 1;
      psalmOffset += b.chapters;
      return Array.from({ length: b.chapters }, (_, i) => ({ book: osis, ch: start + i }));
    }
    return Array.from({ length: b.chapters }, (_, i) => ({ book: osis, ch: i + 1 }));
  });
}

// psalm offset is module-level because expandBooks is called once
let psalmOffset = 0;

function splitByBook(refs: ChRef[]): { book: string; refs: ChRef[] }[] {
  if (refs.length === 0) return [];
  const groups: { book: string; refs: ChRef[] }[] = [];
  let cur = { book: refs[0].book, refs: [refs[0]] };
  for (let i = 1; i < refs.length; i++) {
    if (refs[i].book === cur.book) {
      cur.refs.push(refs[i]);
    } else {
      groups.push(cur);
      cur = { book: refs[i].book, refs: [refs[i]] };
    }
  }
  groups.push(cur);
  return groups;
}

function toPassage(group: { book: string; refs: ChRef[] }): Passage {
  const chs = group.refs.map((r) => r.ch);
  const ref = chs.length === 1 ? String(chs[0]) : `${chs[0]}-${chs[chs.length - 1]}`;
  return { book: group.book, ref };
}

function buildSizes(total: number, days: number): number[] {
  const base = Math.floor(total / days);
  const extra = total - base * days;
  return Array.from({ length: days }, (_, i) => (i < extra ? base + 1 : base));
}

export const CHRONOLOGICAL_DAYS: PlanDay[] = (() => {
  const DAYS = 365;
  const allRefs = expandBooks(CHRONO_BOOKS);
  const sizes = buildSizes(allRefs.length, DAYS);

  const days: PlanDay[] = [];
  let idx = 0;
  for (let d = 0; d < DAYS; d++) {
    const chunk = allRefs.slice(idx, idx + sizes[d]);
    idx += sizes[d];
    const groups = splitByBook(chunk);
    days.push({ day: d + 1, passages: groups.map(toPassage) });
  }
  return days;
})();
