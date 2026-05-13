import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const codes = await prisma.inviteCode.findMany({
    orderBy: { createdAt: "asc" },
  });
  const valid = codes.filter((c) => !c.disabled && c.uses < c.maxUses);
  const spent = codes.filter((c) => !c.disabled && c.uses >= c.maxUses);
  const disabled = codes.filter((c) => c.disabled);
  console.log(`Valid (${valid.length}):`);
  for (const c of valid) {
    const grant = c.grantsDays ? `${c.grantsDays}d` : "lifetime";
    console.log(`  ${c.code.padEnd(22)} ${c.uses}/${c.maxUses}  ${grant}  ${c.note ?? "-"}`);
  }
  if (spent.length) {
    console.log(`\nSpent (${spent.length}):`);
    for (const c of spent) console.log(`  ${c.code.padEnd(22)} ${c.uses}/${c.maxUses}  ${c.note ?? "-"}`);
  }
  if (disabled.length) {
    console.log(`\nDisabled (${disabled.length}):`);
    for (const c of disabled) console.log(`  ${c.code.padEnd(22)} ${c.note ?? "-"}`);
  }
  await prisma.$disconnect();
})();
