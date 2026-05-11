# PaddockIQ Paywall POC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Clerk auth + Stripe (test-mode) subscription into PaddockIQ so the live product stays public, and personal-data sections (bankroll, Kelly sim, Venmo importer, personal bet log) become premium-gated.

**Architecture:** Add a `User` model in Prisma keyed to Clerk's `userId`. Stripe Checkout creates a subscription; webhook updates `user.plan`. The static SPA at `public/index.html` calls `/api/me` on load, sets `window.IS_PREMIUM`, and an `applyGates()` helper blurs `[data-premium]` nodes for non-premium visitors. Existing `Bet`/`Bankroll` rows are scoped by optional `userId`; legacy rows (Charles's) stay accessible to anonymous sessions.

**Tech Stack:** Next.js 14 (App Router), Prisma 5 + Neon Postgres, `@clerk/nextjs`, `stripe` (Node SDK), `svix` (Clerk webhook signature verification).

**Spec:** `docs/superpowers/specs/2026-05-11-paywall-poc-design.md`

**Charles's commit rule:** Per `~/.claude/CLAUDE.md`, do NOT run `git commit` autonomously. At the end of each task, stage files with `git add` and **wait for Charles to OK the commit** before proceeding. Suggested commit messages are provided.

---

## File Structure

**New files:**
- `lib/db.ts` — singleton `PrismaClient` (extracted; current routes instantiate fresh clients per route, leaking in dev)
- `lib/auth.ts` — `getCurrentUser()` helper, reads Clerk session → DB `User`
- `lib/premium.ts` — `isPremium(user)` pure function + unit test
- `lib/premium.test.ts` — Node-native test (`node --test`)
- `lib/stripe.ts` — `getStripe()` singleton
- `middleware.ts` — Clerk middleware
- `app/api/me/route.ts` — returns `{ signedIn, isPremium }`
- `app/api/clerk/webhook/route.ts` — handle `user.created`/`user.updated`/`user.deleted`
- `app/api/stripe/checkout/route.ts` — create Checkout session
- `app/api/stripe/portal/route.ts` — create Billing Portal session
- `app/api/stripe/webhook/route.ts` — handle subscription events
- `app/sign-in/[[...rest]]/page.tsx` — Clerk catch-all
- `app/sign-up/[[...rest]]/page.tsx` — Clerk catch-all
- `app/pricing/page.tsx` — pricing + Subscribe button
- `app/account/page.tsx` — account home, manage billing
- `.env.example` — committed; lists every required env var

**Modified files:**
- `package.json` — add `@clerk/nextjs`, `stripe`, `svix`
- `prisma/schema.prisma` — add `User` model + optional `userId` FK on `Bet`, `Bankroll`, `BankrollSnapshot`
- `app/layout.tsx` — wrap in `<ClerkProvider>`
- `app/api/bankroll/route.ts` — scope by `User.id` when Clerk session present
- `public/index.html` — `data-premium` attributes + `applyGates()` JS + `/api/me` fetch on load + Subscribe/Account header buttons

---

## Task 1: Install dependencies and create `.env.example`

**Files:**
- Modify: `package.json`
- Create: `.env.example`

- [ ] **Step 1: Install Clerk, Stripe, svix**

Run:
```bash
cd C:/Users/Charles/paddockiq && npm install @clerk/nextjs@^5 stripe@^17 svix@^1
```

Expected: three deps added to `package.json`, lockfile updated.

- [ ] **Step 2: Create `.env.example` with every required key**

Create `.env.example`:

