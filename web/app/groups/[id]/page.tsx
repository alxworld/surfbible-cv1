import { db } from "@/lib/db";
import { readingGroups, readingGroupMembers, users, userPlans, plans } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import LeaveButton from "./LeaveButton";
import CopyInviteButton from "./CopyInviteButton";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;

  const [group] = await db
    .select({ id: readingGroups.id, name: readingGroups.name, inviteCode: readingGroups.inviteCode, createdBy: readingGroups.createdBy, planId: readingGroups.planId })
    .from(readingGroups)
    .where(eq(readingGroups.id, id));
  if (!group) notFound();

  const [membership] = await db
    .select()
    .from(readingGroupMembers)
    .where(and(eq(readingGroupMembers.groupId, id), eq(readingGroupMembers.userId, user.id)));
  if (!membership) redirect("/groups");

  const [plan] = await db.select({ title: plans.title, totalDays: plans.totalDays }).from(plans).where(eq(plans.id, group.planId));

  const members = await db
    .select({
      userId: users.id,
      displayName: users.displayName,
      email: users.email,
      role: readingGroupMembers.role,
      currentDay: userPlans.currentDay,
      streakCount: userPlans.streakCount,
      lastReadAt: userPlans.lastReadAt,
    })
    .from(readingGroupMembers)
    .innerJoin(users, eq(readingGroupMembers.userId, users.id))
    .leftJoin(userPlans, and(eq(userPlans.userId, users.id), eq(userPlans.planId, group.planId)))
    .where(eq(readingGroupMembers.groupId, id))
    .orderBy(userPlans.streakCount);

  const leader = members.reduce((best, m) =>
    (m.streakCount ?? 0) > (best.streakCount ?? 0) ? m : best, members[0]);

  return (
    <main className="bg-[#0f172a] min-h-[calc(100svh-3.5rem)]">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">{group.name}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{plan?.title} · {plan?.totalDays} days</p>
            </div>
            <LeaveButton groupId={group.id} userId={user.id} />
          </div>
        </div>

        {/* Invite code */}
        <div className="bg-[#162033] border border-[#d4a843]/15 rounded-2xl p-5 shadow-sm mb-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Invite code</p>
          <div className="flex items-center gap-3">
            <CopyInviteButton code={group.inviteCode} />
            <p className="text-xs text-slate-400">Share this code so others can join</p>
          </div>
        </div>

        {/* Streak leader */}
        {leader && (leader.streakCount ?? 0) > 0 && (
          <div className="bg-gradient-to-r from-[#d4a843] to-[#b8882a] text-[#080d1a] rounded-2xl p-5 shadow-sm mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">Streak leader</p>
            <p className="font-bold text-lg">{leader.displayName ?? leader.email}</p>
            <p className="text-sm opacity-80">{leader.streakCount} day streak · Day {leader.currentDay ?? "—"}</p>
          </div>
        )}

        {/* Member table */}
        <div className="bg-[#162033] border border-[#d4a843]/15 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-[#d4a843]/10">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{members.length} member{members.length !== 1 ? "s" : ""}</h2>
          </div>
          <ul className="divide-y divide-[#d4a843]/8">
            {members.map(m => (
              <li key={m.userId} className="px-5 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">
                    {m.displayName ?? m.email}
                    {m.role === "admin" && <span className="ml-1.5 text-[10px] text-[#d4a843] font-semibold uppercase">admin</span>}
                    {m.userId === user.id && <span className="ml-1.5 text-[10px] text-slate-400">(you)</span>}
                  </p>
                  <p className="text-xs text-slate-400">
                    {m.currentDay != null ? `Day ${m.currentDay}` : "Not started"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#d4a843]">{m.streakCount ?? 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase">streak</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center">
          <Link href="/groups" className="text-sm text-[#d4a843] hover:text-[#e0bc60] font-medium">
            All groups →
          </Link>
        </div>
      </div>
    </main>
  );
}
