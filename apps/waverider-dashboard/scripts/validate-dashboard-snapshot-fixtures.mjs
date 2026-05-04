const truthClasses = ["MOCK", "LIVE", "DEGRADED", "STALE", "FAILED"];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isTruthClass(value) {
  return truthClasses.includes(value);
}

function isPercent(value) {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

function guardFixtureSnapshot(snapshot) {
  const issues = [];

  if (snapshot.surface !== "waverider-dashboard") issues.push("surface");
  if (!isTruthClass(snapshot.truthClass)) issues.push("truthClass");
  if (snapshot.executionEligible !== false) issues.push("executionEligible");
  if (snapshot.privateData !== false) issues.push("privateData");
  if (snapshot.brokerConnected !== false) issues.push("brokerConnected");
  if (!Array.isArray(snapshot.heroMetrics) || snapshot.heroMetrics.length < 1) issues.push("heroMetrics");
  if (!Array.isArray(snapshot.miniMetrics) || snapshot.miniMetrics.length < 1) issues.push("miniMetrics");

  for (const hero of Array.isArray(snapshot.heroMetrics) ? snapshot.heroMetrics : []) {
    if (!isPercent(hero.mainValue)) issues.push(`${hero.id}.mainValue`);
    if (!isPercent(hero.secondaryValue)) issues.push(`${hero.id}.secondaryValue`);
    if (!hero.sourceId) issues.push(`${hero.id}.sourceId`);
    if (!hero.capturedAt) issues.push(`${hero.id}.capturedAt`);
  }

  if (issues.length > 0) {
    throw new Error(`Dashboard snapshot rejected by guard: ${issues.join(", ")}`);
  }

  return snapshot;
}

function validSnapshot() {
  return {
    surface: "waverider-dashboard",
    releaseState: "VISUAL_PROTOTYPE",
    truthClass: "MOCK",
    sourceId: "fixture:waverider-dashboard:valid",
    capturedAt: "2026-05-05T00:00:00.000Z",
    confidence: 0,
    executionEligible: false,
    privateData: false,
    brokerConnected: false,
    heroMetrics: [
      {
        id: "regime",
        title: "Regime",
        mainValue: 50,
        mainKicker: "MOCK",
        mainLabel: "Display-only",
        secondaryValue: 25,
        secondaryLabel: "Actionability",
        outer: "#000000",
        inner: "#111111",
        truthClass: "MOCK",
        sourceId: "fixture:hero:regime",
        capturedAt: "2026-05-05T00:00:00.000Z",
        confidence: 0,
      },
    ],
    miniMetrics: [
      {
        id: "source",
        label: "Source",
        value: "fixture",
        icon: "activity",
        color: "#000000",
        truthClass: "MOCK",
        sourceId: "fixture:mini:source",
        capturedAt: "2026-05-05T00:00:00.000Z",
        confidence: 0,
      },
    ],
    deltaRows: [],
    gateSteps: [],
  };
}

function expectAccept(name, fixture) {
  const accepted = guardFixtureSnapshot(fixture);
  assert(accepted === fixture, `${name} should return the original fixture`);
}

function expectReject(name, fixture, expectedIssue) {
  try {
    guardFixtureSnapshot(fixture);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    assert(message.includes("Dashboard snapshot rejected by guard"), `${name} must use guard rejection message`);
    assert(message.includes(expectedIssue), `${name} must reject on ${expectedIssue}; got ${message}`);
    return;
  }
  throw new Error(`${name} should have been rejected`);
}

expectAccept("valid mock snapshot", validSnapshot());
expectReject("wrong surface", { ...validSnapshot(), surface: "other-dashboard" }, "surface");
expectReject("unknown truth class", { ...validSnapshot(), truthClass: "CERTAIN" }, "truthClass");
expectReject("execution enabled", { ...validSnapshot(), executionEligible: true }, "executionEligible");
expectReject("private data enabled", { ...validSnapshot(), privateData: true }, "privateData");
expectReject("broker connected", { ...validSnapshot(), brokerConnected: true }, "brokerConnected");
expectReject("missing heroes", { ...validSnapshot(), heroMetrics: [] }, "heroMetrics");
expectReject("missing minis", { ...validSnapshot(), miniMetrics: [] }, "miniMetrics");
expectReject("hero main below range", { ...validSnapshot(), heroMetrics: [{ ...validSnapshot().heroMetrics[0], mainValue: -1 }] }, "regime.mainValue");
expectReject("hero main above range", { ...validSnapshot(), heroMetrics: [{ ...validSnapshot().heroMetrics[0], mainValue: 101 }] }, "regime.mainValue");
expectReject("hero secondary below range", { ...validSnapshot(), heroMetrics: [{ ...validSnapshot().heroMetrics[0], secondaryValue: -1 }] }, "regime.secondaryValue");
expectReject("hero secondary above range", { ...validSnapshot(), heroMetrics: [{ ...validSnapshot().heroMetrics[0], secondaryValue: 101 }] }, "regime.secondaryValue");
expectReject("hero missing source", { ...validSnapshot(), heroMetrics: [{ ...validSnapshot().heroMetrics[0], sourceId: "" }] }, "regime.sourceId");
expectReject("hero missing capture time", { ...validSnapshot(), heroMetrics: [{ ...validSnapshot().heroMetrics[0], capturedAt: "" }] }, "regime.capturedAt");

console.log("Dashboard snapshot fixture guard: PASS");
