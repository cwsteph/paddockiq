import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const code = (process.argv[2] || "PADDOCK-DAVE").toUpperCase();
(async () => {
  const c = await prisma.inviteCode.findUnique({ where: { code }, include: { redemptions: true } });
  if (!c) { console.log("NOT FOUND:", code); return; }
  console.log("code:", c.code);
  console.log("maxUses:", c.maxUses, "uses:", c.uses, "remaining:", c.maxUses - c.uses);
  console.log("disabled:", c.disabled);
  console.log("grantsDays:", c.grantsDays);
  console.log("createdAt:", c.createdAt.toISOString());
  console.log("redemptions:", c.redemptions.length);
  c.redemptions.forEach((r) => console.log("  -", r.userId, "at", r.redeemedAt.toISOString()));
  await prisma.$disconnect();
})();
