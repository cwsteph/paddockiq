// keeneland-tokens.jsx — Shared Keeneland Turf Club design tokens & data

const KT = {
  // Canvas & surfaces
  bg:      '#0d3d2e',     // deep Keeneland green (masthead, dark surfaces)
  bgDeep:  '#082a20',     // darker green for contrast
  canvas:  '#faf6ec',     // cream paper (main bg)
  canvas2: '#f5efe0',     // slightly darker cream
  panel:   '#ffffff',     // white cards
  panelAlt:'#fbf8ef',     // warm off-white for alt rows

  // Ink
  ink:     '#1a2420',
  ink2:    '#3a3a30',
  muted:   '#6b6558',
  dim:     '#a89f8c',

  // Rules
  border:  '#e4dcc4',
  rule:    '#d4c79a',
  rule2:   '#ede5cc',

  // Accents
  brass:   '#a67c2e',
  brassHi: '#c99a4a',
  brassSoft:'#fbf3d8',
  green:   '#0d4f3c',
  green2:  '#1a6b54',
  greenSoft:'#e8f2e8',
  red:     '#8b2330',
  redHi:   '#a83040',
  cream:   '#f5ecd3',
  creamHi: '#faf0d4',
};

const KRACES = [
  { n: 1, mtp: '—',  status: 'past',     purse: '$32K',  surf: 'Dirt', dist: '6f',     time: '1:09', cls:'MCL' },
  { n: 2, mtp: '—',  status: 'past',     purse: '$38K',  surf: 'Turf', dist: '1m',     time: '1:34', cls:'MSW' },
  { n: 3, mtp: '—',  status: 'past',     purse: '$42K',  surf: 'Dirt', dist: '6½f',    time: '1:16', cls:'CLM' },
  { n: 4, mtp: '8',  status: 'next',     purse: '$125K', surf: 'Dirt', dist: '1 1/16', time: '4:08', cls:'ALW' },
  { n: 5, mtp: '34', status: 'upcoming', purse: '$85K',  surf: 'Turf', dist: '1m',     time: '4:34', cls:'ALW' },
  { n: 6, mtp: '61', status: 'upcoming', purse: '$60K',  surf: 'Dirt', dist: '6f',     time: '5:01', cls:'CLM' },
  { n: 7, mtp: '88', status: 'upcoming', purse: '$250K', surf: 'Dirt', dist: '1 1/8',  time: '5:28', cls:'G2',  big: true, name:'Rebel Stakes' },
  { n: 8, mtp: '—',  status: 'upcoming', purse: '$40K',  surf: 'Turf', dist: '5f',     time: '5:55', cls:'MSW' },
  { n: 9, mtp: '—',  status: 'upcoming', purse: '$45K',  surf: 'Dirt', dist: '1m',     time: '6:22', cls:'ALW' },
  { n: 10,mtp: '—',  status: 'upcoming', purse: '$55K',  surf: 'Turf', dist: '1 1/16', time: '6:49', cls:'ALW' },
];

