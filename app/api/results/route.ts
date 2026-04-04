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
    const { card_id, race_num, race_date, results, track: trackCode } = body;

    if (!card_id || !race_num || !race_date || !Array.isArray(results)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert each horse result
    for (const r of results) {
      const { horse_name, finish_pos, paddockiq_rank, score, components } = r;
      const { spd=0, frm=0, cls=0, pce=0, jck=0, trn=0, wk=0, trend=0, ml=0 } = components || {};
      const won = finish_pos === 1;
      const bet_amount    = r.bet_amount    ?? null;
      const bet_type      = r.bet_type      ?? null;
      const bet_payout    = r.bet_payout    ?? null;
      const win_payoff    = r.win_payoff    ?? null;
      const place_payoff  = r.place_payoff  ?? null;
      const show_payoff   = r.show_payoff   ?? null;
      const closing_odds  = r.closing_odds  ?? null;
      const morning_line  = r.morning_line  ?? null;
      const model_prob    = r.model_prob    ?? null;
      const source        = r.source        ?? 'manual';
      const track         = trackCode       ?? null;

      await prisma.$executeRaw`
        INSERT INTO "RaceResult"
          (card_id, race_num, race_date, horse_name, finish_pos, paddockiq_rank,
           score, spd, frm, cls, pce, jck, trn, wk, trend, ml, won,
           bet_amount, bet_type, bet_payout, win_payoff, place_payoff, show_payoff,
           closing_odds, morning_line, model_prob, source, track)
        VALUES
          (${card_id}, ${race_num}, ${race_date}::date, ${horse_name}, ${finish_pos},
           ${paddockiq_rank}, ${score}, ${spd}, ${frm}, ${cls}, ${pce},
           ${jck}, ${trn}, ${wk}, ${trend}, ${ml}, ${won},
           ${bet_amount}, ${bet_type}, ${bet_payout}, ${win_payoff}, ${place_payoff}, ${show_payoff},
           ${closing_odds}, ${morning_line}, ${model_prob}, ${source}, ${track})
        ON CONFLICT (card_id, race_num, horse_name) DO UPDATE SET
          finish_pos      = COALESCE(EXCLUDED.finish_pos, "RaceResult".finish_pos),
          paddockiq_rank  = COALESCE(EXCLUDED.paddockiq_rank, "RaceResult".paddockiq_rank),
          score           = COALESCE(EXCLUDED.score, "RaceResult".score),
          spd=COALESCE(EXCLUDED.spd, "RaceResult".spd),
          frm=COALESCE(EXCLUDED.frm, "RaceResult".frm),
          cls=COALESCE(EXCLUDED.cls, "RaceResult".cls),
          pce=COALESCE(EXCLUDED.pce, "RaceResult".pce),
          jck=COALESCE(EXCLUDED.jck, "RaceResult".jck),
          trn=COALESCE(EXCLUDED.trn, "RaceResult".trn),
          wk=COALESCE(EXCLUDED.wk, "RaceResult".wk),
          trend=COALESCE(EXCLUDED.trend, "RaceResult".trend),
          ml=COALESCE(EXCLUDED.ml, "RaceResult".ml),
          won             = COALESCE(EXCLUDED.won, "RaceResult".won),
          bet_amount      = COALESCE(EXCLUDED.bet_amount, "RaceResult".bet_amount),
          bet_type        = COALESCE(EXCLUDED.bet_type, "RaceResult".bet_type),
          bet_payout      = COALESCE(EXCLUDED.bet_payout, "RaceResult".bet_payout),
          win_payoff      = COALESCE(EXCLUDED.win_payoff, "RaceResult".win_payoff),
          place_payoff    = COALESCE(EXCLUDED.place_payoff, "RaceResult".place_payoff),
          show_payoff     = COALESCE(EXCLUDED.show_payoff, "RaceResult".show_payoff),
          closing_odds    = COALESCE(EXCLUDED.closing_odds, "RaceResult".closing_odds),
          morning_line    = COALESCE(EXCLUDED.morning_line, "RaceResult".morning_line),
          model_prob      = COALESCE(EXCLUDED.model_prob, "RaceResult".model_prob),
          source          = EXCLUDED.source,
          track           = COALESCE(EXCLUDED.track, "RaceResult".track),
          updated_at      = NOW()
      `;
    }

    return NextResponse.json({ ok: true, saved: results.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
