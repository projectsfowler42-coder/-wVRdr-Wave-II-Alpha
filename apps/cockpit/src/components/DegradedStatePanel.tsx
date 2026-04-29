type Props = {
  error: string | null;
  stale: boolean;
  onRefresh: () => Promise<void>;
};

export function DegradedStatePanel({ error, stale, onRefresh }: Props) {
  return (
    <section className="panel degraded-panel" aria-live="polite">
      <div>
        <p className="eyebrow">Degraded state</p>
        <h2>Wave-I source is unavailable or not current.</h2>
        <p>
          The cockpit is not allowed to infer, invent, or silently substitute values. Backend state must return through the API before this surface can be treated as live.
        </p>
      </div>
      <div className="warning-stack">
        {error ? <span className="warning-token">API error: {error}</span> : null}
        {stale ? <span className="warning-token">Snapshot stale or missing timestamp</span> : null}
        <span className="warning-token">Mock fallback disabled</span>
        <span className="warning-token">Locked capabilities remain locked</span>
      </div>
      <button className="primary-button" type="button" onClick={() => void onRefresh()}>
        Recheck API
      </button>
    </section>
  );
}
