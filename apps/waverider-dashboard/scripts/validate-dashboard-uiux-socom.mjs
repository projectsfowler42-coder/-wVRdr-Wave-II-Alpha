import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = join(here, "..");
const mapPath = join(appRoot, "MDK_UIUX_SOCOM_BOUNDARY_MAP.md");

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(mapPath), "MDK_UIUX_SOCOM_BOUNDARY_MAP.md is missing");

const map = read(mapPath);

const requiredSections = [
  "## 0. Executive lock",
  "## 1. Source of authority for this map",
  "## 2. Repo ownership map",
  "## 3. MDK basement map for UI/UX SOCom",
  "## 4. Dashboard-specific authority",
  "## 5. Button authority matrix",
  "## 6. Visual truth lexicon",
  "## 7. Freshest logic ledger",
  "## 8. Acceptance checklist for future dashboard patches",
  "## 9. Final lock",
];

for (const section of requiredSections) {
  assert(map.includes(section), `UIUX SOCom map missing required section: ${section}`);
}

const requiredRepos = [
  "projectsfowler42-coder/-wVRdr-Wave-II-Alpha",
  "projectsfowler42-coder/MDK-9000_wVRdr",
  "projectsfowler42-coder/wave-rider-intelligence",
  "projectsfowler42-coder/wVRdr_Wave-I_Build",
  "projectsfowler42-coder/wVRdr-anomaly-lab",
];

for (const repo of requiredRepos) {
  assert(map.includes(repo), `UIUX SOCom map missing repo ownership reference: ${repo}`);
}

const requiredBasements = [
  "Build Truth",
  "Fault Memory",
  "Sentinel",
  "Browser Hounds",
  "Truth Spigot",
  "Padded Room",
  "Mouseion/Crawlers",
  "W3/Scythe/Sarlaac/Algorilla",
  "Holo-Deck",
  "Broker/Execution",
  "UI/UX SOCom",
];

for (const basement of requiredBasements) {
  assert(map.includes(basement), `UIUX SOCom map missing basement: ${basement}`);
}

const requiredPostureLocks = [
  "DISPLAY_ONLY",
  "VISUAL_PROTOTYPE",
  "MOCK",
  "WATCH_NOT_RELEASE_READY",
  "adapter-gated",
  "snapshot-gated",
  "source-gated",
  "docs-gated",
  "visual-contract-gated",
  "visual-source-gated",
];

for (const posture of requiredPostureLocks) {
  assert(map.includes(posture), `UIUX SOCom map missing posture lock: ${posture}`);
}

const requiredFreshnessRules = [
  "Prefer merged main over closed/unmerged branch",
  "Prefer newer timestamp only inside the same ownership lane",
  "Prefer executable source/config over stale README prose",
  "Treat unmerged branches as quarantine/archaeology until explicitly revived",
];

for (const rule of requiredFreshnessRules) {
  assert(map.includes(rule), `UIUX SOCom map missing freshness rule: ${rule}`);
}

const requiredForbiddenImplications = [
  "LIVE",
  "broker connected",
  "private data connected",
  "execution eligible",
  "Algorilla certified",
  "edge confirmed",
  "source complete",
  "current/live quote truth",
];

for (const implication of requiredForbiddenImplications) {
  assert(map.includes(implication), `UIUX SOCom map missing forbidden implication: ${implication}`);
}

const requiredAllowedLabels = [
  "Inspect",
  "Details",
  "View Source",
  "Show Fault",
  "Review Snapshot",
  "Open Evidence",
];

for (const label of requiredAllowedLabels) {
  assert(map.includes(label), `UIUX SOCom map missing allowed display label: ${label}`);
}

const requiredBlockedLabels = [
  "Buy",
  "Sell",
  "Execute",
  "Send Order",
  "Connect Broker",
  "Authorize Account",
  "Promote Algorilla",
  "Certify Edge",
];

for (const label of requiredBlockedLabels) {
  assert(map.includes(label), `UIUX SOCom map missing blocked label: ${label}`);
}

assert(map.includes("No dashboard or cockpit surface may imply"), "UIUX SOCom map must preserve final forbidden implication lock");
assert(map.includes("unless the owning subsystem produces that truth"), "UIUX SOCom map must preserve owner-truth condition");

console.log("Dashboard UIUX SOCom gate: PASS");
