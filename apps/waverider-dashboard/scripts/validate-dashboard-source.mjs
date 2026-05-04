import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = join(here, "..");
const srcRoot = join(appRoot, "src");

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const app = read(join(srcRoot, "App.tsx"));
const adapter = read(join(srcRoot, "adapters", "dashboardSnapshotAdapter.ts"));
const guard = read(join(srcRoot, "contracts", "snapshotGuard.ts"));
const snapshot = read(join(srcRoot, "data", "mockDashboardSnapshot.ts"));
const styles = read(join(srcRoot, "styles.css"));

assert(app.includes("loadDashboardSnapshot"), "App must load data through the adapter boundary");
assert(!app.includes("mockDashboardSnapshot"), "App must not import mock data directly");
assert(app.includes("MOCK / VISUAL PROTOTYPE"), "App must visibly state MOCK / VISUAL PROTOTYPE");

assert(adapter.includes("guardDashboardSnapshot"), "Adapter must route snapshots through guardDashboardSnapshot");
assert(guard.includes("executionEligible !== false"), "Snapshot guard must enforce executionEligible false");
assert(guard.includes("privateData !== false"), "Snapshot guard must enforce privateData false");
assert(guard.includes("brokerConnected !== false"), "Snapshot guard must enforce brokerConnected false");
assert(guard.includes("mainValue"), "Snapshot guard must inspect hero mainValue");
assert(guard.includes("secondaryValue"), "Snapshot guard must inspect hero secondaryValue");

assert(snapshot.includes("truthClass: \"MOCK\""), "Mock snapshot must carry truthClass MOCK");
assert(!snapshot.includes("truthClass: \"LIVE\""), "Mock snapshot must not claim LIVE truthClass");
assert(!snapshot.includes("executionEligible: true"), "Mock snapshot must not enable execution");
assert(!snapshot.includes("brokerConnected: true"), "Mock snapshot must not claim broker connectivity");
assert(!snapshot.includes("privateData: true"), "Mock snapshot must not claim private data access");

assert(!app.includes("DATA FEED: LIVE"), "Prototype UI must not claim live data feed");
assert(!app.includes("API HEALTH: CONNECTED"), "Prototype UI must not claim connected API health");
assert(!app.includes("MODEL STATUS: ACTIVE"), "Prototype UI must not claim active model status");

assert(styles.includes("@media(max-width:720px)"), "Styles must include mobile fallback media query");
assert(styles.includes("filter:none"), "Mobile fallback must disable heavy SVG filters");
assert(styles.includes("prefers-reduced-motion"), "Styles must include reduced-motion safeguard");

console.log("Dashboard source guard: PASS");
