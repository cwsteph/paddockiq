import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/analysis — returns all race results grouped by card/race for aggregate analysis
// Each race row includes: our top pick, actual winner, component scores, finish positions
export async function GET() {
  try {
    // Get all results with finish positions (i.e., races that have been settled)
    const rows: Array<{
      card_id: number; race_num: number; race_date: string; track: string | null;
      horse_name: string; finish_pos: number | null; paddockiq_rank: number | null;
      score: number | null; won: boolean | null;
      spd: number; frm: number; cls: number; pce: number;
      jck: number; trn: number; wk: number; trend: number; ml: number;
      closing_odds: string | null; morning_line: string | null; model_prob: number | null;
      win_payoff: number | null; place_payoff: number | null;
      bet_amount: number | null; bet_type: string | null; bet_payout: number | null;
    }> = await prisma.$queryRaw`
      SELECT r.card_id, r.race_num, r.race_date,
             COALESCE(r.track, c.track) as track,
             r.horse_name, r.finish_pos, r.paddockiq_rank, r.score, r.won,
             r.spd, r.frm, r.cls, r.pce, r.jck, r.trn, r.wk, r.trend, r.ml,
             r.closing_odds, r.morning_line, r.model_prob,
             r.win_payoff, r.place_payoff,
             r.bet_amount, r.bet_type, r.bet_payout
      FROM "RaceResult" r
      LEFT JOIN "RaceCard" c ON c.id = r.card_id
      WHERE r.finish_pos IS NOT NULL
      ORDER BY r.race_date ASC, r.race_num ASC, r.paddockiq_rank ASC
    `;

    // Group into races
    const raceMap: Record<string, typeof rows> = {};
    for (const row of rows) {
      const key = `${row.card_id}_${row.race_num}`;
      if (!raceMap[key]) raceMap[key] = [];
      raceMap[key].push(row);
    }

    // Build race summaries
    const races = Object.values(raceMap).map(horses => {
      const first = horses[0];
      const topPick = horses.find(h => h.paddockiq_rank === 1);
      const winner = horses.find(h => h.finish_pos === 1);
      const winnerRank = winner ? horses.findIndex(h => h.horse_name === winner.horse_name) + 1 : null;

      return {
        cardId: first.card_id,
        raceNum: first.race_num,
        raceDate: String(first.race_date ?? '').slice(0, 10),
        track: first.track || "??",
        topPick: topPick ? {
          name: topPick.horse_name,
          score: Number(topPick.score),
          rank: topPick.paddockiq_rank,
          comps: {
            spd: Number(topPick.spd), frm: Number(topPick.frm), cls: Number(topPick.cls),
            pce: Number(topPick.pce), jck: Number(topPick.jck), trn: Number(topPick.trn),
            wk: Number(topPick.wk), trend: Number(topPick.trend), ml: Number(topPick.ml),
          },
          morningLine: topPick.morning_line,
          modelProb: topPick.model_prob ? Number(topPick.model_prob) : null,
        } : null,
        winner: winner ? {
          name: winner.horse_name,
          score: Number(winner.score),
          rank: winnerRank,
          finishPos: winner.finish_pos,
          comps: {
            spd: Number(winner.spd), frm: Number(winner.frm), cls: Number(winner.cls),
            pce: Number(winner.pce), jck: Number(winner.jck), trn: Number(winner.trn),
            wk: Number(winner.wk), trend: Number(winner.trend), ml: Number(winner.ml),
          },
          closingOdds: winner.closing_odds,
          winPayoff: winner.win_payoff ? Number(winner.win_payoff) : null,
        } : null,
        isHit: topPick && winner ? topPick.horse_name === winner.horse_name : false,
        winnerInTop3: winnerRank != null && winnerRank <= 3,
        fieldSize: horses.length,
        // Bet info if any
        bet: horses.filter(h => h.bet_amount != null).map(h => ({
          horse: h.horse_name,
          amount: Number(h.bet_amount),
          type: h.bet_type,
          payout: h.bet_payout ? Number(h.bet_payout) : 0,
        }))[0] || null,
      };
    });

    // Get distinct tracks
    const tracks = Array.from(new Set(races.map(r => r.track))).sort();

    return NextResponse.json({
      ok: true,
      totalRaces: races.length,
      tracks,
      races,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
