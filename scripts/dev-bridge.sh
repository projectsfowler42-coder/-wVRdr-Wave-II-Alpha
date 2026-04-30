#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Starting ~wVRdr~ Wave-II~Alpha local truth bridge"
echo "Bridge: http://127.0.0.1:8089"
echo "Mode: READ_ONLY_DORMANT"
echo "No credentials, OAuth, live transport, or live orders are enabled."

go run ./packages/mdk/cmd/truth-bridge
