export type PremiumCheckUser = {
  plan: string;
  currentPeriodEnd: Date | null;
} | null;

export function isPremium(user: PremiumCheckUser): boolean {
  if (!user) return false;
  if (user.plan !== "premium") return false;
  if (!user.currentPeriodEnd) return false;
  return user.currentPeriodEnd.getTime() > Date.now();
}
