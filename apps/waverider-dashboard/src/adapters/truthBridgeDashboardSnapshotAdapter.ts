import type { AdapterBoundary } from "../contracts/adapterReadiness";
import type { DashboardSnapshot } from "../contracts/dashboardSnapshot";
import { mockDashboardSnapshot } from "../data/mockDashboardSnapshot";

export const truthBridgeDashboardSnapshotBoundary: AdapterBoundary = {
  adapterName: "truth-bridge-dashboard-snapshot-adapter",
  readiness: "DEGRADED",
  canUsePrivateData: false,
  canUseBrokerConnection: false,
  canUseExecutionAuthority: false,
  notes: [
    "Truth Bridge adapter scaffold only.",
    "No network fetch is performed by this prototype scaffold.",
    "Must remain non-private and non-execution until MDK certification.",
  ],
};

export function loadTruthBridgeDashboardSnapshot(): DashboardSnapshot {
  return {
    ...mockDashboardSnapshot,
    truthClass: "DEGRADED",
    sourceId: "truth-bridge-scaffold:waverider-dashboard",
    confidence: 0,
  };
}
