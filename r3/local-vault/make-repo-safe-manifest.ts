#!/usr/bin/env node
import fs from "node:fs";
import { buildRepoSafeVaultManifest, writeRepoSafeVaultManifest } from "./bridge.js";
import type { LocalVaultManifest } from "./bridge.js";

function printUsage(): void {
  console.log(`Usage:
  node .r3-build/local-vault/make-repo-safe-manifest.js --in <local-manifest-json> --out <repo-safe-json>

Purpose:
  Create a repo-safe projection from a trusted-device local vault manifest.

Example:
  node .r3-build/local-vault/make-repo-safe-manifest.js --in r3/local-vault/out/control-room-001.json --out r3/local-vault/out/control-room-001.repo-safe.json
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

const inPath = readArgValue(args, "--in");
const outPath = readArgValue(args, "--out") ?? "r3/local-vault/out/local-vault-manifest.repo-safe.json";

if (!inPath) {
  console.error("Missing required --in <local-manifest-json> argument.");
  printUsage();
  process.exit(1);
}

const localManifest = JSON.parse(fs.readFileSync(inPath, "utf8")) as LocalVaultManifest;
const repoSafeManifest = buildRepoSafeVaultManifest(localManifest);
writeRepoSafeVaultManifest(repoSafeManifest, outPath);

console.log(`Wrote repo-safe vault manifest: ${outPath}`);
console.log(JSON.stringify({
  manifestId: repoSafeManifest.manifestId,
  deviceScope: repoSafeManifest.deviceScope,
  sourceCount: repoSafeManifest.sourceCount,
  privateSourceCount: repoSafeManifest.privateSourceCount,
  redactedSourceCount: repoSafeManifest.redactedSourceCount,
  rawRowsMayLeaveDevice: repoSafeManifest.exportPolicy.rawRowsMayLeaveDevice,
  containsLocalPaths: repoSafeManifest.exportPolicy.containsLocalPaths,
  containsRawFileProbes: repoSafeManifest.exportPolicy.containsRawFileProbes,
}, null, 2));
