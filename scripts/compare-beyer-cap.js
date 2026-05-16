#!/usr/bin/env node
/**
 * Before/after comparison of the Beyer recency cap on a DRF CSV.
 *
 * Replicates the in-browser scoreRaceCSV math (production weights).
 * Runs both:
 *   OLD: bestBeyer = max(all 12 Beyers)
 *   NEW: effectiveBeyer = max(last 5 AND ≤365d)
 * Prints, per race, the top pick under each, score deltas, and field max Beyer
 * under both definitions.
 *
 *   node scripts/compare-beyer-cap.js path/to/file.csv
 */

const fs = require("fs");

const csvPath = process.argv[2];
if (!csvPath) { console.error("usage: compare-beyer-cap.js <csv>"); process.exit(1); }
const text = fs.readFileSync(csvPath, "utf8");

// ── CSV parse (matches index.html parseCSV) ──
function parseCSV(text) {
  const lines = text.split("\n").filter((l) => l.trim());
  const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
  return lines.slice(1).map((line) => {
    const cols = []; let cur = ""; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') inQ = !inQ;
      else if (c === "," && !inQ) { cols.push(cur.trim()); cur = ""; }
      else cur += c;
    }
    cols.push(cur.trim().replace(/\r/, ""));
    const obj = {}; headers.forEach((h, i) => obj[h] = (cols[i] || "").replace(/^"|"$/g, ""));
    return obj;
  });
}

const nv = (v) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };

function dayDiff(a, b) {
  function p(s) { if (!s) return null; if (s.indexOf("-") > 0) { const x=s.split("-"); return new Date(+x[0],+x[1]-1,+x[2]); } const x=s.split("/"); return new Date(+x[2],+x[0]-1,+x[1]); }
  const da=p(a), db=p(b); if (!da||!db) return null; return Math.round((db-da)/86400000);
}

function getBeyerFigs(h) {
  const figs = []; const figsDated = [];
  for (let i = 1; i <= 12; i++) {
    const b = nv(h["HR_Beyer_"+i]); const d = h["HR_Date_"+i];
    if (!d) break; if (b > 0 && b < 900) { figs.push(b); figsDated.push({ beyer: b, date: d, idx: i }); }
  }
  return { figs, figsDated };
}

function getPace(h) { const data = []; for (let i=1;i<=6;i++){ const d=h["HR_Date_"+i]; if(!d) break; const fc=nv(h["HR_FirstCall_"+i]),fn=nv(h["HR_FinalCall_"+i]); if(fc>0) data.push({first:fc,final:fn});} return data; }

// Carry-forward race fields then merge horse row
const rawRows = parseCSV(text);
let cur = null, rf = {};
const rows = rawRows.map((r) => {
  if (r.R_RCRace) { cur = r.R_RCRace; rf = {}; for (const k of Object.keys(r)) if (k.startsWith("R_") && r[k] !== "") rf[k] = r[k]; }
  if (!r.H_Horse || !r.H_Horse.trim()) return null;
  const merged = { ...rf };
  for (const k of Object.keys(r)) if (r[k] !== "") merged[k] = r[k];
  merged._race = cur;
  return merged;
}).filter(Boolean);

const W = { beyer: 0.18, pace: 0.13, speed: 0.10, class_: 0.20, form: 0.20, jock: 0.06, trainer: 0.05, works: 0.04, ml: 0.04 };

function scoreOneHorse(h, raceDate, mode) {
  // Beyer
  const { figs, figsDated } = getBeyerFigs(h);
  let useFigs;
  if (mode === "new") {
    const RECENT_DAYS = 180; // 6 months
    useFigs = figsDated.filter((f,i)=>{ if(i===0) return true; const d=dayDiff(f.date,raceDate); return d==null || d<=RECENT_DAYS; }).map(f=>f.beyer);
  } else {
    useFigs = figs; // OLD
  }
  const bestBeyer = useFigs.length ? Math.max(...useFigs) : 0;
  const avg3Beyer = useFigs.length ? useFigs.slice(0,3).reduce((a,b)=>a+b,0)/Math.min(3,useFigs.length) : 0;
  const beyerRaw = bestBeyer > 0 ? bestBeyer*0.55 + avg3Beyer*0.45 : 0;

  // Pace
  const pd = getPace(h);
  let earlyPos = 0, posGain = 0;
  if (pd.length) {
    earlyPos = pd.reduce((a,c)=>a+c.first,0)/pd.length;
    posGain  = pd.reduce((a,c)=>a+(c.first-c.final),0)/pd.length;
  }
  const fs2 = nv(h.R_Starters) || 8;
  const earlyNorm = earlyPos > 0 ? Math.max(0, 1-(earlyPos-1)/(fs2-1)) : 0.5;
  const gainNorm  = posGain > 0 ? Math.min(1, posGain/4) : 0;
  const paceRaw = earlyNorm*0.6 + gainNorm*0.4;

  // Speed proxy
  const trkS=nv(h.H_TrkStarts), trkW=nv(h.H_TrkWins), distS=nv(h.H_DistStarts), distW=nv(h.H_DistWins);
  const speedRaw = (trkS>0?trkW/trkS:0)*0.55 + (distS>0?distW/distS:0)*0.45;

  // Class
  const starts=nv(h.H_Starts), eps=starts>0?nv(h.H_Earnings)/starts:0, trkEps=trkS>0?nv(h.H_TrkEarnings)/trkS:0;
  const classRaw = eps*0.55 + trkEps*0.35 + nv(h.H_ClaimPrice)*0.1;

  // Form
  const wins=nv(h.H_Wins),places=nv(h.H_Places),shows=nv(h.H_Shows);
  const cyS=nv(h.H_CYStarts),cyW=nv(h.H_CYWins);
  const winPct=starts>0?wins/starts:0, itmPct=starts>0?(wins+places+shows)/starts:0, cyWinPct=cyS>0?cyW/cyS:0;
  // layoff (skip strict day calc — approximate)
  const formRaw = winPct*0.35 + cyWinPct*0.25 + itmPct*0.2 + 0.65*0.2;

  // Jockey/Trainer
  const jM=nv(h.H_JockMeetStarts),jP=nv(h.H_JockMeetWinPct),jY=nv(h.H_JockYTDWinPct);
  const jockRaw = jM>=5 ? jP*0.65+jY*0.35 : jY;
  const tM=nv(h.H_TrainerMeetStarts),tP=nv(h.H_TrainerMeetWinPct),tY=nv(h.H_TrainerYTDWinPct);
  const trainerRaw = (tM>=5?tP*0.5+tY*0.3:tY)*0.7; // skip situational for compare-ability

  // ML
  function mlD(s){ if(!s||!s.includes("-"))return 99; const [a,b]=s.split("-").map(Number); return b>0?a/b:99; }
  const mlDec=mlD(h.B_MLOdds);
  const mlRaw = mlDec<=1?1:mlDec<=2?0.85:mlDec<=4?0.70:mlDec<=9?0.55:mlDec<=19?0.35:0.15;

  return { beyerRaw, paceRaw, speedRaw, classRaw, formRaw, jockRaw, trainerRaw, mlRaw, bestBeyer, careerMax: figs.length?Math.max(...figs):0 };
}

