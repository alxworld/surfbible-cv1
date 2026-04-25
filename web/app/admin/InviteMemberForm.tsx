"use client";
import { useState } from "react";

export default function InviteMemberForm({ churchId }: { churchId: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/admin/churches/${churchId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Member added." });
      setEmail("");
    } else {
      const d = await res.json();
      setMsg({ ok: false, text: d.error ?? "Failed" });
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 mt-3">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="member@email.com"
        className="flex-1 border border-slate-600 bg-[#0f172a] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#d4a843]/50 transition"
      />
      <button type="submit" disabled={busy}
        className="bg-[#d4a843] text-[#080d1a] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#e0bc60] disabled:opacity-50 transition-colors">
        {busy ? "..." : "Add"}
      </button>
      {msg && <p className={`text-xs mt-1 self-center ${msg.ok ? "text-[#d4a843]" : "text-red-400"}`}>{msg.text}</p>}
    </form>
  );
}
