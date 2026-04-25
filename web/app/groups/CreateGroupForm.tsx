"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
        className="w-full bg-emerald-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors"
      >
        Create a group
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="font-semibold text-stone-900">New reading group</h3>
      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">Group name</label>
        <input
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Morning Bible Study"
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">Reading plan</label>
        <select
          value={planId}
          onChange={e => setPlanId(e.target.value)}
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          {plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-stone-200 text-stone-600 text-sm py-2.5 rounded-xl hover:bg-stone-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="flex-1 bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
          {busy ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
