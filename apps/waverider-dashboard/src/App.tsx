import React from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Bitcoin,
  Clock,
  Filter,
  Gauge,
  Hexagon,
  LineChart,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  User,
  Waves,
  Zap,
} from "lucide-react";

const WR = {
  khorneRed: "#7A0C14",
  mephistonRed: "#B11C2B",
  emberRed: "#C62828",
  signalVermilion: "#D9472B",
  hotAlert: "#E45A2B",
  lavaOrange: "#F06A1F",
  fantaOrange: "#F58220",
  warningOrange: "#F79A1E",
  gold: "#F7C600",
  beaconYellow: "#F3E36E",
  lemongrass: "#F6EE9A",
  chelseaBlue: "#034694",
  fordBlue: "#2A5DA8",
  manCityBlue: "#6CABDD",
  aquaBlue: "#7DE7F7",
  aquaGreen: "#67D7B0",
  green: "#39B96B",
  deepGreen: "#008348",
  darkGreen: "#004225",
  purple: "#552583",
};

type HeroSpec = {
  id: string;
  title: string;
  mainValue: number;
  mainKicker: string;
  mainLabel: string;
  secondaryValue: number;
  secondaryLabel: string;
  outer: string;
  inner: string;
  caution?: boolean;
};

const heroes: HeroSpec[] = [
  { id: "regime", title: "REGIME", mainValue: 78, mainKicker: "REALITY", mainLabel: "STABLE\nEXPANSION", secondaryValue: 65, secondaryLabel: "RISK-ON\n(CAUTIOUS)", outer: WR.aquaBlue, inner: WR.manCityBlue, caution: true },
  { id: "vectors", title: "VECTORS", mainValue: 82, mainKicker: "REALITY", mainLabel: "CONVERGING\nPOSITIVE", secondaryValue: 70, secondaryLabel: "DEPLOY\n(SELECTIVE)", outer: WR.aquaGreen, inner: WR.manCityBlue },
  { id: "threats", title: "THREATS", mainValue: 45, mainKicker: "REALITY", mainLabel: "MODERATE\nELEVATED", secondaryValue: 30, secondaryLabel: "DEFENSIVE\nPOSTURE", outer: WR.fantaOrange, inner: WR.mephistonRed },
  { id: "portfolio", title: "PORTFOLIO", mainValue: 88, mainKicker: "HEALTHY", mainLabel: "YTD: +14.5%", secondaryValue: 75, secondaryLabel: "SHARPE: 2.1\nDRAWDOWN: -3.2%", outer: WR.deepGreen, inner: WR.aquaGreen },
];

const miniMetrics = [
  { label: "VOLATILITY", value: "22.4%", icon: Activity, color: WR.manCityBlue },
  { label: "MOMENTUM", value: "+5.8%", icon: TrendingUp, color: WR.green },
  { label: "VIX LEVEL", value: "18.2", icon: AlertTriangle, color: WR.fantaOrange },
  { label: "BTC STRENGTH", value: "+3.1%", icon: Bitcoin, color: WR.aquaGreen },
  { label: "FRACTURE", value: "1.2%", icon: Hexagon, color: WR.purple },
  { label: "WRONGNESS", value: "8.5%", icon: Gauge, color: WR.emberRed },
];

const deltaRows = [
  { rank: 1, label: "Panic / Liquidity", color: WR.emberRed },
  { rank: 2, label: "Dip / Mean Reversion", color: WR.fantaOrange },
  { rank: 1, label: "Momentum / BMOS", color: WR.green },
  { rank: 1, label: "Macro Pressure", color: WR.fordBlue },
  { rank: 2, label: "Regime / Risk", color: WR.gold },
];

const gateSteps = [
  { title: "Scan", desc: "Market data sweep", color: WR.fordBlue, icon: Search },
  { title: "Filter", desc: "Signal refinement", color: WR.fantaOrange, icon: Filter },
  { title: "Validate", desc: "Risk & quality check", color: WR.green, icon: ShieldCheck },
  { title: "Execute", desc: "Action with discipline", color: WR.purple, icon: Zap },
];

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, end);
  const e = polar(cx, cy, r, start);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

