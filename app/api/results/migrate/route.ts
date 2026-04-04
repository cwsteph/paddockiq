import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/results/migrate  → creates RaceResult table if not exists
// Hit this once in browser after deploying, then you're done.
export async function GET() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "RaceResult" (
        id              SERIAL PRIMARY KEY,
        card_id         INTEGER NOT NULL,
        race_num        INTEGER NOT NULL,
        race_date       DATE    NOT NULL,
        horse_name      TEXT    NOT NULL,
        finish_pos      INTEGER,          -- NULL until result logged
        paddockiq_rank  INTEGER,          -- our model's rank (1 = top pick)
        score           NUMERIC,          -- final composite score
        -- component scores (raw, before weight multiply)
        spd             NUMERIC DEFAULT 0,
        frm             NUMERIC DEFAULT 0,
        cls             NUMERIC DEFAULT 0,
        pce             NUMERIC DEFAULT 0,
        jck             NUMERIC DEFAULT 0,
        trn             NUMERIC DEFAULT 0,
        wk              NUMERIC DEFAULT 0,
        trend           NUMERIC DEFAULT 0,
        ml              NUMERIC DEFAULT 0,
        won             BOOLEAN DEFAULT FALSE,
        -- Bet tracking
        bet_amount      NUMERIC,          -- how much was wagered (NULL = no bet)
        bet_type        TEXT,             -- 'WIN', 'WIN/PLACE', 'PLACE/SHOW'
        bet_payout      NUMERIC,          -- actual return from bet
        -- TVG payoffs (for all horses, not just bet ones)
        win_payoff      NUMERIC,          -- $2 win payoff
        place_payoff    NUMERIC,          -- $2 place payoff
        show_payoff     NUMERIC,          -- $2 show payoff
        source          TEXT DEFAULT 'manual', -- 'equibase' | 'manual'
        created_at      TIMESTAMPTZ DEFAULT now(),
        updated_at      TIMESTAMPTZ DEFAULT now(),
        UNIQUE (card_id, race_num, horse_name)
      )
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_raceresult_card ON "RaceResult" (card_id);
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_raceresult_won ON "RaceResult" (won);
    `;

    // Add closing odds columns (safe to run multiple times — IF NOT EXISTS)
    await prisma.$executeRaw`
      ALTER TABLE "RaceResult" ADD COLUMN IF NOT EXISTS closing_odds TEXT;
    `;
    await prisma.$executeRaw`
      ALTER TABLE "RaceResult" ADD COLUMN IF NOT EXISTS morning_line TEXT;
    `;
    await prisma.$executeRaw`
      ALTER TABLE "RaceResult" ADD COLUMN IF NOT EXISTS model_prob NUMERIC;
    `;
    await prisma.$executeRaw`
      ALTER TABLE "RaceResult" ADD COLUMN IF NOT EXISTS snapshot_at TIMESTAMPTZ;
    `;

    // Track column for per-track analysis
    await prisma.$executeRaw`
      ALTER TABLE "RaceResult" ADD COLUMN IF NOT EXISTS track TEXT;
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_raceresult_track ON "RaceResult" (track);
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_raceresult_date ON "RaceResult" (race_date);
    `;

    return NextResponse.json({ ok: true, message: "RaceResult table ready (with track + closing odds columns)" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
