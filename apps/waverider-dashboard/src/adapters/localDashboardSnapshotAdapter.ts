import type { AdapterBoundary } from "../contracts/adapterReadiness";
import type { DashboardSnapshot } from "../contracts/dashboardSnapshot";
import { mockDashboardSnapshot } from "../data/mockDashboardSnapshot";

export const localDashboardSnapshotBoundary: AdapterBoundary = {
  adapterName: "local-dashboard-snapshot-adapter",
  readiness: "LOCAL_ONLY",
  canUsePrivateData: false,
  canUseBrokerConnection: false,
  canUseExecutionAuthority: false,
  notes: [
    "Local static snapshot adapter scaffold.",
    "Uses bundled mock fallback until a reviewed local source is wired.",
    "No private data, broker connection, or execution authority.",
  ],
};

export function loadLocalDashboardSnapshot(): DashboardSnapshot {
  return mockDashboardSnapshot;
}
