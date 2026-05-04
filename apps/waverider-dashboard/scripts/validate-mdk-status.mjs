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

function requireStatusItem(item) {
  assert(
    Array.isArray(status.requiredBeforeRelease) && status.requiredBeforeRelease.includes(item),
    `MDK_STATUS requiredBeforeRelease must include: ${item}`,
  );
}

const status = readJson(join(appRoot, "MDK_STATUS.json"));
const packageJson = readJson(join(appRoot, "package.json"));
const app = readText(join(appRoot, "src", "App.tsx"));
const snapshot = readText(join(appRoot, "src", "data", "mockDashboardSnapshot.ts"));

const scripts = packageJson.scripts ?? {};

assert(status.surface === "waverider-dashboard", "MDK_STATUS surface mismatch");
assert(status.releaseState === "VISUAL_PROTOTYPE", "Dashboard must remain VISUAL_PROTOTYPE until certified");
assert(status.truthClass === "MOCK", "Dashboard must remain MOCK until real adapter is certified");
assert(status.executionEligible === false, "Dashboard must not be execution eligible");
assert(status.privateData === false, "Dashboard must not claim private data access");
assert(status.brokerConnected === false, "Dashboard must not claim broker connection");
assert(status.releaseEligible === false, "Dashboard must not be release eligible during prototype state");

requireStatusItem("typecheck passes");
requireStatusItem("build passes");
requireStatusItem("mdk:static passes");
requireStatusItem("mdk:uiux passes");
requireStatusItem("MDK_UIUX_SOCOM_BOUNDARY_MAP.md remains current");

assert(scripts["mdk:status"] === "node scripts/validate-mdk-status.mjs", "package script mdk:status must run validate-mdk-status");
assert(scripts["mdk:source"] === "node scripts/validate-dashboard-source.mjs", "package script mdk:source must run validate-dashboard-source");
assert(scripts["mdk:snapshot"] === "node scripts/validate-dashboard-snapshot.mjs", "package script mdk:snapshot must run validate-dashboard-snapshot");
assert(scripts["mdk:docs"] === "node scripts/validate-dashboard-docs.mjs", "package script mdk:docs must run validate-dashboard-docs");
assert(scripts["mdk:uiux"] === "node scripts/validate-dashboard-uiux-socom.mjs", "package script mdk:uiux must run validate-dashboard-uiux-socom");
assert(scripts["mdk:visual"] === "node scripts/validate-dashboard-visual-source.mjs", "package script mdk:visual must run validate-dashboard-visual-source");
assert(typeof scripts["mdk:static"] === "string", "package script mdk:static is missing");
assert(scripts["mdk:static"].includes("mdk:status"), "mdk:static must include mdk:status");
assert(scripts["mdk:static"].includes("mdk:source"), "mdk:static must include mdk:source");
assert(scripts["mdk:static"].includes("mdk:snapshot"), "mdk:static must include mdk:snapshot");
assert(scripts["mdk:static"].includes("mdk:docs"), "mdk:static must include mdk:docs");
assert(scripts["mdk:static"].includes("mdk:uiux"), "mdk:static must include mdk:uiux");
assert(scripts["mdk:static"].includes("mdk:visual"), "mdk:static must include mdk:visual");
assert(typeof scripts["mdk:gate"] === "string", "package script mdk:gate is missing");
assert(scripts["mdk:gate"].includes("typecheck"), "mdk:gate must include typecheck");
assert(scripts["mdk:gate"].includes("build"), "mdk:gate must include build");
assert(scripts["mdk:gate"].includes("mdk:static"), "mdk:gate must include mdk:static");

assert(app.includes("MOCK / VISUAL PROTOTYPE"), "Visible mock/prototype banner is missing from App.tsx");
assert(snapshot.includes("truthClass: \"MOCK\""), "Mock snapshot must carry MOCK truth class");

console.log("MDK dashboard status guard: PASS");