```
# Database (already in use)
DATABASE_URL=postgres://...

# Clerk — Auth (https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe — Test Mode Only for POC (https://dashboard.stripe.com/test)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# App URL (used to build Checkout success/cancel URLs)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 3: Verify install**

Run:
```bash
cd C:/Users/Charles/paddockiq && npm ls @clerk/nextjs stripe svix
```

Expected: three packages listed with no errors.

- [ ] **Step 4: Stage**

```bash
cd C:/Users/Charles/paddockiq && git add package.json package-lock.json .env.example
```

**Suggested commit:** `chore: add clerk, stripe, svix deps + .env.example for paywall POC`

---

## Task 2: Prisma schema — add `User` + optional `userId` FKs

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Update schema**

Replace `prisma/schema.prisma` contents with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                   String    @id @default(cuid())
  clerkId              String    @unique
  email                String    @unique
  stripeCustomerId     String?   @unique
  stripeSubscriptionId String?   @unique
  plan                 String    @default("free") // "free" | "premium"
  currentPeriodEnd     DateTime?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  bankrolls Bankroll[]
  bets      Bet[]
  snapshots BankrollSnapshot[]
}

model Bankroll {
  id        Int      @id @default(autoincrement())
  amount    Float
  updatedAt DateTime @updatedAt
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])

  @@index([userId])
}

model Bet {
  id        Int      @id @default(autoincrement())
  track     String
  raceDate  String
  race      Int
  betType   String
  horses    String
  amount    Float
  toWin     Float?
  result    String?
  payout    Float?
  createdAt DateTime @default(now())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])

  @@index([userId])
}

model BankrollSnapshot {
  id        Int      @id @default(autoincrement())
  amount    Float
  createdAt DateTime @default(now())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])

  @@index([userId])
}

model RaceCard {
  id       Int      @id @default(autoincrement())
  track    String
  raceDate String
  numRaces Int      @default(10)
  label    String
  data     String
  savedAt  DateTime @default(now())

  @@unique([track, raceDate])
}
```

- [ ] **Step 2: Generate Prisma client**

Run:
```bash
cd C:/Users/Charles/paddockiq && npx prisma generate
```

Expected: `✔ Generated Prisma Client (...)` — no errors.

- [ ] **Step 3: Apply migration to Neon dev branch**

Run:
```bash
cd C:/Users/Charles/paddockiq && npx prisma migrate dev --name add_user_and_user_scoping
```

Expected: migration file created in `prisma/migrations/`, Neon DB updated. **If `DATABASE_URL` points to prod**, abort and switch to a Neon dev branch first.

- [ ] **Step 4: Stage**

```bash
cd C:/Users/Charles/paddockiq && git add prisma/schema.prisma prisma/migrations/
```

**Suggested commit:** `feat: add User model + optional userId FK on Bet/Bankroll/BankrollSnapshot`

---

## Task 3: Singletons (`lib/db.ts`, `lib/stripe.ts`)

**Files:**
- Create: `lib/db.ts`
- Create: `lib/stripe.ts`

- [ ] **Step 1: Create `lib/db.ts`**

Per Next.js + Prisma docs: avoid re-instantiating client on hot reload.

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 2: Create `lib/stripe.ts`**

```ts
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  _stripe = new Stripe(key, { apiVersion: "2024-11-20.acacia" });
  return _stripe;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run:
```bash
cd C:/Users/Charles/paddockiq && npx tsc --noEmit
```

Expected: no errors related to `lib/db.ts` or `lib/stripe.ts`.

- [ ] **Step 4: Stage**

```bash
cd C:/Users/Charles/paddockiq && git add lib/
```

**Suggested commit:** `feat: add prisma + stripe singletons in lib/`

---

## Task 4: Premium helper + unit test (TDD)

**Files:**
- Create: `lib/premium.ts`
- Create: `lib/premium.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/premium.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { isPremium } from "./premium";

test("free plan is never premium", () => {
  assert.equal(isPremium({ plan: "free", currentPeriodEnd: null }), false);
});

test("premium plan with future period end is premium", () => {
  const future = new Date(Date.now() + 1000 * 60 * 60 * 24);
  assert.equal(isPremium({ plan: "premium", currentPeriodEnd: future }), true);
});

test("premium plan with past period end is not premium", () => {
  const past = new Date(Date.now() - 1000 * 60 * 60 * 24);
  assert.equal(isPremium({ plan: "premium", currentPeriodEnd: past }), false);
});

test("premium plan with null period end is not premium", () => {
  assert.equal(isPremium({ plan: "premium", currentPeriodEnd: null }), false);
});

