import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = join(here, "..");

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const requiredDocs = [
  "README.md",
  "MDK_STATUS.json",
  "MDK_RELEASE_CHECKLIST.md",
  "SCREENSHOT_REVIEW.md",
  "MDK_REVIEW.md",
  "MDK_VISUAL_CONTRACT.md",
  "MDK_UIUX_SOCOM_BOUNDARY_MAP.md",
];

for (const doc of requiredDocs) {
  assert(existsSync(join(appRoot, doc)), `${doc} is missing`);
}

const readme = read(join(appRoot, "README.md"));
const checklist = read(join(appRoot, "MDK_RELEASE_CHECKLIST.md"));
const screenshot = read(join(appRoot, "SCREENSHOT_REVIEW.md"));
const visualContract = read(join(appRoot, "MDK_VISUAL_CONTRACT.md"));
const uiuxSocomMap = read(join(appRoot, "MDK_UIUX_SOCOM_BOUNDARY_MAP.md"));

assert(readme.includes("VISUAL_PROTOTYPE"), "README must state VISUAL_PROTOTYPE");
assert(readme.includes("MOCK"), "README must state MOCK");
assert(readme.includes("WATCH_NOT_RELEASE_READY"), "README must state WATCH_NOT_RELEASE_READY");
assert(readme.includes("DashboardSnapshotAdapter"), "README must explain adapter path");

assert(checklist.includes("BLOCKED"), "Release checklist must state BLOCKED");
assert(checklist.includes("truthClass: LIVE"), "Release checklist must block LIVE in mock snapshot");
assert(checklist.includes("executionEligible: true"), "Release checklist must block executionEligible true");
assert(checklist.includes("brokerConnected: true"), "Release checklist must block brokerConnected true");
assert(checklist.includes("privateData: true"), "Release checklist must block privateData true");

assert(screenshot.includes("Dual-arc hero gauges"), "Screenshot review must require dual-arc hero gauges");
assert(screenshot.includes("MOCK / VISUAL PROTOTYPE"), "Screenshot review must require visible mock boundary");
assert(screenshot.includes("broker connection"), "Screenshot review must block broker implication");
assert(screenshot.includes("trade execution"), "Screenshot review must block execution implication");

assert(visualContract.includes("DUAL_ARC_HERO_GAUGE_REQUIRED"), "Visual contract must lock dual-arc hero gauge requirement");
assert(visualContract.includes("single-gauge hero cards"), "Visual contract must block single-gauge hero drift");
assert(visualContract.includes("dark generic fintech dashboard mode"), "Visual contract must block dark generic drift");
assert(visualContract.includes("fake LIVE, CONNECTED, or ACTIVE posture"), "Visual contract must block fake status posture");

assert(uiuxSocomMap.includes("MDK UI/UX SOCom"), "UIUX SOCom map must identify the owning role");
assert(uiuxSocomMap.includes("Dial 811 before digging"), "UIUX SOCom map must preserve the 811 utility-map rule");
assert(uiuxSocomMap.includes("VISUAL_PROTOTYPE"), "UIUX SOCom map must lock VISUAL_PROTOTYPE posture");
assert(uiuxSocomMap.includes("MOCK"), "UIUX SOCom map must lock MOCK posture");
assert(uiuxSocomMap.includes("WATCH_NOT_RELEASE_READY"), "UIUX SOCom map must lock WATCH_NOT_RELEASE_READY posture");
assert(uiuxSocomMap.includes("Prefer merged main over closed/unmerged branch"), "UIUX SOCom map must preserve canonical freshness rules");
assert(uiuxSocomMap.includes("Treat unmerged branches as quarantine/archaeology"), "UIUX SOCom map must preserve archaeology treatment");
assert(uiuxSocomMap.includes("No dashboard or cockpit surface may imply"), "UIUX SOCom map must include forbidden implication lock");
assert(uiuxSocomMap.includes("broker connected"), "UIUX SOCom map must block broker implication");
assert(uiuxSocomMap.includes("execution eligible"), "UIUX SOCom map must block execution implication");
assert(uiuxSocomMap.includes("Algorilla certified"), "UIUX SOCom map must block Algorilla certification implication");

console.log("Dashboard documentation guard: PASS");
