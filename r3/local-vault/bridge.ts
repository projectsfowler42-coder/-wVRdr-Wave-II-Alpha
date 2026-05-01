import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { R3SourceManifestRecord } from "../contracts.js";

export type LocalVaultKind = "CSV" | "PDF" | "SQLITE" | "DUCKDB" | "PARQUET" | "JSON" | "UNKNOWN";
export type LocalVaultSensitivity = "PUBLIC" | "REDACTED" | "PRIVATE" | "SECRET";

export interface LocalVaultFileProbe {
  absolutePath: string;
  exists: boolean;
  kind: LocalVaultKind;
  sizeBytes?: number;
  sha256Prefix?: string;
  sensitivity: LocalVaultSensitivity;
  notes: string[];
}

export interface LocalVaultManifest {
  manifestId: string;
  generatedAt: string;
  deviceScope: "TRUSTED_LOCAL_DEVICE";
  files: LocalVaultFileProbe[];
  sourceManifests: R3SourceManifestRecord[];
  exportPolicy: {
    rawRowsMayLeaveDevice: false;
    allowedRepoArtifacts: string[];
    deniedRepoArtifacts: string[];
  };
}

function inferKind(filePath: string): LocalVaultKind {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".csv") return "CSV";
  if (ext === ".pdf") return "PDF";
  if (ext === ".sqlite" || ext === ".db") return "SQLITE";
  if (ext === ".duckdb") return "DUCKDB";
  if (ext === ".parquet") return "PARQUET";
  if (ext === ".json") return "JSON";
  return "UNKNOWN";
}

function inferSensitivity(filePath: string): LocalVaultSensitivity {
  const lower = filePath.toLowerCase();
  if (lower.includes("secret") || lower.includes("token") || lower.includes("private-key")) return "SECRET";
  if (lower.includes("redacted")) return "REDACTED";
  if (lower.includes("confirmation") || lower.includes("confirmed_seed") || lower.includes("broker") || lower.includes("schwab")) return "PRIVATE";
  return "PRIVATE";
}

function sha256Prefix(bytes: Buffer): string {
  return crypto.createHash("sha256").update(bytes).digest("hex").slice(0, 16);
}

export function probeLocalVaultFile(filePath: string): LocalVaultFileProbe {
  const absolutePath = path.resolve(filePath);
  const exists = fs.existsSync(absolutePath);
  const notes: string[] = [];

  if (!exists) {
    notes.push("File not found on trusted device.");
    return {
      absolutePath,
      exists: false,
      kind: inferKind(filePath),
      sensitivity: inferSensitivity(filePath),
      notes,
    };
  }

  const stat = fs.statSync(absolutePath);
  const bytes = fs.readFileSync(absolutePath);
  const sensitivity = inferSensitivity(filePath);

  if (sensitivity === "PRIVATE" || sensitivity === "SECRET") {
    notes.push("Raw file must remain on trusted local device.");
  }

  return {
    absolutePath,
    exists: true,
    kind: inferKind(filePath),
    sizeBytes: stat.size,
    sha256Prefix: sha256Prefix(bytes),
    sensitivity,
    notes,
  };
}

export function buildLocalVaultManifest(args: {
  manifestId: string;
  files: string[];
  sourceTitlePrefix?: string;
}): LocalVaultManifest {
  const probes = args.files.map(probeLocalVaultFile);
  const sourceManifests: R3SourceManifestRecord[] = probes.map((probe, index) => {
    const record: R3SourceManifestRecord = {
      sourceId: `${args.manifestId}:source:${index + 1}`,
      kind: probe.kind === "CSV" || probe.kind === "PDF" ? "BROKER_EXPORT" : "UNKNOWN",
      status: probe.exists ? "LOADED" : "MISSING",
      title: `${args.sourceTitlePrefix ?? "Local vault source"} ${index + 1}`,
      licenseStatus: "INTERNAL",
      confidence: probe.exists ? 0.8 : 0,
      notes: [
        ...probe.notes,
        probe.sha256Prefix ? `sha256Prefix:${probe.sha256Prefix}` : "no checksum",
        "Raw rows are not exported to repo/app bundle.",
      ],
    };

    if (probe.sensitivity === "PUBLIC" || probe.sensitivity === "REDACTED") {
      record.pathOrUrl = probe.absolutePath;
    }

    return record;
  });

  return {
    manifestId: args.manifestId,
    generatedAt: new Date().toISOString(),
    deviceScope: "TRUSTED_LOCAL_DEVICE",
    files: probes,
    sourceManifests,
    exportPolicy: {
      rawRowsMayLeaveDevice: false,
      allowedRepoArtifacts: ["schema", "redacted-template", "checksum-prefix", "source-status", "aggregate-derived-state"],
      deniedRepoArtifacts: ["raw-broker-row", "account-number", "secret-token", "private-key", "unredacted-confirmation"],
    },
  };
}

export function writeLocalVaultManifest(manifest: LocalVaultManifest, outPath: string): void {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
}
