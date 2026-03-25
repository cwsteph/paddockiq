import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    let bankroll = await prisma.bankroll.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!bankroll) bankroll = await prisma.bankroll.create({ data: { amount: 100 } });
    const bets = await prisma.bet.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ bankroll: bankroll.amount, bets });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { bankroll, bets } = await req.json();
    // Update bankroll
    const existing = await prisma.bankroll.findFirst();
    if (existing) {
      await prisma.bankroll.update({ where: { id: existing.id }, data: { amount: bankroll } });
    } else {
      await prisma.bankroll.create({ data: { amount: bankroll } });
    }
    // Sync bets — replace all bets for today
    const today = new Date().toISOString().slice(0, 10);
    await prisma.bet.deleteMany({ where: { raceDate: today } });
    if (bets && bets.length > 0) {
      await prisma.bet.createMany({
        data: bets.map((b: {track?:string;race?:number;betType?:string;horses?:string;amount?:number;toWin?:number;result?:string;payout?:number}) => ({
          track: b.track || "OP",
          raceDate: today,
          race: b.race || 0,
          betType: b.betType || "WIN",
          horses: b.horses || "",
          amount: b.amount || 0,
          toWin: b.toWin || null,
          result: b.result || "pending",
          payout: b.payout || null,
        })),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
