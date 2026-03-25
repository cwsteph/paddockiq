const fs = require("fs");

// Downgrade to Prisma 5 in package.json
const pkg = JSON.parse(fs.readFileSync("package.json","utf8"));
pkg.dependencies["@prisma/client"] = "^5.22.0";
pkg.dependencies["prisma"] = "^5.22.0";
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));

// Restore url in schema.prisma
fs.writeFileSync("prisma/schema.prisma", `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
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
console.log("Downgraded to Prisma 5, schema.prisma restored");
console.log(pkg.dependencies["prisma"], pkg.dependencies["@prisma/client"]);