test("null user is not premium", () => {
  assert.equal(isPremium(null), false);
});
```

- [ ] **Step 2: Run test — verify it fails**

Run:
```bash
cd C:/Users/Charles/paddockiq && npx tsx --test lib/premium.test.ts
```

Expected: failure — "Cannot find module './premium'" or similar.

If `tsx` not installed, install: `npm install -D tsx`.

- [ ] **Step 3: Implement minimal `lib/premium.ts`**

```ts
export type PremiumCheckUser = {
  plan: string;
  currentPeriodEnd: Date | null;
} | null;

export function isPremium(user: PremiumCheckUser): boolean {
  if (!user) return false;
  if (user.plan !== "premium") return false;
  if (!user.currentPeriodEnd) return false;
  return user.currentPeriodEnd.getTime() > Date.now();
}
```

- [ ] **Step 4: Run test — verify it passes**

Run:
```bash
cd C:/Users/Charles/paddockiq && npx tsx --test lib/premium.test.ts
```

Expected: `# pass 5` (all 5 tests pass).

- [ ] **Step 5: Stage**

```bash
cd C:/Users/Charles/paddockiq && git add lib/premium.ts lib/premium.test.ts package.json package-lock.json
```

**Suggested commit:** `feat: add isPremium() helper with unit tests`

---

## Task 5: Clerk middleware + auth helper

**Files:**
- Create: `middleware.ts`
- Create: `lib/auth.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add Clerk middleware**

Create `middleware.ts` at repo root:

```ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next internals and static files unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

- [ ] **Step 2: Wrap layout in `<ClerkProvider>`**

