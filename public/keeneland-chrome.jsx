// keeneland-chrome.jsx — Shared UI primitives (aligned to real PaddockIQ IA)

// ─── SADDLE CLOTH CHIP (NTRA post-position colors) ──────────
function KSaddle({ n, size=22 }) {
  const c = (window.KPP_COLORS && window.KPP_COLORS[n]) || { bg:'#5a5a5a', fg:'#fff' };
  const border = (c.bg === '#ffffff' || c.bg === '#f0c430' || c.bg === '#ec8fb0' || c.bg === '#4fc8c8' || c.bg === '#b0d050') ? '1px solid #1a2420' : 'none';
  return (
    <div style={{width:size, height:size, borderRadius:3, background:c.bg, color:c.fg, border, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Oswald, sans-serif', fontWeight:700, fontSize:Math.round(size*0.6), flexShrink:0, letterSpacing:0}}>{n}</div>
  );
}

// ─── SILK (jockey silks as circular SVG badge) ──────────────
function KSilk({ bg, stripe, patt, size=22, ring }) {
  const s = size;
  const pid = 'p' + Math.random().toString(36).slice(2,8);
  let pattern = null;
  if (patt === 'diag')    pattern = <path d={`M0 0 L${s} ${s} M0 ${s/2} L${s/2} ${s} M${s/2} 0 L${s} ${s/2}`} stroke={stripe} strokeWidth="2.5"/>;
  if (patt === 'cross')   pattern = <g><rect x={s/2-2} y="0" width="4" height={s} fill={stripe}/><rect x="0" y={s/2-2} width={s} height="4" fill={stripe}/></g>;
  if (patt === 'hoop')    pattern = <g><rect x="0" y={s*0.33} width={s} height={s*0.16} fill={stripe}/><rect x="0" y={s*0.62} width={s} height={s*0.16} fill={stripe}/></g>;
  if (patt === 'star')    pattern = <circle cx={s/2} cy={s/2} r={s*0.25} fill={stripe}/>;
  if (patt === 'dot')     pattern = <g><circle cx={s*0.3} cy={s*0.3} r="2.5" fill={stripe}/><circle cx={s*0.7} cy={s*0.3} r="2.5" fill={stripe}/><circle cx={s*0.3} cy={s*0.7} r="2.5" fill={stripe}/><circle cx={s*0.7} cy={s*0.7} r="2.5" fill={stripe}/></g>;
  if (patt === 'diamond') pattern = <path d={`M${s/2} 2 L${s-2} ${s/2} L${s/2} ${s-2} L2 ${s/2} Z`} fill={stripe}/>;
  if (patt === 'quad')    pattern = <g><rect x="0" y="0" width={s/2} height={s/2} fill={stripe}/><rect x={s/2} y={s/2} width={s/2} height={s/2} fill={stripe}/></g>;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{borderRadius:'50%', flexShrink:0, boxShadow: ring ? `0 0 0 1.5px ${ring}` : 'inset 0 0 0 1px rgba(0,0,0,0.15)'}}>
      <clipPath id={pid}><circle cx={s/2} cy={s/2} r={s/2}/></clipPath>
      <g clipPath={`url(#${pid})`}>
        <rect width={s} height={s} fill={bg}/>{pattern}
      </g>
    </svg>
  );
}

// ─── HORSESHOE LOGO MARK ────────────────────────────────────
function KHorseshoe({ size=28, color=KT.brass, accent=KT.brassHi, bg=KT.bg }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{flexShrink:0}}>
      <path d="M8 6 Q8 22 16 26 Q24 22 24 6 L20 6 Q20 20 16 22 Q12 20 12 6 Z" fill={color} stroke={accent} strokeWidth="0.5"/>
      <circle cx="10" cy="8" r="1" fill={bg}/><circle cx="14" cy="7" r="1" fill={bg}/>
      <circle cx="18" cy="7" r="1" fill={bg}/><circle cx="22" cy="8" r="1" fill={bg}/>
    </svg>
  );
}

// ─── Typography primitives ──────────────────────────────────
function KLabel({ children, color, size=10, spacing=2, style={} }) {
  return <div style={{fontFamily:'Oswald, sans-serif', fontSize:size, letterSpacing:spacing, color:color||KT.muted, textTransform:'uppercase', ...style}}>{children}</div>;
}
function KHead({ children, size=22, color, weight=700, style={} }) {
  return <div style={{fontFamily:'Playfair Display, serif', fontSize:size, fontWeight:weight, color:color||KT.ink, letterSpacing:0.2, lineHeight:1.1, ...style}}>{children}</div>;
}

