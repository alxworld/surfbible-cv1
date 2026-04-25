"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LeaveButton({ groupId, userId }: { groupId: string; userId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function leave() {
    if (!confirm("Leave this group?")) return;
    setBusy(true);
    await fetch(`/api/groups/${groupId}/members/${userId}`, { method: "DELETE" });
    router.push("/groups");
    router.refresh();
  }

  return (
    <button
      onClick={leave}
      disabled={busy}
      className="text-xs text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
    >
      {busy ? "Leaving..." : "Leave group"}
    </button>
  );
}
