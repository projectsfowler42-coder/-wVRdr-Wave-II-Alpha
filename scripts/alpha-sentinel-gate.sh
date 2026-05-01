#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${ALPHA_BRIDGE_URL:-http://127.0.0.1:8089}"
TMP_DIR="${TMPDIR:-/tmp}/wvrdr-alpha-sentinel"
mkdir -p "${TMP_DIR}"

truth_file="${TMP_DIR}/truth.json"
snapshot_file="${TMP_DIR}/snapshot.json"
five_file="${TMP_DIR}/five-things.json"
intent_file="${TMP_DIR}/operator-intent.json"

curl --fail --silent "${BASE_URL}/api/truth" | tee "${truth_file}"
grep '"schema": "wvrdr.alpha.truth.v1"' "${truth_file}" >/dev/null
grep '"source": "SCHWAB"' "${truth_file}" >/dev/null
grep '"status": "DEGRADED"' "${truth_file}" >/dev/null
grep '"truthClass": "UNRESOLVED"' "${truth_file}" >/dev/null
grep '"executionEligible": false' "${truth_file}" >/dev/null
grep '"networkEnabled": false' "${truth_file}" >/dev/null
grep '"credentialsUsed": false' "${truth_file}" >/dev/null
if grep '"status": "LIVE"' "${truth_file}" >/dev/null; then
  echo "Sentinel failure: fake LIVE status found in truth envelope" >&2
  exit 1
fi
if grep '"truthClass": "RAW_MARKET"' "${truth_file}" >/dev/null; then
  echo "Sentinel failure: fake RAW_MARKET truth class found in dormant mode" >&2
  exit 1
fi

curl --fail --silent "${BASE_URL}/api/snapshot" | tee "${snapshot_file}"
grep '"schema": "wvrdr.alpha.cockpit.snapshot.v1"' "${snapshot_file}" >/dev/null
grep '"mode": "DEGRADED"' "${snapshot_file}" >/dev/null
grep '"Broker execution locked"' "${snapshot_file}" >/dev/null

curl --fail --silent "${BASE_URL}/api/telemetry/five-things" | tee "${five_file}"
grep '"schema": "wvrdr.alpha.telemetry.five_things.v1"' "${five_file}" >/dev/null
grep '"status": "OPERATOR_REVIEW"' "${five_file}" >/dev/null
grep '"executionEligible": false' "${five_file}" >/dev/null
grep '"label": "Truth Bridge"' "${five_file}" >/dev/null
grep '"label": "Schwab Socket"' "${five_file}" >/dev/null
grep '"label": "Network Transport"' "${five_file}" >/dev/null
grep '"label": "Credentials"' "${five_file}" >/dev/null
grep '"label": "Execution Gate"' "${five_file}" >/dev/null
if grep -E 'Net Liquidity|Credit Spreads|BKLN / JAAA Ratio|Zeitgeist Momentum' "${five_file}" >/dev/null; then
  echo "Sentinel failure: unproven market telemetry found in Five Things" >&2
  exit 1
fi

curl --fail --silent \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"kind":"sentinel_probe"}' \
  "${BASE_URL}/api/operator/intent" | tee "${intent_file}"
grep '"ok": true' "${intent_file}" >/dev/null
grep '"status": "recorded_no_execution"' "${intent_file}" >/dev/null
grep '"executionEligible": false' "${intent_file}" >/dev/null

echo "Alpha Sentinel Gate passed."