Update `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "PaddockIQ — Horse Racing Analysis",
  description: "Professional horse racing analysis and handicapping",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${sans.variable} ${mono.variable}`}>
        <body className="bg-bg text-base">{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 3: Create `lib/auth.ts`**

```ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "./db";

export type CurrentUser = Awaited<ReturnType<typeof prisma.user.findUnique>>;

export async function getCurrentUser(): Promise<CurrentUser> {
  const { userId } = auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}
```

- [ ] **Step 4: Verify build with env vars stubbed**

Add real Clerk test keys to `.env` (not `.env.example`). Without them, Clerk middleware will throw at request time but build should still pass:

Run:
```bash
cd C:/Users/Charles/paddockiq && npm run build
```

Expected: build completes. If it errors on missing Clerk env vars, set them in `.env` first.

- [ ] **Step 5: Stage**

```bash
cd C:/Users/Charles/paddockiq && git add middleware.ts lib/auth.ts app/layout.tsx
```

**Suggested commit:** `feat: wire clerk middleware + getCurrentUser helper`

---

## Task 6: `/api/me` route

**Files:**
- Create: `app/api/me/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isPremium } from "@/lib/premium";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({
    signedIn: !!user,
    isPremium: isPremium(user),
    email: user?.email ?? null,
  });
}
```

Note: `@/lib/*` requires path alias in `tsconfig.json`. Verify `paths: { "@/*": ["./*"] }` exists — if not, add it.

- [ ] **Step 2: Verify alias in tsconfig**

Read `tsconfig.json`. If `compilerOptions.paths` lacks `@/*`, add:

```json
"baseUrl": ".",
"paths": { "@/*": ["./*"] }
```

- [ ] **Step 3: Test manually**

Start dev server:
```bash
cd C:/Users/Charles/paddockiq && npm run dev
```

In browser, visit `http://localhost:3000/api/me`. Expected response (anonymous):
```json
{ "signedIn": false, "isPremium": false, "email": null }
```

- [ ] **Step 4: Stage**

```bash
cd C:/Users/Charles/paddockiq && git add app/api/me/ tsconfig.json
```

**Suggested commit:** `feat: add /api/me route — returns auth + premium state`

---

## Task 7: Clerk sign-in / sign-up pages + Clerk webhook

**Files:**
- Create: `app/sign-in/[[...rest]]/page.tsx`
- Create: `app/sign-up/[[...rest]]/page.tsx`
- Create: `app/api/clerk/webhook/route.ts`

- [ ] **Step 1: Sign-in page**

`app/sign-in/[[...rest]]/page.tsx`:

```tsx
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 20px" }}>
      <SignIn />
    </div>
  );
}
```

- [ ] **Step 2: Sign-up page**

`app/sign-up/[[...rest]]/page.tsx`:

```tsx
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 20px" }}>
      <SignUp />
    </div>
  );
}
```

- [ ] **Step 3: Configure Clerk URLs in `.env`**

Add to `.env`:
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

- [ ] **Step 4: Clerk webhook route**

`app/api/clerk/webhook/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type ClerkEvent =
  | { type: "user.created" | "user.updated"; data: { id: string; email_addresses: Array<{ email_address: string }> } }
  | { type: "user.deleted"; data: { id: string } };

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "missing webhook secret" }, { status: 500 });

  const svixId = req.headers.get("svix-id");
  const svixTs = req.headers.get("svix-timestamp");
  const svixSig = req.headers.get("svix-signature");
  if (!svixId || !svixTs || !svixSig) {
    return NextResponse.json({ error: "missing svix headers" }, { status: 400 });
  }

  const body = await req.text();
  let evt: ClerkEvent;
  try {
    evt = new Webhook(secret).verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTs,
      "svix-signature": svixSig,
    }) as ClerkEvent;
  } catch (err) {
    console.error("[clerk webhook] signature verification failed", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    if (evt.type === "user.created" || evt.type === "user.updated") {
      const email = evt.data.email_addresses[0]?.email_address;
      if (!email) return NextResponse.json({ error: "no email" }, { status: 400 });
      await prisma.user.upsert({
        where: { clerkId: evt.data.id },
        update: { email },
        create: { clerkId: evt.data.id, email, plan: "free" },
      });
    } else if (evt.type === "user.deleted") {
      await prisma.user.deleteMany({ where: { clerkId: evt.data.id } });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[clerk webhook] handler failed", err);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }
}
```

- [ ] **Step 5: Test manually with ngrok or Clerk's dashboard**

In Clerk dashboard → Webhooks → Add endpoint → `https://<ngrok-url>/api/clerk/webhook` → subscribe to `user.created`, `user.updated`, `user.deleted` → copy webhook secret to `.env`.

Sign up a test user at `http://localhost:3000/sign-up`. Verify in Neon SQL editor:

```sql
SELECT * FROM "User" ORDER BY "createdAt" DESC LIMIT 5;
```

Expected: one row matching the test user's `clerkId` and `email`.

- [ ] **Step 6: Stage**

```bash
cd C:/Users/Charles/paddockiq && git add app/sign-in/ app/sign-up/ app/api/clerk/
```

**Suggested commit:** `feat: add clerk sign-in/sign-up pages + user.created webhook`

---

## Task 8: Stripe Checkout route

**Files:**
- Create: `app/api/stripe/checkout/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "sign in required" }, { status: 401 });

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) return NextResponse.json({ error: "STRIPE_PRICE_ID not set" }, { status: 500 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const stripe = getStripe();

  // Reuse or create Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id, clerkId: user.clerkId },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id,
    metadata: { userId: user.id },
    success_url: `${appUrl}/account?subscribed=1`,
    cancel_url: `${appUrl}/pricing?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
```

- [ ] **Step 2: Manual test via curl (requires signed-in cookie)**

Easier: defer to Task 10 (pricing page calls this with a real Clerk session).

- [ ] **Step 3: Stage**

```bash
cd C:/Users/Charles/paddockiq && git add app/api/stripe/checkout/
```

**Suggested commit:** `feat: add stripe checkout route — creates subscription session`

---

## Task 9: Stripe webhook route

**Files:**
- Create: `app/api/stripe/webhook/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "missing signature or secret" }, { status: 400 });
  }

  const body = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId || session.client_reference_id;
        if (!userId) break;
        const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        if (!subId) break;
        const sub = await stripe.subscriptions.retrieve(subId);
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeSubscriptionId: sub.id,
            stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
            plan: sub.status === "active" || sub.status === "trialing" ? "premium" : "free",
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const active = sub.status === "active" || sub.status === "trialing";
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            plan: active ? "premium" : "free",
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { plan: "free", stripeSubscriptionId: null },
        });
        break;
      }
      default:
        // Ignore other event types
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe webhook] handler failed", err);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Stage**

