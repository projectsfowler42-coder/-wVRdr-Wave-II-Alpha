#!/usr/bin/env bash
set -euo pipefail

# ~wVRdr~ Wave-II~Alpha wholesale importer
# Source:  projectsfowler42-coder/wave-rider-intelligence
# Target:  this Wave-II~Alpha repo
# Import location: imports/wave-rider-intelligence
#
# This does not wire imported code into runtime. It preserves the intelligence
# repo as a quarantined source corpus for Wave-II~Alpha review, extraction,
# and promotion.

SOURCE_REPO="${SOURCE_REPO:-https://github.com/projectsfowler42-coder/wave-rider-intelligence.git}"
SOURCE_REF="${SOURCE_REF:-main}"
IMPORT_DIR="${IMPORT_DIR:-imports/wave-rider-intelligence}"
WORK_DIR="${WORK_DIR:-.tmp/wave-rider-intelligence-import}"

printf '==> Importing %s#%s into %s\n' "$SOURCE_REPO" "$SOURCE_REF" "$IMPORT_DIR"

rm -rf "$WORK_DIR"
mkdir -p "$(dirname "$WORK_DIR")"

git clone --depth 1 --branch "$SOURCE_REF" "$SOURCE_REPO" "$WORK_DIR"

rm -rf "$IMPORT_DIR"
mkdir -p "$IMPORT_DIR"

# Copy source wholesale while excluding only git metadata and dependency/build
# caches that would corrupt or bloat the target repo. Source code, docs, config,
# artifacts, and scripts are preserved.
rsync -a \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.pnpm-store/' \
  --exclude '.turbo/' \
  --exclude '.cache/' \
  --exclude 'dist/' \
  --exclude 'build/' \
  --exclude 'coverage/' \
  "$WORK_DIR/" "$IMPORT_DIR/"

mkdir -p docs/imports
cat > docs/imports/wave-rider-intelligence-import-manifest.txt <<EOF
~wVRdr~ Wave-II~Alpha Intelligence Import Manifest

Source repo: $SOURCE_REPO
Source ref: $SOURCE_REF
Import dir: $IMPORT_DIR
Imported at: $(date -u +%Y-%m-%dT%H:%M:%SZ)

Boundary:
- Imported code is quarantined source corpus.
- No imported module is runtime-active merely because it exists here.
- No broker execution is enabled.
- No fake LIVE state is created.
- Wave-I cockpit runtime is not mutated by this import.

Promotion rule:
Any imported intelligence code must be extracted through review, tests, Truth Spine validation,
and explicit Wave-II~Alpha promotion before it can affect runtime behavior.
EOF

rm -rf "$WORK_DIR"

printf '==> Done. Review with:\n'
printf '    git status --short\n'
printf '    git diff --stat\n'
printf '    less docs/imports/wave-rider-intelligence-import-manifest.txt\n'
