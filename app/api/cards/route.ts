import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type RaceCardData = {
  track: string; raceDate: string; numRaces: number; label: string; data: string;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const card = await prisma.$queryRaw`SELECT * FROM "RaceCard" WHERE id = ${parseInt(id)} LIMIT 1`;
      return NextResponse.json(Array.isArray(card) ? card[0] : card);
    }
    const cards = await prisma.$queryRaw`SELECT id, track, "raceDate", "numRaces", "savedAt", label FROM "RaceCard" ORDER BY "raceDate" ASC`;
    return NextResponse.json(cards);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { track, raceDate, numRaces, label, data }: RaceCardData = await req.json();
    await prisma.$executeRaw`
      INSERT INTO "RaceCard" (track, "raceDate", "numRaces", label, data, "savedAt")
      VALUES (${track}, ${raceDate}, ${numRaces}, ${label}, ${data}, NOW())
      ON CONFLICT (track, "raceDate") DO UPDATE
      SET "numRaces"=${numRaces}, label=${label}, data=${data}, "savedAt"=NOW()
    `;
    const result = await prisma.$queryRaw`SELECT id FROM "RaceCard" WHERE track=${track} AND "raceDate"=${raceDate} LIMIT 1`;
    const id = Array.isArray(result) ? (result[0] as {id: number}).id : 0;
    return NextResponse.json({ ok: true, id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
