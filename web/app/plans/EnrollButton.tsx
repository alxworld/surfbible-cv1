"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function EnrollButton({ planId }: { planId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function enroll() {
    const res = await fetch("/api/user/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    if (res.ok) {
      startTransition(() => router.push("/dashboard"));
    }
  }

  return (
    <button
      onClick={enroll}
      disabled={pending}
      className="w-full bg-[#d4a843] text-[#080d1a] text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#e0bc60] active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm"
    >
      {pending ? "Starting…" : "Start Reading"}
    </button>
  );
}
