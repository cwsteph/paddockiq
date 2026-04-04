// Live/final odds fetcher — queries TVG for tote odds via bettingInterests
// GET /api/odds?track=OP&date=2026-04-03
// GET /api/odds?track=OP&date=2026-04-03&race=3
//
// Uses pastRaces query which returns bettingInterests with:
//   - morningLineOdds (ML)
//   - currentOdds (final tote odds / live odds if race is still open)
//
// During live racing, the `race()` query returns current pool odds.
// After the race, `pastRaces` returns the final closing odds.

import { NextRequest, NextResponse } from "next/server";

const TVG_GQL = "https://api.tvg.com/cosmo/v1/graphql";

// pastRaces query — works for completed + today's races
const PAST_QUERY = `
  query PastOdds($trackCode: String, $date: String, $raceNumber: String) {
    pastRaces(profile: "hpws", trackCode: $trackCode, date: $date, raceNumber: $raceNumber) {
      number
      surface { defaultCondition code }
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

// Live race query — works for upcoming/open races
const LIVE_QUERY = `
  query LiveOdds($track: String!, $number: String!) {
    race(profile: "hpws", track: $track, number: $number) {
      number
      status { code name }
      mtp
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
  // TVG ML often has null denominator (meaning X-1)
  const denom = odds.denominator ?? 1;
  return odds.numerator + "-" + denom;
}

interface RaceOdds {
  postTime?: string;
  status?: string;
  mtp?: number;
  runners: Record<string, {
    ml: string | null;
    live: string | null;
    scratched: boolean;
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseBettingInterests(bis: any[]): Record<string, { ml: string | null; live: string | null; scratched: boolean }> {
  const runners: Record<string, { ml: string | null; live: string | null; scratched: boolean }> = {};
  for (const bi of bis || []) {
    for (const r of bi.runners || []) {
      runners[r.horseName] = {
        ml: oddsToString(bi.morningLineOdds),
        live: oddsToString(bi.currentOdds),
        scratched: r.scratched || false,
      };
    }
  }
  return runners;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trackCode = searchParams.get("track") || "OP";
    const date = searchParams.get("date");
    const raceNum = searchParams.get("race");

    if (!date) {
      return NextResponse.json({ error: "Missing date param" }, { status: 400 });
    }

    const result: Record<number, RaceOdds> = {};
    let trackCondition: string | null = null;

    // Strategy: try live query first for specific race, then fall back to pastRaces
    if (raceNum) {
      // Try live first
      try {
        const liveResp = await fetch(TVG_GQL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: LIVE_QUERY, variables: { track: trackCode, number: raceNum } }),
        });
        const liveGql = await liveResp.json();
        const liveRace = liveGql.data?.race;
        if (liveRace?.bettingInterests?.length) {
          result[liveRace.number] = {
            status: liveRace.status?.name,
            mtp: liveRace.mtp,
            runners: parseBettingInterests(liveRace.bettingInterests),
          };
        }
      } catch { /* live query not available */ }

      // If live didn't work, try pastRaces
      if (!Object.keys(result).length) {
        const pastResp = await fetch(TVG_GQL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: PAST_QUERY, variables: { trackCode, date, raceNumber: raceNum } }),
        });
        const pastGql = await pastResp.json();
        for (const race of pastGql.data?.pastRaces || []) {
          if (race.bettingInterests?.length) {
            result[race.number] = { runners: parseBettingInterests(race.bettingInterests) };
            if (!trackCondition && race.surface?.defaultCondition) trackCondition = race.surface.defaultCondition;
          }
        }
      }
    } else {
      // Fetch all races — try race-by-race via pastRaces
      const promises = [];
      for (let r = 1; r <= 14; r++) {
        promises.push(
          fetch(TVG_GQL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: PAST_QUERY, variables: { trackCode, date, raceNumber: String(r) } }),
          }).then(resp => resp.json()).catch(() => null)
        );
      }
      const results = await Promise.all(promises);
      for (const gql of results) {
        if (!gql?.data?.pastRaces) continue;
        for (const race of gql.data.pastRaces) {
          if (race.bettingInterests?.length) {
            result[race.number] = { runners: parseBettingInterests(race.bettingInterests) };
            if (!trackCondition && race.surface?.defaultCondition) trackCondition = race.surface.defaultCondition;
          }
        }
      }

      // Also try live queries for races that didn't show up in pastRaces
      for (let r = 1; r <= 14; r++) {
        if (result[r]) continue;
        try {
          const liveResp = await fetch(TVG_GQL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: LIVE_QUERY, variables: { track: trackCode, number: String(r) } }),
          });
          const liveGql = await liveResp.json();
          const liveRace = liveGql.data?.race;
          if (liveRace?.bettingInterests?.length) {
            result[r] = {
              status: liveRace.status?.name,
              mtp: liveRace.mtp,
              runners: parseBettingInterests(liveRace.bettingInterests),
            };
          }
        } catch { /* live query not available for this race */ }
      }
    }

    if (!Object.keys(result).length) {
      return NextResponse.json({ error: "No odds found — track may not be running today" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      track: trackCode,
      date,
      races: result,
      trackCondition,
      fetchedAt: new Date().toISOString(),
    });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
