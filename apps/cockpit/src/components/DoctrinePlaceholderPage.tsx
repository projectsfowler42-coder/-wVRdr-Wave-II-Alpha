import type { PageKey } from './PageShell';

type DoctrinePlaceholderPageProps = {
  page: PageKey;
};

const PAGE_COPY: Record<PageKey, { title: string; purpose: string; owns: string[]; boundary: string }> = {
  cockpit: {
    title: 'Cockpit',
    purpose: 'Live truth surface. Current verified state only.',
    owns: ['Live State', 'Account Health', 'WAL Log', 'Data Scrape', 'Truth Spine', '7-Tile Intent Surface'],
    boundary: 'Cockpit shows truth. It does not certify logic, promote plays, bypass MDK, or force-clear stale truth.',
  },
  mdk: {
    title: 'MDK',
    purpose: 'Exchange, guard, pressure controller, validation authority, routing hub, audit system, and certification layer.',
    owns: ['Sentinel', 'Scythe', 'Sarlaac Pit', 'Pressurization Chamber', 'Anomaly Lab', 'Data Hound', 'Algorilla Command', 'Audit Gates'],
    boundary: 'Every cross-system movement goes through MDK. No side doors.',
  },
  ftysk: {
    title: 'FTySK',
    purpose: 'Five Things You Should Know. Filtered context, not a generic field/news page.',
    owns: ['Five Things', 'Regime Pressure', 'News Pressure', 'Event Pressure', 'Historical Analogs'],
    boundary: 'FTySK explains what matters before touching Cockpit or Holo-Deck.',
  },
  holoDeck: {
    title: 'Holo-Deck',
    purpose: 'Shielded testing chamber. Rulebook-as-physics. Answers sealed until scoring.',
    owns: ['W³ Judgment', 'Guess Builder', 'Scenario Packet', 'Rulebook & Constraints', 'Run Results', 'Death-Zone Monitor', 'Promotion Tracker'],
    boundary: 'Holo-Deck tests. MDK certifies. Holo-Deck may receive projections but may not freely read raw Sarlaac/MSP.',
  },
  settings: {
    title: 'Settings',
    purpose: 'Sovereignty, config, display, and audit gates.',
    owns: ['System', 'Sovereignty', 'Display', 'Audit', 'Room Mode', 'Vault Access Policies', 'Projection Rules', 'Local-only Enforcement'],
    boundary: 'Settings protects sovereignty and controls audit/room-mode configuration.',
  },
};

export function DoctrinePlaceholderPage({ page }: DoctrinePlaceholderPageProps) {
  const copy = PAGE_COPY[page];

  return (
    <section className="panel doctrine-page-panel">
      <div className="panel-head compact">
        <div>
          <p className="eyebrow">Wave-II Alpha Page Doctrine</p>
          <h2>{copy.title}</h2>
        </div>
        <span className="lock-badge">doctrine locked</span>
      </div>
      <p className="doctrine-page-purpose">{copy.purpose}</p>
      <div className="doctrine-card-grid">
        {copy.owns.map((item) => (
          <article className="doctrine-card" key={item}>
            <strong>{item}</strong>
            <small>MDK-routed / audit-aware</small>
          </article>
        ))}
      </div>
      <p className="doctrine">{copy.boundary}</p>
    </section>
  );
}