```bash
cd C:/Users/Charles/paddockiq && git add app/api/stripe/webhook/
```

**Suggested commit:** `feat: add stripe webhook — handles checkout.completed + sub.updated/deleted`

---

## Task 10: Stripe Billing Portal route

**Files:**
- Create: `app/api/stripe/portal/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "sign in required" }, { status: 401 });
  if (!user.stripeCustomerId) {
    return NextResponse.json({ error: "no stripe customer" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/account`,
  });

  return NextResponse.json({ url: session.url });
}
```

- [ ] **Step 2: Stage**

```bash
cd C:/Users/Charles/paddockiq && git add app/api/stripe/portal/
```

**Suggested commit:** `feat: add stripe billing portal route`

---

## Task 11: Pricing + Account pages

**Files:**
- Create: `app/pricing/page.tsx`
- Create: `app/account/page.tsx`

- [ ] **Step 1: Pricing page**

`app/pricing/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => setSignedIn(d.signedIn));
  }, []);

  async function subscribe() {
    if (!signedIn) {
      router.push("/sign-up?redirect_url=/pricing");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 20px", fontFamily: "system-ui" }}>
      <div style={{ background: "#fff8e1", border: "1px solid #f0c060", borderRadius: 6, padding: 12, marginBottom: 24, fontSize: 13 }}>
        <strong>POC — Stripe test mode.</strong> No real charges. Use card <code>4242 4242 4242 4242</code>, any future expiry, any CVC.
      </div>

      <h1 style={{ fontSize: 28, marginBottom: 8 }}>PaddockIQ Premium</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>Personal bankroll tracking, Kelly sim, Venmo importer, your bet log.</p>

      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 24 }}>
        <div style={{ fontSize: 32, fontWeight: 700 }}>$9<span style={{ fontSize: 14, color: "#888" }}>/mo</span></div>
        <ul style={{ margin: "16px 0", paddingLeft: 20, fontSize: 14, lineHeight: 1.7 }}>
          <li>Personal bankroll, persisted across sessions</li>
          <li>Kelly sim using your actual bankroll</li>
          <li>Venmo CSV importer for buy-in matching</li>
          <li>Full bet log + date filters over your bets</li>
          <li>All public features (rankings, odds, exotics, backtest charts)</li>
        </ul>
        <button
          onClick={subscribe}
          disabled={loading}
          style={{ width: "100%", padding: "12px 16px", fontSize: 15, fontWeight: 600, background: "#0d3d2e", color: "#f5ecd3", border: "none", borderRadius: 6, cursor: "pointer" }}
        >
          {loading ? "Loading…" : signedIn ? "Subscribe — $9/mo (test mode)" : "Sign up to subscribe"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Account page**

`app/account/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";

type Me = { signedIn: boolean; isPremium: boolean; email: string | null };

export default function AccountPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setMe);
  }, []);

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "portal failed");
    } finally {
      setPortalLoading(false);
    }
  }

  if (!me) return <div style={{ padding: 40 }}>Loading…</div>;

  if (!me.signedIn) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui" }}>
        <p>You are signed out. <a href="/sign-in">Sign in</a> or <a href="/sign-up">create an account</a>.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 20px", fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Account</h1>
        <UserButton afterSignOutUrl="/" />
      </div>

      <p style={{ color: "#666" }}>Signed in as <strong>{me.email}</strong></p>
      <p style={{ marginTop: 16 }}>
        Plan: <strong>{me.isPremium ? "Premium ✓" : "Free"}</strong>
      </p>

      {me.isPremium ? (
        <button
          onClick={openPortal}
          disabled={portalLoading}
          style={{ marginTop: 24, padding: "10px 18px", background: "#0d3d2e", color: "#f5ecd3", border: "none", borderRadius: 6, cursor: "pointer" }}
        >
          {portalLoading ? "Loading…" : "Manage billing"}
        </button>
      ) : (
        <a
          href="/pricing"
          style={{ display: "inline-block", marginTop: 24, padding: "10px 18px", background: "#0d3d2e", color: "#f5ecd3", borderRadius: 6, textDecoration: "none" }}
        >
          Subscribe — $9/mo
        </a>
      )}

      <p style={{ marginTop: 32, fontSize: 12, color: "#999" }}>
        <a href="/">← Back to PaddockIQ</a>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Stage**

```bash
cd C:/Users/Charles/paddockiq && git add app/pricing/ app/account/
```

**Suggested commit:** `feat: add /pricing and /account pages`

---

## Task 12: SPA gating — `data-premium` + `applyGates()` + header buttons

**Files:**
- Modify: `public/index.html`

- [ ] **Step 1: Tag premium DOM elements**

In `public/index.html` around line 320 (bankroll badge), add `data-premium="1"`:

Locate (lines ~318-323):

```html
      <span class="pill on-g" id="br-badge">$100.00 Bankroll</span>
      <button id="br-edit" onclick="toggleBankrollPop(event)" title="Edit bankroll / reset day">&#9998;</button>
```

Wrap them in a container with `data-premium`:

```html
      <span data-premium="1" style="display:inline-flex;align-items:center;gap:4px">
        <span class="pill on-g" id="br-badge">$100.00 Bankroll</span>
        <button id="br-edit" onclick="toggleBankrollPop(event)" title="Edit bankroll / reset day">&#9998;</button>
      </span>
      <span data-premium-cta style="display:none">
        <a href="/pricing" class="pill on-g" style="text-decoration:none">Subscribe</a>
        <a href="/account" class="pill on-g" style="text-decoration:none;margin-left:6px">Account</a>
      </span>
```

- [ ] **Step 2: Tag analysis-tab premium sections**

The Analysis tab is built in JS (function around line 4157). The Kelly sim panel (~line 4583), Venmo importer card (~line 4606), and personal bet log sections need to be tagged.

Find the start of each section's HTML string and add `data-premium="1"` to the outer `<div class="card...">`. Example for Bet Simulation (around line 4587):

Before:
```js
html += '<div class="card-gold"><div class="ctitle">Bet Simulation — Kelly-Sized, Compounding</div>' +
```

After:
```js
html += '<div class="card-gold" data-premium="1"><div class="ctitle">Bet Simulation — Kelly-Sized, Compounding</div>' +
```

Apply the same change to:
- The Bet Simulation / Kelly replay card (`card-gold` block, ~line 4587)
- The Real-World Caesars Buy-Ins (Venmo) card (~line 4606)
- Any subsequent "your bets" section in the Analysis tab — search for `'<div class="card"'` references inside `loadAnalysisTab()` and tag the ones that show *personal* data only. Leave backtest cohort charts alone.

If unsure whether a section is personal vs general: if the heading mentions "your" or it depends on `bets`/`bankroll` state, tag it.

- [ ] **Step 3: Add `applyGates()` + `/api/me` fetch**

In `public/index.html`, find the first `<script>` block or the existing init code (search for `function goTab(t)` around line 988 — there's a top-level script). Add at the top of that script:

```js
window.IS_PREMIUM = false;
window.SIGNED_IN = false;

async function loadMe(){
  try {
    const r = await fetch('/api/me');
    const d = await r.json();
    window.IS_PREMIUM = !!d.isPremium;
    window.SIGNED_IN = !!d.signedIn;
  } catch(e) { /* anonymous fallback */ }
  applyGates();
}

function applyGates(){
  const els = document.querySelectorAll('[data-premium="1"]');
  els.forEach(el => {
    if (window.IS_PREMIUM) {
      el.style.filter = '';
      el.style.pointerEvents = '';
      el.style.position = '';
      const overlay = el.querySelector('[data-premium-overlay]');
      if (overlay) overlay.remove();
    } else {
      if (!el.querySelector('[data-premium-overlay]')) {
        el.style.position = 'relative';
        el.style.filter = 'blur(4px)';
        el.style.pointerEvents = 'none';
        el.style.userSelect = 'none';
        const overlay = document.createElement('a');
        overlay.setAttribute('data-premium-overlay','');
        overlay.href = '/pricing';
        overlay.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.5);filter:none;pointer-events:auto;text-decoration:none;color:#0d3d2e;font-weight:700;font-size:14px;border-radius:6px;z-index:5';
        overlay.textContent = '🔒 Subscribe to unlock';
        el.appendChild(overlay);
      }
    }
  });

  // Swap bankroll badge vs Subscribe/Account header cluster
  const cta = document.querySelector('[data-premium-cta]');
  const badge = document.querySelector('[data-premium="1"] #br-badge');
  if (cta) {
    if (window.IS_PREMIUM) {
      cta.style.display = 'none';
    } else {
      cta.style.display = 'inline-flex';
      // Also fully hide the bankroll group (vs blur it) since it's in the header chrome
      const group = badge && badge.closest('[data-premium="1"]');
      if (group) group.style.display = 'none';
    }
  }
}

