import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = join(here, "..");
const snapshotPath = join(appRoot, "src", "data", "mockDashboardSnapshot.ts");
const snapshotSource = readFileSync(snapshotPath, "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function count(pattern) {
  const matches = snapshotSource.match(pattern);
  return matches ? matches.length : 0;
}

assert(snapshotSource.includes("surface: \"waverider-dashboard\""), "snapshot surface must be waverider-dashboard");
assert(snapshotSource.includes("releaseState: \"VISUAL_PROTOTYPE\""), "snapshot releaseState must be VISUAL_PROTOTYPE");
assert(snapshotSource.includes("executionEligible: false"), "snapshot executionEligible must be false");
assert(snapshotSource.includes("privateData: false"), "snapshot privateData must be false");
assert(snapshotSource.includes("brokerConnected: false"), "snapshot brokerConnected must be false");
assert(snapshotSource.includes("sourceId: \"mock:waverider-dashboard:visual-prototype\""), "snapshot sourceId must identify mock prototype source");
assert(snapshotSource.includes("confidence: 0"), "mock snapshot confidence must be zero");
assert(count(/id: \"regime\"/g) === 1, "regime hero must exist once");
assert(count(/id: \"vectors\"/g) === 1, "vectors hero must exist once");
assert(count(/id: \"threats\"/g) === 1, "threats hero must exist once");
assert(count(/id: \"portfolio\"/g) === 1, "portfolio hero must exist once");
assert(count(/icon: \"/g) >= 6, "mini metric icon declarations are missing");
assert(!snapshotSource.includes("LIVE"), "mock snapshot must not contain LIVE truth text");

console.log("Dashboard snapshot static guard: PASS");
