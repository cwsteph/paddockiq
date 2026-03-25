import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const card = await (prisma as any).raceCard.findUnique({ where: { id: parseInt(id) } });
      return NextResponse.json(card);
    }
    const cards = await (prisma as any).raceCard.findMany({ orderBy: { raceDate: "asc" }, select: { id:true,track:true,raceDate:true,numRaces:true,savedAt:true,label:true } });
    return NextResponse.json(cards);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "err" }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  try {
    const { track, raceDate, numRaces, label, data } = await req.json();
    const card = await (prisma as any).raceCard.upsert({
      where: { track_raceDate: { track, raceDate } },
      update: { numRaces, label, data, savedAt: new Date() },
      create: { track, raceDate, numRaces, label: label||(track+" "+raceDate), data, savedAt: new Date() }
    });
    return NextResponse.json({ ok: true, id: card.id });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "err" }, { status: 500 });
  }
}
