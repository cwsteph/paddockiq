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
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (!subId) break;
        const sub = await stripe.subscriptions.retrieve(subId);
        const active = sub.status === "active" || sub.status === "trialing";
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeSubscriptionId: sub.id,
            stripeCustomerId:
              typeof sub.customer === "string" ? sub.customer : sub.customer.id,
            plan: active ? "premium" : "free",
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
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe webhook] handler failed", err);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }
}