// Run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadMe);
} else {
  loadMe();
}

// Re-apply after analysis tab is rendered (it's rendered lazily)
const _origGoTab = window.goTab;
```

Note: the analysis tab is rendered lazily (`function goTab(t)` switches tabs and `loadAnalysisTab()` builds its DOM on demand). After that runs, we need to re-apply gates. Hook it:

Find `function loadAnalysisTab()` and at the very end (after the final `el.innerHTML = html;` or equivalent), add:

```js
  if (typeof applyGates === 'function') applyGates();
```

- [ ] **Step 4: Manual visual test — anonymous**

Start dev server, hard-refresh `http://localhost:3000/` in incognito.

Expected:
- Header shows "Subscribe" + "Account" links instead of bankroll badge
- Rankings tab works normally
- Analysis tab: backtest charts visible; Kelly sim + Venmo importer + Bet Simulation are blurred with a "🔒 Subscribe to unlock" overlay
- Clicking overlay → goes to `/pricing`

- [ ] **Step 5: Stage**

```bash
cd C:/Users/Charles/paddockiq && git add public/index.html
```

**Suggested commit:** `feat: SPA premium gating — blur personal sections for non-premium`

---

## Task 13: Scope `/api/bankroll` by user when signed in

**Files:**
- Modify: `app/api/bankroll/route.ts`

