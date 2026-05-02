import { DegradedStatePanel } from './components/DegradedStatePanel';
import { HeroGaugesPanel } from './components/HeroGaugesPanel';
import { IntegrationGuide } from './components/IntegrationGuide';
import { SystemHealthStrip } from './components/SystemHealthStrip';
import { sendOperatorIntent, type WaveSnapshot } from './services/waveApi';
import { useWaveSnapshot } from './hooks/useWaveSnapshot';

function asEntries(record: Record<string, unknown> | undefined): Array<[string, Record<string, unknown>]> {
  if (!record) return [];
  return Object.entries(record).map(([key, value]) => [key, value && typeof value === 'object' ? (value as Record<string, unknown>) : { value }]);
}

function text(value: unknown, fallback = 'UNVERIFIED'): string {
  if (value === null || value === undefined || value === '') return fallback;
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function RegimePanel({ snapshot }: { snapshot: WaveSnapshot | null }) {
  const regime = snapshot?.regime;
  const drivers = regime?.drivers ?? [];
  return (
    <section className="panel regime-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Regime / 5 Things</p>
          <h1>{text(regime?.label, 'NO VERIFIED REGIME')}</h1>
        </div>
        <div className="score-orb">
          <span>Score</span>
          <strong>{text(regime?.score, '--')}</strong>
        </div>
      </div>
      <div className="confidence-row">
        <span>Confidence</span>
        <strong>{typeof regime?.confidence === 'number' ? `${Math.round(regime.confidence * 100)}%` : 'UNVERIFIED'}</strong>
      </div>
      <div className="things-grid">
        {[0, 1, 2, 3, 4].map((index) => (
          <div className="thing-card" key={index}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <p>{drivers[index] ?? 'Awaiting verified backend driver.'}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BucketPortfolioPanel({ snapshot }: { snapshot: WaveSnapshot | null }) {
  const buckets = asEntries(snapshot?.buckets);
  const positions = snapshot?.portfolio?.positions ?? [];
  return (
    <section className="panel bucket-panel">
      <div className="panel-head compact">
        <div>
          <p className="eyebrow">Buckets / Portfolio</p>
          <h2>Capital map</h2>
        </div>
        <span className="lock-badge">Broker capability locked</span>
      </div>
      <div className="bucket-grid">
        {buckets.length === 0 ? (
          <div className="empty-card">No backend bucket state returned.</div>
        ) : (
          buckets.map(([name, bucket]) => (
            <article className="bucket-card" key={name}>
              <span>{name.toUpperCase()}</span>
              <strong>{text(bucket.status ?? bucket.permission ?? bucket.role ?? bucket.value)}</strong>
              <small>{text(bucket.role ?? bucket.description, 'Awaiting backend detail')}</small>
            </article>
          ))
        )}
      </div>
      <div className="position-list">
        <h3>Positions</h3>
        {positions.length === 0 ? (
          <div className="empty-card">No verified portfolio positions returned.</div>
        ) : (
          positions.map((position, index) => (
            <article className="position-card" key={`${text(position.ticker, 'position')}-${index}`}>
              <strong>{text(position.ticker, 'UNKNOWN')}</strong>
              <span>{text(position.bucket, 'NO BUCKET')}</span>
              <small>{text(position.status ?? position.source, 'UNVERIFIED')}</small>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function ActionsAuditPanel({ snapshot }: { snapshot: WaveSnapshot | null }) {
  const urgent = snapshot?.actions?.urgent ?? [];
  const active = snapshot?.actions?.active ?? [];
  const blocked = snapshot?.actions?.blocked ?? [];
  const completed = snapshot?.actions?.completed ?? [];
  const quarantine = snapshot?.quarantine;
  const audit = snapshot?.audit;

  async function sendIntent(kind: string) {
    try {
      await sendOperatorIntent({ kind, note: 'Cockpit operator intent captured. No direct capability execution.' });
    } catch {
      // The degraded panel and health strip already expose API status. Keep this button non-blocking.
    }
  }

  return (
    <section className="panel action-panel">
      <div className="panel-head compact">
        <div>
          <p className="eyebrow">Actions / Audit / Quarantine</p>
          <h2>Operator board</h2>
        </div>
        <span className="lock-badge">Direct execution locked</span>
      </div>
      <div className="action-columns">
        <ActionStack title="Urgent" items={urgent} />
        <ActionStack title="Active" items={active} />
        <ActionStack title="Blocked" items={blocked} />
        <ActionStack title="Completed" items={completed} />
      </div>
      <div className="audit-grid">
        <div className="audit-card">
          <span>Audit</span>
          <strong>{text(audit?.status, 'NO AUDIT STATUS')}</strong>
          <small>{text(audit?.recent?.length, '0')} recent entries</small>
        </div>
        <div className="audit-card warn">
          <span>Quarantine</span>
          <strong>{text(quarantine?.count, '0')}</strong>
          <small>{quarantine?.items?.length ? 'Inspect quarantined material before promotion.' : 'No quarantined items returned.'}</small>
        </div>
      </div>
      <div className="intent-row">
        <button type="button" onClick={() => void sendIntent('acknowledge_current_state')}>Acknowledge state</button>
        <button type="button" onClick={() => void sendIntent('request_backend_review')}>Request backend review</button>
      </div>
    </section>
  );
}

function ActionStack({ title, items }: { title: string; items: Array<Record<string, unknown>> }) {
  return (
    <div className="action-stack">
      <h3>{title}</h3>
      {items.length === 0 ? <p>No verified items.</p> : null}
      {items.slice(0, 4).map((item, index) => (
        <article className="action-card" key={`${title}-${index}`}>
          <strong>{text(item.label ?? item.title ?? item.id, 'UNLABELED')}</strong>
          <small>{text(item.type ?? item.status, 'backend state')}</small>
        </article>
      ))}
    </div>
  );
}

export default function App() {
  const { snapshot, heroGauges, health, loading, degraded, stale, error, refresh } = useWaveSnapshot();

  return (
    <main className="cockpit-shell">
      <SystemHealthStrip health={health} snapshot={snapshot} degraded={degraded} stale={stale} loading={loading} />
      {degraded ? <DegradedStatePanel error={error} stale={stale} onRefresh={refresh} /> : null}
      <HeroGaugesPanel state={heroGauges} loading={loading} />
      <section className="cockpit-grid">
        <RegimePanel snapshot={snapshot} />
        <BucketPortfolioPanel snapshot={snapshot} />
        <ActionsAuditPanel snapshot={snapshot} />
        <IntegrationGuide />
      </section>
    </main>
  );
}
