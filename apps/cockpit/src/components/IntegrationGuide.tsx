export function IntegrationGuide() {
  return (
    <section className="panel integration-guide">
      <p className="eyebrow">Repo integration</p>
      <h2>Base44 scaffold retired. Real cockpit mounted in ~Alpha.</h2>
      <ol>
        <li>Run this frontend from <code>/apps/cockpit</code>.</li>
        <li>Set <code>VITE_API_BASE_URL</code>.</li>
        <li>Optionally set <code>VITE_PUBLIC_READ_TOKEN</code>.</li>
        <li>Start the Wave-I / MDK adapter service.</li>
        <li>Verify <code>GET /api/health</code>.</li>
        <li>Verify <code>GET /api/snapshot</code>.</li>
        <li>Confirm this cockpit renders backend state.</li>
        <li>Keep unavailable capabilities visibly locked until read-only state is stable.</li>
      </ol>
      <p className="doctrine">
        Market truth → regime state → opportunity classification → wallet permission → position sizing → execution/non-execution → audit trail → learning loop.
      </p>
    </section>
  );
}
