#!/usr/bin/env bash
# ~wVRdr~ Wave-II~Alpha escape hatch.
# Reconstructs original repo structures from populated package mirrors.
#
# Non-destructive: writes only to split-output/. Monorepo is untouched.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)"
SPLIT_OUT="${REPO_ROOT}/split-output"

MDK_SRC="${REPO_ROOT}/packages/mdk"
WAVE_I_SRC="${REPO_ROOT}/packages/wave-i"

MDK_DEST="${SPLIT_OUT}/MDK-9000_wVRdr"
WAVE_I_DEST="${SPLIT_OUT}/wVRdr_Wave-I_Build/artifacts/wave-i"

echo "~wVRdr~ Wave-II~Alpha Split Procedure"
echo "  Source root : ${REPO_ROOT}"
echo "  Output root : ${SPLIT_OUT}"
echo ""

if [[ ! -d "${MDK_SRC}" ]]; then
  echo "ERROR: packages/mdk not found. Populate the monorepo first." >&2
  exit 1
fi

if [[ ! -d "${WAVE_I_SRC}" ]]; then
  echo "ERROR: packages/wave-i not found. Populate the monorepo first." >&2
  exit 1
fi

rm -rf "${SPLIT_OUT}"
mkdir -p "${MDK_DEST}"
mkdir -p "${WAVE_I_DEST}"

echo "Copying MDK-9000 -> ${MDK_DEST}"
if command -v rsync >/dev/null 2>&1; then
  rsync -av --exclude='.git' "${MDK_SRC}/" "${MDK_DEST}/"
else
  cp -R "${MDK_SRC}/." "${MDK_DEST}/"
  rm -rf "${MDK_DEST}/.git" 2>/dev/null || true
fi

echo ""
echo "Copying Wave-I  -> ${WAVE_I_DEST}"
if command -v rsync >/dev/null 2>&1; then
  rsync -av --exclude='.git' "${WAVE_I_SRC}/" "${WAVE_I_DEST}/"
else
  cp -R "${WAVE_I_SRC}/." "${WAVE_I_DEST}/"
  rm -rf "${WAVE_I_DEST}/.git" 2>/dev/null || true
fi

echo ""
echo "Split complete."
echo "  MDK-9000 : ${MDK_DEST}"
echo "  Wave-I   : ${WAVE_I_DEST}"
echo ""
echo "Review split-output/ before pushing to origin repos."
