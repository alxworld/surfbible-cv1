"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinGroupForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: code.trim() }),
    });
    setBusy(false);
    if (!res.ok) { setError("Invalid invite code"); return; }
    const { group } = await res.json();
    router.push(`/groups/${group.id}`);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border-2 border-emerald-500 text-emerald-700 text-sm font-semibold py-3 rounded-xl hover:bg-emerald-50 transition-colors"
      >
        Join with invite code
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="font-semibold text-stone-900">Join a group</h3>
      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">Invite code</label>
        <input
          required
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="12-character code"
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-stone-200 text-stone-600 text-sm py-2.5 rounded-xl hover:bg-stone-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="flex-1 bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
          {busy ? "Joining..." : "Join"}
        </button>
      </div>
    </form>
  );
}
