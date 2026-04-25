import { db } from "@/lib/db";
import { churches, users, plans } from "@/lib/db/schema";
import { getDbUser } from "@/lib/auth";
import { eq, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateChurchForm from "./CreateChurchForm";
import InviteMemberForm from "./InviteMemberForm";
import CopyInviteButton from "../groups/[id]/CopyInviteButton";

export default async function AdminPage() {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  // No church yet
  if (!user.churchId) {
    return (
      <main className="bg-green-50 min-h-[calc(100svh-3.5rem)]">
        <div className="max-w-lg mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Church Admin</h1>
          <p className="text-stone-500 text-sm mb-6">Create a church to manage members and assign reading plans.</p>
          <CreateChurchForm />
          <p className="text-center text-xs text-stone-400 mt-4">
            Already have an invite code?{" "}
            <Link href="/settings" className="text-emerald-600 hover:text-emerald-700 font-medium">Join in Settings</Link>
          </p>
        </div>
      </main>
    );
  }

  const [church] = await db.select().from(churches).where(eq(churches.id, user.churchId));
  if (!church) redirect("/admin");

  const isAdmin = church.createdBy === user.id;

  const [{ value: memberCount }] = await db
    .select({ value: count() })
    .from(users)
    .where(eq(users.churchId, church.id));

  const churchPlans = await db
    .select({ id: plans.id, title: plans.title, totalDays: plans.totalDays, createdAt: plans.createdAt })
    .from(plans)
    .where(eq(plans.churchId, church.id));

  return (
    <main className="bg-green-50 min-h-[calc(100svh-3.5rem)]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">{isAdmin ? "Admin" : "Member"}</p>
          <h1 className="text-2xl font-bold text-stone-900">{church.name}</h1>
          {(church.city || church.country) && (
            <p className="text-stone-500 text-sm mt-0.5">{[church.city, church.country].filter(Boolean).join(", ")}</p>
          )}
        </div>

        {/* Invite code */}
        {isAdmin && (
          <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm mb-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Church invite code</p>
            <div className="flex items-center gap-3">
              <CopyInviteButton code={church.inviteCode} />
              <p className="text-xs text-stone-400">Share so members can join via Settings</p>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-emerald-600">{memberCount}</p>
            <p className="text-xs text-stone-400 mt-0.5 uppercase tracking-wide">Members</p>
          </div>
          <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-emerald-600">{churchPlans.length}</p>
            <p className="text-xs text-stone-400 mt-0.5 uppercase tracking-wide">Plans</p>
          </div>
        </div>

        {/* Invite member */}
        {isAdmin && (
          <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm mb-4">
            <p className="text-sm font-semibold text-stone-700">Add member by email</p>
            <p className="text-xs text-stone-400 mt-0.5">User must already have a SurfBible account.</p>
            <InviteMemberForm churchId={church.id} />
          </div>
        )}

        {/* Assigned plans */}
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-50">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Assigned plans</h2>
            {isAdmin && (
              <Link href="/plans/create" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                + New plan
              </Link>
            )}
          </div>
          {churchPlans.length === 0 ? (
            <p className="text-sm text-stone-400 px-5 py-4">No plans assigned yet.</p>
          ) : (
            <ul className="divide-y divide-emerald-50">
              {churchPlans.map(p => (
                <li key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-stone-900">{p.title}</p>
                    <p className="text-xs text-stone-400">{p.totalDays} days</p>
                  </div>
                  <Link href={`/plans/${p.id}`} className="text-xs text-emerald-600 hover:text-emerald-700">View</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Nav */}
        <div className="flex gap-3 justify-center">
          <Link href="/admin/members" className="text-xs font-medium text-emerald-600 bg-white border border-emerald-100 px-3 py-1.5 rounded-full shadow-sm hover:shadow">
            Members →
          </Link>
          <Link href="/dashboard" className="text-xs font-medium text-emerald-600 bg-white border border-emerald-100 px-3 py-1.5 rounded-full shadow-sm hover:shadow">
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
