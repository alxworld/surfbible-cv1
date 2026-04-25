"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  displayName: string;
  timezone: string;
  reminderTime: string;
}

const TIMEZONES = Intl.supportedValuesOf("timeZone");

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
      {/* Display name */}
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
        <label className="block text-sm font-semibold text-stone-700 mb-2">Display name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={100}
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
        />
      </div>

      {/* Timezone */}
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
        <label className="block text-sm font-semibold text-stone-700 mb-2">Timezone</label>
        <p className="text-xs text-stone-400 mb-3">Used to send reminders at the right local time.</p>
        <select
          value={tz}
          onChange={(e) => setTz(e.target.value)}
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
        >
          {TIMEZONES.map((z) => (
            <option key={z} value={z}>{z.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {/* Reminder time */}
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
        <label className="block text-sm font-semibold text-stone-700 mb-2">Daily reminder time</label>
        <p className="text-xs text-stone-400 mb-3">Leave blank to turn off reminders.</p>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
        />
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={status === "saving"}
        className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm text-sm"
      >
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved!" : status === "error" ? "Error — try again" : "Save changes"}
      </button>

      <div className="text-center">
        <Link href="/dashboard" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
