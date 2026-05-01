import { evaluateCircuitBreakers } from "../circuitBreakers.js";
import { buildSurvivorshipProfile } from "../survivorshipInversion.js";
import { evaluatePromotion } from "../promotionGate.js";
import { waveIIEnvelope } from "../truth.js";
import { inspectWithMdk, mdkBlocksPromotion } from "../mdkGate.js";
import { predictionCanBeScored, sarlaacRecordIsActionable, sourceIsUsable } from "../contracts.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${String(expected)}, got ${String(actual)}`);
  }
}

export function testHardDeck(): void {
  const decision = evaluateCircuitBreakers({ dailyDrawdownPct: 3.1, totalDrawdownPct: 2, atr14: 1, dailyAverageAtr: 1, openProfitR: 0 });
  assertEqual(decision.mode, "SURVIVAL", "Hard Deck should force survival mode");
  assert(decision.disabledEngines.includes("GREEN"), "Hard Deck should disable Green");
  assert(decision.disabledEngines.includes("YELLOW"), "Hard Deck should disable Yellow");
  assertEqual(decision.riskMultiplier, 0.5, "Hard Deck should cut risk by half");
}

export function testVolatilityClamp(): void {
  const decision = evaluateCircuitBreakers({ dailyDrawdownPct: 0, totalDrawdownPct: 0, atr14: 2.1, dailyAverageAtr: 1, openProfitR: 0 });
  assertEqual(decision.mode, "TIGHT", "Volatility Clamp should force tight mode");
  assertEqual(decision.stopDistanceMultiplier, 0.7, "Volatility Clamp should reduce stop distance");
  assertEqual(decision.takeProfitMode, "FIXED_ONLY", "Volatility Clamp should force fixed TP");
}

export function testRatchet(): void {
  const decision = evaluateCircuitBreakers({ dailyDrawdownPct: 0, totalDrawdownPct: 0, atr14: 1, dailyAverageAtr: 1, openProfitR: 1.51 });
  assertEqual(decision.mode, "RATCHET_ACTIVE", "Open profit above +1.5R should activate Ratchet");
  assertEqual(decision.ratchetActive, true, "Ratchet active flag should be true");
}

export function testSurvivorOnlyBlocksEdge(): void {
  const profile = buildSurvivorshipProfile({
    datasetId: "survivor-only-fixture",
    windowStart: "1900-01-01",
    windowEnd: "2000-12-31",
    entities: [{ entityId: "SURVIVOR_A", entityType: "COMPANY", firstObservedDate: "1900-01-01", deathType: "NONE", survivedToWindowEnd: true, sourceIds: ["fixture"], confidence: 1 }],
  });
  assertEqual(profile.survivorOnlyRisk, "CRITICAL", "Survivor-only dataset should be critical risk");
}

export function testPromotionBlocksWithoutWalkForward(): void {
  const decision = evaluatePromotion({
    candidateId: "candidate-no-walk-forward",
    trainEpisodes: 200,
    testEpisodes: 100,
    precisionPct: 95,
    recallPct: 80,
    falsePositiveCount: 1,
    truePositiveCount: 20,
    hasWalkForwardEvidence: false,
    hasElectronicEraValidation: true,
    source: waveIIEnvelope({ value: { candidate: true }, truthClass: "SIMULATED", sourceId: "fixture" }),
  });
  assertEqual(decision.label, "BLOCKED", "No walk-forward evidence should block promotion");
}

export function testPromotionAllowsNotUncertainCandidate(): void {
  const decision = evaluatePromotion({
    candidateId: "candidate-validated",
    trainEpisodes: 200,
    testEpisodes: 100,
    precisionPct: 95,
    recallPct: 80,
    falsePositiveCount: 1,
    truePositiveCount: 20,
    hasWalkForwardEvidence: true,
    hasElectronicEraValidation: true,
    source: waveIIEnvelope({ value: { candidate: true }, truthClass: "EDGE_CONFIRMED", sourceId: "fixture" }),
  });
  assertEqual(decision.label, "NOT_UNCERTAIN_CANDIDATE", "Strong validated candidate should reach Not-Uncertain candidate label");
}

export function testMdkBlocksBlockedPromotion(): void {
  const promotion = evaluatePromotion({
    candidateId: "candidate-no-walk-forward",
    trainEpisodes: 200,
    testEpisodes: 100,
    precisionPct: 95,
    recallPct: 80,
    falsePositiveCount: 1,
    truePositiveCount: 20,
    hasWalkForwardEvidence: false,
    hasElectronicEraValidation: true,
    source: waveIIEnvelope({ value: { candidate: true }, truthClass: "SIMULATED", sourceId: "fixture" }),
  });
  const record = inspectWithMdk({ artifactId: "candidate-no-walk-forward", artifactType: "PROMOTION_DECISION", promotion });
  assertEqual(record.verdict, "BLOCK", "MDK should block blocked promotion decisions");
  assertEqual(mdkBlocksPromotion(record), true, "MDK block helper should return true");
}

export function testR3Contracts(): void {
  assertEqual(sourceIsUsable({ sourceId: "s1", kind: "PRICE_SPINE", status: "VALIDATED", title: "fixture", licenseStatus: "FREE", confidence: 0.8, notes: [] }), true, "Validated confident source should be usable");
  assertEqual(sourceIsUsable({ sourceId: "s2", kind: "PRICE_SPINE", status: "CANDIDATE", title: "fixture", licenseStatus: "UNKNOWN", confidence: 0.9, notes: [] }), false, "Candidate source should not be usable");
  assertEqual(predictionCanBeScored({ predictionId: "p1", candidateId: "c1", asOf: "2001-01-01", horizonDays: 20, expectedDirection: "UP", truthClass: "SIMULATED", trainingWindow: { start: "1900-01-01", end: "2000-12-31" }, validationWindow: { start: "2001-01-01", end: "2001-12-31" }, featureVectorIds: ["fv1"], sourceIds: ["s1"] }), true, "Prediction with validation window and features should be scorable");
  assertEqual(sarlaacRecordIsActionable({ sarlaacId: "sr1", predictionId: "p1", grade: "F", missType: "SURVIVORSHIP_BLINDNESS", expectedSummary: "up", actualSummary: "down", missingFeatureNeeded: ["graveyard cohort"], misleadingFeatureIds: [], revisedQuestion: "What failed before disappearance?", sourceIds: ["s1"], createdAt: "2026-05-01T00:00:00.000Z" }), true, "Sarlaac record with revised question and missing feature should be actionable");
}

export function runR3Tests(): void {
  testHardDeck();
  testVolatilityClamp();
  testRatchet();
  testSurvivorOnlyBlocksEdge();
  testPromotionBlocksWithoutWalkForward();
  testPromotionAllowsNotUncertainCandidate();
  testMdkBlocksBlockedPromotion();
  testR3Contracts();
}

runR3Tests();
