import type { AdapterBoundary } from "../contracts/adapterReadiness";
import { mockAdapterBoundary } from "../contracts/adapterReadiness";
import type { DashboardSnapshot } from "../contracts/dashboardSnapshot";
import { guardDashboardSnapshot } from "../contracts/snapshotGuard";
import { mockDashboardSnapshot } from "../data/mockDashboardSnapshot";

export type DashboardSnapshotAdapter = {
  readonly name: string;
  readonly boundary: AdapterBoundary;
  loadSnapshot: () => DashboardSnapshot;
};

export const mockDashboardSnapshotAdapter: DashboardSnapshotAdapter = {
  name: "mock-dashboard-snapshot-adapter",
  boundary: mockAdapterBoundary,
  loadSnapshot: () => mockDashboardSnapshot,
};

function guardAdapterBoundary(adapter: DashboardSnapshotAdapter): void {
  if (adapter.boundary.canUsePrivateData !== false) throw new Error(`${adapter.name}: private data access denied`);
  if (adapter.boundary.canUseBrokerConnection !== false) throw new Error(`${adapter.name}: broker connection denied`);
  if (adapter.boundary.canUseExecutionAuthority !== false) throw new Error(`${adapter.name}: execution authority denied`);
}

export function loadDashboardSnapshot(adapter: DashboardSnapshotAdapter = mockDashboardSnapshotAdapter): DashboardSnapshot {
  guardAdapterBoundary(adapter);
  return guardDashboardSnapshot(adapter.loadSnapshot());
}
