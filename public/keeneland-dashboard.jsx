// keeneland-dashboard.jsx — Today's Card overview (aspirational multi-race summary, trimmed to live-app parity)

function KDashboard({ nav, ui }) {
  const nextRace = KRACES.find(r => r.status === 'next') || KRACES[3];
  const bigRace  = KRACES.find(r => r.big) || KRACES[6];

  return (
    <div style={{minHeight:'100%', background:KT.canvas, color:KT.ink, fontFamily:'Inter, sans-serif', paddingBottom:40}}>
      <KHeader current={nextRace.n}/>
      <KTrackActionBar/>

      <div style={{maxWidth:1100, margin:'0 auto', padding:'16px 24px'}}>
        <KConditionsBar/>

        <div style={{display:'grid', gridTemplateColumns:'1fr 280px', gap:14}}>
          {/* Today's card list */}
          <div style={{background:KT.panel, border:`1px solid ${KT.border}`, borderRadius:8, padding:'14px 18px'}}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
              <KHead size={18} weight={700}>Today's Card</KHead>
              <KOrnament width={60}/>
              <span style={{fontSize:11, color:KT.muted}}>10 races · 3 completed</span>
              <div style={{marginLeft:'auto'}}>
                <KButton variant="ghost" size="sm">Print Form</KButton>
              </div>
            </div>

            {KRACES.map(r => {
              const past = r.status === 'past';
              const next = r.status === 'next';
              return (
                <div key={r.n} onClick={()=>!past && nav('race',{race:r.n})}
                     style={{display:'grid', gridTemplateColumns:'40px 60px 1fr 80px 80px 90px 70px', gap:10, alignItems:'center', padding:'10px 8px', borderRadius: next ? 6 : 0, borderBottom: next ? 'none' : `1px solid ${KT.rule2}`, cursor: past ? 'default' : 'pointer', opacity: past ? 0.5 : 1, background: next ? KT.greenSoft : r.big ? KT.brassSoft : 'transparent', border: next ? `1.5px solid ${KT.green}` : r.big ? `1px dashed ${KT.brass}` : 'none', margin: (next || r.big) ? '4px 0' : 0}}>
                  <div style={{fontFamily:'Playfair Display, serif', fontSize:22, fontWeight:800, color: next ? KT.green : past ? KT.dim : KT.brass}}>R{r.n}</div>
                  <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:12, color:KT.ink2}}>{r.time}</div>
                  <div>
                    <div style={{fontSize:13, fontWeight:600}}>
                      {r.big
                        ? <span style={{color:KT.brass}}>🏆 {r.name}</span>
                        : r.cls === 'MSW' ? <span>🌱 Maiden Special Weight</span>
                        : r.cls === 'MCL' ? <span>🌱 Maiden Claiming</span>
                        : r.cls === 'ALW' ? <span>💰 Allowance</span>
                        : r.cls === 'CLM' ? <span>🏷️ Claiming</span>
                        : r.cls === 'G2'  ? <span>🏆 Grade II Stakes</span>
                        : r.cls}
                    </div>
                    <div style={{fontSize:10.5, color:KT.muted}}>
                      {r.surf === 'Turf' ? '🌿' : '🏜️'} {r.dist} · {r.surf} · {r.cls}
                    </div>
                  </div>
                  <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:12, color:KT.ink2}}>{r.purse}</div>
                  <div>
                    {next && <span style={{background:'#e8f2e8', color:KT.green, padding:'2px 8px', borderRadius:20, fontSize:10, fontFamily:'Oswald, sans-serif', letterSpacing:1, fontWeight:600}}>▶ {r.mtp} MTP</span>}
                    {past && <span style={{background:'rgba(0,0,0,0.04)', color:KT.dim, padding:'2px 8px', borderRadius:20, fontSize:10, fontFamily:'Oswald, sans-serif', letterSpacing:1}}>Final</span>}
                    {r.status === 'upcoming' && <span style={{color:KT.muted, fontSize:11, fontFamily:'JetBrains Mono, monospace'}}>{r.mtp} MTP</span>}
                  </div>
                  <div style={{fontSize:10, fontFamily:'Oswald, sans-serif', letterSpacing:1}}>
                    {r.big ? (
                      <span style={{background:KT.brass, color:KT.canvas, padding:'2px 8px', borderRadius:20, fontWeight:700, letterSpacing:1}}>G2 STAKES</span>
                    ) : past ? (
                      <span style={{background:'rgba(0,0,0,0.04)', color:KT.dim, padding:'2px 8px', borderRadius:20}}>WON BY #4</span>
                    ) : r.status === 'upcoming' ? (
                      <span style={{background:KT.canvas2, color:KT.muted, padding:'2px 8px', borderRadius:20, border:`1px solid ${KT.rule2}`}}>AWAITING</span>
                    ) : (
                      <span style={{background:KT.brassSoft, color:KT.brass, padding:'2px 8px', borderRadius:20, border:`1px solid ${KT.brass}`, fontWeight:600}}>ANALYZING</span>
                    )}
                  </div>
                  <div style={{textAlign:'right', color: past ? KT.dim : KT.brass, fontSize:11, fontFamily:'Oswald, sans-serif', letterSpacing:1, fontWeight:600}}>
                    {past ? '—' : 'View →'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right rail */}
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {/* Bankroll — green-tinted, $100 demo bank */}
            <div style={{background:`linear-gradient(165deg, ${KT.greenSoft} 0%, ${KT.panel} 60%)`, border:`1.5px solid ${KT.green}`, borderRadius:8, padding:'14px 16px'}}>
              <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:4}}>
                <KLabel color={KT.green} spacing={1.5} size={10} style={{fontWeight:700}}>Bankroll</KLabel>
                <span style={{marginLeft:'auto', fontSize:10, fontFamily:'Oswald, sans-serif', letterSpacing:1.2, color:KT.green, background:KT.panel, border:`1px solid ${KT.green}`, borderRadius:20, padding:'1px 8px', fontWeight:700}}>▲ +$12.40</span>
              </div>
              <div style={{fontFamily:'Playfair Display, serif', fontSize:30, fontWeight:800, color:KT.ink, lineHeight:1}}>$100.00</div>
              <div style={{fontSize:10.5, color:KT.muted, fontFamily:'Playfair Display, serif', fontStyle:'italic', marginTop:3}}>Current session</div>
              <div style={{height:1, background:KT.rule2, margin:'12px 0'}}/>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, fontSize:11}}>
                <div><KLabel spacing={1} size={9}>Today P/L</KLabel><div style={{fontFamily:'JetBrains Mono, monospace', fontWeight:600, color:KT.green, marginTop:1}}>+$12.40</div></div>
                <div><KLabel spacing={1} size={9}>Open Bets</KLabel><div style={{fontFamily:'JetBrains Mono, monospace', fontWeight:600, marginTop:1}}>1</div></div>
                <div><KLabel spacing={1} size={9}>Sim ROI</KLabel><div style={{fontFamily:'JetBrains Mono, monospace', fontWeight:600, color:KT.green, marginTop:1}}>+28.6%</div></div>
                <div><KLabel spacing={1} size={9}>Sim Win %</KLabel><div style={{fontFamily:'JetBrains Mono, monospace', fontWeight:600, marginTop:1}}>31.0%</div></div>
              </div>
              <div style={{display:'flex', gap:6, marginTop:10}}>
                <KButton variant="ghost" size="sm" style={{flex:1}}>Edit</KButton>
                <KButton variant="ghost" size="sm" style={{flex:1}}>Reset Day</KButton>
              </div>
            </div>

            {/* Today's Bets — session summary (scaled to $100 bank) */}
            <div style={{background:KT.panel, border:`1px solid ${KT.border}`, borderRadius:8, padding:'14px 16px'}}>
              <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:8}}>
                <KLabel spacing={1.5} size={10} color={KT.brass} style={{fontWeight:700}}>Today's Bets</KLabel>
                <span style={{marginLeft:'auto', fontSize:10, color:KT.muted, fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>2 settled · 1 pending</span>
              </div>
              {[
                { r:3, pick:'Maple Drifter', conf:'MED', odds:'5/1', stake:2, finish:'🥉', net: -2.00, pending:false },
                { r:2, pick:'Ironwood Bay',  conf:'HI',  odds:'3/1', stake:4, finish:'🥇', net:+14.40, pending:false },
                { r:4, pick:'Silver Reign',  conf:'HI',  odds:'7/2', stake:4, finish:'—',  net:  0,    pending:true  },
              ].map((b,i,arr) => {
                const win = b.net > 0;
                return (
                  <div key={i} style={{display:'grid', gridTemplateColumns:'24px 1fr auto', gap:8, alignItems:'center', padding:'7px 0', borderBottom: i<arr.length-1 ? `1px solid ${KT.rule2}` : 'none', opacity: b.pending ? 0.7 : 1}}>
                    <div style={{fontFamily:'Playfair Display, serif', fontSize:15, fontWeight:700, color:KT.brass}}>R{b.r}</div>
                    <div>
                      <div style={{fontSize:12, fontFamily:'Playfair Display, serif', fontWeight:600, color:KT.ink}}>{b.pick}</div>
                      <div style={{fontSize:10, color:KT.muted, fontFamily:'JetBrains Mono, monospace'}}>{b.odds} · ${b.stake} · <span style={{fontFamily:'initial', fontSize:12}}>{b.finish}</span></div>
                    </div>
                    {b.pending ? (
                      <div style={{fontSize:10, fontFamily:'Oswald, sans-serif', letterSpacing:1.2, fontWeight:700, color:KT.brass, textAlign:'right'}}>PENDING</div>
                    ) : (
                      <div style={{fontSize:12, fontFamily:'JetBrains Mono, monospace', fontWeight:700, color: win ? KT.green : KT.red, textAlign:'right'}}>
                        {win ? '▲ +' : '▼ -'}${Math.abs(b.net).toFixed(2)}
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{marginTop:8, padding:'7px 10px', background:KT.greenSoft, border:`1px solid ${KT.green}`, borderRadius:4, display:'flex', alignItems:'center'}}>
                <KLabel color={KT.green} spacing={1.5} size={10} style={{fontWeight:700}}>Settled Net</KLabel>
                <span style={{marginLeft:'auto', fontFamily:'JetBrains Mono, monospace', fontSize:13, fontWeight:700, color:KT.green}}>+$12.40</span>
              </div>
            </div>

            {/* Stakes spotlight */}
            <div style={{background:`linear-gradient(135deg, ${KT.brassSoft} 0%, ${KT.cream} 100%)`, border:`1.5px solid ${KT.brass}`, borderRadius:8, padding:'14px 16px', cursor:'pointer'}} onClick={()=>nav('race',{race:bigRace.n})}>
              <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:6}}>
                <span style={{background:KT.brass, color:KT.canvas, fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:2, fontFamily:'Oswald, sans-serif', letterSpacing:1}}>🏆 STAKES</span>
                <KLabel color={KT.brass} spacing={1.5} size={10}>Feature · R{bigRace.n}</KLabel>
              </div>
              <KHead size={18} weight={800} color={KT.brass}>Rebel Stakes (G2)</KHead>
              <div style={{fontSize:11, color:KT.ink2, marginTop:2}}>1 1/8m · Dirt · {bigRace.purse} · Post {bigRace.time}</div>
              <div style={{fontSize:11.5, fontFamily:'Playfair Display, serif', fontStyle:'italic', color:KT.ink2, marginTop:8, lineHeight:1.5}}>
                Key Derby prep. Nine 3-year-olds. Silver Reign the horse to beat.
              </div>
              <div style={{color:KT.brass, fontFamily:'Oswald, sans-serif', fontSize:10.5, letterSpacing:1.5, marginTop:10, fontWeight:600}}>PREVIEW →</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { KDashboard });
