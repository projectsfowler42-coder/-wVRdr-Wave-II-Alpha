import type { CSSProperties, ReactNode } from "react";
import { Bell, Clock, LineChart, Search, SlidersHorizontal, User, Waves } from "lucide-react";
import { HeroCard } from "./components/HeroCard";
import { MiniMetric } from "./components/MiniMetric";
import { DecisionGatesPanel, DeltaEnginePanel, ITBPanel, PropLabPanel } from "./components/panels";
import { mockDashboardSnapshot } from "./data/mockDashboardSnapshot";
import { waveIColors } from "./tokens/waveIColors";

type StatusStyle = CSSProperties & { "--status"?: string };

function StatusPill({ children, color }: { children: ReactNode; color?: string }) {
  const style: StatusStyle = { "--status": color ?? "rgba(255,255,255,.75)" };
  return <div className="status-pill" style={style}>{children}</div>;
}

function TruthBanner() {
  return (
    <div className="truth-banner" role="status" aria-label="Dashboard data mode is mock visual prototype">
      <span><strong>MOCK / VISUAL PROTOTYPE</strong> — not live-data certified</span>
      <span>no broker link · no private data · no trading authority</span>
    </div>
  );
}

export default function WaveRiderDashboard() {
  const snapshot = mockDashboardSnapshot;

  return (
    <div className="screen">
      <div className="haze h1" />
      <div className="haze h2" />
      <div className="haze h3" />
      <div className="dashboard">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark"><Waves size={22} /></div>
            <div><b>WaveRider</b><small>DASHBOARD</small></div>
          </div>
          <nav aria-label="WaveRider dashboard sections">
            <button className="active">Regime</button>
            <button>Cash</button>
            <button>Positions</button>
            <button>Intel</button>
          </nav>
          <div className="icons" aria-hidden="true"><Search size={17} /><Bell size={17} /><LineChart size={17} /><User size={17} /></div>
        </header>

        <TruthBanner />

        <main>
          <section className="hero-grid" aria-label="Hero dashboard gauges">
            {snapshot.heroMetrics.map((hero) => <HeroCard key={hero.id} hero={hero} />)}
          </section>
          <section className="mini-grid" aria-label="Mini metric row">
            {snapshot.miniMetrics.map((metric) => <MiniMetric key={metric.id} item={metric} />)}
          </section>
          <section className="lower-grid" aria-label="Dashboard intelligence panels">
            <DeltaEnginePanel snapshot={snapshot} />
            <DecisionGatesPanel snapshot={snapshot} />
            <ITBPanel />
            <PropLabPanel />
          </section>
        </main>

        <footer>
          <StatusPill><SlidersHorizontal size={14} /> SYSTEM CONTROLS</StatusPill>
          <StatusPill color={waveIColors.green}>API HEALTH: MOCK</StatusPill>
          <StatusPill color={waveIColors.gold}>INTEGRITY: VISUAL</StatusPill>
          <StatusPill color={waveIColors.fordBlue}>DATA FEED: MOCK</StatusPill>
          <StatusPill color={waveIColors.purple}>MODEL STATUS: DORMANT</StatusPill>
          <StatusPill><Clock size={14} /> 10:24 AM ET</StatusPill>
        </footer>
      </div>
    </div>
  );
}
