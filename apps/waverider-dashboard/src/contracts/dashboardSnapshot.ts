export type TruthClass = "MOCK" | "LIVE" | "DEGRADED" | "STALE" | "FAILED";
export type MetricIconName = "activity" | "alert" | "bitcoin" | "gauge" | "hexagon" | "trend";

export type MetricEvidence = {
  truthClass: TruthClass;
  sourceId: string;
  capturedAt: string;
  confidence: number;
};

export type HeroMetric = MetricEvidence & {
  id: string;
  title: string;
  mainValue: number;
  mainKicker: string;
  mainLabel: string;
  secondaryValue: number;
  secondaryLabel: string;
  outer: string;
  inner: string;
  caution?: boolean;
};

export type MiniMetric = MetricEvidence & {
  id: string;
  label: string;
  value: string;
  icon: MetricIconName;
  color: string;
};

export type DeltaRow = {
  rank: number;
  label: string;
  color: string;
};

export type GateStep = {
  title: string;
  desc: string;
  color: string;
  icon: "scan" | "filter" | "validate" | "execute";
};

export type DashboardSnapshot = MetricEvidence & {
  surface: "waverider-dashboard";
  releaseState: "VISUAL_PROTOTYPE" | "DEVELOPMENT" | "CERTIFIED";
  executionEligible: false;
  privateData: false;
  brokerConnected: false;
  heroMetrics: HeroMetric[];
  miniMetrics: MiniMetric[];
  deltaRows: DeltaRow[];
  gateSteps: GateStep[];
};
