import type { Passage, PlanDay } from "./navigators";

export const OT_NT_PLAN_META = {
  title: "OT + NT Parallel",
  description:
    "Read through the entire Old Testament and New Testament simultaneously in one year — an Old Testament passage and a New Testament chapter every day.",
  type: "ot_nt",
  totalDays: 365,
  isPublic: true,
};

type BookSpec = { osis: string; chapters: number };

const OT_BOOKS: BookSpec[] = [
  { osis: "GEN", chapters: 50 }, { osis: "EXO", chapters: 40 }, { osis: "LEV", chapters: 27 },
  { osis: "NUM", chapters: 36 }, { osis: "DEU", chapters: 34 }, { osis: "JOS", chapters: 24 },
  { osis: "JDG", chapters: 21 }, { osis: "RUT", chapters: 4  }, { osis: "1SA", chapters: 31 },
  { osis: "2SA", chapters: 24 }, { osis: "1KI", chapters: 22 }, { osis: "2KI", chapters: 25 },
  { osis: "1CH", chapters: 29 }, { osis: "2CH", chapters: 36 }, { osis: "EZR", chapters: 10 },
  { osis: "NEH", chapters: 13 }, { osis: "EST", chapters: 10 }, { osis: "JOB", chapters: 42 },
  { osis: "PSA", chapters: 150}, { osis: "PRO", chapters: 31 }, { osis: "ECC", chapters: 12 },
  { osis: "SNG", chapters: 8  }, { osis: "ISA", chapters: 66 }, { osis: "JER", chapters: 52 },
  { osis: "LAM", chapters: 5  }, { osis: "EZK", chapters: 48 }, { osis: "DAN", chapters: 12 },
  { osis: "HOS", chapters: 14 }, { osis: "JOL", chapters: 3  }, { osis: "AMO", chapters: 9  },
  { osis: "OBA", chapters: 1  }, { osis: "JON", chapters: 4  }, { osis: "MIC", chapters: 7  },
  { osis: "NAM", chapters: 3  }, { osis: "HAB", chapters: 3  }, { osis: "ZEP", chapters: 3  },
  { osis: "HAG", chapters: 2  }, { osis: "ZEC", chapters: 14 }, { osis: "MAL", chapters: 4  },
];

const NT_BOOKS: BookSpec[] = [
  { osis: "MAT", chapters: 28 }, { osis: "MRK", chapters: 16 }, { osis: "LUK", chapters: 24 },
  { osis: "JHN", chapters: 21 }, { osis: "ACT", chapters: 28 }, { osis: "ROM", chapters: 16 },
  { osis: "1CO", chapters: 16 }, { osis: "2CO", chapters: 13 }, { osis: "GAL", chapters: 6  },
  { osis: "EPH", chapters: 6  }, { osis: "PHP", chapters: 4  }, { osis: "COL", chapters: 4  },
  { osis: "1TH", chapters: 5  }, { osis: "2TH", chapters: 3  }, { osis: "1TI", chapters: 6  },
  { osis: "2TI", chapters: 4  }, { osis: "TIT", chapters: 3  }, { osis: "PHM", chapters: 1  },
  { osis: "HEB", chapters: 13 }, { osis: "JAS", chapters: 5  }, { osis: "1PE", chapters: 5  },
  { osis: "2PE", chapters: 3  }, { osis: "1JN", chapters: 5  }, { osis: "2JN", chapters: 1  },
  { osis: "3JN", chapters: 1  }, { osis: "JUD", chapters: 1  }, { osis: "REV", chapters: 22 },
];

type ChRef = { book: string; ch: number };

function expandBooks(books: BookSpec[]): ChRef[] {
  return books.flatMap((b) =>
    Array.from({ length: b.chapters }, (_, i) => ({ book: b.osis, ch: i + 1 }))
  );
}

function groupToPassages(chunks: ChRef[][]): Passage[] {
  return chunks.map((group) => {
    const first = group[0].ch;
    const last = group[group.length - 1].ch;
    return { book: group[0].book, ref: first === last ? String(first) : `${first}-${last}` };
  });
}

function splitByBook(refs: ChRef[]): ChRef[][] {
  if (refs.length === 0) return [];
  const result: ChRef[][] = [];
  let cur: ChRef[] = [refs[0]];
  for (let i = 1; i < refs.length; i++) {
    if (refs[i].book === cur[0].book) {
      cur.push(refs[i]);
    } else {
      result.push(cur);
      cur = [refs[i]];
    }
  }
  result.push(cur);
  return result;
}

function buildSizes(total: number, days: number): number[] {
  // Distribute 'total' chapters across 'days' days as evenly as possible.
  const base = Math.floor(total / days);
  const extra = total - base * days;
  return Array.from({ length: days }, (_, i) => (i < extra ? base + 1 : base));
}

function chunkBySize(refs: ChRef[], sizes: number[]): ChRef[][] {
  const chunks: ChRef[][] = [];
  let idx = 0;
  for (const size of sizes) {
    if (size > 0) chunks.push(refs.slice(idx, idx + size));
    idx += size;
  }
  return chunks;
}

export const OT_NT_DAYS: PlanDay[] = (() => {
  const DAYS = 365;
  const otRefs = expandBooks(OT_BOOKS); // 929
  const ntRefs = expandBooks(NT_BOOKS); // 260

  // OT: 929 chapters across 365 days (mix of 2 and 3)
  const otSizes = buildSizes(otRefs.length, DAYS);
  // NT: 260 chapters across 365 days (260 days get 1, 105 days get 0)
  const ntSizes = buildSizes(ntRefs.length, DAYS);

  const otChunks = chunkBySize(otRefs, otSizes);
  const ntChunks = chunkBySize(ntRefs, ntSizes);

  const days: PlanDay[] = [];
  let otIdx = 0;
  let ntIdx = 0;

  for (let d = 0; d < DAYS; d++) {
    const passages: Passage[] = [];

    // OT passage(s) for this day
    if (otSizes[d] > 0) {
      const otGroup = otChunks[otIdx++];
      const byBook = splitByBook(otGroup);
      passages.push(...groupToPassages(byBook));
    }

    // NT passage for this day (if allocated)
    if (ntSizes[d] > 0) {
      const ntGroup = ntChunks[ntIdx++];
      const byBook = splitByBook(ntGroup);
      passages.push(...groupToPassages(byBook));
    }

    days.push({ day: d + 1, passages });
  }

  return days;
})();
