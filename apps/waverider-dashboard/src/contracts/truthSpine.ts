export const SURFACE_IDS = ["waverider-dashboard"] as const;
export type SurfaceId = (typeof SURFACE_IDS)[number];

export const RELEASE_STATES = ["VISUAL_PROTOTYPE", "DEVELOPMENT", "CERTIFIED"] as const;
export type ReleaseState = (typeof RELEASE_STATES)[number];

export const TRUTH_CLASSES = [
  "MOCK",
  "LOCAL_ONLY",
  "RAW_SOURCE",
  "NORMALIZED_SOURCE",
  "SIMULATED",
  "DEGRADED",
  "STALE",
  "FAILED",
  "QUARANTINED",
  "WATCH",
  "EDGE_CANDIDATE",
  "EDGE_CONFIRMED",
  "CERTIFIED",
  "LIVE",
] as const;
export type TruthClass = (typeof TRUTH_CLASSES)[number];

export const DASHBOARD_RENDERABLE_TRUTH_CLASSES = ["MOCK", "LOCAL_ONLY", "DEGRADED", "STALE", "FAILED", "CERTIFIED", "LIVE"] as const;
export type DashboardRenderableTruthClass = (typeof DASHBOARD_RENDERABLE_TRUTH_CLASSES)[number];

export const UI_AUTHORITY_CLASSES = [
  "DISPLAY_ONLY",
  "DRILLDOWN_ONLY",
  "REVIEW_ONLY",
  "SIM_ONLY",
  "MANUAL_BRIDGE",
  "READ_ONLY_REFRESH",
  "EXECUTION_DISABLED",
  "EXECUTION_ELIGIBLE",
] as const;
export type UiAuthorityClass = (typeof UI_AUTHORITY_CLASSES)[number];

export type MetricEvidence = {
  truthClass: TruthClass;
  sourceId: string;
  capturedAt: string;
  confidence: number;
};

export function isTruthClass(value: unknown): value is TruthClass {
  return typeof value === "string" && TRUTH_CLASSES.includes(value as TruthClass);
}

export function isDashboardRenderableTruthClass(value: unknown): value is DashboardRenderableTruthClass {
  return typeof value === "string" && DASHBOARD_RENDERABLE_TRUTH_CLASSES.includes(value as DashboardRenderableTruthClass);
}

export function isReleaseState(value: unknown): value is ReleaseState {
  return typeof value === "string" && RELEASE_STATES.includes(value as ReleaseState);
}

export function isConfidence(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

export function hasEvidence(value: MetricEvidence): boolean {
  return Boolean(value.sourceId && value.capturedAt && isConfidence(value.confidence) && isTruthClass(value.truthClass));
}
