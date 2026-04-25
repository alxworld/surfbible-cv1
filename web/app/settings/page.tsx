import { db } from "@/lib/db";
import { churches } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import SettingsForm from "./SettingsForm";
import JoinChurchForm from "./JoinChurchForm";

export default async function SettingsPage() {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const church = user.churchId
    ? (await db.select().from(churches).where(eq(churches.id, user.churchId)))[0] ?? null
    : null;

  return (
    <main className="bg-green-50 min-h-[calc(100svh-3.5rem)]">
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Settings</h1>
        <p className="text-stone-500 text-sm mb-8">Update your profile and notification preferences.</p>

        <div className="flex flex-col gap-5">
          <SettingsForm
            displayName={user.displayName ?? ""}
            timezone={user.timezone}
            reminderTime={user.reminderTime ?? ""}
          />

          {/* Church section */}
          <div className="mt-2">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Church</p>
            {church ? (
              <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900">{church.name}</p>
                  {(church.city || church.country) && (
                    <p className="text-xs text-stone-400">{[church.city, church.country].filter(Boolean).join(", ")}</p>
                  )}
                </div>
                <Link href="/admin" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium border border-emerald-200 px-3 py-1.5 rounded-full">
                  Admin →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <JoinChurchForm />
                <p className="text-center text-xs text-stone-400">
                  Want to create a church?{" "}
                  <Link href="/admin" className="text-emerald-600 hover:text-emerald-700 font-medium">Go to Admin</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
