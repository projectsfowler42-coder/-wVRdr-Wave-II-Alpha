import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "r3/truth.ts",
  "r3/propDoctrine.ts",
  "r3/circuitBreakers.ts",
  "r3/survivorshipInversion.ts",
  "r3/promotionGate.ts",
  "r3/mdkGate.ts",
  "r3/contracts.ts",
  "r3/index.ts",
  "r3/tests/r3Engine.spec.ts",
];

const requiredTokens = new Map([
  ["r3/circuitBreakers.ts", ["SURVIVAL", "RATCHET_ACTIVE", "Volatility Clamp", "dailyDrawdownPct > 3", "totalDrawdownPct > 6"]],
  ["r3/survivorshipInversion.ts", ["SurvivorshipProfile", "CRITICAL", "graveyard cohort missing", "blocksEdgeConfirmation"]],
  ["r3/promotionGate.ts", ["NO_WALK_FORWARD", "NOT_UNCERTAIN_CANDIDATE", "SURVIVORSHIP_BLINDNESS_RISK"]],
  ["r3/mdkGate.ts", ["SENTINEL", "JUDGE", "ARCHIVIST", "MDK_PROMOTION_BLOCKED", "mdkBlocksPromotion"]],
  ["r3/contracts.ts", ["R3SourceManifestRecord", "R3EventNode", "R3FeatureVector", "R3PredictionRecord", "R3SarlaacRecord"]],
  ["r3/tests/r3Engine.spec.ts", ["testHardDeck", "testVolatilityClamp", "testRatchet", "testSurvivorOnlyBlocksEdge", "testMdkBlocksBlockedPromotion"]],
]);

function fail(message) {
  console.error(`R3 INTEGRITY FAIL: ${message}`);
  process.exitCode = 1;
}

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    fail(`Missing required file: ${file}`);
    continue;
  }

  const body = fs.readFileSync(fullPath, "utf8");
  const tokens = requiredTokens.get(file) ?? [];
  for (const token of tokens) {
    if (!body.includes(token)) {
      fail(`Missing token ${JSON.stringify(token)} in ${file}`);
    }
  }
}

const index = fs.readFileSync(path.join(root, "r3/index.ts"), "utf8");
for (const exportName of ["truth", "propDoctrine", "circuitBreakers", "survivorshipInversion", "promotionGate", "mdkGate", "contracts"]) {
  if (!index.includes(`./${exportName}`)) {
    fail(`r3/index.ts does not export ${exportName}`);
  }
}

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}

console.log("R3 integrity check passed.");