- [ ] **Step 1: Update to scope by user**

Replace `app/api/bankroll/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const userId = user?.id ?? null;

    // Scoped reads: signed-in users see only their rows; anonymous sees null-userId rows (legacy)
    let bankroll = await prisma.bankroll.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    if (!bankroll) {
      bankroll = await prisma.bankroll.create({ data: { amount: 100, userId } });
    }
    const bets = await prisma.bet.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bankroll: bankroll.amount, bets });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id ?? null;
    const { bankroll, bets } = await req.json();

    const existing = await prisma.bankroll.findFirst({ where: { userId } });
    if (existing) {
      await prisma.bankroll.update({ where: { id: existing.id }, data: { amount: bankroll } });
    } else {
      await prisma.bankroll.create({ data: { amount: bankroll, userId } });
    }

    const today = new Date().toISOString().slice(0, 10);
    await prisma.bet.deleteMany({ where: { raceDate: today, userId } });
    if (bets && bets.length > 0) {
      await prisma.bet.createMany({
        data: bets.map((b: { track?: string; race?: number; betType?: string; horses?: string; amount?: number; toWin?: number; result?: string; payout?: number }) => ({
          track: b.track || "OP",
          raceDate: today,
          race: b.race || 0,
          betType: b.betType || "WIN",
          horses: b.horses || "",
          amount: b.amount || 0,
          toWin: b.toWin || null,
          result: b.result || "pending",
          payout: b.payout || null,
          userId,
        })),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

- [ ] **Step 2: Smoke test anonymous reads**

Restart dev server. With incognito browser, visit `/`. Bankroll/bets behave exactly as before (rows with `userId=null`).

Expected: no regression for Charles's existing single-tenant flow.

- [ ] **Step 3: Stage**

```bash
cd C:/Users/Charles/paddockiq && git add app/api/bankroll/
```

**Suggested commit:** `feat: scope bankroll API by user when signed in (anonymous unchanged)`

---

## Task 14: End-to-end manual verification

**Files:** none

- [ ] **Step 1: Run build + lint clean**

```bash
cd C:/Users/Charles/paddockiq && npm run build && npm run lint
```

Expected: both pass with zero errors.

- [ ] **Step 2: Start Stripe CLI webhook listener (separate terminal)**

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` printed and update `STRIPE_WEBHOOK_SECRET` in `.env`. **Restart `npm run dev`** so the new secret loads.

