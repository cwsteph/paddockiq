// keeneland-race.jsx — Main app screen (parity with live PaddockIQ IA)
// Nav: Rankings / Exotics / Odds / Analysis / News
// Horse detail is INLINE EXPAND within Rankings (no separate screen)

function KRaceScreen({ nav, ui, params }) {
  const silksOn = ui.silksOn;
  const raceN = (params && params.race) || 4;
  const [tab, setTab] = React.useState('rankings');
  const race = KRACES.find(r => r.n === raceN) || KRACES[0];
  const isBig = race.big;

  return (
    <div style={{minHeight:'100%', background:KT.canvas, color:KT.ink, fontFamily:'Inter, sans-serif', paddingBottom:40}}>
      <KHeader current={raceN} track="Oaklawn Park" date="Apr 9, 2026" nRaces={KRACES.length}/>
      <KTrackActionBar/>

      <div style={{maxWidth:1100, margin:'0 auto', padding:'16px 24px'}}>
        <KConditionsBar/>
        {isBig && <KBigRaceSpotlight race={race}/>}
        <KRaceTabs current={raceN} onSelect={(n)=>nav('race',{race:n})}/>
        <KNavTabs current={tab} onSelect={setTab}/>

        {tab === 'rankings' && <KRankings race={race} silksOn={silksOn}/>}
        {tab === 'exotics'  && <KExotics race={race}/>}
        {tab === 'odds'     && <KOddsBoard race={race} silksOn={silksOn}/>}
        {tab === 'analysis' && <KAnalysis race={race}/>}
        {tab === 'news'     && <KNews race={race}/>}
      </div>
    </div>
  );
}

