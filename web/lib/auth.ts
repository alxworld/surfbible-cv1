import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const [existing] = await db.select().from(users).where(eq(users.clerkUserId, userId));
  if (existing) return existing;

  const clerkUser = await currentUser();
  const [created] = await db.insert(users).values({
    clerkUserId: userId,
    email: clerkUser!.emailAddresses[0].emailAddress,
    displayName: clerkUser!.fullName ?? undefined,
  }).returning();
  return created;
}