const KHORSES = [
  { pp: 3, name: 'SILVER REIGN',     jockey: 'J. Castellano',  trainer: 'S. Asmussen',  odds: '7/2',   score: 94, edge: '+12.4%', pace: 'E/P',  form: 'WWP', spd:92, cls:'A-', e1:88, e2:91, daysOff:21, postWin:'18%', owner:'Godolphin Stable', silk: { bg:'#1a3a5e', stripe:'#d4af37', patt:'diag'} , note: 'Sharp work pattern' },
  { pp: 7, name: 'MORNING HARVEST',  jockey: 'I. Ortiz Jr.',   trainer: 'T. Pletcher',  odds: '4/1',   score: 88, edge: '+8.1%',  pace: 'P',    form: '2WP', spd:89, cls:'A', e1:85, e2:90, daysOff:14, postWin:'22%', owner:'Repole Stable',   silk: { bg:'#8b1f2e', stripe:'#ffffff', patt:'cross' }, note: 'Class edge over field' },
  { pp: 2, name: 'GALWAY BAY',       jockey: 'F. Prat',        trainer: 'B. Mott',      odds: '6/1',   score: 82, edge: '+3.2%',  pace: 'S',    form: 'P43', spd:86, cls:'B+', e1:82, e2:88, daysOff:28, postWin:'15%', owner:'Phipps Stable',    silk: { bg:'#0d4f3c', stripe:'#f0c850', patt:'hoop' }, note: 'Closer in quick pace' },
  { pp: 5, name: 'PADDOCK PRINCE',   jockey: 'L. Saez',        trainer: 'C. Brown',     odds: '9/2',   score: 79, edge: '+1.8%',  pace: 'E',    form: 'W32', spd:84, cls:'B', e1:86, e2:84, daysOff:35, postWin:'12%', owner:'Klaravich Stables', silk: { bg:'#4a2c6a', stripe:'#ffe5a0', patt:'star' }, note: 'Speed figure trending up' },
  { pp: 1, name: 'COPPER LANTERN',   jockey: 'J. Rosario',     trainer: 'M. Casse',     odds: '8/1',   score: 71, edge: '-2.4%',  pace: 'P/S',  form: '54P', spd:80, cls:'B', e1:80, e2:82, daysOff:42, postWin:'10%', owner:'Gary Barber',       silk: { bg:'#c96a1e', stripe:'#1a1a1a', patt:'solid' }, note: 'Needs cleaner trip' },
  { pp: 6, name: 'BLUEGRASS BELLE',  jockey: 'T. Gaffalione',  trainer: 'K. McPeek',    odds: '12/1',  score: 64, edge: '-6.1%',  pace: 'S',    form: '685', spd:76, cls:'B-', e1:74, e2:80, daysOff:49, postWin:'8%',  owner:'Magdalena Racing',  silk: { bg:'#ffffff', stripe:'#8b1f2e', patt:'dot' }, note: 'Turf to dirt question' },
  { pp: 4, name: 'DRIFTWOOD KING',   jockey: 'J. Leparoux',    trainer: 'W. Mott',      odds: '15/1',  score: 58, edge: '-9.8%',  pace: 'P',    form: '768', spd:72, cls:'C+', e1:70, e2:76, daysOff:56, postWin:'6%',  owner:'West Point Thoroughbreds', silk: { bg:'#2a2a2a', stripe:'#d4af37', patt:'diamond' }, note: 'Trainer cold at 3%' },
  { pp: 8, name: 'RUNNING ON FAITH', jockey: 'R. Santana Jr.', trainer: 'S. Joseph Jr.',odds: '20/1',  score: 49, edge: '-14.2%', pace: 'S',    form: 'P87', spd:68, cls:'C', e1:66, e2:74, daysOff:63, postWin:'4%',  owner:'LNJ Foxwoods',      silk: { bg:'#c4c4c4', stripe:'#2a5e3a', patt:'quad' }, note: 'Stretch out first' },
];

// Past performance lines for HORSE PROFILE (Silver Reign)
const KPP = [
  { date:'Feb 24',   track:'FG',  race:'R8 ALW',  dist:'1 1/16', surf:'dirt', cond:'ft',  fin:'2nd', lengths:'1¼', time:'1:43.2', spd:91, pace:'E/P',  jky:'Castellano', odds:'3/1',  wgt:122 },
  { date:'Jan 20',   track:'FG',  race:'R6 ALW',  dist:'1m',     surf:'dirt', cond:'ft',  fin:'1st', lengths:'2',  time:'1:36.1', spd:89, pace:'E/P',  jky:'Castellano', odds:'5/2',  wgt:120 },
  { date:'Dec 28',   track:'FG',  race:'R7 ALW',  dist:'1m',     surf:'dirt', cond:'ft',  fin:'1st', lengths:'¾',  time:'1:37.8', spd:86, pace:'E',    jky:'Lanerie',    odds:'7/2',  wgt:120 },
  { date:'Nov 18',   track:'CD',  race:'R4 MSW',  dist:'6½f',    surf:'dirt', cond:'ft',  fin:'2nd', lengths:'nk', time:'1:16.4', spd:82, pace:'P',    jky:'Castellano', odds:'9/2',  wgt:119 },
  { date:'Oct 22',   track:'KEE', race:'R3 MSW',  dist:'6f',     surf:'dirt', cond:'ft',  fin:'4th', lengths:'4½', time:'1:10.2', spd:75, pace:'S',    jky:'Rosario',    odds:'12/1', wgt:118 },
];

const KWORKS = [
  { date:'Mar 14', track:'OP', dist:'5f',  time:'1:00.2', rank:'1/18', note:'Bullet, handily' },
  { date:'Mar 07', track:'OP', dist:'4f',  time:':48.1',  rank:'4/22', note:'Easy' },
  { date:'Feb 28', track:'OP', dist:'5f',  time:'1:01.4', rank:'6/14', note:'Breezing' },
  { date:'Feb 17', track:'FG', dist:'4f',  time:':49.2',  rank:'9/31', note:'Handily' },
];

