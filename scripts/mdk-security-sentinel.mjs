#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const scanRoots = process.argv.slice(2);
const targets = scanRoots.length > 0 ? scanRoots : ['.'];

const denyFileNamePatterns = [
  /confirmed_seed\.csv$/i,
  /confirmation.*\.csv$/i,
  /broker.*\.csv$/i,
  /schwab.*\.(csv|xlsx|pdf)$/i,
  /confirm.*\.pdf$/i,
  /account.*statement.*\.(csv|xlsx|pdf)$/i,
  /positions.*\.(csv|xlsx|pdf)$/i,
  /\.env$/i,
];

const secretMaterialPattern = /\b(api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret)\b\s*[:=]\s*["'][A-Za-z0-9_./+=:@-]{12,}["']/i;
const diagnosticMissingSecretPattern = /\b[A-Z0-9_]*(API[_-]?KEY|ACCESS[_-]?TOKEN|REFRESH[_-]?TOKEN|CLIENT[_-]?SECRET)\b.*\b(missing|not set|absent|undefined|required)\b/i;
const placeholderSecretPattern = /\b(api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret)\b\s*[:=]\s*["'](changeme|change-me|changeme-secret|your[-_ ]?api[-_ ]?key|your[-_ ]?token|replace[-_ ]?me|example[-_ ]?secret|dummy[-_ ]?secret|test[-_ ]?secret)["']/i;
const governedVocabularyPattern = /\b(blocked_payloads|publicRepoDenied|denied|blocked|forbidden|not allowed|must not|no raw|policy|contract|doctrine|boundary)\b/i;

const sensitiveContentPatterns = [
  { code: 'BROKER_CONFIRMATION', pattern: /BROKER_CONFIRMATION/i, severity: 'WATCH' },
  { code: 'MARGIN_PAYMENT', pattern: /\bMargin\b/i, severity: 'WATCH' },
  { code: 'CUSIP', pattern: /\b\d{3}[A-Z0-9]{5}\d\b/, severity: 'WATCH' },
  { code: 'ACCOUNT_HINT', pattern: /\b(account|acct)\b/i, severity: 'WATCH' },
  { code: 'BROKER_NAME_HINT', pattern: /\bSchwab\b/i, severity: 'WATCH' },
  { code: 'SECRET_NAME_HINT', pattern: /\b(api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret)\b/i, severity: 'WATCH' },
  { code: 'SECRET_MATERIAL', pattern: secretMaterialPattern, severity: 'BREACH' },
  { code: 'PRIVATE_KEY', pattern: /-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/i, severity: 'BREACH' },
  { code: 'RAW_PRIVATE_ROW', pattern: /raw private (account|position|broker|confirmation) row/i, severity: 'BLOCK' },
];

const ignoredDirs = new Set(['.git', '.agents', 'node_modules', '.r3-build', 'dist', 'build', 'coverage', 'out']);
const ignoredFiles = new Set(['scripts/mdk-security-sentinel.mjs', 'r3/security/out/mdk-security-sentinel-report.json']);
const textExtensions = new Set(['.go', '.mod', '.sum', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.yaml', '.yml', '.md', '.sql', '.txt', '.toml', '.css', '.html']);

function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function severityRank(severity) { return { PASS: 0, WATCH: 1, BLOCK: 2, BREACH: 3 }[severity] ?? 0; }
function worst(a, b) { return severityRank(a) >= severityRank(b) ? a : b; }
function normalize(filePath) { return filePath.split(path.sep).join('/'); }

function walk(entry, files = []) {
  const full = path.resolve(root, entry);
  if (!fs.existsSync(full)) return files;
  const stat = fs.statSync(full);
  const base = path.basename(full);
  const relative = normalize(path.relative(root, full));
  if (stat.isDirectory()) {
    if (ignoredDirs.has(base)) return files;
    for (const child of fs.readdirSync(full)) walk(path.relative(root, path.join(full, child)), files);
  } else if (stat.isFile() && !ignoredFiles.has(relative)) {
    files.push(relative);
  }
  return files;
}

function downgradeContextLine(line, finding) {
  if (['SECRET_NAME_HINT', 'SECRET_MATERIAL'].includes(finding.code) && diagnosticMissingSecretPattern.test(line)) {
    return { ...finding, severity: 'WATCH', message: 'Missing secret diagnostic reference matched; review only.' };
  }
  if (finding.code === 'SECRET_MATERIAL' && placeholderSecretPattern.test(line)) {
    return { ...finding, severity: 'WATCH', message: 'Placeholder secret value matched; review only.' };
  }
  if (['BROKER_CONFIRMATION', 'RAW_PRIVATE_ROW'].includes(finding.code) && governedVocabularyPattern.test(line)) {
    return { ...finding, severity: 'WATCH', message: 'Governed contract/policy vocabulary matched; review only.' };
  }
  return finding;
}

function inspectFile(file) {
  const result = { file, sha256: null, verdict: 'PASS', findings: [] };
  for (const pattern of denyFileNamePatterns) {
    if (pattern.test(file)) {
      result.verdict = worst(result.verdict, 'BLOCK');
      result.findings.push({ severity: 'BLOCK', code: 'DENY_FILENAME', message: 'Filename matches private/broker-data deny pattern.' });
    }
  }
  const full = path.join(root, file);
  const bytes = fs.readFileSync(full);
  result.sha256 = sha256(bytes).slice(0, 16);
  if (bytes.length > 1024 * 1024) {
    result.verdict = worst(result.verdict, 'WATCH');
    result.findings.push({ severity: 'WATCH', code: 'LARGE_FILE', message: 'Large file requires review before commit.' });
    return result;
  }
  const extension = path.extname(file);
  if (!textExtensions.has(extension) && path.basename(file) !== 'go.sum') {
    result.verdict = worst(result.verdict, 'WATCH');
    result.findings.push({ severity: 'WATCH', code: 'UNKNOWN_FILE_TYPE', message: 'Unknown file type requires review before commit.' });
    return result;
  }
  const lines = bytes.toString('utf8').split(/\r?\n/);
  for (const detector of sensitiveContentPatterns) {
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (!detector.pattern.test(line)) continue;
      let finding = {
        severity: detector.severity,
        code: detector.code,
        line: index + 1,
        message: detector.code === 'SECRET_NAME_HINT' ? 'Secret variable name reference matched; review only.' : 'Sensitive content pattern matched.',
      };
      finding = downgradeContextLine(line, finding);
      result.verdict = worst(result.verdict, finding.severity);
      result.findings.push(finding);
      break;
    }
  }
  return result;
}

const files = [...new Set(targets.flatMap((target) => walk(target)))].sort();
const inspected = files.map(inspectFile);
const overall = inspected.reduce((verdict, file) => worst(verdict, file.verdict), 'PASS');
const blocked = inspected.filter((file) => ['BLOCK', 'BREACH'].includes(file.verdict));
const watched = inspected.filter((file) => file.verdict === 'WATCH');

const report = {
  generatedAt: new Date().toISOString(),
  audit: 'MDK Security Sentinel',
  origin: 'Wave-II Alpha audit invocation',
  overall,
  scannedFiles: inspected.length,
  watchFiles: watched.map((file) => ({ file: file.file, verdict: file.verdict, findings: file.findings })),
  blockedFiles: blocked.map((file) => ({ file: file.file, verdict: file.verdict, findings: file.findings })),
  inspected,
  policy: {
    rawUserFinancialData: 'trusted-device-only',
    publicRepoDenied: ['broker confirmation rows', 'exact private account positions', 'secret tokens', 'private keys', 'raw private account rows'],
    secretNamesAreWatch: true,
    placeholderSecretsAreWatch: true,
    secretMaterialIsBreach: true,
    missingSecretDiagnosticsAreWatch: true,
    governedContractVocabularyIsWatch: true,
    watchDoesNotFail: true,
    failStates: ['BLOCK', 'BREACH'],
  },
};

fs.mkdirSync(path.join(root, 'r3/security/out'), { recursive: true });
fs.writeFileSync(path.join(root, 'r3/security/out/mdk-security-sentinel-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

if (['BLOCK', 'BREACH'].includes(overall)) process.exit(1);