function GlassCard({ children, className = "", tint = "rgba(255,255,255,.12)" }: { children: React.ReactNode; className?: string; tint?: string }) {
  return <section className={`glass-card ${className}`} style={{ "--tint": tint } as React.CSSProperties}>{children}</section>;
}

function HeroGauge({ hero }: { hero: HeroSpec }) {
  const id = hero.id;
  const outerEnd = 220 + hero.mainValue * 2.72;
  const innerEnd = 220 + hero.secondaryValue * 2.72;
  return (
    <div className="hero-gauge-shell">
      <svg viewBox="0 0 320 170" className="hero-gauge-svg">
        <defs>
          <linearGradient id={`${id}-outer`} x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stopColor={hero.outer} stopOpacity="0.70" /><stop offset="55%" stopColor={hero.outer} stopOpacity="0.92" /><stop offset="100%" stopColor={hero.outer} stopOpacity="0.52" /></linearGradient>
          <linearGradient id={`${id}-inner`} x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stopColor={hero.inner} stopOpacity="0.52" /><stop offset="100%" stopColor={hero.inner} stopOpacity="0.92" /></linearGradient>
          <filter id={`${id}-glow`} x="-45%" y="-45%" width="190%" height="190%"><feDropShadow dx="0" dy="10" stdDeviation="11" floodColor={hero.outer} floodOpacity="0.30" /><feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={hero.inner} floodOpacity="0.22" /></filter>
        </defs>
        <path d={arcPath(122, 138, 104, 220, 500)} className="hero-track" />
        <path d={arcPath(122, 138, 104, 220, outerEnd)} stroke={`url(#${id}-outer)`} className="hero-outer" filter={`url(#${id}-glow)`} />
        <path d={arcPath(205, 138, 58, 220, 500)} className="hero-track hero-inner-track" />
        <path d={arcPath(205, 138, 58, 220, innerEnd)} stroke={`url(#${id}-inner)`} className="hero-inner" filter={`url(#${id}-glow)`} />
      </svg>
      <div className="hero-main-readout"><div className="kicker">{hero.mainKicker}</div><div className="hero-main-number">{hero.mainValue}<span>%</span></div><div className="hero-main-label">{hero.mainLabel}</div></div>
      <div className="hero-secondary-readout"><div className="hero-secondary-number">{hero.secondaryValue}<span>%</span></div><div className="hero-secondary-label">{hero.secondaryLabel}</div></div>
      {hero.caution && <div className="hero-caution">△</div>}
    </div>
  );
}

function HeroCard({ hero }: { hero: HeroSpec }) { return <GlassCard className="hero-card" tint={`${hero.outer}14`}><div className="hero-title-row"><h2>{hero.title}</h2><span>ACTIONABILITY</span></div><HeroGauge hero={hero} /></GlassCard>; }

function MiniMetric({ item }: { item: (typeof miniMetrics)[number] }) { const Icon = item.icon; return <GlassCard className="mini-card" tint={`${item.color}11`}><div className="mini-orb" style={{ "--orb": item.color } as React.CSSProperties}><Icon size={18} /></div><div><p>{item.label}</p><b style={{ color: item.color }}>{item.value}</b></div></GlassCard>; }

function DeltaEngine() { return <GlassCard className="panel delta-panel" tint="rgba(217,71,43,.10)"><h3>FTYNTK DELTA ENGINE</h3><div className="delta-list">{deltaRows.map((row) => <div className="delta-row" key={row.label}><span className="rank" style={{ background: row.color, boxShadow: `0 0 18px ${row.color}77` }}>{row.rank}</span><span className="delta-label">{row.label}</span><span className="signal"><i style={{ background: row.color }} /><i style={{ background: row.color }} /></span></div>)}</div><MiniLineChart /></GlassCard>; }

