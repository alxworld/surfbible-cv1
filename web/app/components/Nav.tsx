import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-[#080d1a] border-b border-[#d4a843]/10">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[#d4a843]">
            <svg className="w-4 h-4" viewBox="0 0 40 40" fill="currentColor" aria-hidden="true">
              <rect x="17" y="3" width="6" height="34" rx="3" />
              <rect x="5" y="13" width="30" height="6" rx="3" />
            </svg>
          </span>
          <span className="font-display font-bold text-white text-base tracking-tight">SurfBible</span>
        </Link>

        <div className="flex items-center gap-1">
          <Show when="signed-in">
            <Link href="/plans" className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/8 transition-colors">
              Plans
            </Link>
            <Link href="/dashboard" className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/8 transition-colors">
              Dashboard
            </Link>
            <div className="ml-1">
              <UserButton />
            </div>
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in" className="text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/8 transition-colors font-medium">
              Sign in
            </Link>
            <Link href="/sign-up" className="text-sm bg-[#d4a843] text-[#080d1a] px-3.5 py-1.5 rounded-lg font-bold hover:bg-[#e0bc60] transition-colors ml-1">
              Sign up
            </Link>
          </Show>
        </div>
      </div>
    </nav>
  );
}
