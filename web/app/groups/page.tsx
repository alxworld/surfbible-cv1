import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = { robots: { index: false, follow: false } };
import { readingGroups, readingGroupMembers, plans } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateGroupForm from "./CreateGroupForm";
import JoinGroupForm from "./JoinGroupForm";

export default async function GroupsPage() {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const myGroups = await db
    .select({
      id: readingGroups.id,
      name: readingGroups.name,
      inviteCode: readingGroups.inviteCode,
      createdBy: readingGroups.createdBy,
      plan: { title: plans.title, totalDays: plans.totalDays },
    })
    .from(readingGroupMembers)
    .innerJoin(readingGroups, eq(readingGroupMembers.groupId, readingGroups.id))
    .innerJoin(plans, eq(readingGroups.planId, plans.id))
    .where(eq(readingGroupMembers.userId, user.id));

  const allPlans = await db.select({ id: plans.id, title: plans.title }).from(plans).where(eq(plans.isPublic, true));

  return (
    <main className="bg-[#0f172a] min-h-[calc(100svh-3.5rem)]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Reading Groups</h1>
          <p className="text-slate-400 text-sm">Read together and encourage one another.</p>
        </div>

        {myGroups.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">My groups</h2>
            <div className="flex flex-col gap-3">
              {myGroups.map(g => (
                <Link
                  key={g.id}
                  href={`/groups/${g.id}`}
                  className="block bg-[#162033] border-2 border-[#d4a843]/20 hover:border-[#d4a843]/50 rounded-2xl p-5 shadow-sm transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-100">{g.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{g.plan.title} · {g.plan.totalDays} days</p>
                    </div>
                    <span className="text-[#d4a843] text-xl">›</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <CreateGroupForm plans={allPlans} />
          <JoinGroupForm />
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-sm text-[#d4a843] hover:text-[#e0bc60] font-medium">
            Back to dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
