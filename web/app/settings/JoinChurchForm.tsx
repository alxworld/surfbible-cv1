"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinChurchForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/user/church", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: code.trim() }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Invalid code");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
      <p className="text-sm font-semibold text-stone-700 mb-1">Join a church</p>
      <p className="text-xs text-stone-400 mb-3">Enter the invite code your church admin shared.</p>
      <div className="flex gap-2">
        <input
          required
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="12-character code"
          className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
        />
        <button type="submit" disabled={busy}
          className="bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
          {busy ? "..." : "Join"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </form>
  );
}
