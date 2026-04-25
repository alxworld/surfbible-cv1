"use client";

import { useState } from "react";
import Link from "next/link";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MonthGrid({ completedDates }: { completedDates: string[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const completed = new Set(completedDates);
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const label = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const todayIso = today.toISOString().slice(0, 10);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#d4a843]/10 text-slate-400 hover:text-[#d4a843] transition-colors text-sm">←</button>
        <span className="font-semibold text-slate-100">{label}</span>
        <button onClick={next} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#d4a843]/10 text-slate-400 hover:text-[#d4a843] transition-colors text-sm">→</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
        {DAYS.map(d => <div key={d} className="py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = iso === todayIso;
          const done = completed.has(iso);
          return (
            <div
              key={i}
              className={[
                "aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                done ? "bg-[#d4a843] text-[#080d1a]" : "",
                isToday && !done ? "ring-2 ring-[#d4a843] text-[#d4a843] font-bold" : "",
                !done && !isToday ? "text-slate-400 hover:bg-[#d4a843]/10" : "",
              ].join(" ")}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#d4a843] inline-block" /> Read
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full ring-2 ring-[#d4a843] inline-block" /> Today
        </span>
      </div>

      <div className="mt-6 text-center">
        <Link href="/dashboard" className="text-sm text-[#d4a843] hover:text-[#e0bc60] font-medium">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
