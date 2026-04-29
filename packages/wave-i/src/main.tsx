import React from "react";
import { createRoot } from "react-dom/client";
import { fetchAlphaTruth, isAlphaBridgeEnabled, mapAlphaToWaveITruthClass } from "./lib/alpha-bridge";
import type { AlphaTruthEnvelope } from "./lib/alpha-types";
import { TelemetricTile, type TelemetricTileData } from "./components/hud/TelemetricTile";

function envelopeToTile(envelope: AlphaTruthEnvelope): TelemetricTileData {
  const mapped = mapAlphaToWaveITruthClass(
    envelope.truthClass,
    envelope.status,
    envelope.source,
    envelope.executionEligible,
  );

  return {
    value: envelope.executionEligible ? 1 : 0,
    sourceId: `ALPHA_${envelope.source}`,
    timestamp: new Date(envelope.fetchedAt).getTime(),
    truthClass: mapped,
    movementPercent: envelope.status,
    isPositive: envelope.executionEligible,
    staleRescue: envelope.truthClass === "STALE_RESCUE" || envelope.status === "STALE",
  };
}

function AlphaIntegritySurface() {
  const [envelope, setEnvelope] = React.useState<AlphaTruthEnvelope | null>(null);

  React.useEffect(() => {
    let mounted = true;
    void fetchAlphaTruth().then((truth) => {
      if (mounted) setEnvelope(truth);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!envelope) {
    return <main style={{ padding: 24 }}>Loading Alpha truth envelope…</main>;
  }

  const tile = envelopeToTile(envelope);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", background: "#0d1117", color: "#f8fafc", minHeight: "100vh" }}>
      <h1>~wVRdr~ Wave-II~Alpha</h1>
      <p>Alpha bridge enabled: {isAlphaBridgeEnabled() ? "yes" : "no"}</p>
      <p>Schema: {envelope.schema}</p>
      <p>Execution eligible: {envelope.executionEligible ? "true" : "false"}</p>
      <div style={{ maxWidth: 360, marginTop: 24 }}>
        <TelemetricTile label="ALPHA TRUTH" data={tile} />
      </div>
      <pre style={{ marginTop: 24, padding: 16, overflow: "auto", background: "rgba(255,255,255,0.08)", borderRadius: 16 }}>
        {JSON.stringify(envelope, null, 2)}
      </pre>
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("root element missing");

createRoot(root).render(
  <React.StrictMode>
    <AlphaIntegritySurface />
  </React.StrictMode>,
);
