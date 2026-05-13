import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const code = process.argv[2] || "PADDOCK-DAVE";
const note = process.argv[3] || null;
(async () => {
  try {
    const c = await prisma.inviteCode.create({
      data: { code, maxUses: 1, grantsDays: null, note },
    });
    console.log("Created:", c.code, "note=" + (c.note ?? "-"));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Failed:", msg);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