// ═══════════ BIG RACE SPOTLIGHT ═══════════
function KBigRaceSpotlight({ race }) {
  return (
    <div style={{margin:'0 0 12px', padding:'14px 18px', background:`linear-gradient(135deg, ${KT.cream} 0%, ${KT.brassSoft} 50%, ${KT.cream} 100%)`, border:`1px solid ${KT.brass}`, borderRadius:8}}>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
        <span style={{background:KT.brass, color:KT.canvas, fontSize:9.5, fontWeight:700, padding:'2px 8px', borderRadius:3, textTransform:'uppercase', letterSpacing:1, fontFamily:'Oswald, sans-serif'}}>Stakes</span>
        <KHead size={22} weight={800} color={KT.brass}>Rebel Stakes (G2)</KHead>
        <span style={{color:KT.muted, fontSize:12, marginLeft:6}}>· R{race.n} · {race.dist} · {race.surf} · {race.purse} · Post {race.time}</span>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:10}}>
        {KHORSES.slice(0,3).map((h,i) => (
          <div key={h.name} style={{background:'rgba(255,255,255,0.6)', border:`1px solid ${KT.rule}`, borderRadius:6, padding:'10px 12px'}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
              <div style={{fontFamily:'Playfair Display, serif', fontSize:20, fontWeight:800, color:KT.brass, minWidth:18}}>{i+1}</div>
              <KSaddle n={h.pp} size={22}/>
              <div style={{fontFamily:'Playfair Display, serif', fontWeight:700, fontSize:13.5, flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{h.name}</div>
              <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:11, color:KT.ink2, fontWeight:600}}>{h.score}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{fontSize:12, fontFamily:'Playfair Display, serif', fontStyle:'italic', color:KT.ink2, lineHeight:1.5, borderTop:`1px solid ${KT.rule}`, paddingTop:8}}>
        Silver Reign's tactical speed and class edge make him the horse to beat. Hot pace favors a stalker's trip.
      </div>
    </div>
  );
}

// ═══════════ RANKINGS TAB ═══════════
function KRankings({ race, silksOn }) {
  const [expanded, setExpanded] = React.useState({});
  const top = KHORSES[0];
  return (
    <div>
      <KPreRaceChecklist/>

      {/* TOP PICK card */}
      <div style={{background:`linear-gradient(135deg, ${KT.bg} 0%, ${KT.green} 85%)`, border:`1.5px solid ${KT.brass}`, borderRadius:8, padding:'16px 20px', marginBottom:14, display:'grid', gridTemplateColumns:'1fr 220px', gap:18, position:'relative', overflow:'hidden', boxShadow:'0 3px 10px rgba(13,61,46,0.15)'}}>
        <div style={{position:'absolute', top:-60, right:-60, width:200, height:200, background:`radial-gradient(circle, ${KT.brass}22, transparent 65%)`, pointerEvents:'none'}}/>
        <div style={{zIndex:1}}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
            <span style={{background:KT.brass, color:KT.bg, padding:'3px 10px', borderRadius:3, fontFamily:'Oswald, sans-serif', fontSize:10, letterSpacing:1.8, fontWeight:700}}>★ TOP PICK</span>
            <KLabel color={KT.brassHi} spacing={2} size={10}>Race {race.n}</KLabel>
          </div>
          <KHead size={30} weight={800} color="#f5e9c9">{top.name}</KHead>
          <div style={{fontFamily:'Playfair Display, serif', fontStyle:'italic', fontSize:12.5, color:'rgba(245,236,211,0.75)', marginTop:3, marginBottom:10}}>
            PP {top.pp} · {top.jockey} · {top.trainer}
          </div>
          <div style={{display:'flex', gap:6, marginBottom:10, flexWrap:'wrap'}}>
            <span style={{fontSize:10.5, padding:'3px 10px', border:`1px solid ${KT.brassHi}`, color:KT.brassHi, borderRadius:20, fontFamily:'Oswald, sans-serif', letterSpacing:1, fontWeight:600}}>ML {top.odds}</span>
            <span style={{fontSize:10.5, padding:'3px 10px', background:'rgba(78,201,126,0.18)', border:`1px solid #9ad89a`, color:'#9ad89a', borderRadius:20, fontFamily:'Oswald, sans-serif', letterSpacing:1, fontWeight:600}}>LIVE 3-1 ↓ STEAM</span>
            <span style={{fontSize:10.5, padding:'3px 10px', background:KT.brassHi, color:KT.bg, borderRadius:20, fontFamily:'Oswald, sans-serif', letterSpacing:1, fontWeight:700}}>IQ {top.score}</span>
            <span style={{fontSize:10.5, padding:'3px 10px', border:`1px solid ${KT.brassHi}`, color:KT.brassHi, borderRadius:20, fontFamily:'Oswald, sans-serif', letterSpacing:1, fontWeight:600}}>EDGE {top.edge}</span>
            <span style={{fontSize:10.5, padding:'3px 10px', background:'rgba(201,154,74,0.2)', border:`1px solid ${KT.brassHi}`, color:KT.brassHi, borderRadius:20, fontFamily:'Oswald, sans-serif', letterSpacing:1, fontWeight:700}}>✨ KACI ×1.2</span>
          </div>
          <div style={{fontSize:13, lineHeight:1.55, color:'rgba(245,236,211,0.9)', fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>
            Stands out on <b style={{color:KT.brassHi, fontStyle:'normal'}}>trainer</b> and <b style={{color:KT.brassHi, fontStyle:'normal'}}>jockey</b>. Beyers improving (82→86→89→91) — peaking on the clock. Model says 31%, line implies 22% — <b style={{color:'#9ad89a', fontStyle:'normal'}}>+9 edge</b>.
          </div>
          <div style={{fontSize:11, color:'rgba(245,236,211,0.6)', marginTop:10, paddingTop:8, borderTop:`1px solid rgba(212,175,55,0.25)`, fontFamily:'JetBrains Mono, monospace'}}>
            2nd: <b style={{color:KT.cream}}>{KHORSES[1].name}</b> 4-1 · 3rd: <b style={{color:KT.cream}}>{KHORSES[2].name}</b> 6-1 · 4th: <b style={{color:KT.cream}}>{KHORSES[3].name}</b> 9-2
          </div>
        </div>
        <div style={{background:'rgba(0,0,0,0.3)', border:`1.5px solid ${KT.brassHi}`, borderRadius:6, padding:'14px 16px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', zIndex:1}}>
          <KLabel color={KT.brassHi} spacing={3} size={11} style={{marginBottom:8, fontWeight:700}}>Kelly Stake</KLabel>
          <div style={{fontFamily:'Playfair Display, serif', fontSize:34, fontWeight:800, color:KT.brassHi, lineHeight:1}}>$6</div>
          <div style={{fontSize:10.5, color:'rgba(245,236,211,0.55)', fontFamily:'JetBrains Mono, monospace', marginTop:3}}>6% of $100.00</div>
          <div style={{fontSize:11, color:'#9ad89a', fontFamily:'JetBrains Mono, monospace', marginTop:4, fontWeight:600}}>To win ~$21.00</div>
          <div style={{width:40, height:1, background:KT.brassHi, margin:'10px 0'}}/>
          <div style={{fontSize:11, color:'rgba(245,236,211,0.75)', lineHeight:1.5, fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>
            HIGH confidence — model edge well above threshold.
          </div>
          <KButton variant="primary" size="sm" style={{marginTop:12}}>Log Bet</KButton>
        </div>
      </div>

      {/* Full Field Rankings */}
      <div style={{fontSize:11, color:KT.green, textTransform:'uppercase', letterSpacing:1.8, marginBottom:8, fontFamily:'Oswald, sans-serif', fontWeight:600, display:'flex', alignItems:'center', gap:10}}>
        <span>Full Field Rankings</span>
        <div style={{flex:1, height:1, background:`linear-gradient(90deg, ${KT.green}, transparent)`}}/>
        <span style={{fontSize:10, color:KT.muted, fontFamily:'Playfair Display, serif', fontStyle:'italic', letterSpacing:0, textTransform:'none'}}>Click any row to expand</span>
      </div>
      {KHORSES.map((h,i) => (
        <KHorseCard key={h.name} horse={h} rank={i+1} expanded={!!expanded[h.name]} onToggle={()=>setExpanded(e=>({...e, [h.name]: !e[h.name]}))}/>
      ))}

      {/* Scratched row */}
      <div style={{background:'rgba(139,35,48,0.04)', border:`1px solid rgba(139,35,48,0.15)`, borderRadius:6, marginBottom:6, padding:'9px 12px', opacity:0.55, display:'flex', alignItems:'center', gap:10}}>
        <div style={{fontFamily:'Playfair Display, serif', fontSize:18, color:'#8a7070', fontWeight:800, minWidth:22}}>9</div>
        <div style={{flex:1, textDecoration:'line-through', fontSize:13, color:'#8a7070'}}>Harbour Breeze</div>
        <span style={{fontSize:10, background:'#f0d8d8', color:KT.red, border:`1px solid ${KT.red}`, padding:'1px 8px', borderRadius:20, fontFamily:'Oswald, sans-serif', letterSpacing:1}}>SCR</span>
      </div>
    </div>
  );
}

// ═══════════ HORSE CARD (inline expand contains the full horse detail) ═══════════
function KHorseCard({ horse, rank, expanded, onToggle }) {
  const h = horse;
  const rankColor = rank === 1 ? KT.brass : rank === 2 ? KT.green : rank === 3 ? KT.redHi : KT.dim;
  const ppColor = KPP_COLORS[h.pp] || { bg:KT.bg, fg:KT.cream };
  return (
    <div style={{background: rank === 1 ? KT.panel : rank <= 3 ? KT.panelAlt : KT.panel, border:`1px solid ${rank === 1 ? KT.brass : KT.border}`, borderLeft: `4px solid ${rank === 1 ? KT.brass : rank === 2 ? KT.green : rank === 3 ? KT.redHi : KT.border}`, borderRadius:6, marginBottom:6, overflow:'hidden', boxShadow: rank === 1 ? '0 2px 6px rgba(13,61,46,0.08)' : 'none'}}>
      <div onClick={onToggle} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 16px', cursor:'pointer'}}>
        <div style={{fontFamily:'Playfair Display, serif', fontSize:24, fontWeight:800, color:rankColor, minWidth:24, lineHeight:1, textAlign:'center'}}>{rank}</div>
        <div style={{
          background: ppColor.bg, color: ppColor.fg,
          fontFamily:'Oswald, sans-serif', fontSize:14, fontWeight:700,
          width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center',
          borderRadius:3, flexShrink:0,
          border: h.pp === 2 ? `1px solid ${KT.ink}` : `1px solid rgba(0,0,0,0.18)`,
          boxShadow:'inset 0 -2px 0 rgba(0,0,0,0.12)',
        }}>{h.pp}</div>

        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:8, minWidth:0, flexWrap:'wrap'}}>
            <span style={{fontSize:14, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontFamily:'Playfair Display, serif', color:KT.ink}}>{h.name}</span>
            {rank === 1 && <Pill tone="brass" small>★ TOP PICK</Pill>}
            {rank === 1 && <Pill tone="green" small>↑ IMPROVING</Pill>}
            {rank === 2 && <Pill tone="green" small>● BULLET +7</Pill>}
            {rank === 4 && <Pill tone="red" small>↓ DECLINING</Pill>}
          </div>
          <div style={{fontSize:10.5, color:KT.muted, marginTop:2, fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>
            {h.jockey} · {h.trainer}
          </div>
        </div>

        <div style={{width:96, height:5, background:KT.rule2, borderRadius:3, overflow:'hidden'}}>
          <div style={{height:'100%', width:`${Math.min(100,h.score)}%`, background: rank === 1 ? `linear-gradient(90deg, ${KT.brass}, ${KT.brassHi})` : `linear-gradient(90deg, ${KT.green}, ${KT.green2})`}}/>
        </div>
        <div style={{fontFamily:'Playfair Display, serif', fontSize:20, fontWeight:800, color:rankColor, minWidth:36, textAlign:'right'}}>{h.score}</div>
        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2, minWidth:58, borderLeft:`1px solid ${KT.rule2}`, paddingLeft:10}}>
          <div style={{fontSize:9.5, color:KT.dim, fontFamily:'Oswald, sans-serif', letterSpacing:1}}>ML {h.odds}</div>
          <div style={{fontSize:12, fontWeight:700, color: rank<=2 ? KT.green : rank===KHORSES.length ? KT.red : KT.ink, fontFamily:'JetBrains Mono, monospace'}}>
            {rank===1 ? '3-1↓' : rank===2 ? '4-1↓' : h.odds}
          </div>
        </div>
      </div>

      {expanded && <KHorseDetailPanel horse={h} rank={rank}/>}
    </div>
  );
}

// ═══════════ HORSE DETAIL PANEL (full profile rendered inline under row) ═══════════
function KHorseDetailPanel({ horse, rank }) {
  const h = horse;
  const pp = (h.name === 'SILVER REIGN') ? KPP : KPP.slice(0, 4);
  const works = (h.name === 'SILVER REIGN') ? KWORKS : KWORKS.slice(0, 3);
  const [pane, setPane] = React.useState('past');

  return (
    <div style={{padding:'0 16px 16px', borderTop:`1px solid ${KT.rule2}`, background:KT.canvas}}>
      {/* Thesis */}
      <div style={{fontSize:12.5, color:KT.ink2, lineHeight:1.6, marginTop:12, marginBottom:10, fontFamily:'Playfair Display, serif', fontStyle:'italic', borderLeft:`2px solid ${KT.brass}`, paddingLeft:12}}>
        {h.note}. Sharp work pattern leading up to this. Jockey 18% win rate at meet.
      </div>

      {/* Stat grid */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(100px,1fr))', gap:5, margin:'8px 0 12px'}}>
        {[
          ['Beyer', h.spd], ['Style', h.pace], ['Jockey %', '18%'], ['Trainer %', '22%'],
          ['Layoff', h.daysOff+'d'], ['Equipment', 'Lasix'], ['Class', h.cls],
          ['Post Win %', h.postWin], ['Dist Fit', '✓'], ['E1 / E2', `${h.e1}/${h.e2}`],
          ['Final Score', h.score],
        ].map(([l,v]) => (
          <div key={l} style={{background:KT.panel, border:`1px solid ${KT.rule2}`, borderRadius:4, padding:'6px 9px'}}>
            <div style={{fontSize:9, color:KT.dim, textTransform:'uppercase', letterSpacing:0.8, fontFamily:'Oswald, sans-serif'}}>{l}</div>
            <div style={{fontSize:12.5, fontWeight:700, color: l==='Final Score' ? KT.brass : KT.ink, marginTop:1, fontFamily:'JetBrains Mono, monospace'}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{display:'flex', gap:4, marginBottom:10, borderBottom:`1px solid ${KT.rule2}`}}>
        {[
          ['past',"Past Performances"],
          ['works',"Workouts"],
          ['kaci',"Kaci Adjust"],
          ['conn',"Connections"],
        ].map(([id,label]) => (
          <button key={id} onClick={()=>setPane(id)} style={{
            padding:'6px 12px', border:'none', background:'transparent',
            color: pane===id ? KT.green : KT.muted, fontFamily:'Oswald, sans-serif',
            fontSize:11, letterSpacing:1.5, textTransform:'uppercase', fontWeight: pane===id ? 700 : 500,
            borderBottom: pane===id ? `2px solid ${KT.green}` : '2px solid transparent',
            cursor:'pointer', marginBottom:-1,
          }}>{label}</button>
        ))}
      </div>

      {pane === 'past' && <KPastPerfPane pp={pp} spds={pp.map(p=>p.spd)}/>}
      {pane === 'works' && <KWorkoutsPane works={works}/>}
      {pane === 'kaci' && <KKaciAdjustPane rank={rank}/>}
      {pane === 'conn' && <KConnectionsPane horse={h}/>}
    </div>
  );
}

function KPastPerfPane({ pp, spds }) {
  const min = Math.min(...spds), max = Math.max(...spds);
  const pts = spds.map((s, i) => {
    const x = 12 + i * (280 / (spds.length - 1));
    const y = 44 - ((s - min) / Math.max(1, max - min)) * 30;
    return [x, y];
  });
  const polyline = pts.map(p => p.join(',')).join(' ');
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 310px', gap:14}}>
      <div style={{background:KT.panel, border:`1px solid ${KT.rule2}`, borderRadius:4, overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:'54px 32px 60px 44px 40px 36px 44px 52px 38px 64px', gap:6, padding:'7px 10px', background:KT.canvas2, fontSize:9, color:KT.dim, textTransform:'uppercase', letterSpacing:0.8, fontFamily:'Oswald, sans-serif'}}>
          <div>Date</div><div>Trk</div><div>Race</div><div>Dist</div><div>Surf</div><div>Cond</div><div>Fin</div><div>Time</div><div>Spd</div><div>Jky</div>
        </div>
        {pp.map((p,i) => (
          <div key={i} style={{display:'grid', gridTemplateColumns:'54px 32px 60px 44px 40px 36px 44px 52px 38px 64px', gap:6, padding:'8px 10px', borderTop:`1px solid ${KT.rule2}`, fontSize:11, fontFamily:'JetBrains Mono, monospace', alignItems:'center'}}>
            <div style={{color:KT.ink2, fontFamily:'Playfair Display, serif', fontSize:11.5, fontStyle:'italic'}}>{p.date}</div>
            <div style={{color:KT.brass, fontWeight:700}}>{p.track}</div>
            <div style={{color:KT.ink2}}>{p.race}</div>
            <div style={{color:KT.ink2}}>{p.dist}</div>
            <div style={{color:KT.ink2}}>{p.surf}</div>
            <div style={{color:KT.ink2}}>{p.cond}</div>
            <div style={{color: p.fin==='1st' ? KT.green : p.fin==='2nd' ? KT.brass : KT.ink2, fontWeight:700}}>{p.fin}</div>
            <div style={{color:KT.ink2}}>{p.time}</div>
            <div style={{color:KT.brass, fontWeight:700}}>{p.spd}</div>
            <div style={{color:KT.muted, fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>{p.jky}</div>
          </div>
        ))}
      </div>
      <div style={{background:KT.panel, border:`1px solid ${KT.rule2}`, borderRadius:4, padding:'10px 12px'}}>
        <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:6}}>
          <KLabel spacing={1.5} size={10} color={KT.brass} style={{fontWeight:700}}>Speed Figure Trend</KLabel>
          <span style={{fontSize:10, color:KT.green, fontFamily:'JetBrains Mono, monospace', marginLeft:'auto'}}>+{max-spds[0]} over 5 starts</span>
        </div>
        <svg width="100%" height="60" viewBox="0 0 300 60">
          {[15, 30, 45].map(y => <line key={y} x1={10} y1={y} x2={290} y2={y} stroke={KT.rule2} strokeWidth="0.5"/>)}
          <polyline points={polyline} fill="none" stroke={KT.green} strokeWidth="2"/>
          {pts.map((p,i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={KT.green}/>)}
          {pts.map((p,i) => <text key={'l'+i} x={p[0]} y={p[1]-7} fontSize="9" fill={KT.ink2} textAnchor="middle" fontFamily="JetBrains Mono, monospace">{spds[i]}</text>)}
        </svg>
        <div style={{fontSize:11, fontFamily:'Playfair Display, serif', fontStyle:'italic', color:KT.ink2, lineHeight:1.5, marginTop:6, borderTop:`1px solid ${KT.rule2}`, paddingTop:6}}>
          Peaking on the clock, drops a class, draws well. Fair at 7/2 or better.
        </div>
      </div>
    </div>
  );
}

function KWorkoutsPane({ works }) {
  return (
    <div style={{background:KT.panel, border:`1px solid ${KT.rule2}`, borderRadius:4, padding:'10px 12px'}}>
      {works.map((w,i) => (
        <div key={i} style={{display:'grid', gridTemplateColumns:'60px 44px 50px 60px 56px 1fr', gap:10, padding:'8px 0', borderBottom: i<works.length-1 ? `1px solid ${KT.rule2}` : 'none', alignItems:'center', fontSize:11.5}}>
          <div style={{color:KT.brass, fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>{w.date}</div>
          <div style={{color:KT.ink2, fontFamily:'Oswald, sans-serif', letterSpacing:1, fontWeight:600}}>{w.track}</div>
          <div style={{color:KT.ink2, fontFamily:'JetBrains Mono, monospace'}}>{w.dist}</div>
          <div style={{color:KT.brass, fontFamily:'JetBrains Mono, monospace', fontWeight:700}}>{w.time}</div>
          <div style={{color:KT.muted, fontFamily:'JetBrains Mono, monospace', fontSize:10}}>{w.rank}</div>
          <div style={{color:KT.ink2, fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>{w.note}</div>
        </div>
      ))}
    </div>
  );
}

function KKaciAdjustPane({ rank }) {
  const attrs = [
    { k:'Carry',      emoji:'💪', desc:'How the horse carries itself', v: rank===1?'+10':rank===2?'+5':'0' },
    { k:'Conform',    emoji:'🧬', desc:'Conformation & build',          v: rank===1?'+10':rank<=3?'+5':'0' },
    { k:'Temperament',emoji:'🧘', desc:'Paddock demeanor',              v: rank===1?'+5' :rank===2?'0':'-5' },
    { k:'Coat',       emoji:'✨', desc:'Shine & condition',             v: rank<=3?'+5':'0' },
    { k:'Sweat',      emoji:'💧', desc:'Washiness / overheating',       v: rank===1?'0':'-5' },
    { k:'Energy',     emoji:'⚡', desc:'Alert vs. lethargic',           v: rank<=2?'+5':'0' },
  ];
  const total = attrs.reduce((s,a)=>s + (parseInt(a.v,10)||0), 0);
  return (
    <div>
      <div style={{background:`linear-gradient(90deg, ${KT.bg}, ${KT.green})`, border:`1px solid ${KT.brass}`, borderRadius:6, padding:'10px 14px', marginBottom:10, display:'flex', alignItems:'center', gap:10}}>
        <KKaciAvatar size={28}/>
        <div>
          <div style={{color:KT.brassHi, fontFamily:'Oswald, sans-serif', fontSize:10.5, letterSpacing:1.8, fontWeight:700}}>KACI ADJUSTMENT</div>
          <div style={{color:'rgba(245,236,211,0.7)', fontFamily:'Playfair Display, serif', fontStyle:'italic', fontSize:11.5}}>
            Per-horse overrides applied to the model score
          </div>
        </div>
        <div style={{marginLeft:'auto', fontFamily:'Playfair Display, serif', fontSize:26, fontWeight:800, color: total>0?'#9ad89a':total<0?'#e8a89a':KT.brassHi}}>
          {total>0?'+':''}{total}
        </div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:8}}>
        {attrs.map(a => (
          <div key={a.k} style={{background:KT.panel, border:`1px solid ${KT.rule2}`, borderRadius:4, padding:'9px 12px'}}>
            <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:3}}>
              <div style={{fontFamily:'Oswald, sans-serif', fontSize:11, letterSpacing:1.2, fontWeight:600, color:KT.ink, flex:1}}>
                <span style={{marginRight:6, fontSize:13}}>{a.emoji}</span>{a.k}
              </div>
              <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:11.5, fontWeight:700, color: a.v.startsWith('+')?KT.green:a.v.startsWith('-')?KT.red:KT.muted}}>{a.v}</div>
            </div>
            <div style={{fontSize:10.5, color:KT.muted, fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>{a.desc}</div>
            <div style={{display:'flex', gap:3, marginTop:6}}>
              {['−10','−5','0','+5','+10'].map(v => (
                <button key={v} style={{
                  flex:1, padding:'3px 0', fontSize:10, fontFamily:'JetBrains Mono, monospace',
                  border:`1px solid ${v===a.v ? KT.brass : KT.rule2}`,
                  background: v===a.v ? KT.brassSoft : 'transparent',
                  color: v===a.v ? KT.brass : KT.muted,
                  borderRadius:3, cursor:'pointer', fontWeight: v===a.v ? 700 : 400,
                }}>{v}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KConnectionsPane({ horse }) {
  const h = horse;
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
      <div style={{background:KT.panel, border:`1px solid ${KT.rule2}`, borderRadius:4, padding:'12px 14px'}}>
        <KLabel spacing={1.5} size={10} color={KT.brass} style={{fontWeight:700, marginBottom:8}}>Connections</KLabel>
        {[
          ['Owner',   h.owner],
          ['Trainer', `${h.trainer} · 22% win`],
          ['Jockey',  `${h.jockey} · 18% win`],
        ].map(([l,v]) => (
          <div key={l} style={{display:'flex', gap:8, padding:'6px 0', borderBottom:`1px solid ${KT.rule2}`, fontSize:12}}>
            <div style={{color:KT.muted, minWidth:70, fontFamily:'Oswald, sans-serif', letterSpacing:1, fontSize:10, textTransform:'uppercase'}}>{l}</div>
            <div style={{color:KT.ink, fontFamily:'Playfair Display, serif'}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{background:KT.panel, border:`1px solid ${KT.rule2}`, borderRadius:4, padding:'12px 14px'}}>
        <KLabel spacing={1.5} size={10} color={KT.brass} style={{fontWeight:700, marginBottom:8}}>Pedigree</KLabel>
        <div style={{fontFamily:'Playfair Display, serif', fontSize:13.5, color:KT.ink, fontStyle:'italic'}}>
          By <b style={{fontStyle:'normal'}}>Arrogate</b> out of <b style={{fontStyle:'normal'}}>Lady Marian</b>, by Ghostzapper
        </div>
        <div style={{fontSize:11, color:KT.muted, fontFamily:'Playfair Display, serif', fontStyle:'italic', marginTop:6, lineHeight:1.5}}>
          Classic-distance influence from the top side; Ghostzapper broodmare sire adds dirt speed. Distance versatile.
        </div>
      </div>
    </div>
  );
}

// ═══════════ PILL ATOM ═══════════
function Pill({ tone='muted', small, children }) {
  const tones = {
    brass:  { bg:KT.brassSoft, bd:KT.brass,   fg:KT.brass  },
    green:  { bg:'#e8f2e8',    bd:KT.green,   fg:KT.green  },
    red:    { bg:'#f0d8dc',    bd:KT.red,     fg:KT.red    },
    muted:  { bg:'transparent',bd:KT.border,  fg:KT.muted  },
  }[tone] || { bg:'transparent', bd:KT.border, fg:KT.muted };
  return (
    <span style={{
      display:'inline-block', padding: small ? '1px 7px' : '2px 10px',
      borderRadius:20, fontSize: small ? 9.5 : 11,
      border:`1px solid ${tones.bd}`, background:tones.bg, color:tones.fg,
      fontFamily:'Oswald, sans-serif', letterSpacing: small ? 1 : 0.5, fontWeight: small ? 700 : 500,
    }}>{children}</span>
  );
}

// ═══════════ EXOTICS TAB (parity with live — confidence tiers + medals + EXA/TRI box + thesis) ═══════════
function KExotics({ race }) {
  const recommendedRaces = [
    { n: 4, conf:'STRONG',   gap: 18.4, score: 82, exa:{cost:10,  combos:6}, tri:{cost:24, combos:24}, thesis:'Silver Reign looks uncatchable but #7 Morning Harvest and #2 Galway Bay are clear exotic partners. Gap of 18 points between top 3 and the rest.' },
    { n: 7, conf:'STRONG',   gap: 14.2, score: 76, exa:{cost:12,  combos:8}, tri:{cost:48, combos:48}, thesis:'Rebel Stakes — top pick Silver Reign 12% edge, #7 Morning Harvest class drop, #5 Paddock Prince figures peaking. Hot pace favors closers #3.' },
    { n: 9, conf:'GOOD',     gap:  9.1, score: 64, exa:{cost: 8,  combos:4}, tri:{cost:24, combos:24}, thesis:'Allowance mile, five legitimate contenders. Box top 3 for exacta; expand for tri.' },
    { n: 5, conf:'MARGINAL', gap:  4.8, score: 52, exa:{cost:10,  combos:6}, tri:null,                 thesis:'Turf mile, bunched field. Small exacta only.' },
  ];
  const medals = ['🥇','🥈','🥉'];
  return (
    <div style={{display:'flex', flexDirection:'column', gap:14}}>
      {/* Summary */}
      <div style={{background:`linear-gradient(135deg, ${KT.bg}, ${KT.green})`, color:KT.cream, border:`1.5px solid ${KT.brass}`, borderRadius:8, padding:'14px 18px', display:'grid', gridTemplateColumns:'1.3fr 1fr 1fr 1fr', gap:12, alignItems:'center'}}>
        <div>
          <div style={{fontFamily:'Oswald, sans-serif', fontSize:10.5, letterSpacing:2, color:KT.brassHi, fontWeight:700, textTransform:'uppercase'}}>Exotic Bet Picks</div>
          <div style={{fontFamily:'Playfair Display, serif', fontSize:16, fontWeight:700, fontStyle:'italic', marginTop:3, color:'rgba(245,236,211,0.9)'}}>Algorithm recommends 4 best exotic races today</div>
        </div>
        {[
          ['Recommended', 4, KT.brassHi],
          ['Exacta Cost', '$40',   '#9ad89a'],
          ['Trifecta Cost', '$96', '#9ad89a'],
        ].map(([l,v,c]) => (
          <div key={l}>
            <div style={{fontFamily:'Oswald, sans-serif', fontSize:9.5, letterSpacing:1.5, color:'rgba(245,236,211,0.6)', textTransform:'uppercase'}}>{l}</div>
            <div style={{fontFamily:'Playfair Display, serif', fontSize:24, fontWeight:800, color:c}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Top 3 medals + race cards */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10}}>
        {recommendedRaces.slice(0,4).map((r, i) => (
          <div key={r.n} style={{background:KT.panel, border:`1px solid ${i<3 ? KT.brass : KT.border}`, borderRadius:8, padding:'14px 16px', position:'relative'}}>
            {i<3 && <div style={{position:'absolute', top:-10, left:14, background:KT.panel, padding:'0 6px', fontSize:18, lineHeight:1}}>{medals[i]}</div>}
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
              <div style={{fontFamily:'Playfair Display, serif', fontSize:22, fontWeight:800, color:KT.brass}}>R{r.n}</div>
              <KOrnament width={24}/>
              <span style={{padding:'2px 10px', fontSize:9.5, letterSpacing:1.5, fontWeight:700, fontFamily:'Oswald, sans-serif', borderRadius:3,
                background: r.conf==='STRONG' ? KT.green : r.conf==='GOOD' ? KT.brass : 'rgba(168,48,64,0.15)',
                color: r.conf==='STRONG' ? KT.cream : r.conf==='GOOD' ? KT.bg : KT.red,
                border: r.conf==='MARGINAL' ? `1px solid ${KT.red}` : 'none',
              }}>{r.conf}</span>
              <div style={{marginLeft:'auto', fontFamily:'JetBrains Mono, monospace', fontSize:10.5, color:KT.muted}}>
                GAP <b style={{color:KT.brass}}>{r.gap.toFixed(1)}</b> · SCORE <b style={{color:KT.brass}}>{r.score}</b>
              </div>
            </div>
            <div style={{display:'flex', gap:4, flexWrap:'wrap', marginBottom:8}}>
              {KHORSES.slice(0,5).map((h,hi) => (
                <div key={h.name} style={{display:'flex', alignItems:'center', gap:4, padding:'4px 8px', background:KT.canvas2, borderRadius:20, border:`1px solid ${KT.rule2}`}}>
                  <KSaddle n={h.pp} size={16}/>
                  <span style={{fontSize:10.5, fontFamily:'JetBrains Mono, monospace', color:KT.brass, fontWeight:600}}>{h.score}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:8}}>
              <div style={{background:KT.canvas, border:`1px solid ${KT.brass}`, borderRadius:4, padding:'6px 10px', flex:1}}>
                <div style={{fontFamily:'Oswald, sans-serif', fontSize:9, letterSpacing:1.5, color:KT.brass, fontWeight:700}}>EXA BOX {r.exa.combos}H</div>
                <div style={{fontSize:10.5, color:KT.muted, fontFamily:'JetBrains Mono, monospace'}}>3/7/2 · ${r.exa.cost}</div>
              </div>
              {r.tri && (
                <div style={{background:KT.canvas, border:`1px solid ${KT.brass}`, borderRadius:4, padding:'6px 10px', flex:1}}>
                  <div style={{fontFamily:'Oswald, sans-serif', fontSize:9, letterSpacing:1.5, color:KT.brass, fontWeight:700}}>TRI BOX {r.tri.combos}H</div>
                  <div style={{fontSize:10.5, color:KT.muted, fontFamily:'JetBrains Mono, monospace'}}>3/7/2/5 · ${r.tri.cost}</div>
                </div>
              )}
            </div>
            <div style={{fontSize:11.5, fontFamily:'Playfair Display, serif', fontStyle:'italic', color:KT.ink2, lineHeight:1.5, borderTop:`1px solid ${KT.rule2}`, paddingTop:8}}>
              {r.thesis}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════ ODDS TAB (Scratches card + Fetch Live Odds + Live Odds table) ═══════════
function KOddsBoard({ race, silksOn }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:14}}>
      {/* Scratches & Changes card */}
      <div style={{background:KT.panel, border:`1px solid ${KT.border}`, borderLeft:`4px solid ${KT.red}`, borderRadius:8, padding:'12px 16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
          <KLabel spacing={1.5} size={10} color={KT.red} style={{fontWeight:700}}>Scratches & Changes</KLabel>
          <span style={{fontSize:11, color:KT.muted}}>Tap a PP to mark scratched</span>
          <div style={{marginLeft:'auto', display:'flex', gap:6}}>
            <KButton variant="ghost" size="sm">Detect from TVG</KButton>
          </div>
        </div>
        <div style={{display:'flex', gap:6, marginTop:10, flexWrap:'wrap'}}>
          {[1,2,3,4,5,6,7,8,9,10].map(pp => {
            const scratched = pp === 9;
            return (
              <button key={pp} style={{
                display:'flex', alignItems:'center', gap:5, padding:'5px 11px',
                border:`1px solid ${scratched ? KT.red : KT.border}`,
                background: scratched ? 'rgba(139,35,48,0.08)' : 'transparent',
                color: scratched ? KT.red : KT.ink2,
                borderRadius:20, cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif',
                textDecoration: scratched ? 'line-through' : 'none',
              }}>
                <KSaddle n={pp} size={18}/>
                <span>PP {pp}</span>
                {scratched && <span style={{fontSize:9, color:KT.red, fontFamily:'Oswald, sans-serif', letterSpacing:1, fontWeight:700}}>SCR</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Odds table */}
      <div style={{background:KT.panel, border:`1px solid ${KT.border}`, borderRadius:8, padding:'16px 20px'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:14, flexWrap:'wrap'}}>
          <KHead size={18} weight={700}>Live Odds</KHead>
          <span style={{fontSize:10.5, color:KT.muted}}>Tote board · updated 12s ago</span>
          <div style={{marginLeft:'auto', display:'flex', gap:8, alignItems:'center'}}>
            <span style={{width:6, height:6, borderRadius:'50%', background:KT.green, display:'inline-block', animation:'kpulse 1.5s infinite'}}/>
            <span style={{fontSize:10.5, color:KT.green}}>Live</span>
            <KButton variant="primary" size="sm">Fetch Live Odds</KButton>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'32px 1fr 70px 70px 70px 80px 80px', gap:8, padding:'8px 10px', background:KT.canvas2, borderRadius:4, marginBottom:6, fontSize:9.5, color:KT.dim, textTransform:'uppercase', fontFamily:'Oswald, sans-serif', letterSpacing:0.8}}>
          <div>PP</div><div>Horse</div><div style={{textAlign:'right'}}>ML</div><div style={{textAlign:'right'}}>Live</div><div style={{textAlign:'right'}}>Move</div><div style={{textAlign:'right'}}>Pool %</div><div style={{textAlign:'right'}}>Implied</div>
        </div>
        {KHORSES.map((h,i) => {
          const liveNums = ['3-1','4-1','5-1','9-2','8-1','10-1','15-1','25-1'];
          const moves = ['↓ STEAM','↓ STEAM','→','↑ DRIFT','→','↑ DRIFT','↑ DRIFT','↑ DRIFT'];
          const moveColors = [KT.green,KT.green,KT.muted,KT.red,KT.muted,KT.red,KT.red,KT.red];
          const pool = [24.3, 19.1, 16.2, 12.8, 9.4, 7.7, 5.8, 4.7];
          return (
            <div key={h.name} style={{display:'grid', gridTemplateColumns:'32px 1fr 70px 70px 70px 80px 80px', gap:8, padding:'8px 10px', alignItems:'center', borderBottom:`1px solid ${KT.rule2}`}}>
              <div><KSaddle n={h.pp} size={22}/></div>
              <div style={{fontSize:13, fontWeight:500}}>{h.name}</div>
              <div style={{textAlign:'right', fontFamily:'JetBrains Mono, monospace', fontSize:12, color:KT.ink2}}>{h.odds}</div>
              <div style={{textAlign:'right', fontFamily:'JetBrains Mono, monospace', fontSize:12, color:KT.brass, fontWeight:600}}>{liveNums[i]}</div>
              <div style={{textAlign:'right', color:moveColors[i], fontWeight:700, fontSize:10, fontFamily:'Oswald, sans-serif', letterSpacing:1}}>{moves[i]}</div>
              <div style={{textAlign:'right', fontFamily:'JetBrains Mono, monospace', fontSize:11.5, color:KT.ink2}}>{pool[i].toFixed(1)}%</div>
              <div style={{textAlign:'right', fontFamily:'JetBrains Mono, monospace', fontSize:11.5, color:KT.muted}}>{pool[i].toFixed(0)}%</div>
            </div>
          );
        })}
        <div style={{marginTop:12, display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10}}>
          {[['Win Pool','$142,840'],['Place Pool','$48,210'],['Show Pool','$32,580'],['Exacta Pool','$76,100']].map(([l,v])=>(
            <div key={l} style={{background:KT.canvas, border:`1px solid ${KT.border}`, borderRadius:4, padding:'8px 10px'}}>
              <div style={{fontSize:9, color:KT.dim, textTransform:'uppercase', letterSpacing:0.8, fontFamily:'Oswald, sans-serif'}}>{l}</div>
              <div style={{fontFamily:'Playfair Display, serif', fontSize:16, fontWeight:700, color:KT.ink}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════ ANALYSIS TAB — full parity with live (10 visualizations) ═══════════
function KAnalysis({ race }) {
  const [tFilter, setTFilter] = React.useState('all');
  const A = KANALYSIS;
  return (
    <div style={{display:'flex', flexDirection:'column', gap:14}}>

      {/* Controls row */}
      <div style={{background:KT.panel, border:`1px solid ${KT.border}`, borderRadius:8, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
        <KLabel spacing={1.5} size={10} color={KT.green} style={{fontWeight:700}}>Track Filter</KLabel>
        {[['all','All Tracks'],['op','Oaklawn'],['kee','Keeneland'],['cd','Churchill']].map(([id,lbl]) => (
          <button key={id} onClick={()=>setTFilter(id)} style={{
            padding:'4px 12px', borderRadius:20, fontSize:11,
            border:`1.5px solid ${tFilter===id ? KT.green : KT.border}`,
            background: tFilter===id ? KT.greenSoft : 'transparent',
            color: tFilter===id ? KT.green : KT.muted,
            cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight: tFilter===id ? 600 : 400,
          }}>{lbl}</button>
        ))}
        <div style={{width:1, height:20, background:KT.rule2}}/>
        <KLabel spacing={1.5} size={10} color={KT.muted}>Range</KLabel>
        <input type="text" defaultValue="2026-02-01" style={{padding:'4px 8px', fontSize:11, border:`1px solid ${KT.border}`, borderRadius:4, fontFamily:'JetBrains Mono, monospace', background:KT.canvas}}/>
        <span style={{color:KT.dim}}>→</span>
        <input type="text" defaultValue="2026-04-09" style={{padding:'4px 8px', fontSize:11, border:`1px solid ${KT.border}`, borderRadius:4, fontFamily:'JetBrains Mono, monospace', background:KT.canvas}}/>
        <div style={{marginLeft:'auto', display:'flex', gap:6}}>
          <KButton variant="ghost" size="sm">Backfill from TVG</KButton>
          <KButton variant="primary" size="sm">Load Analysis</KButton>
        </div>
      </div>

      {/* Row 1: Model Performance + Kelly Replay */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:14}}>
        <KAnalysisCard title="Model Performance">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            <KStatBlock label="Top Pick Win %"  value={`${A.modelPerf.topPickWinPct.toFixed(1)}%`} accent={KT.green}/>
            <KStatBlock label="Top 3 Hit %"      value={`${A.modelPerf.topThreeHitPct.toFixed(1)}%`} accent={KT.green}/>
            <KStatBlock label="Win Record"       value={A.modelPerf.winRecord}     accent={KT.brass}/>
            <KStatBlock label="Place Record"     value={A.modelPerf.placeRecord}   accent={KT.brass}/>
          </div>
          <div style={{fontSize:10, color:KT.muted, fontFamily:'Oswald, sans-serif', letterSpacing:1, textTransform:'uppercase', marginTop:8, textAlign:'center'}}>
            Sample · {A.modelPerf.sampleSize} races
          </div>
        </KAnalysisCard>

        <KAnalysisCard title="Kelly Replay Simulation">
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:10}}>
            <KStatBlock label="Starting Bank" value={`$${A.kellyReplay.startBank.toFixed(2)}`}/>
            <KStatBlock label="Ending Bank"   value={`$${A.kellyReplay.endBank.toFixed(2)}`} accent={KT.green}/>
            <KStatBlock label="Peak Bank"     value={`$${A.kellyReplay.peakBank.toFixed(2)}`} accent={KT.brass}/>
            <KStatBlock label="Max Drawdown"  value={`${A.kellyReplay.maxDrawdown.toFixed(1)}%`} accent={KT.red}/>
            <KStatBlock label="Hit Rate"      value={`${A.kellyReplay.hitRate.toFixed(1)}%`}/>
            <KStatBlock label="Record"        value={A.kellyReplay.record}/>
            <KStatBlock label="Wagered"       value={`$${A.kellyReplay.wagered.toFixed(2)}`}/>
            <KStatBlock label="Returned"      value={`$${A.kellyReplay.returned.toFixed(2)}`}/>
            <KStatBlock label="Net P/L"       value={`+$${A.kellyReplay.netPL.toFixed(2)}`} accent={KT.green}/>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:KT.canvas, borderLeft:`3px solid ${KT.green}`, borderRadius:4}}>
            <KLabel spacing={1.5} size={10} color={KT.green} style={{fontWeight:700}}>ROI</KLabel>
            <div style={{fontFamily:'Playfair Display, serif', fontSize:22, fontWeight:800, color:KT.green}}>+{A.kellyReplay.roi}%</div>
            <span style={{marginLeft:'auto', fontSize:11, color:KT.muted, fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>
              {A.kellyReplay.betsPlaced} bets placed
            </span>
          </div>
        </KAnalysisCard>
      </div>

      {/* Bankroll curve */}
      <KAnalysisCard title="Bankroll Curve" subtitle="Kelly replay simulation over 60 days">
        <KLineChart data={A.bankrollCurve} xKey="day" yKey="bank" height={160} stroke={KT.green} fill="rgba(13,79,60,0.1)" yFmt={v=>`$${Math.round(v)}`}/>
      </KAnalysisCard>

      {/* Row 2: Per-Track Summary + Daily Performance */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <KAnalysisCard title="Per-Track Summary">
          <div style={{display:'grid', gridTemplateColumns:'1.3fr 0.7fr 0.7fr 0.8fr 0.8fr 0.9fr', gap:6, padding:'6px 0', borderBottom:`1px solid ${KT.rule2}`, fontSize:9.5, color:KT.dim, textTransform:'uppercase', fontFamily:'Oswald, sans-serif', letterSpacing:0.8}}>
            <div>Track</div><div style={{textAlign:'right'}}>Races</div><div style={{textAlign:'right'}}>Wins</div><div style={{textAlign:'right'}}>Win %</div><div style={{textAlign:'right'}}>ROI</div><div style={{textAlign:'right'}}>Net</div>
          </div>
          {A.perTrack.map(t => {
            const winning = t.roi > 0;
            const tintBg = winning ? `rgba(13,79,60,${Math.min(0.14, Math.abs(t.roi)/300)})` : `rgba(139,35,48,${Math.min(0.10, Math.abs(t.roi)/300)})`;
            return (
              <div key={t.track} style={{display:'grid', gridTemplateColumns:'1.3fr 0.7fr 0.7fr 0.8fr 0.8fr 0.9fr', gap:6, padding:'8px 10px', borderBottom:`1px solid ${KT.rule2}`, fontSize:11.5, alignItems:'center', background:tintBg, borderLeft:`3px solid ${winning ? KT.green : KT.red}`, marginLeft:-10, marginRight:-10}}>
                <div style={{fontFamily:'Oswald, sans-serif', letterSpacing:1, color:KT.brass, fontWeight:600, paddingLeft:10}}>{t.track.toUpperCase()}</div>
                <div style={{textAlign:'right', fontFamily:'JetBrains Mono, monospace'}}>{t.races}</div>
                <div style={{textAlign:'right', fontFamily:'JetBrains Mono, monospace', color:KT.green, fontWeight:600}}>{t.wins}</div>
                <div style={{textAlign:'right', fontFamily:'JetBrains Mono, monospace'}}>{t.winPct.toFixed(1)}%</div>
                <div style={{textAlign:'right', fontFamily:'JetBrains Mono, monospace', color: winning?KT.green:KT.red, fontWeight:700}}>{winning?'▲ +':'▼ '}{t.roi.toFixed(1)}%</div>
                <div style={{textAlign:'right', fontFamily:'JetBrains Mono, monospace', color: t.net>0?KT.green:KT.red, fontWeight:600, paddingRight:10}}>{t.net>0?'+':'−'}${Math.abs(t.net).toFixed(2)}</div>
              </div>
            );
          })}
        </KAnalysisCard>

        <KAnalysisCard title="Daily Performance">
          <div style={{display:'grid', gridTemplateColumns:'0.8fr 0.6fr 0.7fr 0.6fr 0.8fr', gap:6, padding:'6px 0', borderBottom:`1px solid ${KT.rule2}`, fontSize:9.5, color:KT.dim, textTransform:'uppercase', fontFamily:'Oswald, sans-serif', letterSpacing:0.8}}>
            <div>Date</div><div>Trk</div><div style={{textAlign:'right'}}>Races</div><div style={{textAlign:'right'}}>Wins</div><div style={{textAlign:'right'}}>Win %</div>
          </div>
          {A.daily.map((d, i) => (
            <div key={d.date} style={{display:'grid', gridTemplateColumns:'0.8fr 0.6fr 0.7fr 0.6fr 0.8fr', gap:6, padding:'8px 10px', borderBottom:`1px solid ${KT.rule2}`, fontSize:11.5, alignItems:'center', background: i%2 ? KT.canvas2 : 'transparent', marginLeft:-10, marginRight:-10, paddingLeft:10, paddingRight:10}}>
              <div style={{fontFamily:'Playfair Display, serif', fontStyle:'italic', color:KT.ink2}}>{d.date}</div>
              <div style={{fontFamily:'Oswald, sans-serif', letterSpacing:1, color:KT.brass, fontSize:10}}>{d.track}</div>
              <div style={{textAlign:'right', fontFamily:'JetBrains Mono, monospace'}}>{d.races}</div>
              <div style={{textAlign:'right', fontFamily:'JetBrains Mono, monospace', color:KT.green, fontWeight:600}}>{d.wins}</div>
              <div>
                <div style={{display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end'}}>
                  <div style={{width:60, height:6, background:KT.rule2, borderRadius:3, overflow:'hidden'}}>
                    <div style={{width:`${Math.min(100, d.winPct*2)}%`, height:'100%', background: d.winPct>30 ? KT.green : d.winPct<15 ? KT.red : KT.brass}}/>
                  </div>
                  <span style={{textAlign:'right', fontFamily:'JetBrains Mono, monospace', color: d.winPct>30 ? KT.green : d.winPct<15 ? KT.red : KT.ink, fontWeight:600, minWidth:40}}>{d.winPct.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </KAnalysisCard>
      </div>

      {/* Top Pick Accuracy Over Time */}
      <KAnalysisCard title="Top Pick Accuracy Over Time" subtitle="Cumulative win % as sample size grows">
        <KLineChart data={A.accuracyCurve} xKey="n" yKey="pct" height={160} stroke={KT.brass} fill="rgba(166,124,46,0.1)" yFmt={v=>`${v.toFixed(0)}%`}/>
      </KAnalysisCard>

      {/* Row 3: Component Profile (Radar + Bar side-by-side) */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <KAnalysisCard title="Component Profile · Radar" subtitle="Winners vs Top Picks (avg 0–100)">
          <KRadarChart labels={A.components.labels} winners={A.components.winners} topPicks={A.components.topPicks}/>
          <div style={{display:'flex', gap:14, justifyContent:'center', fontSize:10, color:KT.muted, fontFamily:'Oswald, sans-serif', letterSpacing:1, marginTop:6}}>
            <span><span style={{display:'inline-block', width:10, height:10, background:KT.green, marginRight:5, verticalAlign:'middle', borderRadius:2}}/>Winners</span>
            <span><span style={{display:'inline-block', width:10, height:10, background:KT.brass, marginRight:5, verticalAlign:'middle', borderRadius:2}}/>Top Picks</span>
          </div>
        </KAnalysisCard>
        <KAnalysisCard title="Component Profile · Bars" subtitle="Winners vs Top Picks (paired)">
          <KGroupedBarChart labels={A.components.labels} seriesA={A.components.winners} seriesB={A.components.topPicks} colorA={KT.green} colorB={KT.brass} height={220}/>
        </KAnalysisCard>
      </div>

      {/* Weight Trend */}
      <KAnalysisCard title="Weight Trend" subtitle="Rolling-10 effectiveness per component (higher = component correlated with wins)">
        <KMultiLineChart series={A.weightTrend} height={200}/>
      </KAnalysisCard>

      {/* Weight Sensitivity */}
      <KAnalysisCard title="Weight Sensitivity" subtitle="Avg component diff (winner − pick) on misses — positive means winners outscored picks on that component">
        <KDivergingBarChart data={A.weightSensitivity} height={200}/>
      </KAnalysisCard>

      {/* Bet Log */}
      <KAnalysisCard title="Bet Log" subtitle={`${A.betLog.length} recent bets — most recent first`}>
        <KBetLogSparkline bets={A.betLog}/>
        <div style={{height:1, background:KT.rule2, margin:'14px 0 10px'}}/>
        <KBetLogTable bets={A.betLog}/>
      </KAnalysisCard>
    </div>
  );
}

// ─── Analysis building blocks ───────────────────────────
function KAnalysisCard({ title, subtitle, children }) {
  return (
    <div style={{background:KT.panel, border:`1px solid ${KT.border}`, borderRadius:8, padding:'14px 18px'}}>
      <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
        <KHead size={16} weight={700}>{title}</KHead>
        <KOrnament width={40}/>
        {subtitle && <span style={{fontSize:11, color:KT.muted, fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function KStatBlock({ label, value, accent }) {
  return (
    <div style={{background:KT.canvas, border:`1px solid ${KT.rule2}`, borderRadius:4, padding:'8px 10px'}}>
      <KLabel spacing={1.2} size={9}>{label}</KLabel>
      <div style={{fontFamily:'Playfair Display, serif', fontSize:20, fontWeight:800, color: accent || KT.ink, marginTop:2, lineHeight:1.1}}>{value}</div>
    </div>
  );
}

function KLineChart({ data, xKey, yKey, height=160, stroke, fill, yFmt=(v)=>v }) {
  const w = 640, h = height, pad = { l: 52, r: 14, t: 10, b: 24 };
  const xs = data.map(d => d[xKey]);
  const ys = data.map(d => d[yKey]);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const toX = (x) => pad.l + ((x - minX) / (maxX - minX)) * (w - pad.l - pad.r);
  const toY = (y) => pad.t + (1 - (y - minY) / (maxY - minY)) * (h - pad.t - pad.b);
  const pts = data.map(d => `${toX(d[xKey])},${toY(d[yKey])}`).join(' ');
  const areaPts = `${toX(minX)},${h - pad.b} ${pts} ${toX(maxX)},${h - pad.b}`;
  const yTicks = [minY, (minY + maxY) / 2, maxY];
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block'}}>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} y1={toY(t)} x2={w - pad.r} y2={toY(t)} stroke={KT.rule2} strokeWidth="0.5"/>
          <text x={pad.l - 8} y={toY(t) + 3} fontSize="9" fill={KT.dim} fontFamily="JetBrains Mono, monospace" textAnchor="end">{yFmt(t)}</text>
        </g>
      ))}
      <polygon points={areaPts} fill={fill}/>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="2"/>
      <text x={pad.l} y={h - 4} fontSize="9" fill={KT.dim} fontFamily="Oswald, sans-serif" letterSpacing="1">{minX}</text>
      <text x={w - pad.r} y={h - 4} fontSize="9" fill={KT.dim} fontFamily="Oswald, sans-serif" letterSpacing="1" textAnchor="end">{maxX}</text>
    </svg>
  );
}

function KRadarChart({ labels, winners, topPicks, size=240 }) {
  const cx = size/2, cy = size/2, rMax = size * 0.38;
  const n = labels.length;
  const angle = (i) => -Math.PI/2 + (i / n) * Math.PI * 2;
  const maxVal = 100;
  const point = (val, i) => {
    const r = (val / maxVal) * rMax;
    return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))];
  };
  const poly = (arr) => arr.map((v,i) => point(v,i).join(',')).join(' ');
  const axisEnd = (i) => [cx + rMax * Math.cos(angle(i)), cy + rMax * Math.sin(angle(i))];
  return (
    <svg width="100%" height={size} viewBox={`0 0 ${size} ${size}`} style={{display:'block'}}>
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <polygon key={i}
          points={labels.map((_, j) => {
            const [x, y] = point(maxVal * f, j);
            return `${x},${y}`;
          }).join(' ')}
          fill="none" stroke={KT.rule2} strokeWidth="0.5"
        />
      ))}
      {labels.map((l, i) => (
        <g key={l}>
          <line x1={cx} y1={cy} x2={axisEnd(i)[0]} y2={axisEnd(i)[1]} stroke={KT.rule2} strokeWidth="0.5"/>
          <text
            x={cx + (rMax + 14) * Math.cos(angle(i))}
            y={cy + (rMax + 14) * Math.sin(angle(i)) + 3}
            fontSize="9.5" fill={KT.muted} fontFamily="Oswald, sans-serif" letterSpacing="1"
            textAnchor={Math.cos(angle(i)) > 0.3 ? 'start' : Math.cos(angle(i)) < -0.3 ? 'end' : 'middle'}
          >{l}</text>
        </g>
      ))}
      <polygon points={poly(topPicks)} fill={KT.brass} fillOpacity="0.25" stroke={KT.brass} strokeWidth="1.5"/>
      <polygon points={poly(winners)}  fill={KT.green} fillOpacity="0.25" stroke={KT.green} strokeWidth="2"/>
      {winners.map((v, i) => {
        const [x,y] = point(v,i);
        return <circle key={i} cx={x} cy={y} r="2.5" fill={KT.green}/>;
      })}
    </svg>
  );
}

function KGroupedBarChart({ labels, seriesA, seriesB, colorA, colorB, height=220 }) {
  const w = 540, h = height, pad = { l: 32, r: 8, t: 10, b: 32 };
  const maxV = 100;
  const bandW = (w - pad.l - pad.r) / labels.length;
  const barW = bandW * 0.35;
  const toY = (v) => pad.t + (1 - v / maxV) * (h - pad.t - pad.b);
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block'}}>
      {[0, 25, 50, 75, 100].map(t => (
        <g key={t}>
          <line x1={pad.l} y1={toY(t)} x2={w - pad.r} y2={toY(t)} stroke={KT.rule2} strokeWidth="0.5"/>
          <text x={pad.l - 6} y={toY(t) + 3} fontSize="9" fill={KT.dim} fontFamily="JetBrains Mono, monospace" textAnchor="end">{t}</text>
        </g>
      ))}
      {labels.map((l, i) => {
        const x0 = pad.l + i * bandW + bandW/2;
        const vA = seriesA[i], vB = seriesB[i];
        return (
          <g key={l}>
            <rect x={x0 - barW - 1} y={toY(vA)} width={barW} height={(h - pad.b) - toY(vA)} fill={colorA}/>
            <rect x={x0 + 1}        y={toY(vB)} width={barW} height={(h - pad.b) - toY(vB)} fill={colorB}/>
            <text x={x0} y={h - pad.b + 14} fontSize="9.5" fill={KT.muted} fontFamily="Oswald, sans-serif" letterSpacing="1" textAnchor="middle">{l}</text>
          </g>
        );
      })}
    </svg>
  );
}

function KMultiLineChart({ series, height=200 }) {
  const w = 680, h = height, pad = { l: 36, r: 80, t: 10, b: 24 };
  const colors = [KT.brass, KT.green, KT.red, '#1a3a5e', KT.brassHi, '#6a3f90', KT.green2, KT.ink2];
  const keys = Object.keys(series);
  const all = keys.flatMap(k => series[k].map(p => p.val));
  const minV = Math.min(...all, 0.2), maxV = Math.max(...all, 0.95);
  const nX = series[keys[0]].length;
  const toX = (i) => pad.l + (i / (nX - 1)) * (w - pad.l - pad.r);
  const toY = (v) => pad.t + (1 - (v - minV) / (maxV - minV)) * (h - pad.t - pad.b);
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block'}}>
      {[minV, (minV+maxV)/2, maxV].map((t, i) => (
        <g key={i}>
          <line x1={pad.l} y1={toY(t)} x2={w - pad.r} y2={toY(t)} stroke={KT.rule2} strokeWidth="0.5"/>
          <text x={pad.l - 6} y={toY(t) + 3} fontSize="9" fill={KT.dim} fontFamily="JetBrains Mono, monospace" textAnchor="end">{t.toFixed(2)}</text>
        </g>
      ))}
      {keys.map((k, ki) => {
        const pts = series[k].map((p, i) => `${toX(i)},${toY(p.val)}`).join(' ');
        const endY = toY(series[k][series[k].length - 1].val);
        return (
          <g key={k}>
            <polyline points={pts} fill="none" stroke={colors[ki % colors.length]} strokeWidth="1.75" opacity="0.9"/>
            <text x={w - pad.r + 6} y={endY + 3} fontSize="10" fill={colors[ki % colors.length]} fontFamily="Oswald, sans-serif" letterSpacing="1" fontWeight="600">{k}</text>
          </g>
        );
      })}
    </svg>
  );
}

function KDivergingBarChart({ data, height=200 }) {
  const w = 600, h = height, pad = { l: 70, r: 50, t: 10, b: 18 };
  const maxAbs = Math.max(...data.map(d => Math.abs(d.diff))) * 1.15;
  const rowH = (h - pad.t - pad.b) / data.length;
  const cx = pad.l + (w - pad.l - pad.r) / 2;
  const toW = (v) => (Math.abs(v) / maxAbs) * ((w - pad.l - pad.r) / 2);
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block'}}>
      <line x1={cx} y1={pad.t} x2={cx} y2={h - pad.b} stroke={KT.ink2} strokeWidth="0.75"/>
      {data.map((d, i) => {
        const y = pad.t + i * rowH + rowH/2;
        const bw = toW(d.diff);
        const positive = d.diff > 0;
        return (
          <g key={d.comp}>
            <text x={pad.l - 8} y={y + 3} fontSize="10" fill={KT.ink2} fontFamily="Oswald, sans-serif" letterSpacing="1" textAnchor="end">{d.comp}</text>
            <rect
              x={positive ? cx : cx - bw}
              y={y - rowH*0.32}
              width={bw}
              height={rowH*0.64}
              fill={positive ? KT.green : KT.red}
              opacity="0.85"
            />
            <text
              x={positive ? cx + bw + 6 : cx - bw - 6}
              y={y + 3}
              fontSize="10" fill={positive ? KT.green : KT.red} fontFamily="JetBrains Mono, monospace" fontWeight="700"
              textAnchor={positive ? 'start' : 'end'}
            >{positive ? '+' : ''}{d.diff.toFixed(1)}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Bet Log sparkline (full bankroll trajectory) ─────────
function KBetLogSparkline({ bets }) {
  // Bets are most-recent-first; reverse to chronological for the curve
  const chrono = [...bets].reverse();
  const startBank = (KANALYSIS.kellyReplay && KANALYSIS.kellyReplay.startBank) || 1000;
  const prevBank = chrono[0].bank - chrono[0].net;
  const series = [{ label:'Start', bank: prevBank, net: 0 }, ...chrono];

  const w = 640, h = 72, pad = { l: 48, r: 48, t: 8, b: 18 };
  const ys = series.map(s => s.bank);
  const minY = Math.min(...ys) - 6, maxY = Math.max(...ys) + 6;
  const toX = (i) => pad.l + (i / (series.length - 1)) * (w - pad.l - pad.r);
  const toY = (v) => pad.t + (1 - (v - minY) / (maxY - minY)) * (h - pad.t - pad.b);

  const pts = series.map((s, i) => `${toX(i)},${toY(s.bank)}`).join(' ');
  const areaPts = `${toX(0)},${h - pad.b} ${pts} ${toX(series.length - 1)},${h - pad.b}`;
  const peakIdx = series.reduce((acc, s, i) => s.bank > series[acc].bank ? i : acc, 0);
  const troughIdx = series.reduce((acc, s, i) => s.bank < series[acc].bank ? i : acc, 0);
  const endBank = series[series.length - 1].bank;
  const net = endBank - prevBank;
  const positive = net >= 0;

  return (
    <div>
      <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:4}}>
        <KLabel spacing={1.5} size={10} color={KT.brass} style={{fontWeight:700}}>Bankroll Trajectory</KLabel>
        <span style={{fontSize:11, color:KT.muted, fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>{bets.length} bets</span>
        <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:8}}>
          <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:11, color:KT.dim}}>${prevBank.toFixed(2)}</span>
          <span style={{color:KT.dim}}>→</span>
          <span style={{fontFamily:'Playfair Display, serif', fontSize:17, fontWeight:800, color:KT.brass}}>${endBank.toFixed(2)}</span>
          <span style={{fontFamily:'Oswald, sans-serif', fontSize:11, letterSpacing:1.5, fontWeight:700, color: positive ? KT.green : KT.red, padding:'2px 8px', borderRadius:20, border:`1px solid ${positive ? KT.green : KT.red}`, background: positive ? 'rgba(13,79,60,0.06)' : 'rgba(139,35,48,0.06)'}}>
            {positive ? '▲' : '▼'} {positive ? '+' : ''}${Math.abs(net).toFixed(2)}
          </span>
        </div>
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block'}}>
        {[minY, (minY + maxY) / 2, maxY].map((t, i) => (
          <line key={i} x1={pad.l} y1={toY(t)} x2={w - pad.r} y2={toY(t)} stroke={KT.rule2} strokeWidth="0.5" strokeDasharray={i===1 ? '2,3' : 'none'}/>
        ))}
        <polygon points={areaPts} fill={positive ? 'rgba(13,79,60,0.12)' : 'rgba(139,35,48,0.1)'}/>
        <polyline points={pts} fill="none" stroke={positive ? KT.green : KT.red} strokeWidth="2"/>
        {series.map((s, i) => (
          <circle key={i} cx={toX(i)} cy={toY(s.bank)} r={i === 0 || i === series.length - 1 ? 3.5 : 2}
                  fill={i === 0 ? KT.muted : i === series.length - 1 ? KT.brass : positive ? KT.green : KT.red}/>
        ))}
        {/* Peak + trough markers */}
        <g>
          <circle cx={toX(peakIdx)} cy={toY(series[peakIdx].bank)} r="5" fill="none" stroke={KT.green} strokeWidth="1"/>
          <text x={toX(peakIdx)} y={toY(series[peakIdx].bank) - 9} fontSize="9" fill={KT.green} fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="700">▲</text>
        </g>
        {troughIdx !== peakIdx && (
          <g>
            <circle cx={toX(troughIdx)} cy={toY(series[troughIdx].bank)} r="5" fill="none" stroke={KT.red} strokeWidth="1"/>
            <text x={toX(troughIdx)} y={toY(series[troughIdx].bank) + 14} fontSize="9" fill={KT.red} fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="700">▼</text>
          </g>
        )}
        <text x={pad.l - 6} y={toY(maxY) + 3} fontSize="9" fill={KT.dim} fontFamily="JetBrains Mono, monospace" textAnchor="end">${Math.round(maxY)}</text>
        <text x={pad.l - 6} y={toY(minY) + 3} fontSize="9" fill={KT.dim} fontFamily="JetBrains Mono, monospace" textAnchor="end">${Math.round(minY)}</text>
      </svg>
    </div>
  );
}

// ─── Bet Log table with per-row diverging slider bar ──────
function KBetLogTable({ bets }) {
  const maxAbsNet = Math.max(...bets.map(b => Math.abs(b.net)));
  const finishGlyph = (f) => f === '1st' ? '🥇' : f === '2nd' ? '🥈' : f === '3rd' ? '🥉' : f;
  const confGlyph = (c) => c === 'HI' ? '🎯' : c === 'MED' ? '⚡' : '💭';

  // Grid: Date · Trk · R · Pick · Conf · Odds · Stake · Finish · Payout · (Net+Slider) · Bank
  const cols = '62px 42px 28px 1.2fr 62px 48px 50px 54px 66px 180px 74px';
  return (
    <div style={{overflowX:'auto'}}>
      <div style={{display:'grid', gridTemplateColumns:cols, gap:6, padding:'6px 10px', borderBottom:`1px solid ${KT.rule2}`, fontSize:9.5, color:KT.dim, textTransform:'uppercase', fontFamily:'Oswald, sans-serif', letterSpacing:0.8}}>
        <div>Date</div><div>Trk</div><div>R</div><div>Pick</div><div>Conf</div>
        <div style={{textAlign:'right'}}>Odds</div>
        <div style={{textAlign:'right'}}>Stake</div>
        <div style={{textAlign:'right'}}>Finish</div>
        <div style={{textAlign:'right'}}>Payout</div>
        <div style={{textAlign:'center'}}>Net · Movement</div>
        <div style={{textAlign:'right'}}>Bank</div>
      </div>
      {bets.map((b,i) => {
        const positive = b.net > 0;
        const barPct = Math.min(1, Math.abs(b.net) / maxAbsNet);
        return (
          <div key={i} style={{display:'grid', gridTemplateColumns:cols, gap:6, padding:'8px 10px', borderBottom:`1px solid ${KT.rule2}`, fontSize:11.5, alignItems:'center', fontFamily:'JetBrains Mono, monospace', background: i%2 ? KT.canvas2 : 'transparent', borderLeft:`3px solid ${positive ? KT.green : KT.red}`, marginLeft:-10, marginRight:-10, paddingLeft:10, paddingRight:10}}>
            <div style={{color:KT.muted, fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>{b.date}</div>
            <div style={{color:KT.brass, fontWeight:700, fontFamily:'Oswald, sans-serif', fontSize:10, letterSpacing:1}}>{b.track}</div>
            <div style={{color:KT.ink2}}>{b.r}</div>
            <div style={{color:KT.ink, fontFamily:'Playfair Display, serif', fontSize:12.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{b.pick}</div>
            <div>
              <span style={{display:'inline-flex', alignItems:'center', gap:4, fontSize:9.5, padding:'2px 8px', borderRadius:20, fontFamily:'Oswald, sans-serif', letterSpacing:1, fontWeight:700,
                color: b.conf==='HI' ? KT.green : b.conf==='MED' ? KT.brass : KT.muted,
                border:`1px solid ${b.conf==='HI' ? KT.green : b.conf==='MED' ? KT.brass : KT.border}`,
                background: b.conf==='HI' ? 'rgba(13,79,60,0.06)' : b.conf==='MED' ? KT.brassSoft : 'transparent',
              }}>
                <span style={{fontFamily:'initial', fontSize:11}}>{confGlyph(b.conf)}</span>
                {b.conf}
              </span>
            </div>
            <div style={{textAlign:'right', color:KT.ink2}}>{b.odds}</div>
            <div style={{textAlign:'right', color:KT.ink2}}>${b.stake}</div>
            <div style={{textAlign:'right', fontFamily:'initial', fontSize: b.finish==='1st'||b.finish==='2nd'||b.finish==='3rd' ? 16 : 11.5, color: b.finish==='1st' ? KT.green : KT.ink2, fontWeight: b.finish==='1st' ? 700 : 400, lineHeight:1}}>
              {finishGlyph(b.finish)}
            </div>
            <div style={{textAlign:'right', color:KT.ink2}}>${b.payout.toFixed(2)}</div>
            <div>
              {/* Diverging slider: net value label + proportional bar centered on zero */}
              <div style={{display:'flex', alignItems:'center', gap:6}}>
                <div style={{fontSize:11, fontWeight:700, color: positive ? KT.green : KT.red, minWidth:54, textAlign:'right'}}>
                  {positive ? '▲ +' : '▼ -'}${Math.abs(b.net).toFixed(2)}
                </div>
                <div style={{flex:1, position:'relative', height:14, background:KT.canvas2, borderRadius:3, border:`1px solid ${KT.rule2}`}}>
                  <div style={{position:'absolute', left:'50%', top:0, bottom:0, width:1, background:KT.dim}}/>
                  <div style={{
                    position:'absolute',
                    [positive ? 'left' : 'right']: '50%',
                    top:2, bottom:2,
                    width: `${barPct * 48}%`,
                    background: positive ? `linear-gradient(90deg, ${KT.green}, ${KT.green2})` : `linear-gradient(90deg, ${KT.redHi}, ${KT.red})`,
                    borderRadius: positive ? '0 2px 2px 0' : '2px 0 0 2px',
                  }}/>
                </div>
              </div>
            </div>
            <div style={{textAlign:'right', color:KT.brass, fontWeight:700}}>${b.bank.toFixed(2)}</div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════ NEWS TAB (Race updates + Bloodlines sire database) ═══════════
function KNews({ race }) {
  const items = [
    { when:'10 min ago', tag:'🚨 Scratch',   tone:'red',   text:'Harbour Breeze scratched by stewards — vet.' },
    { when:'32 min ago', tag:'🔧 Equipment', tone:'brass', text:'Silver Reign adds Lasix first time.' },
    { when:'1h ago',     tag:'🏇 Jockey',    tone:'muted', text:'J. Castellano named on Silver Reign (replaces injured Rosario).' },
    { when:'2h ago',     tag:'📊 Odds Move', tone:'muted', text:'Paddock Prince drifts from 4-1 → 9-2 on live board.' },
    { when:'4h ago',     tag:'⏱️ Workout',  tone:'green', text:'Morning Harvest bulleted 4f in :47.3 at trackside.' },
  ];
  const toneBorder = { red:KT.red, brass:KT.brass, green:KT.green, muted:KT.rule };
  return (
    <div style={{display:'flex', flexDirection:'column', gap:14}}>
      {/* Race news */}
      <div style={{background:KT.panel, border:`1px solid ${KT.border}`, borderRadius:8, padding:'16px 20px'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
          <KHead size={18} weight={700}>Race News</KHead>
          <KOrnament width={40}/>
          <span style={{fontSize:11, color:KT.muted, fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>Last 4 hours</span>
        </div>
        {items.map((it,i) => (
          <div key={i} style={{display:'flex', gap:12, padding:'12px 14px', marginBottom: i<items.length-1 ? 6 : 0, alignItems:'flex-start', background: i%2 ? KT.canvas2 : KT.panel, borderLeft:`3px solid ${toneBorder[it.tone]}`, borderRadius:4}}>
            <div style={{fontSize:10, color:KT.dim, minWidth:80, fontFamily:'JetBrains Mono, monospace'}}>{it.when}</div>
            <div style={{minWidth:110}}><Pill tone={it.tone} small>{it.tag}</Pill></div>
            <div style={{fontSize:13, color:KT.ink, lineHeight:1.5, fontFamily:'Playfair Display, serif'}}>{it.text}</div>
          </div>
        ))}
      </div>

      {/* Race Day Info */}
      <div style={{background:`linear-gradient(135deg, ${KT.cream} 0%, ${KT.brassSoft} 100%)`, border:`1px solid ${KT.brass}`, borderRadius:8, padding:'16px 20px'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
          <KHead size={17} weight={700} color={KT.brass}>Track Notes · Oaklawn Park</KHead>
          <KOrnament width={40} color={KT.brass}/>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12}}>
          {[
            ['Admission',   '$5 general · $12 grandstand'],
            ['Box Seats',   '$20–45 depending on tier'],
            ['Dress Code',  'Turf Club: jacket required for men'],
            ['Jockey Club', 'Members-only, reservations essential'],
          ].map(([l,v]) => (
            <div key={l}>
              <KLabel spacing={1.5} size={10} color={KT.brass} style={{fontWeight:700}}>{l}</KLabel>
              <div style={{fontSize:12.5, color:KT.ink2, fontFamily:'Playfair Display, serif', marginTop:3}}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bloodlines — sire info */}
      <div style={{background:KT.panel, border:`1px solid ${KT.border}`, borderRadius:8, padding:'16px 20px'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
          <KHead size={17} weight={700}>Bloodlines & Backgrounds</KHead>
          <KOrnament width={40}/>
          <span style={{fontSize:11, color:KT.muted, fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>Sires represented in today's card</span>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
          {KSIRES.map(s => (
            <div key={s.sire} style={{background:KT.canvas, border:`1px solid ${KT.rule2}`, borderLeft:`3px solid ${KT.brass}`, borderRadius:4, padding:'10px 14px'}}>
              <div style={{display:'flex', alignItems:'baseline', gap:8}}>
                <div style={{fontFamily:'Playfair Display, serif', fontSize:15, fontWeight:800, color:KT.ink}}>{s.sire}</div>
                <div style={{fontSize:10.5, color:KT.brass, fontFamily:'Oswald, sans-serif', letterSpacing:1}}>{s.fee}</div>
              </div>
              <div style={{fontSize:11, color:KT.muted, fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>{s.farm}</div>
              <div style={{fontSize:11.5, color:KT.ink2, lineHeight:1.5, marginTop:5, fontFamily:'Playfair Display, serif'}}>
                {s.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { KRaceScreen, KBigRaceSpotlight });
