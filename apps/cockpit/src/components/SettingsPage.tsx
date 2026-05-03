import type { HealthResponse, WaveSnapshot } from '../services/waveApi';

type SettingsPageProps = {
  snapshot: WaveSnapshot | null;
  health: HealthResponse | null;
  degraded: boolean;
  stale: boolean;
};

type SettingsCard = {
  title: string;
  role: string;
  posture: string;
};

const SETTINGS_CARDS: SettingsCard[] = [
  {
    title: 'System Mode',
    role: 'Controls how the cockpit reads current truth posture.',
    posture: 'Display only until MDK certifies a higher capability state.',
  },
  {
    title: 'Sovereignty',
    role: 'Protects operator authority, local-only expectations, and human final decision control.',
    posture: 'No automated external action from Settings.',
  },
  {
    title: 'Device Proof',
    role: 'Shows whether optional local proof posture is configured by the bridge.',
    posture: 'Visibility only; no secrets are stored in the UI.',
  },
  {
    title: 'Audit Gates',
    role: 'Frames release, replay, and certification evidence requirements.',
    posture: 'No force-clear and no bypass state.',
  },
  {
    title: 'Room Mode',
    role: 'Future home for Padded Room, Holo-Deck, and projection access posture.',
    posture: 'Configuration surface only until backend contracts exist.',
  },
  {
    title: 'Projection Rules',
    role: 'Defines what may leave Mouseion, Sarlaac, and MDK as a projection.',
    posture: 'Raw originals and private rows remain protected.',
  },
  {
    title: 'Operator Intent',
    role: 'Keeps user choices explicit and auditable.',
    posture: 'Intent logging is not execution authority.',
  },
  {
    title: 'Closure Gate',
    role: 'Prepares Wave-II Alpha for closure before Bravo assembly begins.',
    posture: 'Only checked, documented, doctrine-safe surfaces may close Alpha.',
  },
];

function text(value: unknown, fallback = 'UNVERIFIED'): string {
  if (value === null || value === undefined || value === '') return fallback;
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function SettingsPage({ snapshot, health, degraded, stale }: SettingsPageProps) {
  const mode = snapshot?.system?.mode ?? health?.mode ?? (degraded ? 'DEGRADED' : 'READ_ONLY');
  const truthSpine = snapshot?.system?.truth_spine ?? health?.truth_spine ?? snapshot?.system?.health ?? 'UNKNOWN';
  const deviceProofMode = health?.deviceProof?.mode ?? 'not reported';
  const deviceProofConfigured = health?.deviceProof?.configured === true ? 'configured' : 'not configured';
  const auditStatus = snapshot?.audit?.status ?? 'unreported';

  return (
    <section className="panel ftysk-context-panel">
      <div className="panel-head compact">
        <div>
          <p className="eyebrow">Settings</p>
          <h2>Sovereignty / Config / Audit Gates</h2>
        </div>
        <span className="lock-badge">configuration only</span>
      </div>

      <div className="ftysk-hero-grid">
        <article className="ftysk-hero-card">
          <span>Mode</span>
          <strong>{text(mode)}</strong>
          <small>Settings may display posture but cannot promote capability.</small>
        </article>
        <article className="ftysk-hero-card">
          <span>Truth Spine</span>
          <strong>{text(truthSpine)}</strong>
          <small>MDK remains the authority for verified truth state.</small>
        </article>
        <article className={stale || degraded ? 'ftysk-hero-card warn' : 'ftysk-hero-card'}>
          <span>Freshness</span>
          <strong>{stale ? 'STALE' : 'CURRENT'}</strong>
          <small>{degraded ? 'Degraded truth is not actionable.' : 'Current truth is still read-only unless certified.'}</small>
        </article>
        <article className="ftysk-hero-card">
          <span>Device Proof</span>
          <strong>{text(deviceProofMode)}</strong>
          <small>{deviceProofConfigured}</small>
        </article>
      </div>

      <div className="context-card-grid">
        {SETTINGS_CARDS.map((card) => (
          <article className="context-card" key={card.title}>
            <span>{card.title}</span>
            <strong>{card.role}</strong>
            <p>{card.posture}</p>
          </article>
        ))}
      </div>

      <div className="mdk-flow-strip" aria-label="Settings closure flow">
        <span>Local Proof</span>
        <strong>Audit Gates</strong>
        <span>Projection Policy</span>
        <strong>Human Authority</strong>
        <span>Closure Review</span>
      </div>

      <p className="doctrine">
        Settings protects sovereignty, config, display posture, local-only expectations, and audit gates. It may expose room mode and projection policy, but it does not execute, certify Algorilla readiness, store credentials, override MDK, or turn degraded truth into action. Current audit status: {text(auditStatus)}.
      </p>
    </section>
  );
}
