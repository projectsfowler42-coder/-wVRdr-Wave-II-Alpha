import type { WaveSnapshot } from '../services/waveApi';

type FtyskContextPageProps = {
  snapshot: WaveSnapshot | null;
};

type ContextCard = {
  title: string;
  role: string;
  signal: string;
};

const CONTEXT_CARDS: ContextCard[] = [
  {
    title: 'Regime Pressure',
    role: 'Frames current market pressure before Cockpit action.',
    signal: 'Uses verified regime drivers only.',
  },
  {
    title: 'News Pressure',
    role: 'Filters relevant outside noise into operator context.',
    signal: 'Projection layer, not raw Sarlaac browsing.',
  },
  {
    title: 'Event Pressure',
    role: 'Surfaces calendar, rate, liquidity, and shock timing.',
    signal: 'Pre-touch warning before Holo-Deck testing.',
  },
  {
    title: 'Historical Analogs',
    role: 'Shows similar prior conditions without leaking answer keys.',
    signal: 'Scythe-filtered and MDK-routed projections only.',
  },
];

function text(value: unknown, fallback = 'UNVERIFIED'): string {
  if (value === null || value === undefined || value === '') return fallback;
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function FtyskContextPage({ snapshot }: FtyskContextPageProps) {
  const drivers = snapshot?.regime?.drivers ?? [];
  const warnings = [
    ...(snapshot?.system?.warnings ?? []),
    ...(snapshot?.portfolio?.warnings ?? []),
  ];
  const auditStatus = snapshot?.audit?.status ?? 'unreported';
  const truthSpine = snapshot?.system?.truth_spine ?? snapshot?.system?.health ?? 'unknown';

  return (
    <section className="panel ftysk-context-panel">
      <div className="panel-head compact">
        <div>
          <p className="eyebrow">FTySK</p>
          <h2>Five Things You Should Know</h2>
        </div>
        <span className="lock-badge">filtered context only</span>
      </div>

      <div className="ftysk-hero-grid">
        <article className="ftysk-hero-card">
          <span>Truth Spine</span>
          <strong>{text(truthSpine)}</strong>
          <small>FTySK explains what matters now. It does not certify or execute.</small>
        </article>
        <article className="ftysk-hero-card">
          <span>Regime</span>
          <strong>{text(snapshot?.regime?.label, 'NO VERIFIED REGIME')}</strong>
          <small>Score: {text(snapshot?.regime?.score, '--')} · Confidence: {typeof snapshot?.regime?.confidence === 'number' ? `${Math.round(snapshot.regime.confidence * 100)}%` : 'UNVERIFIED'}</small>
        </article>
        <article className="ftysk-hero-card warn">
          <span>Warnings</span>
          <strong>{warnings.length}</strong>
          <small>{warnings.length ? warnings[0] : 'No warnings returned by backend.'}</small>
        </article>
        <article className="ftysk-hero-card">
          <span>Audit</span>
          <strong>{text(auditStatus)}</strong>
          <small>Context output remains MDK-routed and audit-visible.</small>
        </article>
      </div>

      <div className="five-things-grid">
        {[0, 1, 2, 3, 4].map((index) => (
          <article className="five-thing-card" key={index}>
            <span>{`Thing ${index + 1}`}</span>
            <strong>{drivers[index] ?? 'Awaiting verified context driver.'}</strong>
            <small>{index === 0 ? 'Primary driver' : 'Context driver'}</small>
          </article>
        ))}
      </div>

      <div className="context-card-grid">
        {CONTEXT_CARDS.map((card) => (
          <article className="context-card" key={card.title}>
            <span>{card.title}</span>
            <strong>{card.role}</strong>
            <p>{card.signal}</p>
          </article>
        ))}
      </div>

      <p className="doctrine">
        FTySK answers what changed, why it matters, what regime pressure exists, what event pressure exists, what rule pressure exists, and what the operator should know before touching Cockpit or Holo-Deck. It is not a generic news page and it is never called Field.
      </p>
    </section>
  );
}
