const fs = require("fs");

fs.writeFileSync("src/app/globals.css", `/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --terminal-bg: #080810;
  --terminal-surface: #0d0d18;
  --terminal-border: #1e1e30;
  --terminal-border-hover: #2a2a48;
  --terminal-text: #e8e4d8;
  --terminal-muted: #888;
  --terminal-dim: #444;
  --green: #4ec97e;
  --green-bg: #0a1f12;
  --red: #e05555;
  --red-bg: #1f0a0a;
  --amber: #d4af37;
  --amber-bg: #1f1800;
  --blue: #7b8df8;
  --blue-bg: #0d0f2a;
  --surface-hard: #0d0f2a;
  --surface-clay: #2a1508;
  --surface-grass: #0a200f;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--terminal-bg);
  color: var(--terminal-text);
  font-family: var(--font-sans), system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--terminal-border); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: var(--terminal-border-hover); }

@layer utilities {
  .bg-terminal { background-color: var(--terminal-bg); }
  .bg-surface { background-color: var(--terminal-surface); }
  .border-terminal { border-color: var(--terminal-border); }
  .text-terminal { color: var(--terminal-text); }
  .text-terminal-muted { color: var(--terminal-muted); }
  .text-terminal-dim { color: var(--terminal-dim); }
  .text-green { color: var(--green); }
  .text-red { color: var(--red); }
  .text-amber { color: var(--amber); }
  .text-blue { color: var(--blue); }
  .font-mono { font-family: var(--font-mono), monospace; }
}
`);
console.log("globals.css updated");
