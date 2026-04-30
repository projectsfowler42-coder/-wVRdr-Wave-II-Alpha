#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

export VITE_API_BASE_URL="${VITE_API_BASE_URL:-http://127.0.0.1:8089}"
export VITE_PUBLIC_READ_TOKEN="${VITE_PUBLIC_READ_TOKEN:-}"

echo "Starting ~wVRdr~ Wave-II~Alpha cockpit"
echo "API: ${VITE_API_BASE_URL}"
echo "Mode: read-only local bridge"
echo "No credentials, OAuth, live transport, or live orders are enabled."

pnpm --filter @wvrdr/wave-i-cockpit dev
