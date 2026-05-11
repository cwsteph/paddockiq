import { auth } from "@clerk/nextjs/server";
import { prisma } from "./db";

export type CurrentUser = Awaited<ReturnType<typeof prisma.user.findUnique>>;

export async function getCurrentUser(): Promise<CurrentUser> {
  const { userId } = auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}
