"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  displayName: string;
  timezone: string;
  reminderTime: string;
}

const TIMEZONES = Intl.supportedValuesOf("timeZone");

const inputCls = "w-full rounded-xl border border-slate-600 bg-[#0f172a] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#d4a843]/50 focus:border-transparent transition";

export default function SettingsForm({ displayName, timezone, reminderTime }: Props) {
  const [name, setName] = useState(displayName);
  const [tz, setTz] = useState(timezone);
  const [time, setTime] = useState(reminderTime);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setStatus("saving");
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: name.trim() || null,
        timezone: tz,
        reminderTime: time || null,
      }),
    });
    setStatus(res.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#162033] rounded-2xl border border-[#d4a843]/15 shadow-sm p-5">
        <label className="block text-sm font-semibold text-slate-300 mb-2">Display name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={100}
          className={inputCls}
        />
      </div>

      <div className="bg-[#162033] rounded-2xl border border-[#d4a843]/15 shadow-sm p-5">
        <label className="block text-sm font-semibold text-slate-300 mb-2">Timezone</label>
        <p className="text-xs text-slate-400 mb-3">Used to send reminders at the right local time.</p>
        <select value={tz} onChange={(e) => setTz(e.target.value)} className={inputCls}>
          {TIMEZONES.map((z) => (
            <option key={z} value={z}>{z.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <div className="bg-[#162033] rounded-2xl border border-[#d4a843]/15 shadow-sm p-5">
        <label className="block text-sm font-semibold text-slate-300 mb-2">Daily reminder time</label>
        <p className="text-xs text-slate-400 mb-3">Leave blank to turn off reminders.</p>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-xl border border-slate-600 bg-[#0f172a] px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#d4a843]/50 focus:border-transparent transition"
        />
      </div>

      <button
        onClick={save}
        disabled={status === "saving"}
        className="w-full bg-[#d4a843] text-[#080d1a] font-semibold py-3 rounded-xl hover:bg-[#e0bc60] active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm text-sm"
      >
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved!" : status === "error" ? "Error — try again" : "Save changes"}
      </button>

      <div className="text-center">
        <Link href="/dashboard" className="text-sm text-[#d4a843] hover:text-[#e0bc60] font-medium">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
