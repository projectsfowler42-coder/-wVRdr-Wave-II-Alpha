import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = join(here, "..");

function readText(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const truthSpine = readText(join(appRoot, "src", "contracts", "truthSpine.ts"));
const dashboardSnapshot = readText(join(appRoot, "src", "contracts", "dashboardSnapshot.ts"));
const snapshotGuard = readText(join(appRoot, "src", "contracts", "snapshotGuard.ts"));
const fixtureGuard = readText(join(appRoot, "scripts", "validate-dashboard-snapshot-fixtures.mjs"));

const requiredTruthClasses = [
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
];

const requiredAuthorityClasses = [
  "DISPLAY_ONLY",
  "DRILLDOWN_ONLY",
  "REVIEW_ONLY",
  "SIM_ONLY",
  "MANUAL_BRIDGE",
  "READ_ONLY_REFRESH",
  "EXECUTION_DISABLED",
  "EXECUTION_ELIGIBLE",
];

for (const truthClass of requiredTruthClasses) {
  assert(truthSpine.includes(`"${truthClass}"`), `truthSpine missing truth class: ${truthClass}`);
}

for (const authorityClass of requiredAuthorityClasses) {
  assert(truthSpine.includes(`"${authorityClass}"`), `truthSpine missing UI authority class: ${authorityClass}`);
}

assert(truthSpine.includes("TRUTH_CLASSES"), "truthSpine must export TRUTH_CLASSES");
assert(truthSpine.includes("DASHBOARD_RENDERABLE_TRUTH_CLASSES"), "truthSpine must export DASHBOARD_RENDERABLE_TRUTH_CLASSES");
assert(truthSpine.includes("UI_AUTHORITY_CLASSES"), "truthSpine must export UI_AUTHORITY_CLASSES");
assert(truthSpine.includes("isTruthClass"), "truthSpine must export isTruthClass");
assert(truthSpine.includes("isDashboardRenderableTruthClass"), "truthSpine must export isDashboardRenderableTruthClass");
assert(truthSpine.includes("isConfidence"), "truthSpine must export isConfidence");

assert(dashboardSnapshot.includes("truthClass"), "dashboard snapshot contract must keep truthClass evidence");
assert(dashboardSnapshot.includes("sourceId"), "dashboard snapshot contract must keep sourceId evidence");
assert(dashboardSnapshot.includes("capturedAt"), "dashboard snapshot contract must keep capturedAt evidence");
assert(dashboardSnapshot.includes("confidence"), "dashboard snapshot contract must keep confidence evidence");
assert(snapshotGuard.includes("truthClass"), "snapshot guard must check truthClass");
assert(fixtureGuard.includes("unknown truth class"), "fixture guard must prove unknown truth class rejection");

console.log("Dashboard truth spine guard: PASS");
