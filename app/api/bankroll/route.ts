import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const userId = user?.id ?? null;

    let bankroll = await prisma.bankroll.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    if (!bankroll) {
      bankroll = await prisma.bankroll.create({ data: { amount: 100, userId } });
    }
    const bets = await prisma.bet.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bankroll: bankroll.amount, bets });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id ?? null;
    const { bankroll, bets } = await req.json();

    const existing = await prisma.bankroll.findFirst({ where: { userId } });
    if (existing) {
      await prisma.bankroll.update({ where: { id: existing.id }, data: { amount: bankroll } });
    } else {
      await prisma.bankroll.create({ data: { amount: bankroll, userId } });
    }

    const today = new Date().toISOString().slice(0, 10);
    await prisma.bet.deleteMany({ where: { raceDate: today, userId } });
    if (bets && bets.length > 0) {
      await prisma.bet.createMany({
        data: bets.map((b: { track?: string; race?: number; betType?: string; horses?: string; amount?: number; toWin?: number; result?: string; payout?: number }) => ({
          track: b.track || "OP",
          raceDate: today,
          race: b.race || 0,
          betType: b.betType || "WIN",
          horses: b.horses || "",
          amount: b.amount || 0,
          toWin: b.toWin || null,
          result: b.result || "pending",
          payout: b.payout || null,
          userId,
        })),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