// ─── HEADER (matches real app: track sel + card sel + date + bankroll + betting-today + race badge) ──
function KHeader({ current, track='Oaklawn Park', date='Apr 9, 2026', nRaces=8, bankroll=100, tracksToday=1 }) {
  return (
    <div style={{background:KT.bg, color:KT.cream, padding:'10px 24px', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap', borderBottom:`3px solid ${KT.brass}`, fontFamily:'Inter, sans-serif'}}>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <KHorseshoe size={26}/>
        <div style={{fontFamily:'Playfair Display, serif', fontSize:20, fontWeight:800, letterSpacing:0.3, lineHeight:1, color:KT.brassHi}}>PaddockIQ</div>
      </div>

      {/* Track selector */}
      <div style={{display:'flex', alignItems:'center', gap:6, background:'rgba(0,0,0,0.25)', border:`1px solid ${KT.brass}`, borderRadius:4, padding:'5px 12px', cursor:'pointer', minWidth:180}}>
        <div style={{fontFamily:'Oswald, sans-serif', fontSize:12, letterSpacing:1.5, color:KT.brassHi, fontWeight:600, flex:1}}>{track.toUpperCase()}</div>
        <span style={{fontSize:9, color:KT.brassHi}}>▼</span>
      </div>

      {/* Card date selector */}
      <div style={{display:'flex', alignItems:'center', gap:6, background:'rgba(0,0,0,0.15)', border:`1px solid ${KT.border}`, borderRadius:4, padding:'4px 10px', cursor:'pointer'}}>
        <div style={{fontFamily:'Inter, sans-serif', fontSize:11.5, color:'rgba(245,236,211,0.85)'}}>{date}</div>
        <span style={{fontSize:9, color:'rgba(245,236,211,0.5)'}}>▼</span>
      </div>

      {/* Date + race count sub */}
      <KLabel spacing={2} size={10} color="rgba(245,236,211,0.55)">{date.toUpperCase()} · {nRaces} RACES</KLabel>

      <div style={{flex:1}}/>

      {/* Bankroll pill */}
      <div style={{display:'flex', alignItems:'center', gap:6, background:'rgba(26,111,84,0.25)', border:`1px solid ${KT.green2}`, borderRadius:20, padding:'4px 12px'}}>
        <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:12, color:'#9ad89a', fontWeight:600}}>${bankroll.toFixed(2)}</span>
        <span style={{fontSize:10, color:'rgba(154,216,154,0.7)'}}>Bankroll</span>
        <span style={{fontSize:9, color:KT.dim, cursor:'pointer', marginLeft:2}}>✎</span>
      </div>

      {/* Betting Today */}
      <div style={{display:'flex', alignItems:'center', gap:6, background:'rgba(0,0,0,0.2)', border:`1px solid ${KT.border}`, borderRadius:20, padding:'4px 12px'}}>
        <span style={{fontSize:9, color:'rgba(245,236,211,0.45)', letterSpacing:1}}>BETTING</span>
        <span style={{fontSize:11, color:KT.brassHi, fontWeight:600}}>{tracksToday} Track</span>
        <span style={{fontSize:8, color:'rgba(245,236,211,0.45)'}}>▼</span>
      </div>

      {/* Race badge */}
      <div style={{background:KT.brassSoft, border:`1px solid ${KT.brass}`, color:KT.brass, borderRadius:20, padding:'4px 12px', fontSize:11, fontWeight:600, fontFamily:'Oswald, sans-serif', letterSpacing:1}}>
        Race {current||1}
      </div>
    </div>
  );
}