function scoreRace(horses, raceDate, mode) {
  const active = horses.filter(h => h.H_Scratch !== "Y");
  const raw = active.map(h => ({ name: h.H_Horse, parts: scoreOneHorse(h, raceDate, mode) }));
  const factors = ["beyerRaw","paceRaw","speedRaw","classRaw","formRaw","jockRaw","trainerRaw"];
  const mm = {};
  factors.forEach(f => { const vals = raw.map(r => r.parts[f]); mm[f] = { mn: Math.min(...vals), mx: Math.max(...vals) }; });
  const norm = (v,f) => mm[f].mx === mm[f].mn ? 0.5 : (v-mm[f].mn)/(mm[f].mx-mm[f].mn);

  return raw.map(r => {
    const p = r.parts;
    const bN=norm(p.beyerRaw,"beyerRaw"), pN=norm(p.paceRaw,"paceRaw"), sN=norm(p.speedRaw,"speedRaw"),
          cN=norm(p.classRaw,"classRaw"), fN=norm(p.formRaw,"formRaw"), jN=norm(p.jockRaw,"jockRaw"), tN=norm(p.trainerRaw,"trainerRaw");
    const score = Math.round((bN*W.beyer + pN*W.pace + sN*W.speed + cN*W.class_ + fN*W.form + jN*W.jock + tN*W.trainer + p.mlRaw*W.ml) * 100);
    return { name: r.name, score, recentBest: p.bestBeyer, careerMax: p.careerMax };
  }).sort((a,b) => b.score - a.score);
}

// Group by race
const byRace = {};
for (const r of rows) {
  const k = r._race; if (!byRace[k]) byRace[k] = [];
  byRace[k].push(r);
}

const raceDate = rows[0]?.R_RCDate || "";
const trackName = rows[0]?.R_TrackName || rows[0]?.R_RCTrack || "";
console.log(`\n${trackName} — ${raceDate}\n`);
console.log("Race | OLD top pick (score, fieldMaxBeyer-career) | NEW top pick (score, fieldMaxBeyer-recent) | Δ");
console.log("─".repeat(110));

let differs = 0, totalRaces = 0;
const detail = [];
for (const rk of Object.keys(byRace).sort((a,b)=>+a-+b)) {
  const horses = byRace[rk];
  const oldS = scoreRace(horses, raceDate, "old");
  const newS = scoreRace(horses, raceDate, "new");
  if (!oldS.length || !newS.length) continue;
  totalRaces++;
  const oldTop = oldS[0], newTop = newS[0];
  const oldFieldMax = Math.max(...oldS.map(s => s.careerMax));
  const newFieldMax = Math.max(...newS.map(s => s.recentBest));
  const changed = oldTop.name !== newTop.name;
  if (changed) differs++;
  const line = `R${String(rk).padStart(2," ")}  | ${oldTop.name.padEnd(22)} ${String(oldTop.score).padStart(3)} (max ${oldFieldMax})`.padEnd(60) +
               ` | ${newTop.name.padEnd(22)} ${String(newTop.score).padStart(3)} (max ${newFieldMax})`.padEnd(48) +
               (changed ? " | ★ CHANGED" : "");
  console.log(line);
  detail.push({ race: rk, oldTop, newTop, oldFieldMax, newFieldMax, changed });
}

console.log("\n" + "─".repeat(110));
console.log(`${totalRaces} races · top pick changed in ${differs} race${differs===1?"":"s"} (${((differs/totalRaces)*100).toFixed(0)}%)`);

// Show details for changed races
const changes = detail.filter(d => d.changed);
if (changes.length) {
  console.log("\n=== Changed top picks (detail) ===");
  for (const c of changes) {
    console.log(`\nRace ${c.race}:`);
    console.log(`  OLD pick: ${c.oldTop.name} — score ${c.oldTop.score}, recent best Beyer ${c.oldTop.recentBest}, career max ${c.oldTop.careerMax}`);
    console.log(`  NEW pick: ${c.newTop.name} — score ${c.newTop.score}, recent best Beyer ${c.newTop.recentBest}, career max ${c.newTop.careerMax}`);
    console.log(`  Field career-max Beyer: ${c.oldFieldMax} | Field recent-max Beyer: ${c.newFieldMax}`);
  }
}
