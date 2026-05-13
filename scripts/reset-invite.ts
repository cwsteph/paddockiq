import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const code = (process.argv[2] || "PADDOCK-DAVE").toUpperCase();
(async () => {
  const c = await prisma.inviteCode.update({
    where: { code },
    data: { uses: 0 },
  }).catch((e) => { console.error("Failed:", e.message); return null; });
  if (!c) return;
  console.log("Reset", c.code, "→ uses:", c.uses, "/", c.maxUses);
  await prisma.$disconnect();
})();
