import { NextRequest, NextResponse } from "next/server";

const TVG_GQL = "https://api.tvg.com/cosmo/v1/graphql";

const RESULTS_QUERY = `
  query PastRace($trackCode: String, $date: String, $raceNumber: String) {
    pastRaces(profile: "hpws", trackCode: $trackCode, date: $date, raceNumber: $raceNumber) {
      number
      results {
        winningTime
        runners {
          runnerName
          finishPosition
          finishStatus
          scratched
          winPayoff
          placePayoff
          showPayoff
        }
      }
      bettingInterests {
        biNumber
        morningLineOdds { numerator denominator }
        currentOdds { numerator denominator }
        runners {
          horseName
          scratched
        }
      }
    }
  }
`;

function oddsToString(odds: { numerator?: number | null; denominator?: number | null } | null): string | null {
  if (!odds || odds.numerator == null) return null;
  const denom = odds.denominator ?? 1;
  return odds.numerator + "-" + denom;
}

interface RunnerResult {
  name: string;
  finishPos: number | null;
  finishStatus: string | null;
  scratched: boolean;
  winPayoff: number | null;
  placePayoff: number | null;
  showPayoff: number | null;
  finalOdds: string | null;
  morningLine: string | null;
}

interface RaceResult {
  raceNumber: number;
  winningTime: number | null;
  runners: RunnerResult[];
}

async function fetchRace(trackCode: string, date: string, raceNumber: number): Promise<RaceResult | null> {
  try {
    const resp = await fetch(TVG_GQL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: RESULTS_QUERY,
        variables: { trackCode, date, raceNumber: String(raceNumber) },
      }),
    });

    if (!resp.ok) return null;
    const gql = await resp.json();
    if (gql.errors) return null;

    const race = gql.data?.pastRaces?.[0];
    if (!race) return null;

    const resultRunners = race.results?.runners || [];
    const bis = race.bettingInterests || [];

    // Build odds map from bettingInterests
    const oddsMap: Record<string, { final: string | null; ml: string | null; scratched: boolean }> = {};
    for (const bi of bis) {
      for (const r of bi.runners || []) {
        oddsMap[r.horseName] = {
          final: oddsToString(bi.currentOdds),
          ml: oddsToString(bi.morningLineOdds),
          scratched: r.scratched || false,
        };
      }
    }

    if (resultRunners.length === 0 && Object.keys(oddsMap).length === 0) {
      return null;
    }

    // Merge results with odds
    const runners: RunnerResult[] = resultRunners
      .sort((a: { finishPosition?: number; scratched?: boolean }, b: { finishPosition?: number; scratched?: boolean }) => {
        if (a.scratched) return 1;
        if (b.scratched) return -1;
        return (a.finishPosition ?? 99) - (b.finishPosition ?? 99);
      })
      .map((r: { runnerName: string; finishPosition?: number; finishStatus?: string; scratched?: boolean; winPayoff?: number; placePayoff?: number; showPayoff?: number }) => {
        const odds = oddsMap[r.runnerName];
        return {
          name: r.runnerName,
          finishPos: r.finishPosition ?? null,
          finishStatus: r.finishStatus ?? null,
          scratched: r.scratched || odds?.scratched || false,
          winPayoff: r.winPayoff ?? null,
          placePayoff: r.placePayoff ?? null,
          showPayoff: r.showPayoff ?? null,
          finalOdds: odds?.final ?? null,
          morningLine: odds?.ml ?? null,
        };
      });

    // Add any horses that are in odds but not in results (scratches before race)
    for (const [name, odds] of Object.entries(oddsMap)) {
      if (!runners.find(r => r.name === name)) {
        runners.push({
          name,
          finishPos: null,
          finishStatus: odds.scratched ? "Scratched" : null,
          scratched: odds.scratched,
          winPayoff: null,
          placePayoff: null,
          showPayoff: null,
          finalOdds: odds.final,
          morningLine: odds.ml,
        });
      }
    }

    return {
      raceNumber: parseInt(race.number),
      winningTime: race.results?.winningTime ?? null,
      runners,
    };
  } catch {
    return null;
  }
}

// GET /api/results/fetch-all?track=OP&date=2026-04-03&races=10
// Fetches results + final odds for ALL races in parallel from TVG
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trackCode = searchParams.get("track") || "OP";
    const date = searchParams.get("date");
    const numRaces = parseInt(searchParams.get("races") || "14");

    if (!date) {
      return NextResponse.json({ error: "Missing date param" }, { status: 400 });
    }

    const cap = Math.min(numRaces, 14);

    // Fetch all races in parallel
    const promises = [];
    for (let r = 1; r <= cap; r++) {
      promises.push(fetchRace(trackCode, date, r));
    }
    const results = await Promise.all(promises);

    const races: Record<number, RaceResult> = {};
    let totalRunners = 0;
    for (const race of results) {
      if (race) {
        races[race.raceNumber] = race;
        totalRunners += race.runners.length;
      }
    }

    if (!Object.keys(races).length) {
      return NextResponse.json({ error: "No results found — track may not have run or results not yet official" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      track: trackCode,
      date,
      numRaces: Object.keys(races).length,
      totalRunners,
      races,
      fetchedAt: new Date().toISOString(),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
