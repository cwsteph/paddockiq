// Unified dashboard endpoint — returns standardized bankroll summary
// Called by the cross-app dashboard at /dashboard.html
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get bankroll
    let bankroll = await prisma.bankroll.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!bankroll) bankroll = await prisma.bankroll.create({ data: { amount: 100 } });

    // Get all bets
    const bets = await prisma.bet.findMany({ orderBy: { createdAt: "asc" } });

    // Get bankroll snapshots
    const snapshots = await prisma.bankrollSnapshot.findMany({
      orderBy: { createdAt: "asc" },
      take: 90,
    });

    // Compute summary stats
    const settled = bets.filter(b => b.result && b.result !== "pending");
    const wins = settled.filter(b => (b.payout || 0) > (b.amount || 0)).length;
    const losses = settled.filter(b => (b.payout || 0) <= (b.amount || 0)).length;
    const totalWagered = settled.reduce((s, b) => s + (b.amount || 0), 0);
    const totalReturned = settled.reduce((s, b) => s + (b.payout || 0), 0);
    const totalPnl = totalReturned - totalWagered;

    // Max drawdown from snapshots
    let peak = 100, maxDrawdown = 0, maxDrawdownPct = 0;
    for (const snap of snapshots) {
      const bal = snap.amount;
      if (bal > peak) peak = bal;
      const dd = peak - bal;
      const ddPct = peak > 0 ? (dd / peak) * 100 : 0;
      if (dd > maxDrawdown) { maxDrawdown = dd; maxDrawdownPct = ddPct; }
    }

    // Streak
    let streak = 0, streakType: 'W' | 'L' | 'none' = 'none';
    for (let i = settled.length - 1; i >= 0; i--) {
      const won = (settled[i].payout || 0) > (settled[i].amount || 0);
      if (streak === 0) {
        streakType = won ? 'W' : 'L';
        streak = 1;
      } else if ((won && streakType === 'W') || (!won && streakType === 'L')) {
        streak++;
      } else break;
    }

    // Recent settled bets for activity feed
    const recentBets = settled.slice(-20).reverse().map(b => ({
      date: b.createdAt,
      desc: 'R' + b.race + ' ' + b.horses + ' (' + b.betType + ')',
      result: (b.payout || 0) > (b.amount || 0) ? 'WIN' : 'LOSS',
      pnl: (b.payout || 0) - (b.amount || 0),
      odds: null,
      stake: b.amount,
    }));

    return NextResponse.json({
      sport: 'racing',
      app: 'PaddockIQ',
      starting: 100,
      current: bankroll.amount,
      summary: {
        current: bankroll.amount,
        starting: 100,
        totalPnl,
        roi: totalWagered > 0 ? (totalPnl / 100) * 100 : 0,
        winRate: settled.length > 0 ? (wins / settled.length) * 100 : 0,
        wins,
        losses,
        pushes: 0,
        totalBets: bets.length,
        openBets: bets.length - settled.length,
        settledBets: settled.length,
        totalWagered,
        avgEdge: 0,
        avgOdds: 0,
        maxDrawdown,
        maxDrawdownPct,
        currentStreak: streak,
        streakType,
        clvAvg: 0,
      },
      snapshots: snapshots.map(s => ({
        date: s.createdAt,
        balance: s.amount,
      })),
      recentBets,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
