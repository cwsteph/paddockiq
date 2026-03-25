const fs = require("fs");
const p = (f,c) => { fs.mkdirSync(require("path").dirname(f),{recursive:true}); fs.writeFileSync(f,c); console.log("wrote",f); };

p("app/page.tsx", `import { redirect } from "next/navigation";
export default function Home() {
  redirect("/index.html");
}
`);

p("app/api/parse-pp/route.ts", `import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const betaHeader = req.headers.get("anthropic-beta") || "pdfs-2024-09-25";
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": betaHeader,
      },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: { message: msg } }, { status: 500 });
  }
}
`);

console.log("done");
