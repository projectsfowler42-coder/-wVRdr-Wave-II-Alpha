import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function fail(message) {
  throw new Error(message);
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "r3-vault-cli-"));
const inputFile = path.join(tempDir, "broker_confirmed_seed.csv");
const outFile = path.join(tempDir, "manifest.json");

fs.writeFileSync(inputFile, "ticker,quantity,price\nREDACTED,0,0\n");

execFileSync(
  process.execPath,
  [
    ".r3-build/local-vault/make-manifest.js",
    "--id",
    "cli-smoke-test",
    "--out",
    outFile,
    inputFile,
  ],
  { stdio: "inherit" },
);

if (!fs.existsSync(outFile)) {
  fail("Vault CLI did not write manifest output file.");
}

const manifest = JSON.parse(fs.readFileSync(outFile, "utf8"));
const source = manifest.sourceManifests?.[0];

if (manifest.manifestId !== "cli-smoke-test") {
  fail("Vault CLI manifest id mismatch.");
}

if (manifest.exportPolicy?.rawRowsMayLeaveDevice !== false) {
  fail("Vault CLI manifest must preserve rawRowsMayLeaveDevice=false.");
}

if (!source) {
  fail("Vault CLI manifest missing first source manifest.");
}

if (Object.prototype.hasOwnProperty.call(source, "pathOrUrl")) {
  fail("Vault CLI exposed pathOrUrl for private input file.");
}

if (!source.notes?.some((note) => String(note).startsWith("sha256Prefix:"))) {
  fail("Vault CLI manifest missing checksum prefix note.");
}

console.log("R3 vault CLI smoke test passed.");
