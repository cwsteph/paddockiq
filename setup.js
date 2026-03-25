const fs = require("fs");
const path = require("path");
const p = (f, c) => {
  fs.mkdirSync(path.dirname(f), {recursive:true});
  fs.writeFileSync(f, c);
  console.log("wrote", f);
};

p("netlify.toml", `[build]
  command = "npx prisma generate && npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
`);

p("prisma/schema.prisma", `generator client {
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

p("app/globals.css", `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg:           #080810;
  --bg2:          #0d0d18;
  --bg3:          #111120;
  --border:       #1e1e30;
  --border-hover: #2a2a48;
  --gold:         #d4af37;
  --gold2:        #f0c850;
  --gold-bg:      #1f1800;
  --green:        #4ec97e;
  --green-bg:     #0a1f12;
  --blue:         #7b8df8;
  --blue-bg:      #0d0f2a;
  --red:          #e05555;
  --red-bg:       #1f0a0a;
  --purple:       #b48cf8;
  --text:         #e8e4d8;
  --muted:        #888;
  --dim:          #444;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans), "DM Sans", system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: var(--border-hover); }

@layer utilities {
  .bg-bg       { background-color: var(--bg); }
  .bg-bg2      { background-color: var(--bg2); }
  .bg-bg3      { background-color: var(--bg3); }
  .border-base { border-color: var(--border); }
  .text-base   { color: var(--text); }
  .text-muted  { color: var(--muted); }
  .text-dim    { color: var(--dim); }
  .text-gold   { color: var(--gold); }
  .text-gold2  { color: var(--gold2); }
  .text-green  { color: var(--green); }
  .text-red    { color: var(--red); }
  .text-blue   { color: var(--blue); }
  .text-purple { color: var(--purple); }
  .font-mono   { font-family: var(--font-mono), monospace; }
}
`);

p("app/layout.tsx", `import type { Metadata } from "next"
import { DM_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: "PaddockIQ \u2014 Horse Racing Analysis",
  description: "Professional horse racing analysis and handicapping",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={\`\${sans.variable} \${mono.variable}\`}>
      <body className="bg-bg text-base">
        {children}
      </body>
    </html>
  )
}
`);

p("app/page.tsx", `export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gold mb-2">PaddockIQ</h1>
        <p className="text-muted">Horse Racing Analysis Terminal</p>
        <p className="text-dim text-sm mt-4">Loading...</p>
      </div>
    </main>
  )
}
`);

console.log("Done — all files written.");
