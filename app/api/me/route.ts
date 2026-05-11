import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isPremium } from "@/lib/premium";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({
      signedIn: !!user,
      isPremium: isPremium(user),
      email: user?.email ?? null,
    });
  } catch {
    return NextResponse.json({ signedIn: false, isPremium: false, email: null });
  }
}
