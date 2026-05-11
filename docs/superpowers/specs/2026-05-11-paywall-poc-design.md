# PaddockIQ Paywall POC — Design

**Date:** 2026-05-11
**Status:** Approved, ready for implementation plan
**Purpose:** Wire a real Stripe test-mode subscription flow + Clerk auth into PaddockIQ so:
1. The full subscription/payment plumbing exists and works end-to-end (future-proof for real monetization).
2. A LinkedIn visitor lands on the live product, sees what was built, and can optionally sign up + "subscribe" via Stripe test card.
3. Personal-data sections (bankroll, Kelly sim using user's bankroll, Venmo importer, personal bet log) are gated behind premium; product depth (rankings, odds, exotics, news, backtest charts) is public.

## Non-goals

- Real-money charges. Stripe stays in test mode throughout this POC.
- Multi-tenant isolation of historical race-card data. Race cards remain shared (they are public-domain results).
- DRM-grade gating. Blur+overlay on premium sections is a UX gate, not a security boundary; the underlying data is non-sensitive (Charles's historical bets).

## Architecture

### Routes

| Path | Type | Auth | Purpose |
|------|------|------|---------|
| `/` | Static SPA (`public/index.html`) | Public | Existing Keeneland-styled live product — unchanged surface area |
| `/account` | Next.js page | Clerk-protected (redirects to sign-in) | Account home: subscription status, "Manage billing" → Stripe portal |
| `/sign-in`, `/sign-up` | Clerk catch-all routes | Public | Clerk-hosted UI |
| `/pricing` | Next.js page | Public | Single plan card, "Subscribe — $9/mo (Stripe test mode)" + POC disclaimer banner |
| `/api/me` | Route handler | Reads Clerk session | Returns `{ signedIn, isPremium }` — called by `index.html` on load |
| `/api/stripe/checkout` | Route handler | Requires Clerk session | Creates Stripe Checkout session, returns `url` to redirect to |
| `/api/stripe/portal` | Route handler | Requires Clerk session + active customer | Creates Stripe Billing Portal session |
| `/api/stripe/webhook` | Route handler | Stripe signature only | Handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` |
| `/api/clerk/webhook` | Route handler | Clerk signature only | Handles `user.created` → upsert `User` row |

### Data model additions

```prisma
model User {
  id                    String   @id @default(cuid())
  clerkId               String   @unique
  email                 String   @unique
  stripeCustomerId      String?  @unique
  stripeSubscriptionId  String?  @unique
  plan                  String   @default("free")    // "free" | "premium"
  currentPeriodEnd      DateTime?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

// Existing models get optional user scope so future sign-ups don't share Charles's data:
model Bankroll {
  // ...existing fields...
  userId String?
  user   User?   @relation(fields: [userId], references: [id])
}

model Bet {
  // ...existing fields...
  userId String?
  user   User?   @relation(fields: [userId], references: [id])
}

model BankrollSnapshot {
  // ...existing fields...
  userId String?
  user   User?   @relation(fields: [userId], references: [id])
}
```

`userId` is nullable so existing rows (Charles's) keep working without a backfill. New rows from signed-in users carry their `userId`. API handlers (`/api/bankroll`, etc.) scope reads/writes by Clerk session → `User.id` when present, fall back to the anonymous shared dataset when not.

### Premium gating in the SPA

`public/index.html` is a static SPA. Approach:

1. On load, JS calls `GET /api/me` → sets `window.IS_PREMIUM` and `window.SIGNED_IN`.
2. A small `applyGates()` helper finds elements tagged `data-premium="1"` and either:
   - Reveals them (when `IS_PREMIUM === true`)
   - Wraps them in a blur+overlay div with a "Subscribe to unlock" CTA → `/pricing`
3. Header bankroll badge is replaced for free users with a `Sign in` / `Subscribe` button cluster.

**Gated elements** (`data-premium="1"`):
- `#br-badge` + bankroll popover (header)
- Analysis tab: Kelly sim panel, Venmo importer panel, personal bet log section, date filters that act on personal bets

**Not gated** (stays public):
- All race-tab Rankings content
- Odds, Exotics, News tabs in full
- Analysis tab backtest-cohort charts (609K runner stats, win rates by component, ROI by gap-size)

### Payment flow (happy path)

1. Visitor lands on `/`, sees product. Clicks "Subscribe" in header → `/pricing`.
2. Not signed in → `/pricing` shows "Sign in to subscribe" → redirects through Clerk sign-up.
3. After Clerk sign-up, Clerk webhook `user.created` fires → POST `/api/clerk/webhook` → upserts `User` row with `clerkId` + `email`, `plan='free'`.
4. User returns to `/pricing`, clicks "Subscribe $9/mo". Browser POSTs `/api/stripe/checkout`.
5. Server reads Clerk session, looks up `User`. Creates or retrieves Stripe Customer (stores `stripeCustomerId` on `User`). Creates Checkout Session with `client_reference_id = User.id`, `metadata.userId = User.id`. Returns `session.url`.
6. Browser redirects to Stripe Checkout. User pays with `4242 4242 4242 4242` (test mode).
7. Stripe redirects to `/account?subscribed=1`. Toast: "Welcome to Premium."
8. In parallel, Stripe fires `checkout.session.completed` → `/api/stripe/webhook` → looks up `User` by `metadata.userId` → sets `stripeSubscriptionId`, `plan='premium'`, `currentPeriodEnd`.
9. On next page load, `/api/me` returns `{ isPremium: true }` → SPA reveals gated content.

### Webhook event handling

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Set `stripeSubscriptionId`, `plan='premium'`, `currentPeriodEnd` on user |
| `customer.subscription.updated` | Refresh `currentPeriodEnd`. If `status` in `('canceled','unpaid','past_due','incomplete_expired')` → `plan='free'` |
| `customer.subscription.deleted` | `plan='free'`, clear `stripeSubscriptionId` |
| (Clerk) `user.created` | Upsert `User` with `clerkId`, `email`, `plan='free'` |
| (Clerk) `user.updated` | Update `email` if changed |
| (Clerk) `user.deleted` | Hard-delete `User` (Stripe cleanup handled via portal cancellation flow separately) |

All webhook handlers verify the signature header and return 200 quickly; any DB work that fails logs and 500s so Stripe/Clerk retries.

### Premium check semantics

`isPremium = plan === 'premium' && currentPeriodEnd && currentPeriodEnd > now()`

The `currentPeriodEnd` guard means a cancelled-mid-period user keeps premium until period end (matches Stripe's default behavior). If the webhook fails to fire, the user is correctly downgraded after period end without us needing an active poll.

## Configuration

New env vars (Netlify + `.env.example`):

```
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...        # single $9/mo price object created in Stripe dashboard

NEXT_PUBLIC_APP_URL=https://paddockiq.netlify.app  # used to construct Checkout success/cancel URLs
```

`.env.example` gets committed; real values go in Netlify env config only.

## Testing strategy

1. **Local Stripe webhook**: `stripe listen --forward-to localhost:3000/api/stripe/webhook` during dev. Verify webhook secret matches the one printed by the CLI.
2. **Local Clerk webhook**: ngrok or Clerk's local dev mode → verify `user.created` fires when a test user signs up.
3. **End-to-end manual test sequence**:
   - Visit `/` as anon → confirm premium sections blurred, header shows "Sign in"
   - Sign up via Clerk → confirm `User` row created in Neon
   - Visit `/pricing` → click Subscribe → 4242 card → land on `/account?subscribed=1`
   - Confirm webhook fired (Stripe CLI output), `User.plan='premium'`, `currentPeriodEnd` set
   - Visit `/` → confirm premium sections now visible, bankroll badge restored
   - Click "Manage billing" → land on Stripe portal → cancel subscription
   - Confirm `customer.subscription.deleted` webhook fires, `User.plan='free'`
   - Visit `/` → confirm premium sections re-blurred
4. **Regression check**: existing single-user betting flow still works for Charles (anonymous, no userId on his existing data).
5. **Build/lint gates**: `npm run build` and `npm run lint` clean before merge. `npx prisma generate` after schema change.

## Risks / things to call out

| Risk | Mitigation |
|------|------------|
| Existing `Bet`/`Bankroll` rows aren't user-scoped; first stranger to subscribe could see/modify Charles's data | Add nullable `userId` FK in this round. API handlers scope by Clerk session when present. Charles's existing rows remain `userId=null` and are only readable by anonymous/Charles's session. |
| Stripe webhook signature mismatches fail silently | Always verify locally with `stripe listen` before deploy. Log signature failures explicitly. |
| LinkedIn visitor charges a real card by accident | "POC — Stripe test mode, no real charges" banner on `/pricing` + on the subscribe button. |
| Blur+overlay gate is bypassable in devtools | Acknowledged: this is a UX gate. Underlying data is Charles's own historical bets, non-sensitive. Don't frame as "secure." |
| Clerk free tier (10K MAU) cap | Portfolio scale only. Documented in this spec. Migrate or pay if it ever matters. |
| Netlify static `public/index.html` and Next.js app coexisting | The static file is served by Next.js from `public/`. Adding new Next.js pages (`/account`, `/pricing`) doesn't conflict because they live in `app/`. Verify routing precedence after first deploy. |
| Existing `/api/bankroll` etc. don't know about users | API handlers updated to: if Clerk session present → scope by user. If not → preserve current single-tenant behavior. No frontend change needed for anonymous users. |

## Scope boundary

**In scope:**
- Clerk auth + user model
- Stripe Checkout + webhook + portal
- `/pricing`, `/account`, `/api/me`
- `data-premium` gates on bankroll badge, Kelly sim, Venmo importer, personal bet log
- `userId` FKs on `Bet`, `Bankroll`, `BankrollSnapshot`
- POC disclaimer banner on pricing
- `.env.example` + Netlify env vars
- Build/lint clean, manual end-to-end test

**Out of scope (future):**
- Multi-tier plans (Single Track / All Access / Triple Crown Pass)
- Affiliate sportsbook deep links
- Email notifications (subscription welcome, cancellation)
- Server-side rendering of gated sections (currently client-side blur)
- Real-mode Stripe keys / production launch
- Migrating Charles's existing rows to a `userId`
