import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/results?card_id=13          → all results for a card
// GET /api/results?card_id=13&race=3   → results for one race
// GET /api/results                     → all results (for optimizer)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const card_id = searchParams.get("card_id");
    const race    = searchParams.get("race");

    if (card_id && race) {
      const rows = await prisma.$queryRaw`
        SELECT * FROM "RaceResult"
        WHERE card_id = ${parseInt(card_id)} AND race_num = ${parseInt(race)}
        ORDER BY finish_pos ASC
      `;
      return NextResponse.json(rows);
    }

    if (card_id) {
      const rows = await prisma.$queryRaw`
        SELECT * FROM "RaceResult"
        WHERE card_id = ${parseInt(card_id)}
        ORDER BY race_num ASC, finish_pos ASC
      `;
      return NextResponse.json(rows);
    }

    // All results — for the weight optimizer
    const rows = await prisma.$queryRaw`
      SELECT * FROM "RaceResult" ORDER BY race_date ASC, race_num ASC, finish_pos ASC
    `;
    return NextResponse.json(rows);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/results
// Body: { card_id, race_num, race_date, results: [{ horse_name, finish_pos, paddockiq_rank, score, components }] }
// components = { spd, frm, cls, pce, jck, trn, wk, trend, ml }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { card_id, race_num, race_date, results } = body;

    if (!card_id || !race_num || !race_date || !Array.isArray(results)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert each horse result
    for (const r of results) {
      const { horse_name, finish_pos, paddockiq_rank, score, components } = r;
      const { spd=0, frm=0, cls=0, pce=0, jck=0, trn=0, wk=0, trend=0, ml=0 } = components || {};
      const won = finish_pos === 1;
      const bet_amount   = r.bet_amount   ?? null;
      const bet_type     = r.bet_type     ?? null;
      const bet_payout   = r.bet_payout   ?? null;
      const win_payoff   = r.win_payoff   ?? null;
      const place_payoff = r.place_payoff ?? null;
      const show_payoff  = r.show_payoff  ?? null;

      await prisma.$executeRaw`
        INSERT INTO "RaceResult"
          (card_id, race_num, race_date, horse_name, finish_pos, paddockiq_rank,
           score, spd, frm, cls, pce, jck, trn, wk, trend, ml, won,
           bet_amount, bet_type, bet_payout, win_payoff, place_payoff, show_payoff)
        VALUES
          (${card_id}, ${race_num}, ${race_date}, ${horse_name}, ${finish_pos},
           ${paddockiq_rank}, ${score}, ${spd}, ${frm}, ${cls}, ${pce},
           ${jck}, ${trn}, ${wk}, ${trend}, ${ml}, ${won},
           ${bet_amount}, ${bet_type}, ${bet_payout}, ${win_payoff}, ${place_payoff}, ${show_payoff})
        ON CONFLICT (card_id, race_num, horse_name) DO UPDATE SET
          finish_pos      = EXCLUDED.finish_pos,
          paddockiq_rank  = EXCLUDED.paddockiq_rank,
          score           = EXCLUDED.score,
          spd=EXCLUDED.spd, frm=EXCLUDED.frm, cls=EXCLUDED.cls,
          pce=EXCLUDED.pce, jck=EXCLUDED.jck, trn=EXCLUDED.trn,
          wk=EXCLUDED.wk,   trend=EXCLUDED.trend, ml=EXCLUDED.ml,
          won             = EXCLUDED.won,
          bet_amount      = EXCLUDED.bet_amount,
          bet_type        = EXCLUDED.bet_type,
          bet_payout      = EXCLUDED.bet_payout,
          win_payoff      = EXCLUDED.win_payoff,
          place_payoff    = EXCLUDED.place_payoff,
          show_payoff     = EXCLUDED.show_payoff,
          updated_at      = NOW()
      `;
    }

    return NextResponse.json({ ok: true, saved: results.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
