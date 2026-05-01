import { evaluateCircuitBreakers } from "../circuitBreakers";
import { buildSurvivorshipProfile } from "../survivorshipInversion";
import { evaluatePromotion } from "../promotionGate";
import { waveIIEnvelope } from "../truth";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${String(expected)}, got ${String(actual)}`);
  }
}

export function testHardDeck(): void {
  const decision = evaluateCircuitBreakers({
    dailyDrawdownPct: 3.1,
    totalDrawdownPct: 2,
    atr14: 1,
    dailyAverageAtr: 1,
    openProfitR: 0,
  });

  assertEqual(decision.mode, "SURVIVAL", "Hard Deck should force survival mode");
  assert(decision.disabledEngines.includes("GREEN"), "Hard Deck should disable Green");
  assert(decision.disabledEngines.includes("YELLOW"), "Hard Deck should disable Yellow");
  assertEqual(decision.riskMultiplier, 0.5, "Hard Deck should cut risk by half");
}

export function testVolatilityClamp(): void {
  const decision = evaluateCircuitBreakers({
    dailyDrawdownPct: 0,
    totalDrawdownPct: 0,
    atr14: 2.1,
    dailyAverageAtr: 1,
    openProfitR: 0,
  });

  assertEqual(decision.mode, "TIGHT", "Volatility Clamp should force tight mode");
  assertEqual(decision.stopDistanceMultiplier, 0.7, "Volatility Clamp should reduce stop distance");
  assertEqual(decision.takeProfitMode, "FIXED_ONLY", "Volatility Clamp should force fixed TP");
}

export function testRatchet(): void {
  const decision = evaluateCircuitBreakers({
    dailyDrawdownPct: 0,
    totalDrawdownPct: 0,
    atr14: 1,
    dailyAverageAtr: 1,
    openProfitR: 1.51,
  });

  assertEqual(decision.mode, "RATCHET_ACTIVE", "Open profit above +1.5R should activate Ratchet");
  assertEqual(decision.ratchetActive, true, "Ratchet active flag should be true");
}

export function testSurvivorOnlyBlocksEdge(): void {
  const profile = buildSurvivorshipProfile({
    datasetId: "survivor-only-fixture",
    windowStart: "1900-01-01",
    windowEnd: "2000-12-31",
    entities: [
      {
        entityId: "SURVIVOR_A",
        entityType: "COMPANY",
        firstObservedDate: "1900-01-01",
        deathType: "NONE",
        survivedToWindowEnd: true,
        sourceIds: ["fixture"],
        confidence: 1,
      },
    ],
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
    source: waveIIEnvelope({
      value: { candidate: true },
      truthClass: "SIMULATED",
      sourceId: "fixture",
    }),
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
    source: waveIIEnvelope({
      value: { candidate: true },
      truthClass: "EDGE_CONFIRMED",
      sourceId: "fixture",
    }),
  });

  assertEqual(
    decision.label,
    "NOT_UNCERTAIN_CANDIDATE",
    "Strong validated candidate should reach Not-Uncertain candidate label",
  );
}

export function runR3Tests(): void {
  testHardDeck();
  testVolatilityClamp();
  testRatchet();
  testSurvivorOnlyBlocksEdge();
  testPromotionBlocksWithoutWalkForward();
  testPromotionAllowsNotUncertainCandidate();
}

runR3Tests();
