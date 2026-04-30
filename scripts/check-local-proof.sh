#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${ALPHA_BRIDGE_URL:-http://127.0.0.1:8089}"
TMP_DIR="${TMPDIR:-/tmp}/wvrdr-alpha-proof"
mkdir -p "${TMP_DIR}"

health_file="${TMP_DIR}/health.json"
api_health_file="${TMP_DIR}/api-health.json"
truth_file="${TMP_DIR}/truth.json"
snapshot_file="${TMP_DIR}/snapshot.json"
intent_file="${TMP_DIR}/operator-intent.json"

curl --fail --silent "${BASE_URL}/health" | tee "${health_file}"
grep '"status": "ok"' "${health_file}" >/dev/null

curl --fail --silent "${BASE_URL}/api/health" | tee "${api_health_file}"
grep '"status": "ok"' "${api_health_file}" >/dev/null
grep '"mode": "READ_ONLY_DORMANT"' "${api_health_file}" >/dev/null
grep '"executionEligible": false' "${api_health_file}" >/dev/null

curl --fail --silent "${BASE_URL}/api/truth" | tee "${truth_file}"
grep '"schema": "wvrdr.alpha.truth.v1"' "${truth_file}" >/dev/null
grep '"source": "SCHWAB"' "${truth_file}" >/dev/null
grep '"status": "DEGRADED"' "${truth_file}" >/dev/null
grep '"truthClass": "UNRESOLVED"' "${truth_file}" >/dev/null
grep '"executionEligible": false' "${truth_file}" >/dev/null
grep '"networkEnabled": false' "${truth_file}" >/dev/null
grep '"credentialsUsed": false' "${truth_file}" >/dev/null

curl --fail --silent "${BASE_URL}/api/snapshot" | tee "${snapshot_file}"
grep '"schema": "wvrdr.alpha.cockpit.snapshot.v1"' "${snapshot_file}" >/dev/null
grep '"name": "~wVRdr~ Wave-II~Alpha"' "${snapshot_file}" >/dev/null
grep '"mode": "DEGRADED"' "${snapshot_file}" >/dev/null
grep '"executionEligible": false' "${snapshot_file}" >/dev/null
grep '"Broker execution locked"' "${snapshot_file}" >/dev/null

curl --fail --silent \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"kind":"local_proof_probe"}' \
  "${BASE_URL}/api/operator/intent" | tee "${intent_file}"
grep '"ok": true' "${intent_file}" >/dev/null
grep '"status": "recorded_no_execution"' "${intent_file}" >/dev/null
grep '"executionEligible": false' "${intent_file}" >/dev/null

echo "~wVRdr~ Wave-II~Alpha local proof passed."
