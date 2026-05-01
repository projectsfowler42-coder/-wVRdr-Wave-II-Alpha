export type TruthClass =
  | "RAW_SOURCE"
  | "NORMALIZED_SOURCE"
  | "TRANSFORMED"
  | "SIMULATED"
  | "QUARANTINED"
  | "WATCH"
  | "EDGE_CANDIDATE"
  | "EDGE_CONFIRMED"
  | "NOT_UNCERTAIN_CANDIDATE"
  | "FAILED";

export type EngineScope = "WAVE_II_ALPHA" | "WAVE_I_RUNTIME";

export type FindingSeverity = "INFO" | "WATCH" | "BLOCKED" | "BREACH";

export interface TruthEnvelope<T> {
  value: T;
  truthClass: TruthClass;
  scope: EngineScope;
  sourceId: string;
  observedAt: string;
  stale: boolean;
  degraded: boolean;
  conflicted: boolean;
  notes: string[];
}

export interface EngineFinding {
  severity: FindingSeverity;
  code: string;
  message: string;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function waveIIEnvelope<T>(args: {
  value: T;
  truthClass: TruthClass;
  sourceId: string;
  notes?: string[];
  degraded?: boolean;
  conflicted?: boolean;
  stale?: boolean;
}): TruthEnvelope<T> {
  return {
    value: args.value,
    truthClass: args.truthClass,
    scope: "WAVE_II_ALPHA",
    sourceId: args.sourceId,
    observedAt: nowIso(),
    stale: args.stale ?? false,
    degraded: args.degraded ?? false,
    conflicted: args.conflicted ?? false,
    notes: args.notes ?? [],
  };
}

export function cannotDriveRuntime(envelope: TruthEnvelope<unknown>): boolean {
  if (envelope.scope !== "WAVE_I_RUNTIME") return true;
  if (envelope.stale || envelope.degraded || envelope.conflicted) return true;
  return ["SIMULATED", "QUARANTINED", "WATCH", "EDGE_CANDIDATE", "FAILED"].includes(
    envelope.truthClass,
  );
}

export function runtimeBlocker(envelope: TruthEnvelope<unknown>): EngineFinding | null {
  if (!cannotDriveRuntime(envelope)) return null;
  return {
    severity: "BLOCKED",
    code: "NOT_RUNTIME_AUTHORIZED",
    message: "This output cannot drive runtime action or broker execution.",
  };
}
