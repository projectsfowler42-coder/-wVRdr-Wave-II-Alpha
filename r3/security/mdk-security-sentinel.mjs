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

function inspectFile(file) {
  const result = {
    file,
    sha256: null,
    verdict: "PASS",
    findings: [],
  };

  for (const pattern of denyFileNamePatterns) {
    if (pattern.test(file)) {
      result.verdict = worst(result.verdict, "BLOCK");
      result.findings.push({ severity: "BLOCK", code: "DENY_FILENAME", message: "Filename matches private/broker-data deny pattern." });
    }
  }

  const full = path.join(root, file);
  const bytes = fs.readFileSync(full);
  result.sha256 = sha256(bytes).slice(0, 16);

  if (bytes.length > 1024 * 1024) {
    result.verdict = worst(result.verdict, "WATCH");
    result.findings.push({ severity: "WATCH", code: "LARGE_FILE", message: "Large file requires review before commit." });
    return result;
  }

  const text = bytes.toString("utf8");
  for (const detector of sensitiveContentPatterns) {
    if (detector.pattern.test(text)) {
      result.verdict = worst(result.verdict, detector.severity);
      result.findings.push({ severity: detector.severity, code: detector.code, message: "Sensitive content pattern matched." });
    }
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
    publicRepoAllowed: ["schemas", "redacted templates", "checksums", "source manifests", "scanner code"],
    publicRepoDenied: ["broker confirmation rows", "exact private account positions", "secret tokens", "private keys"],
  },
};

fs.mkdirSync(path.join(root, "r3/security/out"), { recursive: true });
fs.writeFileSync(path.join(root, "r3/security/out/mdk-security-sentinel-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

if (["BLOCK", "BREACH"].includes(overall)) {
  process.exit(1);
}