function DecisionGates() { return <GlassCard className="panel gates-panel" tint="rgba(247,198,0,.09)"><h3>DECISION GATES</h3><div className="gate-flow">{gateSteps.map((step) => { const Icon = step.icon; return <div className="gate-row" key={step.title}><span className="gate-orb" style={{ "--gate": step.color } as React.CSSProperties}><Icon size={15} /></span><div><b>{step.title}</b><small>{step.desc}</small></div><span className="gate-lock" style={{ "--gate": step.color } as React.CSSProperties}>🔒</span></div>; })}</div></GlassCard>; }

function ITB() { return <GlassCard className="panel itb-panel" tint="rgba(103,215,176,.09)"><h3>ITB INTELLIGENCE ENGINE</h3><Scatter /><div className="legend"><span><i style={{ background: WR.fordBlue }} />Bounce Probe</span><span><i style={{ background: WR.green }} />Dip Probe</span></div><div className="stats"><span>Data Points <b>412</b></span><span>Net Bias <b>+1.4%</b></span><span>Sigma <b>0.27</b></span></div></GlassCard>; }

function PropLab() { return <GlassCard className="panel prop-panel" tint="rgba(85,37,131,.09)"><h3>PROP LAB — SIM TO WIN</h3><div className="mc-row"><span>Monte Carlo</span><small>10,000 SIMULATIONS</small></div><BellCurve /><div className="prop-bottom"><PassRing /><div className="prop-stats"><span>Avg Return <b>+12.6%</b></span><span>Max Drawdown <b>-8.3%</b></span><span>Win Ratio <b>1.78</b></span></div></div></GlassCard>; }

function MiniLineChart() { return <svg className="mini-line" viewBox="0 0 310 92"><line x1="18" y1="72" x2="292" y2="72" stroke="rgba(60,50,35,.10)" /><polyline points="18,76 56,62 92,66 130,48 170,58 214,36 250,44 292,28" fill="none" stroke={WR.fantaOrange} strokeWidth="3" strokeLinecap="round" /><polyline points="18,66 56,58 92,42 130,56 170,50 214,62 250,58 292,40" fill="none" stroke={WR.aquaGreen} strokeWidth="3" strokeLinecap="round" /><polyline points="18,80 56,72 92,70 130,60 170,64 214,61 250,54 292,50" fill="none" stroke={WR.purple} strokeWidth="3" strokeLinecap="round" />{["D","W","M","Q","Y"].map((l, i) => <text key={l} x={36 + i * 58} y="90" textAnchor="middle" className={l === "W" ? "selected-tick" : "small-tick"}>{l}</text>)}</svg>; }

function Scatter() { const pts: Array<[number, number, string]> = [[22,64,WR.fordBlue],[44,52,WR.green],[66,74,WR.purple],[88,46,WR.fordBlue],[110,70,WR.aquaGreen],[134,38,WR.fantaOrange],[158,60,WR.green],[192,44,WR.fordBlue],[220,58,WR.purple]]; return <svg className="scatter" viewBox="0 0 270 128"><rect x="20" y="15" width="226" height="94" rx="3" fill="rgba(255,255,255,.18)" stroke="rgba(0,0,0,.08)" />{[0,1,2,3].map((i) => <line key={`v${i}`} x1={20 + i * 56.5} x2={20 + i * 56.5} y1="15" y2="109" stroke="rgba(0,0,0,.08)" />)}{[0,1,2].map((i) => <line key={`h${i}`} x1="20" x2="246" y1={15 + i * 31.3} y2={15 + i * 31.3} stroke="rgba(0,0,0,.08)" />)}{pts.map(([x,y,c], i) => <circle key={i} cx={x} cy={y} r="5" fill={c} opacity=".78" />)}</svg>; }

function BellCurve() { const w=270,h=86; const pts=Array.from({ length: 80 }, (_, i) => { const x=(i/79)*w; const t=(i-39.5)/13; const y=h-Math.exp(-0.5*t*t)*68-6; return [x,y]; }); const line=pts.map(([x,y], i)=>`${i ? "L" : "M"}${x},${y}`).join(" "); return <svg className="bell" viewBox={`0 0 ${w} ${h}`}><path d={`${line} L${w},${h} L0,${h} Z`} fill={WR.aquaGreen} opacity=".16" /><path d={line} fill="none" stroke={WR.aquaGreen} strokeWidth="3" /><path d={line} fill="none" stroke={WR.purple} strokeWidth="2" opacity=".45" /><line x1="166" x2="166" y1="8" y2="82" stroke={WR.fantaOrange} strokeWidth="2" /></svg>; }

