import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
