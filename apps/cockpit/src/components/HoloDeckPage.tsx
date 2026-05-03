import type { WaveSnapshot } from '../services/waveApi';

type HoloDeckPageProps = {
  snapshot: WaveSnapshot | null;
};

type DeckCard = {
  title: string;
  status: string;
  role: string;
  boundary: string;
};

const DECK_CARDS: DeckCard[] = [
  {
    title: 'Scenario Packet',
    status: 'Awaiting sealed packet',
    role: 'Holds the market state, rulebook context, and candidate play being tested.',
    boundary: 'Packets are projections only until MDK verifies the source chain.',
  },
  {
    title: 'Rulebook-as-Physics',
    status: 'Constraint-first',
    role: 'Treats prop rules as the operating environment, not as reference notes.',
    boundary: 'Profit does not matter if the path breaches daily, max, or trailing loss geometry.',
  },
  {
    title: 'Blind Answer Seal',
    status: 'Sealed by default',
    role: 'Prevents answer-key leakage before the scoring pass is complete.',
    boundary: 'The guesser cannot see outcomes during a sealed run.',
  },
  {
    title: 'Run State',
    status: 'Read-only surface',
    role: 'Shows run posture without starting real execution or external brokerage actions.',
    boundary: 'This page tests judgment. It does not trade.',
  },
  {
    title: 'Death-Zone Monitor',
    status: 'Rule pressure visible',
    role: 'Frames distance to account-killing rule zones before permission is considered.',
    boundary: 'Crossing a rule death zone is Loss even when gross P&L looks good.',
  },
  {
    title: 'Failure Projection',
    status: 'Scythe-routed',
    role: 'Compares the candidate against known failure modes and graveyard signatures.',
    boundary: 'No raw Sarlaac browsing from the UI.',
  },
  {
    title: 'Promotion Tracker',
    status: 'MDK certification required',
    role: 'Shows nomination posture only: Reject, Quarantine, Allowed Small, or Candidate.',
    boundary: 'Holo-Deck nominates. MDK certifies. Algorilla promotion remains locked.',
  },
  {
    title: 'Ipcha Mistabra Trial',
    status: 'Contrary case required',
    role: 'Forces each candidate to survive both supporting evidence and hostile inversion.',
    boundary: 'If the surviving decision is do not trade, that is a correct output.',
  },
];

function text(value: unknown, fallback = 'UNVERIFIED'): string {
  if (value === null || value === undefined || value === '') return fallback;
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function HoloDeckPage({ snapshot }: HoloDeckPageProps) {
  const regime = snapshot?.regime?.label ?? 'NO VERIFIED REGIME';
  const truthSpine = snapshot?.system?.truth_spine ?? snapshot?.system?.health ?? 'UNKNOWN';
  const auditStatus = snapshot?.audit?.status ?? 'unreported';
  const quarantineCount = snapshot?.quarantine?.count ?? 0;

  return (
    <section className="panel holo-deck-panel">
      <div className="panel-head compact">
        <div>
          <p className="eyebrow">Holo-Deck</p>
          <h2>Shielded Constraint Test Surface</h2>
        </div>
        <span className="lock-badge">sealed tests only</span>
      </div>

      <div className="holo-hero-grid">
        <article className="holo-hero-card">
          <span>Truth Spine</span>
          <strong>{text(truthSpine)}</strong>
          <small>Only MDK-routed projections may enter this surface.</small>
        </article>
        <article className="holo-hero-card">
          <span>Regime</span>
          <strong>{text(regime)}</strong>
          <small>Scenario tests inherit current verified regime context when available.</small>
        </article>
        <article className="holo-hero-card warn">
          <span>Quarantine</span>
          <strong>{text(quarantineCount, '0')}</strong>
          <small>Quarantined material may inform failure review, not action permission.</small>
        </article>
        <article className="holo-hero-card">
          <span>Audit</span>
          <strong>{text(auditStatus)}</strong>
          <small>Replay, reproducibility, and reversibility remain required.</small>
        </article>
      </div>

      <div className="holo-flow-strip" aria-label="Holo-Deck sealed run flow">
        <span>Packet</span>
        <strong>Seal</strong>
        <span>Run</span>
        <strong>Score</strong>
        <span>Scythe</span>
        <strong>MDK Review</strong>
      </div>

      <div className="holo-card-grid">
        {DECK_CARDS.map((card) => (
          <article className="holo-card" key={card.title}>
            <span>{card.title}</span>
            <strong>{card.status}</strong>
            <p>{card.role}</p>
            <small>{card.boundary}</small>
          </article>
        ))}
      </div>

      <div className="holo-trial-grid">
        <article className="holo-trial-card light">
          <span>Trial of Light</span>
          <strong>What supports the claim?</strong>
          <p>Corroboration, repeatability, rule allowance, clean source chain, and regime fit.</p>
        </article>
        <article className="holo-trial-card dark">
          <span>Trial of Darkness</span>
          <strong>What kills or inverts the claim?</strong>
          <p>Contradiction, graveyard cohort, stale source, hidden future leakage, rule death, and failed replay.</p>
        </article>
      </div>

      <p className="doctrine">
        Holo-Deck tests judgment under constraints. It does not freely read raw Sarlaac memory, does not execute, does not certify Algorilla readiness, and does not promote contaminated runs. If the only surviving path is wait, reject, or do not trade, that is the correct output.
      </p>
    </section>
  );
}