function PassRing() { const r=31,c=2*Math.PI*r,pct=0.72; return <div className="pass-ring"><svg viewBox="0 0 78 78"><circle cx="39" cy="39" r={r} stroke="rgba(0,0,0,.08)" strokeWidth="9" fill="none" /><circle cx="39" cy="39" r={r} stroke={WR.aquaGreen} strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 39 39)" /></svg><b>72%</b><span>PASS</span></div>; }

function StatusPill({ children, color }: { children: React.ReactNode; color?: string }) { return <div className="status-pill" style={{ "--status": color ?? "rgba(255,255,255,.75)" } as React.CSSProperties}>{children}</div>; }

export default function WaveRiderDashboard() { return <div className="screen"><StyleBlock /><div className="haze h1" /><div className="haze h2" /><div className="haze h3" /><div className="dashboard"><header className="topbar"><div className="brand"><div className="brand-mark"><Waves size={22} /></div><div><b>WaveRider</b><small>DASHBOARD</small></div></div><nav><button className="active">Regime</button><button>Cash</button><button>Positions</button><button>Intel</button></nav><div className="icons"><Search size={17} /><Bell size={17} /><LineChart size={17} /><User size={17} /></div></header><main><section className="hero-grid">{heroes.map((h) => <HeroCard key={h.id} hero={h} />)}</section><section className="mini-grid">{miniMetrics.map((m) => <MiniMetric key={m.label} item={m} />)}</section><section className="lower-grid"><DeltaEngine /><DecisionGates /><ITB /><PropLab /></section></main><footer><StatusPill><SlidersHorizontal size={14} /> SYSTEM CONTROLS</StatusPill><StatusPill color={WR.green}>API HEALTH: CONNECTED</StatusPill><StatusPill color={WR.green}>INTEGRITY: OPTIMAL</StatusPill><StatusPill color={WR.fordBlue}>DATA FEED: LIVE</StatusPill><StatusPill color={WR.purple}>MODEL STATUS: ACTIVE</StatusPill><StatusPill><Clock size={14} /> 10:24 AM ET</StatusPill></footer></div></div>; }

