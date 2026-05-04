import type { DashboardSnapshot, TruthClass } from "./dashboardSnapshot";

const truthClasses: readonly TruthClass[] = ["MOCK", "LIVE", "DEGRADED", "STALE", "FAILED"];

function isTruthClass(value: TruthClass): boolean {
  return truthClasses.includes(value);
}

function isPercent(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

export function guardDashboardSnapshot(snapshot: DashboardSnapshot): DashboardSnapshot {
  const issues: string[] = [];

  if (snapshot.surface !== "waverider-dashboard") issues.push("surface");
  if (!isTruthClass(snapshot.truthClass)) issues.push("truthClass");
  if (snapshot.executionEligible !== false) issues.push("executionEligible");
  if (snapshot.privateData !== false) issues.push("privateData");
  if (snapshot.brokerConnected !== false) issues.push("brokerConnected");
  if (snapshot.heroMetrics.length < 1) issues.push("heroMetrics");
  if (snapshot.miniMetrics.length < 1) issues.push("miniMetrics");

  for (const hero of snapshot.heroMetrics) {
    if (!isPercent(hero.mainValue)) issues.push(`${hero.id}.mainValue`);
    if (!isPercent(hero.secondaryValue)) issues.push(`${hero.id}.secondaryValue`);
    if (!hero.sourceId) issues.push(`${hero.id}.sourceId`);
    if (!hero.capturedAt) issues.push(`${hero.id}.capturedAt`);
  }

  if (issues.length > 0) {
    throw new Error(`Dashboard snapshot rejected by guard: ${issues.join(", ")}`);
  }

  return snapshot;
}
