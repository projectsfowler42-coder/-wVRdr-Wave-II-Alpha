import type { DashboardSnapshot } from "../contracts/dashboardSnapshot";
import { mockDashboardSnapshot } from "../data/mockDashboardSnapshot";

export type DashboardSnapshotAdapter = {
  readonly name: string;
  loadSnapshot: () => DashboardSnapshot;
};

export const mockDashboardSnapshotAdapter: DashboardSnapshotAdapter = {
  name: "mock-dashboard-snapshot-adapter",
  loadSnapshot: () => mockDashboardSnapshot,
};

export function loadDashboardSnapshot(adapter: DashboardSnapshotAdapter = mockDashboardSnapshotAdapter): DashboardSnapshot {
  return adapter.loadSnapshot();
}
