import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "sign in required" }, { status: 401 });

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) return NextResponse.json({ error: "STRIPE_PRICE_ID not set" }, { status: 500 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const stripe = getStripe();

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
