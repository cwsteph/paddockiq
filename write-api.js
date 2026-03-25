const fs = require("fs");
const path = require("path");
const p = (f, c) => { fs.mkdirSync(path.dirname(f), {recursive:true}); fs.writeFileSync(f, c); console.log("wrote", f); };

p("app/api/parse-pp/route.ts", `import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "pdfs-2024-09-25",
      },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: { message: e.message } }, { status: 500 });
  }
}
`);

console.log("Done — API route written");
