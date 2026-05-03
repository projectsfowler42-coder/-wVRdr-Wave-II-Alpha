import type { WaveSnapshot } from '../services/waveApi';

type MdkRoutingHubPageProps = {
  snapshot: WaveSnapshot | null;
};

type MdkNode = {
  title: string;
  role: string;
  status: string;
  boundary: string;
};

const MDK_NODES: MdkNode[] = [
  {
    title: 'Sentinel',
    role: 'Security and integrity gate.',
    status: 'Guarding ingress and local-proof checks.',
    boundary: 'Blocks suspect inputs before they contaminate truth state.',
  },
  {
    title: 'Scythe',
    role: 'Failure and lesson reaper.',
    status: 'Harvests outcomes through MDK only.',
    boundary: 'May create projection candidates; does not bypass vault routing.',
  },
  {
    title: 'Sarlaac Pit',
    role: 'Fort Knox truth vault.',
    status: 'Raw truth remains vault-bound.',
    boundary: 'No page may freely browse raw MSP memory.',
  },
  {
    title: 'Pressurization Chamber',
    role: 'Truth airlock.',
    status: 'Controls ingress and egress pressure.',
    boundary: 'Nothing enters or leaves the Pit without pressure review.',
  },
  {
    title: 'Anomaly Lab',
    role: 'Quarantined/broken packet analysis.',
    status: 'Separate from Algorilla Command.',
    boundary: 'Failed truth and hardened truth must not visually mix.',
  },
  {
    title: 'Data Hound',
    role: 'Telemetry routing and source sniffing.',
    status: 'Receives Cockpit Data Scrape intents.',
    boundary: 'Pull intent only; no external action output.',
  },
  {
    title: 'Algorilla Command',
    role: 'Hardened-tested truth display.',
    status: 'Certification surface only.',
    boundary: 'Holo-Deck can nominate. MDK certifies.',
  },
  {
    title: 'Audit Gates',
    role: 'Release and certification proof chain.',
    status: 'Seven-gate review path remains mandatory.',
    boundary: 'No bypass, no force-clear, no side doors.',
  },
];

function value(value: unknown, fallback = 'UNVERIFIED'): string {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function MdkRoutingHubPage({ snapshot }: MdkRoutingHubPageProps) {
  const bridge = snapshot?.system?.truth_spine ?? snapshot?.system?.health ?? snapshot?.system?.mode ?? 'unknown';
  const quarantineCount = snapshot?.quarantine?.count ?? 0;
  const auditStatus = snapshot?.audit?.status ?? 'unreported';

  return (
    <section className="panel mdk-hub-panel">
      <div className="panel-head compact">
        <div>
          <p className="eyebrow">MDK Routing Hub</p>
          <h2>Exchange / Guard / Pressure Controller</h2>
        </div>
        <span className="lock-badge">no side doors</span>
      </div>

      <div className="mdk-status-grid">
        <article className="mdk-status-card">
          <span>Bridge</span>
          <strong>{value(bridge)}</strong>
          <small>All page movement asks MDK first.</small>
        </article>
        <article className="mdk-status-card warn">
          <span>Quarantine</span>
          <strong>{value(quarantineCount, '0')}</strong>
          <small>Suspect truth routes to Anomaly Lab, not Algorilla.</small>
        </article>
        <article className="mdk-status-card">
          <span>Audit</span>
          <strong>{value(auditStatus)}</strong>
          <small>Certification requires gate evidence.</small>
        </article>
      </div>

      <div className="mdk-flow-strip" aria-label="MDK truth flow">
        <span>Ingress</span>
        <strong>Pressurization Chamber</strong>
        <span>MDK Review</span>
        <strong>Sarlaac / Projection / Quarantine</strong>
        <span>Egress Review</span>
      </div>

      <div className="mdk-node-grid">
        {MDK_NODES.map((node) => (
          <article className="mdk-node-card" key={node.title}>
            <span>{node.title}</span>
            <strong>{node.role}</strong>
            <p>{node.status}</p>
            <small>{node.boundary}</small>
          </article>
        ))}
      </div>

      <p className="doctrine">
        MDK validates, routes, stores, guards, and certifies truth. Cockpit, FTySK, Holo-Deck, Scythe, Sarlaac, and Algorilla all move through MDK. No section talks directly to Sarlaac. No truth leaves the Pit without MDK egress review.
      </p>
    </section>
  );
}
