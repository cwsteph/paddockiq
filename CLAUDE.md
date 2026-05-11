# PaddockIQ

Next.js 14 + Prisma + Neon Postgres horse-racing handicapper. Deploys to Netlify. Used live at Oaklawn and Keeneland; targeting Kentucky Derby.

## Stack

- Next.js 14.2 (App Router) + React 18 + TypeScript
- Prisma 5 → Neon Postgres (`DATABASE_URL` in `.env`)
- Tailwind 3, Zustand for client state
- Netlify deploy via `@netlify/plugin-nextjs`

## Commands

```bash
npm run dev      # local dev on :3000
npm run build    # production build — run before claiming any feature complete
npm run lint     # next lint
```

`backtest/` is a separate Node project with its own `package.json`; `cd backtest && node ingest-parallel.js` etc.

## Layout

- `app/` — Next.js routes + API handlers
- `prisma/schema.prisma` — Bankroll, Bet, BankrollSnapshot, RaceCard models. Race cards stored as JSON strings keyed `(track, raceDate)`.
- `public/lib/betting-core.js` — **shared with DugoutIQ** (copy-paste, not symlinked). If you change odds/Kelly/EV math here, mirror to `~/dugoutiq/public/lib/betting-core.js` in the same change.
- `backtest/` — standalone Node scripts for ingesting DRF CSVs and running backtests against historical data
- `today/` — scratch / today's-card workspace

## Conventions

- **DRF CSV quirk**: only the first horse per race row populates `R_RCTrack`. Don't spread later rows over the first — empty strings overwrite the carried-forward track code. Always carry race-level fields forward, then overlay horse fields.
- **Ranker rules** (don't re-add as score multipliers): SP weight ~30%, no connection/applied-blend/company boosts. Backtest cohort sizes worth quoting in commits (e.g. "609K runner backtest, 66K races, 17 tracks").
- **Restyle, don't rebuild**: when applying a UI mockup, keep the live route, fetchers, and dropdowns intact. Don't swap a static mock in as the live URL.
- **Local server dies on sleep/reboot**: when "localhost not populating" comes up, check `netstat -ano | grep 3000` before reading code.

## Verification before claiming done

Run `npm run build` and `npm run lint`. For schema changes, also `npx prisma generate` and a `npx prisma migrate` against a non-prod branch.

## Model selection

- Opus 4.7: ranker math, simulation, prisma migrations, anything betting-logic
- Sonnet 4.6: SQL exploration, light UI work, route handlers
- Haiku 4.5: log/trace summarization, race-card text munging

## Writing style

Conventional-commit prefixes (`feat:`, `fix:`, `refactor:`), lowercase. Bullets with concrete numbers. When fixing a non-obvious bug, explain the *mechanism*, not just the symptom.
