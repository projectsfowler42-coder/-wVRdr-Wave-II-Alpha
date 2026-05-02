#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const R3_DIR = join(ROOT, 'r3');
const EXTENSION_REQUIRED_RE = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["'](\.{1,2}\/[^"']+)["']/g;
const SIDE_EFFECT_IMPORT_RE = /import\s+["'](\.{1,2}\/[^"']+)["']/g;
const ALLOWED_EXTENSIONS = ['.js', '.json', '.mjs', '.cjs'];

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (entry.isFile() && fullPath.endsWith('.ts')) return [fullPath];
    return [];
  });
}

function hasAllowedRuntimeExtension(specifier) {
  return ALLOWED_EXTENSIONS.some((extension) => specifier.endsWith(extension));
}

function lineNumberFor(source, index) {
  return source.slice(0, index).split('\n').length;
}

function collectViolations(filePath) {
  const source = readFileSync(filePath, 'utf8');
  const violations = [];
  const seen = new Set();

  for (const regex of [EXTENSION_REQUIRED_RE, SIDE_EFFECT_IMPORT_RE]) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(source)) !== null) {
      const specifier = match[1];
      if (!specifier || seen.has(`${match.index}:${specifier}`)) continue;
      seen.add(`${match.index}:${specifier}`);
      if (hasAllowedRuntimeExtension(specifier)) continue;
      violations.push({
        file: relative(ROOT, filePath).split(sep).join('/'),
        line: lineNumberFor(source, match.index),
        specifier
      });
    }
  }

  return violations;
}

if (!statSync(R3_DIR, { throwIfNoEntry: false })?.isDirectory()) {
  console.error('R3 import gate failed: r3 directory not found.');
  process.exit(1);
}

const violations = walk(R3_DIR).flatMap(collectViolations);

if (violations.length > 0) {
  console.error('R3 NodeNext import gate failed. Relative imports/exports must use runtime .js/.json/.mjs/.cjs extensions.');
  for (const violation of violations) {
    console.error(`- ${violation.file}:${violation.line} -> ${violation.specifier}`);
  }
  process.exit(1);
}

console.log(`R3 NodeNext import gate passed for ${walk(R3_DIR).length} TypeScript files.`);
