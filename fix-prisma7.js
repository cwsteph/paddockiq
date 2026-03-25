const fs = require("fs");

// Fix 1: Update schema.prisma - remove url from datasource
fs.writeFileSync("prisma/schema.prisma", `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model Bankroll {
  id        Int      @id @default(autoincrement())
  amount    Float
  updatedAt DateTime @updatedAt
}

model Bet {
  id        Int      @id @default(autoincrement())
  track     String
  raceDate  String
  race      Int
  betType   String
  horses    String
  amount    Float
  toWin     Float?
  result    String?
  payout    Float?
  createdAt DateTime @default(now())
}

model BankrollSnapshot {
  id        Int      @id @default(autoincrement())
  amount    Float
  createdAt DateTime @default(now())
}
`);

// Fix 2: Create prisma.config.ts
fs.writeFileSync("prisma.config.ts", `import path from "path";
import type { PrismaConfig } from "prisma";

export default {
  earlyAccess: true,
  schema: {
    kind: "single",
    filePath: path.join(__dirname, "prisma/schema.prisma"),
  },
  migrate: {
    adapter: async () => {
      const { PrismaNeon } = await import("@prisma/adapter-neon");
      const { neonConfig, Pool } = await import("@neondatabase/serverless");
      neonConfig.webSocketConstructor = (await import("ws")).default;
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      return new PrismaNeon(pool);
    },
  },
} satisfies PrismaConfig;
`);

console.log("Done - schema.prisma and prisma.config.ts updated");