const KBETS = [
  { id:1, race:4, type:'WIN',   sel:'3 Silver Reign',           amt:5,  odds:'7/2',  ret:22.50, status:'pending' },
  { id:2, race:4, type:'EX BOX',sel:'3/7',                       amt:2,  odds:'—',    ret:null,  status:'pending' },
  { id:3, race:7, type:'WIN',   sel:'3 Silver Reign',           amt:10, odds:'9/5',  ret:28.00, status:'pending' },
];

// NTRA-standard saddle cloth colors by post position (US Thoroughbred)
const KPP_COLORS = [
  null,
  { bg:'#c83030', fg:'#ffffff' }, // 1 red,     white #
  { bg:'#ffffff', fg:'#1a2420' }, // 2 white,   black #
  { bg:'#1a4a8a', fg:'#ffffff' }, // 3 blue,    white #
  { bg:'#f0c430', fg:'#1a2420' }, // 4 yellow,  black #
  { bg:'#1a1a1a', fg:'#f0c430' }, // 5 black,   yellow # (NTRA exception)
  { bg:'#1d6b45', fg:'#ffffff' }, // 6 green,   white #
  { bg:'#e07a2a', fg:'#1a2420' }, // 7 orange,  black # (NTRA exception)
  { bg:'#ec8fb0', fg:'#1a2420' }, // 8 pink,    black #
  { bg:'#4fc8c8', fg:'#1a2420' }, // 9 turquoise, black #
  { bg:'#5a2a7a', fg:'#ffffff' }, // 10 purple, white #
  { bg:'#5a4030', fg:'#ffffff' }, // 11 brown,  white #
  { bg:'#b0d050', fg:'#1a2420' }, // 12 lime,   black #
];

