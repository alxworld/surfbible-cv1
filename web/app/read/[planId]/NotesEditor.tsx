"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  enrollmentId: string;
  dayNumber: number;
  initialNotes: string;
  initialReflection: string;
}

type SaveStatus = "idle" | "saving" | "saved";

function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function NotesEditor({ enrollmentId, dayNumber, initialNotes, initialReflection }: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [reflection, setReflection] = useState(initialReflection);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const savedRef = useRef({ notes: initialNotes, reflection: initialReflection });

  const debouncedNotes = useDebounce(notes, 1000);
  const debouncedReflection = useDebounce(reflection, 1000);

  const save = useCallback(async (n: string, r: string) => {
    const prev = savedRef.current;
    if (n === prev.notes && r === prev.reflection) return;

    setStatus("saving");
    await fetch(`/api/user/plans/${enrollmentId}/progress/${dayNumber}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: n, reflection: r }),
    });
    savedRef.current = { notes: n, reflection: r };
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 1500);
  }, [enrollmentId, dayNumber]);

  useEffect(() => {
    save(debouncedNotes, debouncedReflection);
  }, [debouncedNotes, debouncedReflection, save]);

  return (
    <section className="bg-[#162033] rounded-2xl border border-[#d4a843]/15 shadow-sm p-6 mt-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-100">Notes & reflection</h2>
        {status === "saving" && <span className="text-xs text-slate-400">Saving…</span>}
        {status === "saved"  && <span className="text-xs text-[#d4a843]">Saved</span>}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Key verses, observations…"
            rows={3}
            className="w-full border border-slate-600 bg-[#0f172a] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#d4a843]/50 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Personal reflection</label>
          <textarea
            value={reflection}
            onChange={e => setReflection(e.target.value)}
            placeholder="How does this apply to your life?"
            rows={4}
            className="w-full border border-slate-600 bg-[#0f172a] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#d4a843]/50 resize-none"
          />
        </div>
      </div>
    </section>
  );
}
