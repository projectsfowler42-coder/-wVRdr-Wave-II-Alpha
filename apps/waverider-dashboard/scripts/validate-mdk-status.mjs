import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = join(here, "..");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readText(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const status = readJson(join(appRoot, "MDK_STATUS.json"));
const app = readText(join(appRoot, "src", "App.tsx"));
const snapshot = readText(join(appRoot, "src", "data", "mockDashboardSnapshot.ts"));

assert(status.surface === "waverider-dashboard", "MDK_STATUS surface mismatch");
assert(status.releaseState === "VISUAL_PROTOTYPE", "Dashboard must remain VISUAL_PROTOTYPE until certified");
assert(status.truthClass === "MOCK", "Dashboard must remain MOCK until real adapter is certified");
assert(status.executionEligible === false, "Dashboard must not be execution eligible");
assert(status.privateData === false, "Dashboard must not claim private data access");
assert(status.brokerConnected === false, "Dashboard must not claim broker connection");
assert(status.releaseEligible === false, "Dashboard must not be release eligible during prototype state");
assert(app.includes("MOCK / VISUAL PROTOTYPE"), "Visible mock/prototype banner is missing from App.tsx");
assert(snapshot.includes("truthClass: \"MOCK\""), "Mock snapshot must carry MOCK truth class");

console.log("MDK dashboard status guard: PASS");
