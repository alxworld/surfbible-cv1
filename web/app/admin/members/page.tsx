import { db } from "@/lib/db";
import { churches, users, userPlans, plans } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminMembersPage() {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");
  if (!user.churchId) redirect("/admin");

  const [church] = await db.select().from(churches).where(eq(churches.id, user.churchId));
  if (!church) redirect("/admin");

  const members = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.churchId, church.id));

  const churchPlans = await db
    .select({ id: plans.id, title: plans.title })
    .from(plans)
    .where(eq(plans.churchId, church.id));

  type MemberRow = {
    id: string; email: string; displayName: string | null; createdAt: Date;
    enrollments: { planTitle: string; currentDay: number; totalDays: number; streakCount: number; status: string }[];
  };

  const rows: MemberRow[] = await Promise.all(
    members.map(async m => {
      const enrollments = await Promise.all(
        churchPlans.map(async p => {
          const [up] = await db
            .select({ currentDay: userPlans.currentDay, streakCount: userPlans.streakCount, status: userPlans.status })
            .from(userPlans)
            .where(and(eq(userPlans.userId, m.id), eq(userPlans.planId, p.id)));
          return up ? { planTitle: p.title, currentDay: up.currentDay, totalDays: 0, streakCount: up.streakCount, status: up.status } : null;
        })
      );
      return { ...m, enrollments: enrollments.filter(Boolean) as MemberRow["enrollments"] };
    })
  );

  return (
    <main className="bg-[#0f172a] min-h-[calc(100svh-3.5rem)]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-[#d4a843] hover:text-[#e0bc60] font-medium">← Admin</Link>
            <h1 className="text-2xl font-bold text-slate-100 mt-1">{church.name} — Members</h1>
          </div>
        </div>

        <div className="bg-[#162033] border border-[#d4a843]/15 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#d4a843]/10">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{members.length} member{members.length !== 1 ? "s" : ""}</p>
          </div>
          {rows.length === 0 ? (
            <p className="text-sm text-slate-400 px-5 py-4">No members yet.</p>
          ) : (
            <ul className="divide-y divide-[#d4a843]/8">
              {rows.map(m => (
                <li key={m.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-100 truncate">
                        {m.displayName ?? m.email}
                        {m.id === user.id && <span className="ml-1.5 text-[10px] text-slate-400">(you)</span>}
                        {church.createdBy === m.id && <span className="ml-1.5 text-[10px] text-[#d4a843] font-semibold uppercase">admin</span>}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{m.email}</p>
                    </div>
                  </div>
                  {m.enrollments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.enrollments.map((e, i) => (
                        <span key={i} className="text-xs bg-[#0f172a] border border-[#d4a843]/20 text-[#d4a843] px-2 py-0.5 rounded-full">
                          Day {e.currentDay} · {e.streakCount} streak
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
