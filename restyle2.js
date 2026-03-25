const fs = require("fs");
let layout = fs.readFileSync("src/app/layout.tsx", "utf8");

// Swap Space_Grotesk for DM_Sans
layout = layout
  .replace("import { JetBrains_Mono, Space_Grotesk } from \"next/font/google\"", "import { JetBrains_Mono, DM_Sans } from \"next/font/google\"")
  .replace(/const sans = Space_Grotesk\(\{[\s\S]*?\}\)/,
    `const sans = DM_Sans({\n  subsets: ["latin"],\n  variable: "--font-sans",\n  weight: ["400", "500", "600"],\n})`);

fs.writeFileSync("src/app/layout.tsx", layout);
console.log("layout.tsx updated");
console.log(layout.substring(0, 400));
