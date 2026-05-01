import type { EngineFinding, TruthEnvelope } from "./truth";
import type { PromotionDecision } from "./promotionGate";

export type MdkRole = "SENTINEL" | "JUDGE" | "ARCHIVIST";
export type MdkVerdict = "PASS" | "WATCH" | "BLOCK" | "BREACH";

export interface MdkInspectionInput {
  artifactId: string;
  artifactType:
    | "TRUTH_ENVELOPE"
    | "PROMOTION_DECISION"
    | "CIRCUIT_BREAKER_DECISION"
    | "SURVIVORSHIP_PROFILE"
    | "R3_MODULE";
  truth?: TruthEnvelope<unknown>;
  promotion?: PromotionDecision;
  findings?: EngineFinding[];
  notes?: string[];
}

export interface MdkInspectionRecord {
  artifactId: string;
  inspectedAt: string;
  roles: MdkRole[];
  verdict: MdkVerdict;
  findings: EngineFinding[];
  archiveNotes: string[];
}

function nowIso(): string {
  return new Date().toISOString();
}

function worstVerdict(findings: EngineFinding[]): MdkVerdict {
  if (findings.some((finding) => finding.severity === "BREACH")) return "BREACH";
  if (findings.some((finding) => finding.severity === "BLOCKED")) return "BLOCK";
  if (findings.some((finding) => finding.severity === "WATCH")) return "WATCH";
  return "PASS";
}

export function inspectWithMdk(input: MdkInspectionInput): MdkInspectionRecord {
  const findings: EngineFinding[] = [...(input.findings ?? [])];
  const archiveNotes: string[] = [...(input.notes ?? [])];

  if (input.truth) {
    if (input.truth.truthClass === "SIMULATED" || input.truth.truthClass === "QUARANTINED") {
      findings.push({
        severity: "WATCH",
        code: "MDK_SIMULATED_OR_QUARANTINED",
        message: "MDK Sentinel marks this as non-runtime truth until promoted.",
      });
    }

    if (input.truth.scope === "WAVE_I_RUNTIME" && input.truth.truthClass !== "EDGE_CONFIRMED") {
      findings.push({
        severity: "BREACH",
        code: "MDK_RUNTIME_SCOPE_WITHOUT_CONFIRMED_EDGE",
        message: "Runtime scope is forbidden without confirmed edge truth.",
      });
    }
  }

  if (input.promotion) {
    if (input.promotion.label === "BLOCKED") {
      findings.push({
        severity: "BLOCKED",
        code: "MDK_PROMOTION_BLOCKED",
        message: "MDK Judge confirms promotion is blocked.",
      });
    }

    if (input.promotion.label === "NOT_UNCERTAIN_CANDIDATE") {
      archiveNotes.push(
        "MDK Archivist: Not-Uncertain candidate remains a validation label, not certainty.",
      );
    }
  }

  if (findings.length === 0) {
    archiveNotes.push("MDK Archivist: no findings recorded for this artifact.");
  }

  return {
    artifactId: input.artifactId,
    inspectedAt: nowIso(),
    roles: ["SENTINEL", "JUDGE", "ARCHIVIST"],
    verdict: worstVerdict(findings),
    findings,
    archiveNotes,
  };
}

export function mdkBlocksPromotion(record: MdkInspectionRecord): boolean {
  return record.verdict === "BLOCK" || record.verdict === "BREACH";
}
