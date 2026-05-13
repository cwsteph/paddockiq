import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LIFETIME_YEARS = 100;

export async function POST(req: NextRequest) {
  // Auth is optional. Signed-in users get a real InviteRedemption record + their
  // User row flipped to plan=premium. Anonymous users get the same code-consume
  // semantics (uses++) and the client stamps a localStorage flag that the SPA
  // reads to unlock premium UI without a Clerk account.
  const user = await getCurrentUser();

  let body: { code?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const rawCode = typeof body.code === "string" ? body.code : "";
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "code required" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const invite = await tx.inviteCode.findUnique({ where: { code } });
      if (!invite) {
        return { ok: false as const, status: 404, error: "code not found" };
      }
      if (invite.disabled) {
        return { ok: false as const, status: 410, error: "code is disabled" };
      }
      if (invite.uses >= invite.maxUses) {
        return { ok: false as const, status: 410, error: "code has no uses left" };
      }

      if (user) {
        const existing = await tx.inviteRedemption.findUnique({
          where: {
            inviteCodeId_userId: { inviteCodeId: invite.id, userId: user.id },
          },
        });
        if (existing) {
          return { ok: false as const, status: 409, error: "code already redeemed by this account" };
        }

        await tx.inviteRedemption.create({
          data: { inviteCodeId: invite.id, userId: user.id },
        });
        await tx.inviteCode.update({
          where: { id: invite.id },
          data: { uses: { increment: 1 } },
        });

        const now = Date.now();
        const grantMs = invite.grantsDays
          ? invite.grantsDays * 24 * 60 * 60 * 1000
          : LIFETIME_YEARS * 365 * 24 * 60 * 60 * 1000;
        const currentEnd = user.currentPeriodEnd?.getTime() ?? 0;
        const base = Math.max(currentEnd, now);
        const newEnd = new Date(base + grantMs);

        await tx.user.update({
          where: { id: user.id },
          data: { plan: "premium", currentPeriodEnd: newEnd },
        });

        return {
          ok: true as const,
          anonymous: false as const,
          currentPeriodEnd: newEnd.toISOString(),
        };
      }

      // Anonymous redemption: consume one use, no per-user record.
      await tx.inviteCode.update({
        where: { id: invite.id },
        data: { uses: { increment: 1 } },
      });
      return {
        ok: true as const,
        anonymous: true as const,
        code,
        grantsDays: invite.grantsDays,
      };
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("[invite redeem] failed", err);
    return NextResponse.json({ error: "redeem failed" }, { status: 500 });
  }
}
