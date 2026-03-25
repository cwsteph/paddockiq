const fs = require("fs");
const path = require("path");
const p = (f, c) => { fs.mkdirSync(path.dirname(f), {recursive:true}); fs.writeFileSync(f, c); console.log("wrote", f); };

p("app/globals.css", `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg:     #080810;
  --bg2:    #0d0d18;
  --bg3:    #111120;
  --border: #1e1e30;
  --bh:     #2a2a48;
  --gold:   #d4af37;
  --gold2:  #f0c850;
  --green:  #4ec97e;
  --blue:   #7b8df8;
  --red:    #e05555;
  --purple: #b48cf8;
  --text:   #e8e4d8;
  --muted:  #888;
  --dim:    #444;
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

@layer utilities {
  .bg-bg  { background-color: var(--bg); }
  .bg-bg2 { background-color: var(--bg2); }
  .bg-bg3 { background-color: var(--bg3); }
  .text-gold   { color: var(--gold); }
  .text-gold2  { color: var(--gold2); }
  .text-green  { color: var(--green); }
  .text-red    { color: var(--red); }
  .text-blue   { color: var(--blue); }
  .text-purple { color: var(--purple); }
  .text-muted  { color: var(--muted); }
  .text-dim    { color: var(--dim); }
  .border-base { border-color: var(--border); }
  .font-mono   { font-family: var(--font-mono), monospace; }
  .font-bebas  { font-family: "Bebas Neue", sans-serif; letter-spacing: 2px; }
}
`);

console.log("globals.css written");
