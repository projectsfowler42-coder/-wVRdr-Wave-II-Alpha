import type { RepoSafeVaultManifest } from "./bridge.js";

export type RepoSafeManifestIntakeVerdict = "ACCEPT" | "REJECT";

export interface RepoSafeManifestIntakeFinding {
  severity: "PASS" | "WATCH" | "BLOCK";
  code: string;
  message: string;
}

export interface RepoSafeManifestIntakeDecision {
  verdict: RepoSafeManifestIntakeVerdict;
  manifestId?: string;
  sourceCount: number;
  findings: RepoSafeManifestIntakeFinding[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function sourceHasPath(source: unknown): boolean {
  return isObject(source) && hasOwn(source, "pathOrUrl");
}

export function evaluateRepoSafeManifestIntake(input: unknown): RepoSafeManifestIntakeDecision {
  const findings: RepoSafeManifestIntakeFinding[] = [];

  if (!isObject(input)) {
    return {
      verdict: "REJECT",
      sourceCount: 0,
      findings: [{ severity: "BLOCK", code: "NOT_OBJECT", message: "Manifest intake requires a JSON object." }],
    };
  }

  if (input.deviceScope !== "REPO_SAFE_PROJECTION") {
    findings.push({
      severity: "BLOCK",
      code: "WRONG_DEVICE_SCOPE",
      message: "Only REPO_SAFE_PROJECTION manifests may enter the app/repo layer.",
    });
  }

  if (hasOwn(input, "files")) {
    findings.push({
      severity: "BLOCK",
      code: "RAW_FILE_PROBES_PRESENT",
      message: "Repo-safe intake rejects manifests containing raw local file probes.",
    });
  }

  const exportPolicy = isObject(input.exportPolicy) ? input.exportPolicy : undefined;
  if (!exportPolicy) {
    findings.push({ severity: "BLOCK", code: "MISSING_EXPORT_POLICY", message: "Repo-safe manifest requires exportPolicy." });
  } else {
    if (exportPolicy.rawRowsMayLeaveDevice !== false) {
      findings.push({ severity: "BLOCK", code: "RAW_ROWS_POLICY_INVALID", message: "rawRowsMayLeaveDevice must be false." });
    }
    if (exportPolicy.containsLocalPaths !== false) {
      findings.push({ severity: "BLOCK", code: "LOCAL_PATH_POLICY_INVALID", message: "containsLocalPaths must be false." });
    }
    if (exportPolicy.containsRawFileProbes !== false) {
      findings.push({ severity: "BLOCK", code: "RAW_PROBES_POLICY_INVALID", message: "containsRawFileProbes must be false." });
    }
  }

  const sources = Array.isArray(input.sourceManifests) ? input.sourceManifests : [];
  if (!Array.isArray(input.sourceManifests)) {
    findings.push({ severity: "BLOCK", code: "SOURCE_MANIFESTS_NOT_ARRAY", message: "sourceManifests must be an array." });
  }

  sources.forEach((source, index) => {
    if (sourceHasPath(source)) {
      findings.push({
        severity: "BLOCK",
        code: "SOURCE_PATH_PRESENT",
        message: `sourceManifests[${index}] exposes pathOrUrl and cannot enter the app/repo layer.`,
      });
    }
  });

  if (sources.length === 0) {
    findings.push({ severity: "WATCH", code: "NO_SOURCES", message: "Manifest contains no source manifests." });
  }

  const blocked = findings.some((finding) => finding.severity === "BLOCK");
  if (!blocked) {
    findings.push({ severity: "PASS", code: "REPO_SAFE_INTAKE_ACCEPTED", message: "Manifest passed repo-safe intake gate." });
  }

  return {
    verdict: blocked ? "REJECT" : "ACCEPT",
    manifestId: typeof input.manifestId === "string" ? input.manifestId : undefined,
    sourceCount: sources.length,
    findings,
  };
}

export function assertRepoSafeManifestIntake(input: unknown): RepoSafeVaultManifest {
  const decision = evaluateRepoSafeManifestIntake(input);
  if (decision.verdict !== "ACCEPT") {
    throw new Error(`Repo-safe manifest intake rejected: ${decision.findings.map((finding) => finding.code).join(",")}`);
  }
  return input as RepoSafeVaultManifest;
}
