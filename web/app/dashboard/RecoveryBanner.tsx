"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  enrollmentId: string;
  freezeAvailable: boolean;
}

export default function RecoveryBanner({ enrollmentId, freezeAvailable }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function callApi(path: string, body: object) {
    setLoading(path);
    await fetch(`/api/user/plans/${enrollmentId}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="border border-[#d4a843]/30 bg-[#d4a843]/8 rounded-2xl p-4 mb-5">
      <p className="text-sm font-medium text-[#e0bc60] mb-3">
        You missed a day — your streak is at risk. What would you like to do?
      </p>
      <div className="flex flex-wrap gap-2">
        {freezeAvailable && (
          <button
            onClick={() => callApi("freeze", {})}
            disabled={loading !== null}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#d4a843] text-[#080d1a] hover:bg-[#e0bc60] disabled:opacity-50 font-medium"
          >
            {loading === "freeze" ? "Applying…" : "Use streak freeze"}
          </button>
        )}
        <button
          onClick={() => callApi("recover", { action: "skip" })}
          disabled={loading !== null}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 font-medium"
        >
          {loading === "recover" ? "Skipping…" : "Skip missed day"}
        </button>
        <button
          onClick={() => callApi("recover", { action: "restart" })}
          disabled={loading !== null}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50 font-medium"
        >
          Restart plan
        </button>
      </div>
    </div>
  );
}
