"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function MarkCompleteButton({ enrollmentId }: { enrollmentId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function complete() {
    const res = await fetch(`/api/user/plans/${enrollmentId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      startTransition(() => router.refresh());
    }
  }

  return (
    <button
      onClick={complete}
      disabled={pending}
      className="flex-1 bg-[#d4a843] text-[#080d1a] py-3 rounded-xl hover:bg-[#e0bc60] active:scale-[0.98] disabled:opacity-50 text-sm font-semibold transition-all shadow-sm"
    >
      {pending ? "Saving…" : "Mark complete"}
    </button>
  );
}
