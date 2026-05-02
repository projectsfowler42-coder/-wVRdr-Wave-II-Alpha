#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

const checks = [
  {
    id: 'catalog-dependency-unification',
    file: 'package.json',
    required: ['"react": "catalog:"', '"react-dom": "catalog:"', '"typescript": "catalog:"'],
    summary: 'root workspace uses pnpm catalog dependencies for React/TypeScript surfaces'
  },
  {
    id: 'zombie-fetch-abort',
    file: 'apps/cockpit/src/services/waveApi.ts',
    required: ['REQUEST_TIMEOUT_MS = 3500', 'new AbortController()', 'controller.abort()', 'stale-rescue timeout'],
    summary: 'cockpit bridge fetches abort instead of resolving late into ghost data'
  },
  {
    id: 'pwa-install-shell',
    file: 'apps/cockpit/index.html',
    required: ['rel="manifest" href="/manifest.webmanifest"', 'mobile-web-app-capable', 'theme-color', 'viewport-fit=cover'],
    summary: 'cockpit exposes install-ready PWA shell metadata'
  },
  {
    id: 'pwa-manifest-file',
    file: 'apps/cockpit/public/manifest.webmanifest',
    required: ['"display": "standalone"', '"orientation": "landscape-primary"', '"theme_color": "#F5F0E7"'],
    summary: 'cockpit manifest defines standalone ivory/landscape identity'
  },
  {
    id: 'r3-nodenext-import-gate',
    file: 'package.json',
    required: ['"check:r3-imports": "node scripts/check-r3-nodenext-imports.mjs"', 'pnpm check:r3-imports && pnpm exec tsc -p tsconfig.r3.json'],
    summary: 'R3 executable tests run the NodeNext import gate before TypeScript compile'
  },
  {
    id: 'r3-nodenext-script-present',
    file: 'scripts/check-r3-nodenext-imports.mjs',
    required: ['R3 NodeNext import gate failed', 'runtime .js/.json/.mjs/.cjs extensions', 'r3/**/*.ts'],
    summary: 'NodeNext import gate script exists and reports runtime-extension failures'
  },
  {
    id: 'truth-bridge-device-proof',
    file: 'packages/mdk/cmd/truth-bridge/device_proof.go',
    required: ['WVRDR_DEVICE_HMAC_SECRET', 'X-wVRdr-Fingerprint', 'HMAC_REQUIRED', 'sha256'],
    summary: 'truth bridge supports optional HMAC trusted-device proof'
  },
  {
    id: 'hero-gauges-device-proof',
    file: 'packages/mdk/cmd/truth-bridge/hero_gauges.go',
    required: ['requireDeviceProof', '/api/cockpit/hero-gauges', 'wvrdr.alpha.hero_gauges.v1'],
    summary: 'hero gauge cockpit contract is protected by device proof when enabled'
  },
  {
    id: 'device-proof-docs',
    file: 'docs/r3/truth-bridge-device-proof.md',
    required: ['HMAC_REQUIRED', 'canonical_message', 'raw broker-row export', 'fake LIVE promotion'],
    summary: 'trusted-device proof boundary is documented'
  }
];

const failures = [];
const passes = [];

function readRepoFile(path) {
  const fullPath = join(ROOT, path);
  if (!existsSync(fullPath)) {
    failures.push({ id: 'missing-file', file: path, detail: 'file does not exist' });
    return null;
  }
  return readFileSync(fullPath, 'utf8');
}

for (const check of checks) {
  const content = readRepoFile(check.file);
  if (content === null) continue;

  const missing = check.required.filter((needle) => !content.includes(needle));
  if (missing.length > 0) {
    failures.push({ id: check.id, file: check.file, detail: `missing markers: ${missing.join(', ')}` });
  } else {
    passes.push(check);
  }
}

if (failures.length > 0) {
  console.error('Jenova/Venice remediation gate failed.');
  for (const failure of failures) {
    console.error(`- ${failure.id} :: ${failure.file} :: ${failure.detail}`);
  }
  process.exit(1);
}

console.log('Jenova/Venice remediation gate passed.');
for (const pass of passes) {
  console.log(`- ${pass.id}: ${pass.summary}`);
}
