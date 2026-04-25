"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls = "w-full border border-slate-600 bg-[#0f172a] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#d4a843]/50 transition";

export default function CreateChurchForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("India");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/churches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, city, country }),
    });
    setBusy(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed"); return; }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="bg-[#162033] border border-[#d4a843]/15 rounded-2xl p-5 shadow-sm space-y-4">
      <h2 className="font-semibold text-slate-100">Create your church</h2>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Church name *</label>
        <input required value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Grace Community Church"
          className={inputCls} />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
          <input value={city} onChange={e => setCity(e.target.value)} placeholder="Chennai"
            className={inputCls} />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-400 mb-1">Country</label>
          <input value={country} onChange={e => setCountry(e.target.value)}
            className={inputCls} />
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button type="submit" disabled={busy}
        className="w-full bg-[#d4a843] text-[#080d1a] text-sm font-semibold py-3 rounded-xl hover:bg-[#e0bc60] disabled:opacity-50 transition-colors">
        {busy ? "Creating..." : "Create church"}
      </button>
    </form>
  );
}
