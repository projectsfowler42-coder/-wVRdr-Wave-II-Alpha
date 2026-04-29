import type { HealthResponse, WaveSnapshot } from '../services/waveApi';

type Props = {
  health: HealthResponse | null;
  snapshot: WaveSnapshot | null;
  degraded: boolean;
  stale: boolean;
  loading: boolean;
};

function valueOrLocked(value: unknown, fallback = 'LOCKED'): string {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

export function SystemHealthStrip({ health, snapshot, degraded, stale, loading }: Props) {
  const mode = valueOrLocked(snapshot?.system?.mode ?? health?.mode, degraded ? 'DEGRADED' : 'READ_ONLY_LIVE');
  const apiStatus = loading ? 'CHECKING' : degraded ? 'DEGRADED' : 'ONLINE';
  const lastUpdated = valueOrLocked(snapshot?.system?.last_updated ?? health?.last_updated, 'NO VERIFIED UPDATE');
  const truthSpine = valueOrLocked(snapshot?.system?.truth_spine ?? health?.truth_spine, 'UNAVAILABLE');

  return (
    <header className="system-strip" aria-label="Wave-I system health">
      <div className="brand-block">
        <span className="eyebrow">wVRdr~</span>
        <strong>Wave-I Cockpit</strong>
      </div>
      <div className="status-grid">
        <div className={`status-pill ${degraded ? 'warn' : 'ok'}`}>
          <span>API</span>
          <strong>{apiStatus}</strong>
        </div>
        <div className={`status-pill ${stale ? 'warn' : 'ok'}`}>
          <span>Freshness</span>
          <strong>{stale ? 'STALE' : 'CURRENT'}</strong>
        </div>
        <div className="status-pill locked">
          <span>Mode</span>
          <strong>{mode}</strong>
        </div>
        <div className="status-pill">
          <span>Truth Spine</span>
          <strong>{truthSpine}</strong>
        </div>
      </div>
      <div className="last-update">
        <span>Last verified update</span>
        <strong>{lastUpdated}</strong>
      </div>
    </header>
  );
}
