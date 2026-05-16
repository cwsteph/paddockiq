#!/usr/bin/env node
// Quick: show Beyer history for every horse in a given race + what each
// recency rule keeps.
const fs = require("fs");
const csvPath = process.argv[2], targetRace = process.argv[3] || "1";
if (!csvPath) { console.error("usage: inspect-race.js <csv> <race-num>"); process.exit(1); }

const text = fs.readFileSync(csvPath, "utf8");
function parseCSV(t) {
  const lines = t.split("\n").filter(l => l.trim());
  const h = lines[0].split(",").map(x => x.replace(/^"|"$/g, "").trim());
  return lines.slice(1).map(l => {
    const c = []; let cur = "", q = false;
    for (let i = 0; i < l.length; i++) { const ch = l[i]; if (ch === '"') q = !q; else if (ch === "," && !q) { c.push(cur.trim()); cur = ""; } else cur += ch; }
    c.push(cur.trim().replace(/\r/, ""));
    const o = {}; h.forEach((k, i) => o[k] = (c[i] || "").replace(/^"|"$/g, ""));
    return o;
  });
}
function dayDiff(a, b) {
  function p(s) { if (!s) return null; if (s.indexOf("-") > 0) { const x = s.split("-"); return new Date(+x[0], +x[1] - 1, +x[2]); } const x = s.split("/"); return new Date(+x[2], +x[0] - 1, +x[1]); }
  const da = p(a), db = p(b); return (!da || !db) ? null : Math.round((db - da) / 86400000);
}

const rows = parseCSV(text);
let cur = null, rf = {};
const horses = [];
for (const r of rows) {
  if (r.R_RCRace) { cur = r.R_RCRace; rf = {}; for (const k of Object.keys(r)) if (k.startsWith("R_") && r[k] !== "") rf[k] = r[k]; }
  if (!r.H_Horse || !r.H_Horse.trim()) continue;
  if (String(cur) !== String(targetRace)) continue;
  const m = { ...rf };
  for (const k of Object.keys(r)) if (r[k] !== "") m[k] = r[k];
  horses.push(m);
}

const raceDate = horses[0]?.R_RCDate || "";
console.log(`\nRace ${targetRace} — ${horses[0]?.R_TrackName || ""} — ${raceDate}\n`);

for (const h of horses) {
  const figs = [];
  for (let i = 1; i <= 12; i++) {
    const b = parseFloat(h["HR_Beyer_" + i]) || 0;
    const d = h["HR_Date_" + i];
    if (!d) break;
    if (b > 0 && b < 900) figs.push({ idx: i, beyer: b, date: d, daysAgo: dayDiff(d, raceDate) });
  }
  if (!figs.length) continue;

  // Old rule: last 5 AND ≤365d
  const ruleOld = figs.filter((f, i) => i < 5 && (f.daysAgo == null || f.daysAgo <= 365)).map(f => f.beyer);
  // New rule: ≤180d OR first
  const ruleNew = figs.filter((f, i) => i === 0 || (f.daysAgo != null && f.daysAgo <= 180)).map(f => f.beyer);
  // Career
  const careerMax = Math.max(...figs.map(f => f.beyer));

  console.log(`${h.H_Horse.padEnd(24)}  scratched=${h.H_Scratch}`);
  console.log("  Beyers (most-recent first):");
  for (const f of figs) {
    const tag = f.idx === 1 ? " (last race)" : "";
    console.log(`    [${String(f.idx).padStart(2)}] ${String(f.beyer).padStart(3)}  ${f.date}  (${f.daysAgo}d ago)${tag}`);
  }
  console.log(`  career max: ${careerMax}`);
  console.log(`  OLD rule (last 5 AND ≤365d): max=${ruleOld.length ? Math.max(...ruleOld) : 0}  set=[${ruleOld.join(",")}]`);
  console.log(`  NEW rule (≤180d OR last):    max=${ruleNew.length ? Math.max(...ruleNew) : 0}  set=[${ruleNew.join(",")}]`);
  console.log();
}
