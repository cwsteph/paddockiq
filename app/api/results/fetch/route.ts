import { NextRequest, NextResponse } from "next/server";

const TVG_GQL = "https://api.tvg.com/cosmo/v1/graphql";

const QUERY = `
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
    }
  }
`;

// GET /api/results/fetch?date=2026-03-27&race=1&track=OP
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date       = searchParams.get("date");       // YYYY-MM-DD
    const raceNumber = searchParams.get("race");        // "1", "2" ...
    const trackCode  = searchParams.get("track") || "OP";

    if (!date || !raceNumber) {
      return NextResponse.json({ error: "Missing date or race param" }, { status: 400 });
    }

    const resp = await fetch(TVG_GQL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: QUERY,
        variables: { trackCode, date, raceNumber }
      })
    });

    if (!resp.ok) {
      return NextResponse.json({ error: `TVG returned ${resp.status}` }, { status: 502 });
    }

    const gql = await resp.json();

    if (gql.errors) {
      return NextResponse.json({ error: gql.errors[0].message }, { status: 502 });
    }

    const races = gql.data?.pastRaces;
    if (!races || races.length === 0) {
      return NextResponse.json({ error: "No results found — race may not be official yet" }, { status: 404 });
    }

    const race    = races[0];
    const runners = race.results?.runners || [];

    if (runners.length === 0) {
      return NextResponse.json({ error: "Results not yet posted for this race" }, { status: 404 });
    }

    // Sort by finishPosition ascending, scratches last
    const sorted = [...runners].sort((a, b) => {
      if (a.scratched) return 1;
      if (b.scratched) return -1;
      return (a.finishPosition ?? 99) - (b.finishPosition ?? 99);
    });

    return NextResponse.json({
      ok: true,
      raceNumber: race.number,
      winningTime: race.results?.winningTime,
      runners: sorted.map(r => ({
        name:          r.runnerName,
        finishPos:     r.finishPosition,
        finishStatus:  r.finishStatus,
        scratched:     r.scratched,
        winPayoff:     r.winPayoff,
        placePayoff:   r.placePayoff,
        showPayoff:    r.showPayoff,
      }))
    });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
