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
];

for (const doc of requiredDocs) {
  assert(existsSync(join(appRoot, doc)), `${doc} is missing`);
}

const readme = read(join(appRoot, "README.md"));
const checklist = read(join(appRoot, "MDK_RELEASE_CHECKLIST.md"));
const screenshot = read(join(appRoot, "SCREENSHOT_REVIEW.md"));

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

console.log("Dashboard documentation guard: PASS");
