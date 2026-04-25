import { getDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import PlanBuilder from "../PlanBuilder";

export default async function CreatePlanPage() {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  return (
    <main className="bg-green-50 min-h-[calc(100svh-3.5rem)]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link href="/plans" className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 mb-6 font-medium">
          ← All plans
        </Link>
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Create a reading plan</h1>
        <PlanBuilder />
      </div>
    </main>
  );
}