// ─── ANALYSIS TAB MOCK DATA (mirrors live app's backtest analytics) ──────
const KANALYSIS = {
  modelPerf: {
    topPickWinPct: 34.2,
    topThreeHitPct: 61.8,
    winRecord: '41 / 120',
    placeRecord: '74 / 120',
    sampleSize: 120,
  },
  kellyReplay: {
    startBank: 1000,
    endBank: 1286.40,
    peakBank: 1342.10,
    maxDrawdown: -12.4,
    betsPlaced: 58,
    hitRate: 31.0,
    record: '18-13-8',
    wagered: 742.00,
    returned: 1028.40,
    netPL: 286.40,
    roi: 28.6,
  },
  // 60 daily bankroll points for curve chart
  bankrollCurve: (() => {
    const pts = [];
    let bank = 1000;
    for (let i = 0; i <= 60; i++) {
      const daily = (Math.sin(i * 0.35) * 18) + (Math.random() - 0.45) * 35 + (i * 4.8);
      bank = 1000 + daily;
      pts.push({ day: i, bank: Math.max(900, bank) });
    }
    return pts;
  })(),
  perTrack: [
    { track:'Oaklawn',    races: 48, wins: 18, winPct: 37.5, roi:  31.2, net:  +124.80 },
    { track:'Keeneland',  races: 32, wins: 11, winPct: 34.4, roi:  22.0, net:   +70.40 },
    { track:'Churchill',  races: 22, wins:  7, winPct: 31.8, roi:  14.5, net:   +31.90 },
    { track:'Tampa Bay',  races: 10, wins:  3, winPct: 30.0, roi:  -8.2, net:   -18.20 },
    { track:'Gulfstream', races:  8, wins:  2, winPct: 25.0, roi: -22.5, net:   -18.00 },
  ],
  daily: [
    { date:'04-09', track:'OP',  races:10, wins:4, winPct:40.0 },
    { date:'04-08', track:'KEE', races: 9, wins:3, winPct:33.3 },
    { date:'04-07', track:'OP',  races: 8, wins:2, winPct:25.0 },
    { date:'04-06', track:'OP',  races:10, wins:4, winPct:40.0 },
    { date:'04-05', track:'KEE', races: 8, wins:3, winPct:37.5 },
    { date:'04-04', track:'OP',  races: 9, wins:2, winPct:22.2 },
    { date:'04-03', track:'CD',  races:10, wins:0, winPct: 0.0 },
  ],
  // Cumulative top-pick win % over sample size
  accuracyCurve: (() => {
    const pts = [];
    for (let i = 1; i <= 60; i++) {
      const noise = (Math.random() - 0.5) * 4;
      const base = 28 + (i > 15 ? 6 : 0) + (i > 35 ? 2 : 0);
      pts.push({ n: i * 2, pct: Math.max(12, Math.min(48, base + noise)) });
    }
    return pts;
  })(),
  components: {
    labels: ['SPD','FRM','CLS','PCE','JCK','TRN','WK','TREND'],
    winners:  [82, 74, 78, 71, 69, 72, 64, 76],
    topPicks: [79, 71, 76, 70, 70, 74, 60, 72],
  },
  weightTrend: (() => {
    const comps = ['SPD','FRM','CLS','PCE','JCK','TRN','WK','TREND'];
    const out = {};
    comps.forEach((c, ci) => {
      const arr = [];
      let base = 0.45 + (ci * 0.04) + Math.random() * 0.1;
      for (let i = 0; i < 20; i++) {
        base += (Math.random() - 0.5) * 0.08;
        base = Math.max(0.2, Math.min(0.95, base));
        arr.push({ t: i, val: base });
      }
      out[c] = arr;
    });
    return out;
  })(),
  // Avg component diff (winner - pick) on misses — positive means winner outscored pick on that component
  weightSensitivity: [
    { comp:'SPD',   diff: +3.2 },
    { comp:'FRM',   diff: +1.4 },
    { comp:'CLS',   diff: +4.8 },
    { comp:'PCE',   diff: +2.1 },
    { comp:'JCK',   diff: -0.7 },
    { comp:'TRN',   diff: +1.1 },
    { comp:'WK',    diff: +5.6 },
    { comp:'TREND', diff: +3.9 },
    { comp:'ML',    diff: -2.3 },
  ],
  betLog: [
    { date:'04-09', track:'OP',  r:4, pick:'Silver Reign',    conf:'HI',  odds:'7/2', stake:10, finish:'1st', payout:45.00, net:+35.00, bank:1286.40 },
    { date:'04-09', track:'OP',  r:3, pick:'Maple Drifter',   conf:'MED', odds:'5/1', stake: 6, finish:'3rd', payout: 0.00, net: -6.00, bank:1251.40 },
    { date:'04-08', track:'KEE', r:8, pick:'Copperline Rose', conf:'HI',  odds:'9/5', stake:10, finish:'1st', payout:28.00, net:+18.00, bank:1257.40 },
    { date:'04-08', track:'KEE', r:5, pick:'Galloping Gale',  conf:'LOW', odds:'8/1', stake: 4, finish:'4th', payout: 0.00, net: -4.00, bank:1239.40 },
    { date:'04-07', track:'OP',  r:7, pick:'Morning Harvest', conf:'MED', odds:'4/1', stake: 8, finish:'2nd', payout: 0.00, net: -8.00, bank:1243.40 },
    { date:'04-07', track:'OP',  r:2, pick:'Ironwood Bay',    conf:'HI',  odds:'3/1', stake:10, finish:'1st', payout:40.00, net:+30.00, bank:1251.40 },
    { date:'04-06', track:'OP',  r:9, pick:'Driftwood King',  conf:'MED', odds:'6/1', stake: 6, finish:'5th', payout: 0.00, net: -6.00, bank:1221.40 },
    { date:'04-06', track:'OP',  r:4, pick:'Galway Bay',      conf:'HI',  odds:'5/2', stake:12, finish:'1st', payout:42.00, net:+30.00, bank:1227.40 },
  ],
};

// Sire info for News tab — bloodlines
const KSIRES = [
  { sire:'Arrogate',       farm:'Juddmonte Farms',     fee:'$75,000', note:'Classic-distance influence; turf + dirt versatile progeny' },
  { sire:'Into Mischief',  farm:'Spendthrift Farm',    fee:'$250,000',note:'Leading NA sire 4 straight years; precocious 2yo types' },
  { sire:'Curlin',         farm:'Hill n Dale',         fee:'$225,000',note:'Stamina + class; produces graded-stakes routers' },
  { sire:'Ghostzapper',    farm:'Adena Springs',       fee:'$100,000',note:'Speed figures peak late; 3+ year old improvement' },
  { sire:'Tapit',          farm:'Gainesway Farm',      fee:'$125,000',note:'Classic distance, wet tracks; grey coat marker' },
];

Object.assign(window, { KT, KRACES, KHORSES, KPP, KWORKS, KBETS, KPP_COLORS, KANALYSIS, KSIRES });
