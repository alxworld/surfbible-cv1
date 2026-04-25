"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls = "w-full border border-slate-600 bg-[#0f172a] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#d4a843]/50 transition";

export default function CreateGroupForm({ plans }: { plans: { id: string; title: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, planId }),
    });
    setBusy(false);
    if (!res.ok) { setError("Failed to create group"); return; }
    const group = await res.json();
    router.push(`/groups/${group.id}`);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-[#d4a843] text-[#080d1a] text-sm font-semibold py-3 rounded-xl hover:bg-[#e0bc60] transition-colors"
      >
        Create a group
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-[#162033] border border-[#d4a843]/15 rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="font-semibold text-slate-100">New reading group</h3>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Group name</label>
        <input
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Morning Bible Study"
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Reading plan</label>
        <select
          value={planId}
          onChange={e => setPlanId(e.target.value)}
          className={inputCls}
        >
          {plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-slate-600 text-slate-400 text-sm py-2.5 rounded-xl hover:border-slate-500 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="flex-1 bg-[#d4a843] text-[#080d1a] text-sm font-semibold py-2.5 rounded-xl hover:bg-[#e0bc60] disabled:opacity-50 transition-colors">
          {busy ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
