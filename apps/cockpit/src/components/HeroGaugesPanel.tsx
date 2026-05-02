import { HeroGauge } from './HeroGauge';

export type HeroGaugeValue = {
  value: number;
  label: string;
};

export type HeroGaugeState = {
  schema?: string;
  regime: HeroGaugeValue;
  vectors: HeroGaugeValue;
  threats: HeroGaugeValue;
  portfolio: HeroGaugeValue;
  timestamp?: string;
  truthClass?: string;
  executionEligible?: boolean;
  source?: string;
};

type HeroGaugesPanelProps = {
  state: HeroGaugeState | null;
  loading?: boolean;
};

const EMPTY_STATE: HeroGaugeState = {
  regime: { value: 0, label: 'CONNECTING' },
  vectors: { value: 0, label: 'CONNECTING' },
  threats: { value: 0, label: 'CONNECTING' },
  portfolio: { value: 0, label: 'CONNECTING' },
  truthClass: 'UNVERIFIED',
  executionEligible: false,
  source: 'truth-bridge',
};

function formatTimestamp(timestamp?: string): string {
  if (!timestamp) return 'awaiting bridge';
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return timestamp;
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function HeroGaugesPanel({ state, loading = false }: HeroGaugesPanelProps) {
  const gauges = state ?? EMPTY_STATE;
  const bridgeState = loading ? 'CONNECTING TO TRUTH-SPINE...' : (gauges.truthClass ?? 'UNVERIFIED');

  return (
    <section className="hero-gauges-panel" aria-busy={loading}>
      <div className="hero-gauges-aura" aria-hidden="true" />
      <div className="hero-gauges-header">
        <div>
          <p className="eyebrow">Hero Gauges / Truth Bridge</p>
          <h2>Liquid glass telemetry</h2>
        </div>
        <div className="hero-gauges-meta">
          <span>{bridgeState}</span>
          <small>{gauges.executionEligible ? 'execution eligible' : 'execution locked'}</small>
        </div>
      </div>

      <div className="hero-gauges-grid">
        <HeroGauge title="REGIME" value={gauges.regime.value} label={gauges.regime.label} />
        <HeroGauge title="VECTORS" value={gauges.vectors.value} label={gauges.vectors.label} />
        <HeroGauge title="THREATS" value={gauges.threats.value} label={gauges.threats.label} />
        <HeroGauge title="PORTFOLIO" value={gauges.portfolio.value} label={gauges.portfolio.label} />
      </div>

      <div className="hero-gauges-footer">
        <span>source={gauges.source ?? 'unknown'}</span>
        <span>timestamp={formatTimestamp(gauges.timestamp)}</span>
      </div>
    </section>
  );
}
