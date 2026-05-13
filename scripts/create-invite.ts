// Generate PaddockIQ invite codes.
//
// Usage:
//   npx tsx scripts/create-invite.ts [--count N] [--max-uses N] [--days N] [--note "..."] [--prefix PADDOCK]
//
// Examples:
//   npx tsx scripts/create-invite.ts                                   # 1 single-use lifetime code
//   npx tsx scripts/create-invite.ts --count 5                         # 5 single-use lifetime codes
//   npx tsx scripts/create-invite.ts --max-uses 20 --note "twitter"    # 1 code, 20 redemptions, tagged
//   npx tsx scripts/create-invite.ts --days 30                         # 30-day grant instead of lifetime
//
// Run from project root. Requires DATABASE_URL in .env.

import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

function parseArgs(argv: string[]) {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      out[key] = "true";
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function makeCode(prefix: string) {
  const raw = randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${raw}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const count = Math.max(1, parseInt(args.count ?? "1", 10));
  const maxUses = Math.max(1, parseInt(args["max-uses"] ?? "1", 10));
  const grantsDays = args.days ? parseInt(args.days, 10) : null;
  const note = args.note ?? null;
  const prefix = (args.prefix ?? "PADDOCK").toUpperCase();

  const created: string[] = [];
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    while (attempts < 5) {
      const code = makeCode(prefix);
      try {
        await prisma.inviteCode.create({
          data: { code, maxUses, grantsDays, note },
        });
        created.push(code);
        break;
      } catch (err: unknown) {
        attempts++;
        if (attempts >= 5) throw err;
      }
    }
  }

  console.log(`Created ${created.length} invite code${created.length === 1 ? "" : "s"}:`);
  console.log(`  maxUses=${maxUses}  grantsDays=${grantsDays ?? "lifetime"}  note=${note ?? "-"}`);
  console.log("");
  for (const code of created) console.log(`  ${code}`);
  console.log("");
  console.log("Redeem at /pricing — \"Have an invite code?\" form.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