function StyleBlock() { return <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&family=JetBrains+Mono:wght@600;700;800;900&display=swap'); *{box-sizing:border-box} body{margin:0;font-family:Inter,system-ui,sans-serif}.screen{min-height:100vh;position:relative;overflow:hidden;padding:24px;background:radial-gradient(circle at 13% 8%,rgba(217,71,43,.10),transparent 25%),radial-gradient(circle at 80% 17%,rgba(85,37,131,.10),transparent 30%),radial-gradient(circle at 52% 46%,rgba(103,215,176,.11),transparent 36%),linear-gradient(145deg,#ece5da 0%,#f7f2ea 48%,#e4ddd1 100%);color:#171717}.dashboard{max-width:1500px;margin:0 auto;min-height:calc(100vh - 48px);border-radius:34px;border:1px solid rgba(255,255,255,.58);background:linear-gradient(145deg,rgba(255,255,255,.38),rgba(232,219,203,.20));box-shadow:0 34px 92px rgba(73,55,40,.18),inset 0 1px 1px rgba(255,255,255,.74);backdrop-filter:blur(18px);padding:18px;position:relative;z-index:1}.topbar{height:62px;display:flex;align-items:center;justify-content:space-between}.brand{display:flex;align-items:center;gap:10px}.brand-mark{height:42px;width:42px;border-radius:999px;display:grid;place-items:center;background:radial-gradient(circle at 30% 20%,rgba(255,255,255,.74),transparent 32%),rgba(255,255,255,.22);box-shadow:inset 0 1px 1px rgba(255,255,255,.8),0 12px 26px rgba(90,70,45,.10);color:#2A5DA8}.brand b{font-size:24px}.brand small{display:block;font-size:10px;color:rgba(0,0,0,.36);font-weight:900;letter-spacing:.12em}nav{display:flex;gap:26px;font-weight:800}nav button{border:0;background:transparent;padding:9px 16px;border-radius:999px;font:inherit;color:#242424}nav .active{background:radial-gradient(circle at 30% 20%,rgba(255,255,255,.82),transparent 35%),rgba(255,255,255,.32);box-shadow:inset 0 1px 1px rgba(255,255,255,.75),0 12px 30px rgba(91,72,44,.14)}.icons{display:flex;gap:18px;color:rgba(0,0,0,.45)}main{display:flex;flex-direction:column;gap:22px}.hero-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}.glass-card{position:relative;overflow:hidden;border-radius:31px;border:1px solid rgba(255,255,255,.54);background:radial-gradient(circle at 22% 4%,rgba(255,255,255,.52),transparent 34%),radial-gradient(circle at 72% 100%,var(--tint),transparent 46%),linear-gradient(145deg,rgba(255,255,255,.32),rgba(224,211,195,.21));box-shadow:inset 0 1px 2px rgba(255,255,255,.72),inset 0 -1px 2px rgba(95,72,45,.09),0 18px 42px rgba(79,60,42,.16);backdrop-filter:blur(17px) saturate(1.12)}.glass-card:before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(135deg,rgba(255,255,255,.62),transparent 20%,transparent 76%,rgba(255,255,255,.16));pointer-events:none}.glass-card>*{position:relative;z-index:1}.hero-card{height:220px;padding:18px}.hero-title-row{display:flex;justify-content:space-between;align-items:center}.hero-title-row h2{font-size:14px;margin:0;font-weight:900;letter-spacing:.04em}.hero-title-row span{font-size:9px;font-weight:900;color:rgba(0,0,0,.42);letter-spacing:.08em}.hero-gauge-shell{height:172px;position:relative}.hero-gauge-svg{position:absolute;inset:6px -4px 0 -4px;width:calc(100% + 8px);height:150px;overflow:visible}.hero-track{fill:none;stroke:rgba(86,72,55,.075);stroke-width:22;stroke-linecap:round}.hero-inner-track{stroke-width:13}.hero-outer{fill:none;stroke-width:20;stroke-linecap:round}.hero-inner{fill:none;stroke-width:12;stroke-linecap:round}.hero-main-readout{position:absolute;left:54px;top:58px;text-align:left}.kicker{font-size:10px;font-weight:900;color:rgba(0,0,0,.52)}.hero-main-number{font-family:'JetBrains Mono',monospace;font-size:33px;font-weight:900;line-height:.9}.hero-main-number span,.hero-secondary-number span{font-size:16px}.hero-main-label{white-space:pre-line;font-size:10px;font-weight:900;line-height:1.15;margin-top:4px}.hero-secondary-readout{position:absolute;right:18px;top:72px;text-align:center}.hero-secondary-number{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:900}.hero-secondary-label{white-space:pre-line;font-size:9px;font-weight:900;line-height:1.2}.hero-caution{position:absolute;right:7px;bottom:10px;color:#F79A1E;font-weight:900}.mini-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:15px}.mini-card{height:74px;display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:22px}.mini-orb{height:52px;width:52px;border-radius:999px;display:grid;place-items:center;color:white;background:radial-gradient(circle at 30% 22%,rgba(255,255,255,.82),transparent 32%),var(--orb);box-shadow:inset 0 2px 2px rgba(255,255,255,.58),0 0 28px color-mix(in srgb,var(--orb) 58%,transparent)}.mini-card p{margin:0;font-size:9px;font-weight:900;color:rgba(0,0,0,.46);letter-spacing:.1em}.mini-card b{font-family:'JetBrains Mono';font-size:17px}.lower-grid{display:grid;grid-template-columns:1.08fr 1.08fr 1fr 1fr;gap:22px}.panel{height:305px;padding:22px}.panel h3{margin:0 0 20px;font-size:14px;font-weight:900;letter-spacing:.04em}.delta-list{display:grid;gap:13px}.delta-row{display:flex;align-items:center;gap:12px}.rank{height:28px;width:28px;border-radius:999px;display:grid;place-items:center;color:white;font-weight:900}.delta-label{font-size:13px;font-weight:800;flex:1}.signal{display:flex;gap:8px}.signal i{height:11px;width:11px;border-radius:4px}.mini-line{height:86px;width:100%;margin-top:20px}.small-tick,.selected-tick{font-size:10px;font-weight:800;fill:rgba(0,0,0,.42)}.selected-tick{fill:#B11C2B;text-decoration:underline}.gate-flow{display:grid;gap:16px}.gate-row{display:grid;grid-template-columns:42px 1fr 46px;align-items:center;position:relative}.gate-orb,.gate-lock{height:38px;width:38px;border-radius:999px;display:grid;place-items:center;color:var(--gate);background:radial-gradient(circle at 30% 20%,rgba(255,255,255,.78),transparent 34%),color-mix(in srgb,var(--gate) 16%,transparent);box-shadow:inset 0 1px 1px rgba(255,255,255,.7),0 0 24px color-mix(in srgb,var(--gate) 34%,transparent)}.gate-row b{font-size:14px}.gate-row small{display:block;font-size:11px;color:rgba(0,0,0,.38);font-weight:700}.legend{display:flex;gap:22px;font-size:12px;font-weight:800}.legend i{display:inline-block;height:9px;width:9px;border-radius:999px;margin-right:5px}.stats{display:grid;gap:8px;margin-top:12px;font-size:12px}.stats span,.prop-stats span{display:flex;justify-content:space-between}.stats b,.prop-stats b{font-family:'JetBrains Mono';font-weight:900}.mc-row{display:flex;justify-content:space-between;margin-bottom:6px}.mc-row span{font-weight:800}.mc-row small{font-family:'JetBrains Mono';font-weight:800;color:rgba(0,0,0,.36)}.bell{height:88px;width:100%}.prop-bottom{display:flex;align-items:center;gap:20px}.pass-ring{height:78px;width:78px;position:relative;display:grid;place-items:center}.pass-ring svg{position:absolute;inset:0}.pass-ring b{font-family:'JetBrains Mono';font-size:20px}.pass-ring span{position:absolute;top:49px;font-size:8px;font-weight:900}.prop-stats{display:grid;gap:12px;flex:1;font-size:12px}footer{margin-top:24px;display:flex;justify-content:center;gap:16px;flex-wrap:wrap}.status-pill{--status:rgba(255,255,255,.8);height:42px;display:flex;align-items:center;gap:8px;padding:0 20px;border-radius:999px;border:1px solid rgba(255,255,255,.48);background:radial-gradient(circle at 30% 20%,rgba(255,255,255,.64),transparent 34%),linear-gradient(145deg,rgba(255,255,255,.30),rgba(224,211,195,.17));box-shadow:inset 0 1px 1px rgba(255,255,255,.72),0 12px 26px color-mix(in srgb,var(--status) 20%,rgba(80,60,40,.10));font-size:11px;font-weight:900;letter-spacing:.05em}.haze{position:absolute;border-radius:999px;filter:blur(34px);opacity:.44}.h1{width:380px;height:380px;left:-100px;top:170px;background:rgba(217,71,43,.17)}.h2{width:420px;height:420px;right:120px;top:160px;background:rgba(125,231,247,.16)}.h3{width:410px;height:410px;right:-80px;bottom:-90px;background:rgba(85,37,131,.18)}@media(max-width:1100px){.hero-grid,.mini-grid,.lower-grid{grid-template-columns:repeat(2,1fr)}.screen{padding:14px}.topbar{height:auto;flex-wrap:wrap;gap:14px}}@media(max-width:720px){.hero-grid,.mini-grid,.lower-grid{grid-template-columns:1fr}nav{order:3;width:100%;justify-content:center;gap:10px}.hero-main-readout{left:42px}.hero-secondary-readout{right:10px}}`}</style>; }