- [ ] **Step 3: Anonymous flow**

In incognito browser visit `http://localhost:3000/`. Verify:
- Header shows Subscribe + Account links (no bankroll badge)
- Analysis tab: Kelly sim, Venmo, Bet Simulation cards blurred with "🔒 Subscribe to unlock"
- Rankings/Odds/Exotics/News all work

- [ ] **Step 4: Sign-up + subscribe flow**

- Click Subscribe → land on `/pricing`
- Click "Sign up to subscribe" → Clerk sign-up form
- Sign up with a real-looking test email
- Verify in Neon: `SELECT * FROM "User"` shows new row with `plan='free'`
- Back at `/pricing`, click "Subscribe — $9/mo"
- Stripe Checkout opens. Card `4242 4242 4242 4242`, future expiry, any CVC, any ZIP
- After payment, redirect to `/account?subscribed=1`
- Verify in Stripe CLI output: `checkout.session.completed [evt_...]` then `customer.subscription.created`
- Verify in Neon: `User.plan='premium'`, `stripeSubscriptionId` set, `currentPeriodEnd` set
- Visit `/` → Bankroll badge restored, premium sections un-blurred

- [ ] **Step 5: Cancel flow**

- At `/account` click "Manage billing" → Stripe portal
- Cancel subscription immediately
- Verify Stripe CLI shows `customer.subscription.deleted`
- Verify in Neon: `User.plan='free'`, `stripeSubscriptionId IS NULL`
- Reload `/` → premium sections re-blurred

- [ ] **Step 6: Regression test (Charles's anonymous flow)**

- Sign out in incognito
- Verify Charles's existing `Bankroll`/`Bet` rows (where `userId IS NULL`) still load via `/api/bankroll`
- Confirm no orphaning: open Charles's normal browser session — bankroll, bets, all current data still works exactly as before

- [ ] **Step 7: Document results**

Write a short note in plan doc or commit message confirming each of steps 3-6 passed. Capture any defects.

---

## Self-Review

Re-checked against spec sections:

| Spec section | Plan task |
|---|---|
| Routes table | Task 5 (middleware), 6 (`/api/me`), 7 (sign-in/up, Clerk webhook), 8 (checkout), 9 (Stripe webhook), 10 (portal), 11 (pricing/account) |
| User model + userId FKs | Task 2 |
| SPA gating + applyGates | Task 12 |
| API scoping by user | Task 13 |
| Webhook event handling | Tasks 7 (Clerk), 9 (Stripe) |
| Premium check semantics | Task 4 (unit-tested) |
| Env vars | Task 1 (`.env.example`), Task 5 (Clerk URL keys), Task 14 (webhook secret rotation) |
| POC disclaimer banner | Task 11 (`/pricing`) |
| Manual e2e verification | Task 14 |
| Build/lint gates | Task 14 step 1 |

No placeholders found. Function signatures consistent across tasks (`getCurrentUser`, `isPremium`, `getStripe`, `prisma`). API alias `@/lib/*` configured in Task 6.

**Known gaps acknowledged in spec (out of scope):**
- Multi-tier plans
- Affiliate sportsbook deep links
- Backfill of Charles's existing rows with `userId`
- Server-side gating (currently client-side blur — UX gate only)