// ─── Track action bar (DRF CSV + Upload CSV) ────────────────
function KTrackActionBar() {
  return (
    <div style={{background:KT.canvas2, padding:'8px 24px', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', borderBottom:`1px solid ${KT.border}`, fontSize:12, color:KT.muted}}>
      <a style={{color:KT.brass, textDecoration:'none', border:`1px solid ${KT.border}`, borderRadius:20, padding:'4px 12px', background:KT.panel, fontSize:11.5, cursor:'pointer'}}>
        📥 DRF CSV · Oaklawn Park · 04-09 →
      </a>
      <button style={{background:'rgba(30,90,140,0.08)', border:`1px solid #2a5a8c`, color:'#2a6a9c', borderRadius:20, padding:'4px 12px', cursor:'pointer', fontFamily:'inherit', fontSize:11.5}}>
        📂 Upload Card CSV
      </button>
    </div>
  );
}

// ─── Track conditions collapsible bar (green-tinted) ────────
function KConditionsBar({ open, onToggle }) {
  return (
    <div style={{background:KT.panel, border:`1px solid ${KT.border}`, borderLeft:`4px solid ${KT.green}`, borderRadius:6, padding:'10px 14px', margin:'12px 0'}}>
      <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', fontSize:13, color:KT.ink}}>
        <span style={{color:KT.green, fontWeight:700, fontFamily:'Oswald, sans-serif', letterSpacing:1.5}}>☀ FAST</span>
        <span style={{color:KT.rule}}>·</span>
        <span style={{color:KT.ink2}}>🏇 <b>Dirt</b></span>
        <span style={{color:KT.rule}}>·</span>
        <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:12, color:KT.green}}>58°F</span>
        <span style={{color:KT.muted, fontSize:11, fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>Updated 8:05 AM — 56°F, 7mph, overcast → fast</span>
        <div style={{marginLeft:'auto', display:'flex', gap:6, alignItems:'center'}}>
          <button onClick={onToggle} style={{background:'transparent', border:`1px solid ${KT.green}`, color:KT.green, borderRadius:20, padding:'3px 12px', fontSize:11, cursor:'pointer', fontFamily:'Oswald, sans-serif', letterSpacing:1, textTransform:'uppercase', fontWeight:600}}>Weather ▾</button>
        </div>
      </div>
      {/* Bias pills */}
      <div style={{display:'flex', gap:6, marginTop:10, flexWrap:'wrap'}}>
        <KLabel spacing={1.5} size={10} color={KT.green} style={{alignSelf:'center', marginRight:4, fontWeight:600}}>Bias</KLabel>
        {['None','Speed','Closer','Inside','Outside'].map((b,i) => (
          <span key={b} style={{
            padding:'3px 12px', borderRadius:20, fontSize:11,
            border:`1px solid ${i===0 ? KT.green : KT.border}`,
            background: i===0 ? KT.greenSoft : 'transparent',
            color: i===0 ? KT.green : KT.muted,
            fontFamily:'Inter, sans-serif', cursor:'pointer',
            fontWeight: i===0 ? 600 : 400,
          }}>{b}</span>
        ))}
      </div>
    </div>
  );
}

// ─── RACE TABS (chips R1 … Rn, past/current/next/upcoming) ──
function KRaceTabs({ current, onSelect }) {
  return (
    <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:12, alignItems:'center', padding:'8px 10px', background:KT.canvas2, border:`1px solid ${KT.border}`, borderRadius:6}}>
      <KLabel color={KT.green} spacing={1.8} size={10} style={{marginRight:6, fontWeight:600}}>Card</KLabel>
      {KRACES.map(r => {
        const active = current === r.n;
        const past = r.status === 'past';
        const next = r.status === 'next';
        const bg = active ? KT.green : next ? KT.greenSoft : past ? 'transparent' : KT.panel;
        const bd = active ? KT.green : next ? KT.green : past ? KT.rule2 : KT.border;
        const fg = active ? KT.cream : next ? KT.green : past ? KT.dim : KT.ink2;
        return (
          <button key={r.n} onClick={()=>onSelect&&onSelect(r.n)} style={{
            padding:'6px 12px', borderRadius:4, fontSize:12,
            border:`1.5px solid ${bd}`, background:bg, color:fg,
            cursor:'pointer', fontFamily:'Oswald, sans-serif',
            textDecoration: past ? 'line-through' : 'none',
            opacity: past ? 0.55 : 1,
            fontWeight: (active||next) ? 700 : 500,
            letterSpacing:1, textTransform:'uppercase',
            display:'inline-flex', alignItems:'center', gap:5,
            boxShadow: active ? '0 2px 4px rgba(13,61,46,0.15)' : 'none',
          }}>
            {next && <span style={{color:KT.green, fontSize:8}}>▶</span>}
            <span>R{r.n}</span>
            <span style={{fontSize:10, fontFamily:'JetBrains Mono, monospace', opacity:0.85, letterSpacing:0}}>{r.time}</span>
            {r.big && <span style={{fontSize:8, background:KT.brass, color:'#fff', padding:'1px 4px', borderRadius:2, letterSpacing:1}}>G2</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── NAV TABS (Rankings / Exotics / Odds / Analysis / News) ──
function KNavTabs({ current, onSelect }) {
  const tabs = [
    { id:'rankings', label:'Rankings', icon:'🏇' },
    { id:'exotics',  label:'Exotics',  icon:'🎰' },
    { id:'odds',     label:'Odds',     icon:'📡' },
    { id:'analysis', label:'Analysis', icon:'📈' },
    { id:'news',     label:'News',     icon:'📰' },
  ];
  return (
    <div style={{display:'flex', borderBottom:`2px solid ${KT.green}`, marginBottom:14, gap:0, background:KT.canvas2, borderTopLeftRadius:6, borderTopRightRadius:6, paddingLeft:6}}>
      {tabs.map(t => {
        const on = current === t.id;
        return (
          <button key={t.id} onClick={()=>onSelect&&onSelect(t.id)} style={{
            padding:'11px 18px', fontSize:12.5, fontWeight:600,
            color: on ? KT.cream : KT.muted,
            border:'none',
            background: on ? KT.green : 'transparent',
            borderTopLeftRadius: on ? 6 : 0, borderTopRightRadius: on ? 6 : 0,
            cursor:'pointer', fontFamily:'Oswald, sans-serif',
            letterSpacing:1.8, textTransform:'uppercase',
            display:'inline-flex', alignItems:'center', gap:6,
            position:'relative', top: on ? 2 : 0,
          }}>
            <span style={{fontSize:13}}>{t.icon}</span>{t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Pre-race checklist chips ───────────────────────────────
function KPreRaceChecklist() {
  const items = [
    { label:'Surface reviewed',  done:true  },
    { label:'Scratches set',     done:true  },
    { label:'Live odds entered', done:true  },
    { label:'Kaci enabled',      done:false },
    { label:'Jockey changes',    done:false },
  ];
  const doneCount = items.filter(i=>i.done).length;
  return (
    <div style={{background:KT.greenSoft, border:`1px solid ${KT.green}`, borderLeft:`4px solid ${KT.green}`, borderRadius:6, padding:'10px 14px', marginBottom:12}}>
      <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
        <KLabel spacing={1.8} size={10} color={KT.green} style={{fontWeight:700}}>Pre-Race Checklist · {doneCount}/{items.length}</KLabel>
        {items.map(it => (
          <span key={it.label} style={{
            padding:'3px 11px', borderRadius:20, fontSize:10.5,
            border:`1px solid ${it.done ? KT.green : KT.rule}`,
            background: it.done ? KT.panel : 'transparent',
            color: it.done ? KT.green : KT.muted,
            fontFamily:'Inter, sans-serif', fontWeight: it.done ? 600 : 400,
          }}>
            {it.done ? '✓ ' : '○ '}{it.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── KACI avatar (still used for identity moments) ──────────
function KKaciAvatar({ size=36, pulsing }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:`radial-gradient(circle at 30% 30%, ${KT.brassHi}, ${KT.brass} 60%, ${KT.bg} 100%)`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'Playfair Display, serif', fontWeight:700, fontSize:size*0.4,
      color:KT.canvas, position:'relative',
      boxShadow:`inset 0 0 0 1px rgba(255,255,255,0.2), 0 1px 3px rgba(0,0,0,0.15)`,
    }}>K</div>
  );
}

// ─── Button ─────────────────────────────────────────────────
function KButton({ children, onClick, variant='primary', size='md', style={} }) {
  const pad = size==='sm' ? '6px 12px' : size==='lg' ? '12px 22px' : '8px 16px';
  const fontSize = size==='sm' ? 11 : size==='lg' ? 13 : 12;
  const base = {
    primary:   { bg:KT.brass,    color:KT.canvas, border:KT.brass  },
    secondary: { bg:'transparent', color:KT.brass, border:KT.brass  },
    dark:      { bg:KT.bg,       color:KT.cream,  border:KT.bg     },
    ghost:     { bg:'transparent', color:KT.ink,   border:KT.border },
  }[variant];
  return (
    <button onClick={onClick} style={{
      padding:pad, background:base.bg, color:base.color, border:`1.5px solid ${base.border}`,
      borderRadius:4, fontFamily:'Oswald, sans-serif', fontSize, letterSpacing:2, textTransform:'uppercase',
      fontWeight:600, cursor:'pointer', transition:'all 0.15s', ...style,
    }}>{children}</button>
  );
}

// ─── Ornament ───────────────────────────────────────────────
function KOrnament({ color, width=100 }) {
  return (
    <svg width={width} height="10" viewBox={`0 0 ${width} 10`} style={{display:'block'}}>
      <path d={`M0 5 L${width*0.4} 5 M${width*0.6} 5 L${width} 5`} stroke={color||KT.rule} strokeWidth="0.75"/>
      <circle cx={width/2} cy="5" r="2" fill={color||KT.brass}/>
    </svg>
  );
}

Object.assign(window, {
  KSilk, KSaddle, KHorseshoe, KLabel, KHead,
  KHeader, KTrackActionBar, KConditionsBar, KRaceTabs, KNavTabs, KPreRaceChecklist,
  KKaciAvatar, KButton, KOrnament,
});
