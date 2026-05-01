const state = {
  polling: false,
  pollTimer: null,
  lastManifest: null,
};

const modeBadge = document.querySelector("#modeBadge");
const truthBadge = document.querySelector("#truthBadge");
const clockBadge = document.querySelector("#clockBadge");
const viewerState = document.querySelector("#viewerState");
const viewerSubstate = document.querySelector("#viewerSubstate");
const manifestInput = document.querySelector("#manifestInput");
const manifestResult = document.querySelector("#manifestResult");
const eventLog = document.querySelector("#eventLog");
const pollUrl = document.querySelector("#pollUrl");
const pollStatus = document.querySelector("#pollStatus");
const togglePollButton = document.querySelector("#togglePollButton");

const demoManifest = {
  manifestId: "demo-repo-safe-001",
  generatedAt: new Date().toISOString(),
  deviceScope: "REPO_SAFE_PROJECTION",
  sourceManifests: [
    {
      sourceId: "demo:source:1",
      kind: "BROKER_EXPORT",
      status: "LOADED",
      title: "Trusted local vault source 1",
      licenseStatus: "INTERNAL",
      confidence: 0.8,
      notes: ["sha256Prefix:demo000000000001", "Repo-safe projection: local path stripped."],
    },
  ],
  sourceCount: 1,
  privateSourceCount: 1,
  redactedSourceCount: 0,
  exportPolicy: {
    rawRowsMayLeaveDevice: false,
    containsLocalPaths: false,
    containsRawFileProbes: false,
    allowedRepoArtifacts: ["source-status", "checksum-prefix", "aggregate-derived-state", "redacted-source-count"],
  },
};

function nowStamp() {
  return new Date().toLocaleTimeString([], { hour12: false });
}

function logEvent(kind, message, payload) {
  const item = document.createElement("li");
  item.textContent = `[${nowStamp()}] ${kind}: ${message}${payload ? `\n${JSON.stringify(payload, null, 2)}` : ""}`;
  eventLog.prepend(item);
}

function setViewer(status, substate, truth = "REPO_SAFE_PROJECTION ONLY") {
  viewerState.textContent = status;
  viewerSubstate.textContent = substate;
  truthBadge.textContent = truth;
}

function updateClock() {
  clockBadge.textContent = nowStamp();
}

function validateRepoSafeManifest(manifest) {
  const findings = [];

  if (!manifest || typeof manifest !== "object") {
    findings.push({ severity: "BLOCK", code: "NOT_OBJECT", message: "Manifest must be a JSON object." });
    return findings;
  }

  if (manifest.deviceScope !== "REPO_SAFE_PROJECTION") {
    findings.push({ severity: "BLOCK", code: "WRONG_DEVICE_SCOPE", message: "Only REPO_SAFE_PROJECTION manifests may enter viewer/app layer." });
  }

  if (Array.isArray(manifest.files)) {
    findings.push({ severity: "BLOCK", code: "RAW_FILE_PROBES_PRESENT", message: "Repo-safe manifest must not include raw local file probes." });
  }

  if (manifest.exportPolicy?.rawRowsMayLeaveDevice !== false) {
    findings.push({ severity: "BLOCK", code: "RAW_ROWS_POLICY_INVALID", message: "rawRowsMayLeaveDevice must be false." });
  }

  if (manifest.exportPolicy?.containsLocalPaths !== false) {
    findings.push({ severity: "BLOCK", code: "LOCAL_PATH_POLICY_INVALID", message: "containsLocalPaths must be false." });
  }

  if (manifest.exportPolicy?.containsRawFileProbes !== false) {
    findings.push({ severity: "BLOCK", code: "RAW_PROBES_POLICY_INVALID", message: "containsRawFileProbes must be false." });
  }

  const sources = Array.isArray(manifest.sourceManifests) ? manifest.sourceManifests : [];
  if (sources.length === 0) {
    findings.push({ severity: "WATCH", code: "NO_SOURCES", message: "Manifest has no source manifests." });
  }

  for (const source of sources) {
    if (Object.prototype.hasOwnProperty.call(source, "pathOrUrl")) {
      findings.push({ severity: "BLOCK", code: "SOURCE_PATH_PRESENT", message: `Source ${source.sourceId ?? "unknown"} exposes pathOrUrl.` });
    }
  }

  return findings;
}

function renderManifest(manifest) {
  const findings = validateRepoSafeManifest(manifest);
  const blocked = findings.some((finding) => finding.severity === "BLOCK" || finding.severity === "BREACH");
  const sourceCount = Array.isArray(manifest?.sourceManifests) ? manifest.sourceManifests.length : 0;

  state.lastManifest = manifest;

  manifestResult.textContent = JSON.stringify({
    accepted: !blocked,
    manifestId: manifest?.manifestId ?? null,
    deviceScope: manifest?.deviceScope ?? null,
    sourceCount,
    findings,
  }, null, 2);

  if (blocked) {
    setViewer("BLOCKED", "Manifest rejected by repo-safe viewer gate.", "INTAKE BLOCKED");
    modeBadge.textContent = "SAFE_MODE";
    logEvent("BLOCK", "Manifest rejected", findings);
    return;
  }

  setViewer("WATCHING", `${sourceCount} repo-safe source manifest(s) loaded.`, "REPO_SAFE_PROJECTION");
  modeBadge.textContent = "SAFE_MODE";
  logEvent("PASS", "Manifest accepted by preview gate", { manifestId: manifest.manifestId, sourceCount });
}

function parseManifestInput() {
  try {
    const manifest = JSON.parse(manifestInput.value);
    renderManifest(manifest);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    manifestResult.textContent = `JSON parse failed: ${message}`;
    setViewer("ERROR", "Manifest JSON could not be parsed.", "PARSE FAILED");
    logEvent("ERROR", "JSON parse failed", { message });
  }
}

async function pollOnce() {
  const url = pollUrl.value.trim();
  if (!url) {
    pollStatus.textContent = "No poll URL configured.";
    return;
  }

  pollStatus.textContent = `Polling ${url} ...`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const manifest = await response.json();
    manifestInput.value = JSON.stringify(manifest, null, 2);
    renderManifest(manifest);
    pollStatus.textContent = `Last poll succeeded at ${nowStamp()}.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    pollStatus.textContent = `Poll failed: ${message}`;
    logEvent("WATCH", "Poll failed", { url, message });
  }
}

function togglePolling() {
  state.polling = !state.polling;
  togglePollButton.textContent = state.polling ? "Stop polling" : "Start polling";
  logEvent("INFO", state.polling ? "Polling started" : "Polling stopped");

  if (state.pollTimer) {
    clearInterval(state.pollTimer);
    state.pollTimer = null;
  }

  if (state.polling) {
    pollOnce();
    state.pollTimer = setInterval(pollOnce, 5000);
  }
}

document.querySelector("#loadDemoButton").addEventListener("click", () => {
  manifestInput.value = JSON.stringify(demoManifest, null, 2);
  renderManifest(demoManifest);
});

document.querySelector("#parseManifestButton").addEventListener("click", parseManifestInput);
document.querySelector("#clearManifestButton").addEventListener("click", () => {
  manifestInput.value = "";
  manifestResult.textContent = "No manifest loaded.";
  setViewer("WAITING", "Load a repo-safe manifest or run in simulated design mode.");
  logEvent("INFO", "Manifest cleared");
});
document.querySelector("#pollOnceButton").addEventListener("click", pollOnce);
togglePollButton.addEventListener("click", togglePolling);

updateClock();
setInterval(updateClock, 1000);
logEvent("BOOT", "R3 preview shell initialized in SAFE_MODE");
