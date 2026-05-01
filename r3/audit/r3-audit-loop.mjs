import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(file) {
  const fullPath = path.join(root, file);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : null;
}

function has(file, token) {
  const body = read(file);
  return Boolean(body && body.includes(token));
}

function scoreBoolean(value) {
  return value ? 1 : 0;
}

const checks = [
  {
    id: "R3_FILES_PRESENT",
    category: "STRUCTURE",
    weight: 10,
    pass: [
      "r3/truth.ts",
      "r3/propDoctrine.ts",
      "r3/circuitBreakers.ts",
      "r3/survivorshipInversion.ts",
      "r3/promotionGate.ts",
      "r3/mdkGate.ts",
      "r3/tests/r3Engine.spec.ts",
    ].every((file) => read(file) !== null),
  },
  {
    id: "CIRCUIT_BREAKER_BEHAVIOR_TESTS",
    category: "BEHAVIOR",
    weight: 15,
    pass:
      has("r3/tests/r3Engine.spec.ts", "testHardDeck") &&
      has("r3/tests/r3Engine.spec.ts", "testVolatilityClamp") &&
      has("r3/tests/r3Engine.spec.ts", "testRatchet"),
  },
  {
    id: "SURVIVORSHIP_BLINDNESS_TEST",
    category: "BEHAVIOR",
    weight: 15,
    pass:
      has("r3/tests/r3Engine.spec.ts", "testSurvivorOnlyBlocksEdge") &&
      has("r3/survivorshipInversion.ts", "graveyard cohort missing"),
  },
  {
    id: "PROMOTION_GATE_TESTS",
    category: "BEHAVIOR",
    weight: 15,
    pass:
      has("r3/tests/r3Engine.spec.ts", "testPromotionBlocksWithoutWalkForward") &&
      has("r3/tests/r3Engine.spec.ts", "testPromotionAllowsNotUncertainCandidate"),
  },
  {
    id: "MDK_OUTPUT_PROBE",
    category: "MDK",
    weight: 15,
    pass:
      has("r3/mdkGate.ts", "SENTINEL") &&
      has("r3/mdkGate.ts", "JUDGE") &&
      has("r3/mdkGate.ts", "ARCHIVIST") &&
      has("r3/tests/r3Engine.spec.ts", "testMdkBlocksBlockedPromotion"),
  },
  {
    id: "CI_PRESENT",
    category: "CI",
    weight: 10,
    pass:
      read(".github/workflows/r3-integrity.yml") !== null &&
      read("r3/tests/r3-integrity-check.mjs") !== null,
  },
  {
    id: "NO_RUNTIME_WIRING",
    category: "SAFETY",
    weight: 10,
    pass:
      !has("r3/index.ts", "broker") &&
      !has("r3/index.ts", "executeOrder") &&
      !has("r3/index.ts", "placeOrder"),
  },
  {
    id: "MISSING_EXECUTABLE_TS_RUNNER",
    category: "GAP",
    weight: 10,
    pass: read("package.json") !== null && (has("package.json", "tsx") || has("package.json", "ts-node") || has("package.json", "vitest")),
  },
];

const maxScore = checks.reduce((sum, check) => sum + check.weight, 0);
const score = checks.reduce((sum, check) => sum + scoreBoolean(check.pass) * check.weight, 0);
const failed = checks.filter((check) => !check.pass);

const categoryScores = new Map();
for (const check of checks) {
  const current = categoryScores.get(check.category) ?? { score: 0, max: 0 };
  current.max += check.weight;
  if (check.pass) current.score += check.weight;
  categoryScores.set(check.category, current);
}

const direction = score >= 80
  ? "IMPROVING_BUT_NOT_YET_OPERATIONAL"
  : score >= 60
    ? "FOUNDATION_FORMING"
    : "TOO_STRUCTURAL_TO_TRUST";

const report = {
  generatedAt: new Date().toISOString(),
  auditName: "R3 Comparative Audit Loop",
  scope: "Wave-II Alpha / R3",
  score,
  maxScore,
  scorePct: Math.round((score / maxScore) * 10000) / 100,
  direction,
  checks,
  failedChecks: failed.map((check) => check.id),
  categoryScores: Object.fromEntries(categoryScores),
  comparison: {
    myAudit: "Finds structural and behavioral gaps across files, tests, CI, and runtime boundaries.",
    mdkProbeAudit: "Judges artifacts and promotion decisions; stronger on output governance than implementation coverage.",
    r3IntegrityCi: "Good for preventing removal of gates, but currently token/presence-based rather than true execution-based.",
    difference: "MDK inspects decisions, CI inspects structure, this audit inspects direction and gaps between them.",
  },
  extrapolation: [
    "R3 moved from doctrine to executable spine.",
    "MDK moved from concept to gate module.",
    "CI is forming but must evolve from token checks to executable TypeScript tests.",
    "Next leverage point is to add a real TS runner or repo test harness so tests actually execute logic under CI.",
  ],
};

fs.mkdirSync(path.join(root, "r3/audit/out"), { recursive: true });
fs.writeFileSync(path.join(root, "r3/audit/out/r3-audit-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

if (failed.some((check) => ["STRUCTURE", "SAFETY"].includes(check.category))) {
  process.exit(1);
}
