#!/usr/bin/env node
import { buildLocalVaultManifest, writeLocalVaultManifest } from "./bridge.js";

function printUsage(): void {
  console.log(`Usage:
  node .r3-build/local-vault/make-manifest.js --id <manifest-id> --out <local-output-json> <file...>

Purpose:
  Build a trusted-device local vault manifest without exporting raw rows.

Example:
  node .r3-build/local-vault/make-manifest.js --id control-room-001 --out r3/local-vault/out/control-room-001.json ./private/source.csv
`);
}

function readArgValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index < 0) return undefined;
  return args[index + 1];
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  printUsage();
  process.exit(0);
}

const manifestId = readArgValue(args, "--id") ?? `local-vault-${Date.now()}`;
const outPath = readArgValue(args, "--out") ?? "r3/local-vault/out/local-vault-manifest.json";

const consumed = new Set<number>();
for (const flag of ["--id", "--out"]) {
  const index = args.indexOf(flag);
  if (index >= 0) {
    consumed.add(index);
    consumed.add(index + 1);
  }
}

const files = args.filter((_, index) => !consumed.has(index) && !args[index].startsWith("--"));

if (files.length === 0) {
  console.error("No input files provided.");
  printUsage();
  process.exit(1);
}

const manifest = buildLocalVaultManifest({
  manifestId,
  files,
  sourceTitlePrefix: "Trusted local vault source",
});

writeLocalVaultManifest(manifest, outPath);
console.log(`Wrote local vault manifest: ${outPath}`);
console.log(JSON.stringify({
  manifestId: manifest.manifestId,
  generatedAt: manifest.generatedAt,
  deviceScope: manifest.deviceScope,
  files: manifest.files.map((file) => ({
    exists: file.exists,
    kind: file.kind,
    sensitivity: file.sensitivity,
    sizeBytes: file.sizeBytes,
    sha256Prefix: file.sha256Prefix,
  })),
  rawRowsMayLeaveDevice: manifest.exportPolicy.rawRowsMayLeaveDevice,
}, null, 2));
