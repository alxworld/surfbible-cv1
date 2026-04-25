import type { PlanDay } from "./navigators";

export const NT90_PLAN_META = {
  title: "NT in 90 Days",
  description:
    "Read the entire New Testament in 90 days — roughly three chapters a day. Ideal for new believers or anyone wanting a focused immersion in the Gospels and Epistles.",
  type: "nt_90",
  totalDays: 90,
  isPublic: true,
};

// 260 NT chapters divided into 90 daily readings.
// Single-passage days where possible; multi-passage only at book transitions.
// prettier-ignore
export const NT90_DAYS: PlanDay[] = [
  // Matthew (28 ch) — days 1-10
  { day:  1, passages: [{ book: "MAT", ref: "1-3"   }] },
  { day:  2, passages: [{ book: "MAT", ref: "4-6"   }] },
  { day:  3, passages: [{ book: "MAT", ref: "7-9"   }] },
  { day:  4, passages: [{ book: "MAT", ref: "10-12" }] },
  { day:  5, passages: [{ book: "MAT", ref: "13-15" }] },
  { day:  6, passages: [{ book: "MAT", ref: "16-18" }] },
  { day:  7, passages: [{ book: "MAT", ref: "19-21" }] },
  { day:  8, passages: [{ book: "MAT", ref: "22-24" }] },
  { day:  9, passages: [{ book: "MAT", ref: "25-26" }] },
  { day: 10, passages: [{ book: "MAT", ref: "27-28" }] },
  // Mark (16 ch) — days 11-16
  { day: 11, passages: [{ book: "MRK", ref: "1-3"  }] },
  { day: 12, passages: [{ book: "MRK", ref: "4-6"  }] },
  { day: 13, passages: [{ book: "MRK", ref: "7-9"  }] },
  { day: 14, passages: [{ book: "MRK", ref: "10-12"}] },
  { day: 15, passages: [{ book: "MRK", ref: "13-14"}] },
  { day: 16, passages: [{ book: "MRK", ref: "15-16"}] },
  // Luke (24 ch) — days 17-24
  { day: 17, passages: [{ book: "LUK", ref: "1-3"  }] },
  { day: 18, passages: [{ book: "LUK", ref: "4-6"  }] },
  { day: 19, passages: [{ book: "LUK", ref: "7-9"  }] },
  { day: 20, passages: [{ book: "LUK", ref: "10-12"}] },
  { day: 21, passages: [{ book: "LUK", ref: "13-15"}] },
  { day: 22, passages: [{ book: "LUK", ref: "16-18"}] },
  { day: 23, passages: [{ book: "LUK", ref: "19-21"}] },
  { day: 24, passages: [{ book: "LUK", ref: "22-24"}] },
  // John (21 ch) — days 25-31
  { day: 25, passages: [{ book: "JHN", ref: "1-3"  }] },
  { day: 26, passages: [{ book: "JHN", ref: "4-6"  }] },
  { day: 27, passages: [{ book: "JHN", ref: "7-9"  }] },
  { day: 28, passages: [{ book: "JHN", ref: "10-12"}] },
  { day: 29, passages: [{ book: "JHN", ref: "13-15"}] },
  { day: 30, passages: [{ book: "JHN", ref: "16-18"}] },
  { day: 31, passages: [{ book: "JHN", ref: "19-21"}] },
  // Acts (28 ch) — days 32-41
  { day: 32, passages: [{ book: "ACT", ref: "1-3"  }] },
  { day: 33, passages: [{ book: "ACT", ref: "4-6"  }] },
  { day: 34, passages: [{ book: "ACT", ref: "7-9"  }] },
  { day: 35, passages: [{ book: "ACT", ref: "10-12"}] },
  { day: 36, passages: [{ book: "ACT", ref: "13-15"}] },
  { day: 37, passages: [{ book: "ACT", ref: "16-18"}] },
  { day: 38, passages: [{ book: "ACT", ref: "19-21"}] },
  { day: 39, passages: [{ book: "ACT", ref: "22-24"}] },
  { day: 40, passages: [{ book: "ACT", ref: "25-26"}] },
  { day: 41, passages: [{ book: "ACT", ref: "27-28"}] },
  // Romans (16 ch) — days 42-47
  { day: 42, passages: [{ book: "ROM", ref: "1-3"  }] },
  { day: 43, passages: [{ book: "ROM", ref: "4-6"  }] },
  { day: 44, passages: [{ book: "ROM", ref: "7-9"  }] },
  { day: 45, passages: [{ book: "ROM", ref: "10-12"}] },
  { day: 46, passages: [{ book: "ROM", ref: "13-14"}] },
  { day: 47, passages: [{ book: "ROM", ref: "15-16"}] },
  // 1 Corinthians (16 ch) — days 48-53
  { day: 48, passages: [{ book: "1CO", ref: "1-3"  }] },
  { day: 49, passages: [{ book: "1CO", ref: "4-6"  }] },
  { day: 50, passages: [{ book: "1CO", ref: "7-9"  }] },
  { day: 51, passages: [{ book: "1CO", ref: "10-12"}] },
  { day: 52, passages: [{ book: "1CO", ref: "13-14"}] },
  { day: 53, passages: [{ book: "1CO", ref: "15-16"}] },
  // 2 Corinthians (13 ch) — days 54-58
  { day: 54, passages: [{ book: "2CO", ref: "1-3"  }] },
  { day: 55, passages: [{ book: "2CO", ref: "4-6"  }] },
  { day: 56, passages: [{ book: "2CO", ref: "7-9"  }] },
  { day: 57, passages: [{ book: "2CO", ref: "10-11"}] },
  { day: 58, passages: [{ book: "2CO", ref: "12-13"}] },
  // Galatians (6 ch) — days 59-60
  { day: 59, passages: [{ book: "GAL", ref: "1-3"  }] },
  { day: 60, passages: [{ book: "GAL", ref: "4-6"  }] },
  // Ephesians (6 ch) — days 61-62
  { day: 61, passages: [{ book: "EPH", ref: "1-3"  }] },
  { day: 62, passages: [{ book: "EPH", ref: "4-6"  }] },
  // Philippians (4 ch) — days 63-64
  { day: 63, passages: [{ book: "PHP", ref: "1-2"  }] },
  { day: 64, passages: [{ book: "PHP", ref: "3-4"  }] },
  // Colossians (4 ch) — days 65-66
  { day: 65, passages: [{ book: "COL", ref: "1-2"  }] },
  { day: 66, passages: [{ book: "COL", ref: "3-4"  }] },
  // 1 Thessalonians (5 ch) — days 67-68
  { day: 67, passages: [{ book: "1TH", ref: "1-3"  }] },
  { day: 68, passages: [{ book: "1TH", ref: "4-5"  }] },
  // 2 Thessalonians (3 ch) — day 69
  { day: 69, passages: [{ book: "2TH", ref: "1-3"  }] },
  // 1 Timothy (6 ch) — days 70-71
  { day: 70, passages: [{ book: "1TI", ref: "1-3"  }] },
  { day: 71, passages: [{ book: "1TI", ref: "4-6"  }] },
  // 2 Timothy (4 ch) — days 72-73
  { day: 72, passages: [{ book: "2TI", ref: "1-2"  }] },
  { day: 73, passages: [{ book: "2TI", ref: "3-4"  }] },
  // Titus (3 ch) — day 74
  { day: 74, passages: [{ book: "TIT", ref: "1-3"  }] },
  // Philemon + Hebrews — days 75-79
  { day: 75, passages: [{ book: "PHM", ref: "1" }, { book: "HEB", ref: "1-2" }] },
  { day: 76, passages: [{ book: "HEB", ref: "3-5"  }] },
  { day: 77, passages: [{ book: "HEB", ref: "6-8"  }] },
  { day: 78, passages: [{ book: "HEB", ref: "9-11" }] },
  { day: 79, passages: [{ book: "HEB", ref: "12-13"}] },
  // James (5 ch) — days 80-81
  { day: 80, passages: [{ book: "JAS", ref: "1-3"  }] },
  { day: 81, passages: [{ book: "JAS", ref: "4-5"  }] },
  // 1 Peter (5 ch) — days 82-83
  { day: 82, passages: [{ book: "1PE", ref: "1-3"  }] },
  { day: 83, passages: [{ book: "1PE", ref: "4-5"  }] },
  // 2 Peter (3 ch) — day 84
  { day: 84, passages: [{ book: "2PE", ref: "1-3"  }] },
  // 1 John (5 ch) — days 85-86
  { day: 85, passages: [{ book: "1JN", ref: "1-3"  }] },
  { day: 86, passages: [{ book: "1JN", ref: "4-5"  }] },
  // 2 John + 3 John + Jude — day 87
  { day: 87, passages: [{ book: "2JN", ref: "1" }, { book: "3JN", ref: "1" }, { book: "JUD", ref: "1" }] },
  // Revelation (22 ch) — days 88-90
  { day: 88, passages: [{ book: "REV", ref: "1-7"  }] },
  { day: 89, passages: [{ book: "REV", ref: "8-14" }] },
  { day: 90, passages: [{ book: "REV", ref: "15-22"}] },
];
