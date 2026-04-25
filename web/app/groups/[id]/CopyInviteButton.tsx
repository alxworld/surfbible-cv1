"use client";
import { useState } from "react";

export default function CopyInviteButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="text-xs font-mono bg-[#0f172a] border border-[#d4a843]/30 text-[#d4a843] px-3 py-1.5 rounded-lg hover:border-[#d4a843]/60 transition-colors"
    >
      {copied ? "Copied!" : code}
    </button>
  );
}
