// Live racing today, used by the header live-races strip.
// Sourced from TVG cosmo GraphQL `tracksWithMetadata` — returns one entry per
// active (non-finished, non-greyhound) track with the next race + MTP + status.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TVG_GQL = "https://api.tvg.com/cosmo/v1/graphql";

const QUERY = `
  query LiveTracks {
    tracksWithMetadata {
      tracks {
        code
        name
        shortName
        isFinished
        isGreyhound
        numberOfRaces
        currentRace {
          number
          mtp
          postTime
          status { code name }
        }
      }
    }
  }
`;

type TvgTrack = {
  code?: string;
  name?: string;
  shortName?: string | null;
  isFinished?: boolean;
  isGreyhound?: boolean;
  numberOfRaces?: number;
  currentRace?: {
    number?: string | null;
    mtp?: number | null;
    postTime?: string | null;
    status?: { code?: string | null; name?: string | null } | null;
  } | null;
};

// Lower rank = higher priority on the strip.
const STATUS_RANK: Record<string, number> = {
  IC: 0,  // up next
  MO: 1,  // opening soon
  O: 2,   // open for wagering
  RO: 2,
  SK: 3,  // scheduled
  RC: 5,  // closed
};

export async function GET() {
  try {
    const resp = await fetch(TVG_GQL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY }),
      cache: "no-store",
    });
    if (!resp.ok) {
      return NextResponse.json({ tracks: [], error: `TVG returned ${resp.status}` }, { status: 200 });
    }
    const gql = await resp.json();
    const raw: TvgTrack[] = gql?.data?.tracksWithMetadata?.tracks || [];

    const tracks = raw
      .filter(
        (t) =>
          !!t.code &&
          !!t.name &&
          t.isGreyhound === false &&
          t.isFinished === false &&
          !!t.currentRace
      )
      .map((t) => {
        const cr = t.currentRace!;
        return {
          code: t.code!,
          name: t.name!,
          shortName: t.shortName || null,
          raceNumber: cr.number ?? null,
          mtp: typeof cr.mtp === "number" ? cr.mtp : null,
          postTime: cr.postTime ?? null,
          status: cr.status?.code ?? null,
          statusName: cr.status?.name ?? null,
          totalRaces: typeof t.numberOfRaces === "number" ? t.numberOfRaces : null,
        };
      })
      .sort((a, b) => {
        const ra = STATUS_RANK[a.status || ""] ?? 9;
        const rb = STATUS_RANK[b.status || ""] ?? 9;
        if (ra !== rb) return ra - rb;
        const ma = typeof a.mtp === "number" ? a.mtp : 9999;
        const mb = typeof b.mtp === "number" ? b.mtp : 9999;
        return ma - mb;
      });

    return NextResponse.json(
      { tracks, fetchedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ tracks: [], error: msg }, { status: 200 });
  }
}
