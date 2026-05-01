import type { EngineFinding, TruthEnvelope } from "./truth.js";
import type { SurvivorshipProfile } from "./survivorshipInversion.js";
import { blocksEdgeConfirmation } from "./survivorshipInversion.js";

export interface PromotionInput {
  candidateId: string;
  trainEpisodes: number;
  testEpisodes: number;
  precisionPct: number;
  recallPct: number;
  falsePositiveCount: number;
  truePositiveCount: number;
  hasWalkForwardEvidence: boolean;
  hasElectronicEraValidation: boolean;
  survivorshipProfile?: SurvivorshipProfile;
  source: TruthEnvelope<unknown>;
}

export type PromotionLabel = "BLOCKED" | "WATCH" | "EDGE_CANDIDATE" | "EDGE_CONFIRMED" | "NOT_UNCERTAIN_CANDIDATE";

export interface PromotionDecision {
  candidateId: string;
  label: PromotionLabel;
  findings: EngineFinding[];
}

export function evaluatePromotion(input: PromotionInput): PromotionDecision {
  const findings: EngineFinding[] = [];

  if (["SIMULATED", "QUARANTINED", "FAILED"].includes(input.source.truthClass)) {
    findings.push({ severity: "WATCH", code: "SOURCE_NOT_LIVE", message: "Candidate source is not live runtime truth." });
  }

  if (input.trainEpisodes < 100) {
    findings.push({ severity: "BLOCKED", code: "LOW_TRAIN_SAMPLE", message: "Training sample below 100 episodes." });
  }

  if (input.testEpisodes < 50) {
    findings.push({ severity: "BLOCKED", code: "LOW_TEST_SAMPLE", message: "Test sample below 50 episodes." });
  }

  if (!input.hasWalkForwardEvidence) {
    findings.push({ severity: "BLOCKED", code: "NO_WALK_FORWARD", message: "No walk-forward validation evidence." });
  }

  if (input.survivorshipProfile && blocksEdgeConfirmation(input.survivorshipProfile)) {
    findings.push({ severity: "BLOCKED", code: "SURVIVORSHIP_BLINDNESS_RISK", message: "Survivor-only or graveyard-thin dataset blocks edge confirmation." });
  }

  const blocked = findings.some((f) => f.severity === "BLOCKED" || f.severity === "BREACH");
  if (blocked) return { candidateId: input.candidateId, label: "BLOCKED", findings };

  const fpOk = input.falsePositiveCount <= input.truePositiveCount / 3;
  const strong = input.precisionPct >= 90 && input.recallPct >= 50 && fpOk;

  if (strong && input.hasElectronicEraValidation) {
    return { candidateId: input.candidateId, label: "NOT_UNCERTAIN_CANDIDATE", findings };
  }

  if (strong) return { candidateId: input.candidateId, label: "EDGE_CONFIRMED", findings };
  if (input.precisionPct >= 70) return { candidateId: input.candidateId, label: "EDGE_CANDIDATE", findings };
  return { candidateId: input.candidateId, label: "WATCH", findings };
}
