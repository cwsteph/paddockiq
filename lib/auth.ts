import { auth } from "@clerk/nextjs/server";
import { prisma } from "./db";

export type CurrentUser = Awaited<ReturnType<typeof prisma.user.findUnique>>;

// Matches middleware.ts — when Clerk env vars are absent, clerkMiddleware()
// is replaced with a no-op and any call to auth() throws "auth() was called
// but Clerk can't detect usage of clerkMiddleware()". Gate at the same level
// so routes that call getCurrentUser() degrade to anonymous instead of 500.
const hasClerk = !!(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export async function getCurrentUser(): Promise<CurrentUser> {
  if (!hasClerk) return null;
  try {
    const { userId } = auth();
    if (!userId) return null;
    return await prisma.user.findUnique({ where: { clerkId: userId } });
  } catch {
    return null;
  }
}
