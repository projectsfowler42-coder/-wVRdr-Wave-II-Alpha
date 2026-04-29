/**
 * Shared TypeScript contract types for the ~wVRdr~ Wave-II~Alpha truth bridge.
 * Mirrors AlphaTruthResponse in packages/mdk/cmd/truth-bridge/main.go.
 */

export type AlphaTruthClass =
  | "RAW_MARKET"
  | "RAW_USER"
  | "RAW_OFFICIAL"
  | "TRANSFORMED"
  | "STALE"
  | "STALE_RESCUE"
  | "DEGRADED"
  | "UNRESOLVED"
  | "FAILED"
  | "QUARANTINED";

export type AlphaStatus = "LIVE" | "DEGRADED" | "STALE" | "UNRESOLVED" | "FAILED";

export interface AlphaWeakness {
  readonly reason: string;
  readonly detail?: string;
}

export interface AlphaTruthEnvelope {
  readonly schema: "wvrdr.alpha.truth.v1";
  readonly fetchedAt: string;
  readonly source: string;
  readonly status: AlphaStatus;
  readonly truthClass: AlphaTruthClass;
  readonly executionEligible: boolean;
  readonly weaknesses: AlphaWeakness[];
  readonly data: Record<string, unknown>;
}

export function isAlphaTruthEnvelope(value: unknown): value is AlphaTruthEnvelope {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;

  return (
    obj["schema"] === "wvrdr.alpha.truth.v1" &&
    typeof obj["fetchedAt"] === "string" &&
    typeof obj["source"] === "string" &&
    typeof obj["status"] === "string" &&
    typeof obj["truthClass"] === "string" &&
    typeof obj["executionEligible"] === "boolean" &&
    Array.isArray(obj["weaknesses"]) &&
    typeof obj["data"] === "object" &&
    obj["data"] !== null
  );
}
