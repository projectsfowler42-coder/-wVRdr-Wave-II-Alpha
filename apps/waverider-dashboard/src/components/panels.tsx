import { Filter, Search, ShieldCheck, Zap } from "lucide-react";
import type { CSSProperties } from "react";
import type { DashboardSnapshot, GateStep } from "../contracts/dashboardSnapshot";
import { waveIColors } from "../tokens/waveIColors";
import { GlassCard } from "./GlassCard";

const gateIconMap = {
  scan: Search,
  filter: Filter,
  validate: ShieldCheck,
  execute: Zap,
} satisfies Record<GateStep["icon"], typeof Search>;

type GateStyle = CSSProperties & { "--gate"?: string };

export function DeltaEnginePanel({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
    <GlassCard className="panel delta-panel" tint="rgba(217,71,43,.10)">
      <h3>FTYNTK DELTA ENGINE</h3>
      <div className="delta-list">
        {snapshot.deltaRows.map((row) => (
          <div className="delta-row" key={row.label}>
            <span className="rank" style={{ background: row.color, boxShadow: `0 0 18px ${row.color}77` }}>{row.rank}</span>
            <span className="delta-label">{row.label}</span>
            <span className="signal"><i style={{ background: row.color }} /><i style={{ background: row.color }} /></span>
          </div>
        ))}
      </div>
      <MiniLineChart />
    </GlassCard>
  );
}

export function DecisionGatesPanel({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
    <GlassCard className="panel gates-panel" tint="rgba(247,198,0,.09)">
      <h3>DECISION GATES</h3>
      <div className="gate-flow">
        {snapshot.gateSteps.map((step) => {
          const Icon = gateIconMap[step.icon];
          const gateStyle: GateStyle = { "--gate": step.color };
          return (
            <div className="gate-row" key={step.title}>
              <span className="gate-orb" style={gateStyle}><Icon size={15} /></span>
              <div><b>{step.title}</b><small>{step.desc}</small></div>
              <span className="gate-lock" style={gateStyle}>LOCK</span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

export function ITBPanel() {
  return (
    <GlassCard className="panel itb-panel" tint="rgba(103,215,176,.09)">
      <h3>ITB INTELLIGENCE ENGINE</h3>
      <Scatter />
      <div className="legend"><span><i style={{ background: waveIColors.fordBlue }} />Bounce Probe</span><span><i style={{ background: waveIColors.green }} />Dip Probe</span></div>
      <div className="stats"><span>Data Points <b>412</b></span><span>Net Bias <b>+1.4%</b></span><span>Sigma <b>0.27</b></span></div>
    </GlassCard>
  );
}

export function PropLabPanel() {
  return (
    <GlassCard className="panel prop-panel" tint="rgba(85,37,131,.09)">
      <h3>PROP LAB — SIM TO WIN</h3>
      <div className="mc-row"><span>Monte Carlo</span><small>10,000 SIMULATIONS</small></div>
      <BellCurve />
      <div className="prop-bottom"><PassRing /><div className="prop-stats"><span>Avg Return <b>+12.6%</b></span><span>Max Drawdown <b>-8.3%</b></span><span>Win Ratio <b>1.78</b></span></div></div>
    </GlassCard>
  );
}

function MiniLineChart() {
  return <svg className="mini-line" viewBox="0 0 310 92"><line x1="18" y1="72" x2="292" y2="72" stroke="rgba(60,50,35,.10)" /><polyline points="18,76 56,62 92,66 130,48 170,58 214,36 250,44 292,28" fill="none" stroke={waveIColors.fantaOrange} strokeWidth="3" strokeLinecap="round" /><polyline points="18,66 56,58 92,42 130,56 170,50 214,62 250,58 292,40" fill="none" stroke={waveIColors.aquaGreen} strokeWidth="3" strokeLinecap="round" /><polyline points="18,80 56,72 92,70 130,60 170,64 214,61 250,54 292,50" fill="none" stroke={waveIColors.purple} strokeWidth="3" strokeLinecap="round" />{["D","W","M","Q","Y"].map((l, i) => <text key={l} x={36 + i * 58} y="90" textAnchor="middle" className={l === "W" ? "selected-tick" : "small-tick"}>{l}</text>)}</svg>;
}

function Scatter() {
  const pts: Array<[number, number, string]> = [[22,64,waveIColors.fordBlue],[44,52,waveIColors.green],[66,74,waveIColors.purple],[88,46,waveIColors.fordBlue],[110,70,waveIColors.aquaGreen],[134,38,waveIColors.fantaOrange],[158,60,waveIColors.green],[192,44,waveIColors.fordBlue],[220,58,waveIColors.purple]];
  return <svg className="scatter" viewBox="0 0 270 128"><rect x="20" y="15" width="226" height="94" rx="3" fill="rgba(255,255,255,.18)" stroke="rgba(0,0,0,.08)" />{[0,1,2,3].map((i) => <line key={`v${i}`} x1={20 + i * 56.5} x2={20 + i * 56.5} y1="15" y2="109" stroke="rgba(0,0,0,.08)" />)}{[0,1,2].map((i) => <line key={`h${i}`} x1="20" x2="246" y1={15 + i * 31.3} y2={15 + i * 31.3} stroke="rgba(0,0,0,.08)" />)}{pts.map(([x,y,c], i) => <circle key={i} cx={x} cy={y} r="5" fill={c} opacity=".78" />)}</svg>;
}

function BellCurve() {
  const w=270,h=86; const pts=Array.from({ length: 80 }, (_, i) => { const x=(i/79)*w; const t=(i-39.5)/13; const y=h-Math.exp(-0.5*t*t)*68-6; return [x,y]; }); const line=pts.map(([x,y], i)=>`${i ? "L" : "M"}${x},${y}`).join(" ");
  return <svg className="bell" viewBox={`0 0 ${w} ${h}`}><path d={`${line} L${w},${h} L0,${h} Z`} fill={waveIColors.aquaGreen} opacity=".16" /><path d={line} fill="none" stroke={waveIColors.aquaGreen} strokeWidth="3" /><path d={line} fill="none" stroke={waveIColors.purple} strokeWidth="2" opacity=".45" /><line x1="166" x2="166" y1="8" y2="82" stroke={waveIColors.fantaOrange} strokeWidth="2" /></svg>;
}

function PassRing() {
  const r=31,c=2*Math.PI*r,pct=0.72;
  return <div className="pass-ring"><svg viewBox="0 0 78 78"><circle cx="39" cy="39" r={r} stroke="rgba(0,0,0,.08)" strokeWidth="9" fill="none" /><circle cx="39" cy="39" r={r} stroke={waveIColors.aquaGreen} strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 39 39)" /></svg><b>72%</b><span>PASS</span></div>;
}
