#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../packages/mdk"

echo "Running MDK Security Sentinel"
echo "Scope: packages/mdk Python scaffold"
echo "Checks: bandit + pip-audit"

python -m pip install --upgrade pip
python -m pip install -e '.[security]'

python -m bandit -c pyproject.toml -r app
python -m pip_audit

echo "MDK Security Sentinel passed."
