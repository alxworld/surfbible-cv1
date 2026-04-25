"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  enrollmentId: string;
  activeEnrollmentId?: string;
  activePlanTitle?: string;
}

export default function ResumeButton({ enrollmentId, activeEnrollmentId, activePlanTitle }: Props) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState(false);

  async function resume() {
    setPending(true);

    if (activeEnrollmentId) {
      const pause = await fetch(`/api/user/plans/${activeEnrollmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pause" }),
      });
      if (!pause.ok) { setPending(false); return; }
    }

    await fetch(`/api/user/plans/${enrollmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resume" }),
    });

    setPending(false);
    router.refresh();
  }

  if (activeEnrollmentId && confirm) {
    return (
      <div className="rounded-xl border border-[#d4a843]/30 bg-[#d4a843]/8 p-3 space-y-2">
        <p className="text-xs text-[#e0bc60] font-medium">
          This will pause <span className="font-bold">{activePlanTitle}</span>. Continue?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => { resume(); setConfirm(false); }}
            disabled={pending}
            className="flex-1 bg-[#d4a843] text-[#080d1a] text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#e0bc60] disabled:opacity-50 transition-colors"
          >
            {pending ? "Resuming…" : "Yes, switch"}
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="flex-1 bg-[#162033] border border-[#d4a843]/20 text-slate-300 text-xs font-medium px-3 py-2 rounded-lg hover:bg-[#1e2d47] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => activeEnrollmentId ? setConfirm(true) : resume()}
      disabled={pending}
      className="text-xs font-semibold text-[#d4a843] hover:text-[#e0bc60] border border-[#d4a843]/30 px-3 py-1.5 rounded-lg hover:border-[#d4a843]/50 disabled:opacity-50 transition-all"
    >
      {pending ? "Resuming…" : "Resume"}
    </button>
  );
}
