"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls = "w-full border border-slate-600 bg-[#0f172a] rounded-lg px-3 py-2 text-sm font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#d4a843]/50 transition";

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
        className="w-full border-2 border-[#d4a843]/40 text-[#d4a843] text-sm font-semibold py-3 rounded-xl hover:border-[#d4a843]/70 hover:bg-[#d4a843]/5 transition-colors"
      >
        Join with invite code
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-[#162033] border border-[#d4a843]/15 rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="font-semibold text-slate-100">Join a group</h3>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Invite code</label>
        <input
          required
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="12-character code"
          className={inputCls}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-slate-600 text-slate-400 text-sm py-2.5 rounded-xl hover:border-slate-500 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="flex-1 bg-[#d4a843] text-[#080d1a] text-sm font-semibold py-2.5 rounded-xl hover:bg-[#e0bc60] disabled:opacity-50 transition-colors">
          {busy ? "Joining..." : "Join"}
        </button>
      </div>
    </form>
  );
}
