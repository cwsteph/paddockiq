import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
