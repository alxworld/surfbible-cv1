"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BOOK_NAMES } from "@/lib/osis";

const OSIS_CODES = Object.keys(BOOK_NAMES);

type Passage = { book: string; ref: string };
type Day = { passages: Passage[] };

const inputCls = "border border-slate-600 bg-[#0f172a] rounded-lg px-2 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#d4a843]/50 transition";

function emptyDay(): Day {
  return { passages: [{ book: "GEN", ref: "" }] };
}

export default function PlanBuilder({
  initial,
  planId,
}: {
  initial?: { title: string; description: string; isPublic: boolean; days: Day[] };
  planId?: string;
}) {
  const router = useRouter();
  const isEdit = !!planId;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
  const [days, setDays] = useState<Day[]>(initial?.days ?? [emptyDay()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function setPassage(di: number, pi: number, field: keyof Passage, value: string) {
    setDays(prev => prev.map((d, i) =>
      i !== di ? d : {
        ...d,
        passages: d.passages.map((p, j) => j !== pi ? p : { ...p, [field]: value }),
      }
    ));
  }

  function addPassage(di: number) {
    setDays(prev => prev.map((d, i) =>
      i !== di ? d : { ...d, passages: [...d.passages, { book: "GEN", ref: "" }] }
    ));
  }

  function removePassage(di: number, pi: number) {
    setDays(prev => prev.map((d, i) =>
      i !== di ? d : { ...d, passages: d.passages.filter((_, j) => j !== pi) }
    ));
  }

  function addDay() {
    setDays(prev => [...prev, emptyDay()]);
  }

  function removeDay(di: number) {
    setDays(prev => prev.filter((_, i) => i !== di));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const body = {
      title,
      description,
      isPublic,
      days: days.map((d, i) => ({ dayNumber: i + 1, passages: d.passages })),
    };

    const res = await fetch(
      isEdit ? `/api/plans/${planId}` : "/api/plans",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }
    const plan = await res.json();
    router.push(`/plans/${plan.id}`);
    router.refresh();
  }

  async function deletePlan() {
    if (!planId || !confirm("Delete this plan? This cannot be undone.")) return;
    await fetch(`/api/plans/${planId}`, { method: "DELETE" });
    router.push("/plans");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Meta */}
      <div className="bg-[#162033] rounded-2xl border border-[#d4a843]/15 shadow-sm p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Plan title *</label>
          <input
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. 30 Days in the Psalms"
            className={`w-full ${inputCls}`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="Optional description"
            className={`w-full resize-none ${inputCls}`}
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setIsPublic(v => !v)}
            className={`w-10 h-6 rounded-full transition-colors ${isPublic ? "bg-[#d4a843]" : "bg-slate-600"} relative`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isPublic ? "left-5" : "left-1"}`} />
          </div>
          <span className="text-sm text-slate-300">Make this plan public</span>
        </label>
      </div>

      {/* Days */}
      <div className="space-y-3">
        {days.map((day, di) => (
          <div key={di} className="bg-[#162033] rounded-2xl border border-[#d4a843]/15 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#d4a843] uppercase tracking-wide">Day {di + 1}</span>
              {days.length > 1 && (
                <button type="button" onClick={() => removeDay(di)} className="text-xs text-red-400 hover:text-red-300">
                  Remove day
                </button>
              )}
            </div>

            <div className="space-y-2">
              {day.passages.map((p, pi) => (
                <div key={pi} className="flex items-center gap-2">
                  <select
                    value={p.book}
                    onChange={e => setPassage(di, pi, "book", e.target.value)}
                    className={`w-36 ${inputCls}`}
                  >
                    {OSIS_CODES.map(code => (
                      <option key={code} value={code}>{BOOK_NAMES[code]}</option>
                    ))}
                  </select>
                  <input
                    required
                    value={p.ref}
                    onChange={e => setPassage(di, pi, "ref", e.target.value)}
                    placeholder="e.g. 1:1-17"
                    className={`flex-1 ${inputCls}`}
                  />
                  {day.passages.length > 1 && (
                    <button type="button" onClick={() => removePassage(di, pi)} className="text-slate-500 hover:text-red-400 text-lg leading-none px-1">
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addPassage(di)}
              className="mt-2 text-xs text-[#d4a843] hover:text-[#e0bc60] font-medium"
            >
              + Add passage
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addDay}
        className="w-full border-2 border-dashed border-[#d4a843]/30 text-[#d4a843] text-sm font-medium py-3 rounded-xl hover:border-[#d4a843]/60 hover:bg-[#d4a843]/5 transition-colors"
      >
        + Add day
      </button>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      <div className="flex gap-3">
        {isEdit && (
          <button
            type="button"
            onClick={deletePlan}
            className="border border-red-500/40 text-red-400 text-sm font-medium px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors"
          >
            Delete
          </button>
        )}
        <button
          type="submit"
          disabled={busy}
          className="flex-1 bg-[#d4a843] text-[#080d1a] text-sm font-semibold py-3 rounded-xl hover:bg-[#e0bc60] disabled:opacity-50 transition-colors"
        >
          {busy ? "Saving..." : isEdit ? "Save changes" : `Create plan (${days.length} day${days.length !== 1 ? "s" : ""})`}
        </button>
      </div>
    </form>
  );
}
