"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

export default function EnrollButton({ planId }: { planId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<{ enrollmentId: string; planTitle: string } | null>(null);

  async function enroll(pauseEnrollmentId?: string) {
    if (pauseEnrollmentId) {
      const pause = await fetch(`/api/user/plans/${pauseEnrollmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pause" }),
      });
      if (!pause.ok) return;
    }

    const res = await fetch("/api/user/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });

    if (res.ok) {
      startTransition(() => router.push("/dashboard"));
      return;
    }

    if (res.status === 409) {
      const body = await res.json();
      if (body.error === "active_plan_exists") {
        setConfirm({ enrollmentId: body.enrollmentId, planTitle: body.planTitle });
      }
    }
  }

  if (confirm) {
    return (
      <div className="rounded-2xl border border-[#d4a843]/30 bg-[#d4a843]/8 p-4 space-y-3">
        <p className="text-sm text-[#e0bc60] font-medium">
          This will pause <span className="font-bold">{confirm.planTitle}</span>. Continue?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => { enroll(confirm.enrollmentId); setConfirm(null); }}
            disabled={pending}
            className="flex-1 bg-[#d4a843] text-[#080d1a] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#e0bc60] disabled:opacity-50 transition-colors"
          >
            {pending ? "Starting…" : "Yes, pause and start"}
          </button>
          <button
            onClick={() => setConfirm(null)}
            className="flex-1 bg-[#162033] border border-[#d4a843]/20 text-slate-300 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#1e2d47] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => enroll()}
      disabled={pending}
      className="w-full bg-[#d4a843] text-[#080d1a] text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#e0bc60] active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm"
    >
      {pending ? "Starting…" : "Start Reading"}
    </button>
  );
}
