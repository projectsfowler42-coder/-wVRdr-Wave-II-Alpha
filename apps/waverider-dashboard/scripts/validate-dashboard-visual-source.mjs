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

const heroGauge = read(join(srcRoot, "components", "HeroGauge.tsx"));
const heroCard = read(join(srcRoot, "components", "HeroCard.tsx"));
const styles = read(join(srcRoot, "styles.css"));
const snapshot = read(join(srcRoot, "data", "mockDashboardSnapshot.ts"));

assert(heroGauge.includes("hero-outer"), "HeroGauge must render outer arc class");
assert(heroGauge.includes("hero-inner"), "HeroGauge must render inner arc class");
assert(heroGauge.includes("hero-main-readout"), "HeroGauge must render main readout");
assert(heroGauge.includes("hero-secondary-readout"), "HeroGauge must render secondary readout");
assert(heroGauge.includes("aria-label"), "HeroGauge must expose an accessibility label");
assert(heroGauge.includes("clampMetric"), "HeroGauge must clamp metric values");
assert(heroGauge.includes("mainValue * 2.72"), "HeroGauge must map main value into approved arc sweep");
assert(heroGauge.includes("secondaryValue * 2.72"), "HeroGauge must map secondary value into approved arc sweep");

assert(heroCard.includes("hero-title-row"), "HeroCard must retain title row");
assert(heroCard.includes("ACTIONABILITY"), "HeroCard must retain actionability label");
assert(heroCard.includes("truthClass"), "HeroCard must display truth class beside actionability");

assert(styles.includes(".hero-grid"), "Styles must include hero grid");
assert(styles.includes("grid-template-columns:repeat(4,1fr)"), "Desktop hero grid must use four columns");
assert(styles.includes(".hero-outer"), "Styles must define outer hero arc");
assert(styles.includes(".hero-inner"), "Styles must define inner hero arc");
assert(styles.includes(".hero-main-readout"), "Styles must define main readout");
assert(styles.includes(".hero-secondary-readout"), "Styles must define secondary readout");
assert(styles.includes(".truth-banner"), "Styles must define visible truth banner");

assert(snapshot.includes("id: \"regime\""), "Snapshot must include REGIME hero");
assert(snapshot.includes("id: \"vectors\""), "Snapshot must include VECTORS hero");
assert(snapshot.includes("id: \"threats\""), "Snapshot must include THREATS hero");
assert(snapshot.includes("id: \"portfolio\""), "Snapshot must include PORTFOLIO hero");
assert(snapshot.includes("outer:"), "Snapshot hero entries must include outer color token");
assert(snapshot.includes("inner:"), "Snapshot hero entries must include inner color token");

console.log("Dashboard visual source guard: PASS");
