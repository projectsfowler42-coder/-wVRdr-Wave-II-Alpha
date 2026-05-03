import type { HealthResponse, HeroGaugeState, WaveSnapshot } from '../services/waveApi';

type Props = {
  health: HealthResponse | null;
  snapshot: WaveSnapshot | null;
  heroGauges: HeroGaugeState | null;
  stale: boolean;
  degraded: boolean;
  error: string | null;
  loadedAt: string | null;
};

function display(value: unknown, fallback = 'UNKNOWN'): string {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

function boolDisplay(value: boolean | undefined, fallback = 'UNKNOWN'): string {
  if (typeof value !== 'boolean') return fallback;
  return value ? 'TRUE' : 'FALSE';
}

function classifyToken(value: string): 'ok' | 'warn' | 'locked' | 'neutral' {
  if (['HMAC_REQUIRED', 'READ_ONLY_DORMANT', 'CURRENT', 'ONLINE'].includes(value)) return 'ok';
  if (['STALE_RESCUE', 'STALE', 'DEGRADED', 'FAILED', 'UNAVAILABLE'].includes(value)) return 'warn';
  if (['EXECUTION_LOCKED', 'LOCKED', 'FALSE'].includes(value)) return 'locked';
  return 'neutral';
}

type TruthTokenProps = {
  label: string;
  value: string;
};

function TruthToken({ label, value }: TruthTokenProps) {
  return (
    <div className={`truth-token ${classifyToken(value)}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function BridgeSecurityPanel({ health, snapshot, heroGauges, stale, degraded, error, loadedAt }: Props) {
  const proofMode = display(health?.deviceProof?.mode, 'MONITOR_ONLY');
  const proofConfigured = boolDisplay(health?.deviceProof?.configured);
  const bridgeMode = display(snapshot?.system?.mode ?? health?.mode, degraded ? 'DEGRADED' : 'READ_ONLY_DORMANT');
  const truthClass = display(heroGauges?.truthClass ?? snapshot?.regime?.label, stale ? 'STALE_RESCUE' : 'UNVERIFIED');
  const executionState = heroGauges?.executionEligible ? 'EXECUTION_ELIGIBLE' : 'EXECUTION_LOCKED';
  const source = display(heroGauges?.source, 'truth-bridge');
  const freshness = stale ? 'STALE' : 'CURRENT';
  const errorState = error ? 'DEGRADED' : 'ONLINE';

  return (
    <section className="bridge-security-panel" aria-label="Bridge and security state">
      <div className="bridge-security-head">
        <div>
          <p className="eyebrow">Bridge / Security / Truth State</p>
          <h2>Visible operator proof</h2>
        </div>
        <div className="bridge-security-mode">
          <span>loaded</span>
          <strong>{display(loadedAt, 'NO VERIFIED LOAD')}</strong>
        </div>
      </div>

      <div className="truth-token-grid">
        <TruthToken label="Device proof" value={proofMode} />
        <TruthToken label="Proof configured" value={proofConfigured} />
        <TruthToken label="Bridge mode" value={bridgeMode} />
        <TruthToken label="Truth class" value={truthClass} />
        <TruthToken label="Freshness" value={freshness} />
        <TruthToken label="Execution" value={executionState} />
        <TruthToken label="API state" value={errorState} />
        <TruthToken label="Source" value={source} />
      </div>

      <div className="bridge-security-boundary">
        <span>Boundary</span>
        <strong>read-only local truth bridge · no broker orders · no raw private rows · no fake LIVE promotion</strong>
      </div>
      {error ? <p className="bridge-security-error">{error}</p> : null}
    </section>
  );
}
