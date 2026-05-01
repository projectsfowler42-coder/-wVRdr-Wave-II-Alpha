import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const scanRoots = process.argv.slice(2);
const targets = scanRoots.length > 0 ? scanRoots : ["."];

const denyFileNamePatterns = [
  /confirmed_seed\.csv$/i,
  /confirmation.*\.csv$/i,
  /broker.*\.csv$/i,
  /schwab.*\.csv$/i,
  /confirm.*\.pdf$/i,
  /\.env$/i,
];

const sensitiveContentPatterns = [
  { code: "BROKER_CONFIRMATION", pattern: /BROKER_CONFIRMATION/i, severity: "BLOCK" },
  { code: "SCHWAB", pattern: /\bSchwab\b/i, severity: "BLOCK" },
  { code: "MARGIN_PAYMENT", pattern: /\bMargin\b/i, severity: "WATCH" },
  { code: "CUSIP", pattern: /\b\d{3}[A-Z0-9]{5}\d\b/, severity: "WATCH" },
  { code: "ACCOUNT_HINT", pattern: /\b(account|acct)\b/i, severity: "WATCH" },
  { code: "SECRET_TOKEN", pattern: /(api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret)/i, severity: "BREACH" },
  { code: "PRIVATE_KEY", pattern: /-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/i, severity: "BREACH" },
];

const allowedDirs = new Set([
  ".git",
  "node_modules",
  ".r3-build",
  "dist",
  "build",
  "coverage",
  "out",
]);

const policyLexiconFiles = new Set([
  ".gitignore",
  "r3/security/mdk-security-sentinel.mjs",
  "r3/local-vault/README.md",
  "r3/local-vault/bridge.ts",
]);

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function severityRank(severity) {
  return { PASS: 0, WATCH: 1, BLOCK: 2, BREACH: 3 }[severity] ?? 0;
}

function worst(a, b) {
  return severityRank(a) >= severityRank(b) ? a : b;
}

function walk(entry, files = []) {
  const full = path.resolve(root, entry);
  if (!fs.existsSync(full)) return files;
  const stat = fs.statSync(full);
  const base = path.basename(full);
  if (stat.isDirectory()) {
    if (allowedDirs.has(base)) return files;
    for (const child of fs.readdirSync(full)) walk(path.relative(root, path.join(full, child)), files);
  } else if (stat.isFile()) {
    files.push(path.relative(root, full));
  }
  return files;
}

function isRedactedTemplate(file, text) {
  if (!file.endsWith(".redacted.csv")) return false;
  const unsafeRawValue = /\b(?:\d{4,}|[A-Z]{2,5}\d{2,}|\d+\.\d{2})\b/.test(text.replace(/YYYY-MM-DD/g, ""));
  const hasRedactedMarkers = /REDACTED_|,0,0,0,0,/.test(text);
  return hasRedactedMarkers && !unsafeRawValue;
}

function isPolicyLexiconFile(file) {
  return policyLexiconFiles.has(file) || file.endsWith(".md") || file.includes("/README");
}

function applyFinding(result, finding) {
  result.verdict = worst(result.verdict, finding.severity);
  result.findings.push(finding);
}

function inspectFile(file) {
  const result = {
    file,
    sha256: null,
    verdict: "PASS",
    classification: "NORMAL",
    findings: [],
  };

  const full = path.join(root, file);
  const bytes = fs.readFileSync(full);
  result.sha256 = sha256(bytes).slice(0, 16);

  if (bytes.length > 1024 * 1024) {
    applyFinding(result, { severity: "WATCH", code: "LARGE_FILE", message: "Large file requires review before commit." });
    return result;
  }

  const text = bytes.toString("utf8");
  const redactedTemplate = isRedactedTemplate(file, text);
  const policyLexicon = isPolicyLexiconFile(file);

  if (redactedTemplate) result.classification = "REDACTED_TEMPLATE";
  else if (policyLexicon) result.classification = "POLICY_LEXICON";

  for (const pattern of denyFileNamePatterns) {
    if (pattern.test(file)) {
      const severity = redactedTemplate ? "WATCH" : "BLOCK";
      applyFinding(result, {
        severity,
        code: redactedTemplate ? "REDACTED_TEMPLATE_DENY_NAME" : "DENY_FILENAME",
        message: redactedTemplate
          ? "Filename resembles private data but is explicitly redacted template."
          : "Filename matches private/broker-data deny pattern.",
      });
    }
  }

  for (const detector of sensitiveContentPatterns) {
    if (!detector.pattern.test(text)) continue;

    if (redactedTemplate) {
      applyFinding(result, {
        severity: "WATCH",
        code: `REDACTED_TEMPLATE_${detector.code}`,
        message: "Sensitive label appears only inside a redacted template.",
      });
      continue;
    }

    if (policyLexicon) {
      applyFinding(result, {
        severity: "WATCH",
        code: `POLICY_LEXICON_${detector.code}`,
        message: "Sensitive term appears in policy/scanner/documentation context.",
      });
      continue;
    }

    applyFinding(result, { severity: detector.severity, code: detector.code, message: "Sensitive content pattern matched." });
  }

  return result;
}

const files = targets.flatMap((target) => walk(target));
const inspected = files.map(inspectFile);
const overall = inspected.reduce((verdict, file) => worst(verdict, file.verdict), "PASS");
const blocked = inspected.filter((file) => ["BLOCK", "BREACH"].includes(file.verdict));

const report = {
  generatedAt: new Date().toISOString(),
  audit: "MDK Security Sentinel",
  overall,
  scannedFiles: inspected.length,
  blockedFiles: blocked.map((file) => ({ file: file.file, verdict: file.verdict, findings: file.findings })),
  inspected,
  policy: {
    rawUserFinancialData: "trusted-device-only",
    publicRepoAllowed: ["schemas", "redacted templates", "checksums", "source manifests", "scanner code", "security policy docs"],
    publicRepoDenied: ["broker confirmation rows", "exact private account positions", "secret tokens", "private keys"],
  },
};

fs.mkdirSync(path.join(root, "r3/security/out"), { recursive: true });
fs.writeFileSync(path.join(root, "r3/security/out/mdk-security-sentinel-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

if (["BLOCK", "BREACH"].includes(overall)) {
  process.exit(1);
}
