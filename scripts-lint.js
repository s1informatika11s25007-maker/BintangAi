import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const ignored = new Set(['node_modules', 'dist', '.git', 'coverage']);
const files = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (/\.(?:js|mjs|cjs)$/.test(entry.name)) files.push(absolute);
  }
}

walk(root);
let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failed = true;
    process.stderr.write(`\nSyntax error: ${path.relative(root, file)}\n${result.stderr}`);
  }
}

const forbiddenTerms = [
  ['Bintang', 'Ai'].join(''),
  ['bintang', 'ai'].join(''),
  ['resident', '_domain'].join(''),
  ['care', 'giver'].join(''),
  ['private', '-care-', 'evidence'].join(''),
  ['ai_', 'superagent'].join('')
];
const textExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.sql', '.md', '.json', '.html', '.css', '.toml', '.svg', '.webmanifest', '.yml', '.yaml']);
for (const file of collectTextFiles(root, ignored)) {
  const content = fs.readFileSync(file, 'utf8').toLowerCase();
  for (const term of forbiddenTerms) {
    if (content.includes(term.toLowerCase())) {
      failed = true;
      process.stderr.write(`\nLegacy reference detected in ${path.relative(root, file)}: ${term}\n`);
    }
  }
}

function collectTextFiles(directory, ignoreNames) {
  const found = [];
  function visit(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory() && ignoreNames.has(entry.name)) continue;
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (textExtensions.has(path.extname(entry.name)) && entry.name !== 'package-lock.json') found.push(absolute);
    }
  }
  visit(directory);
  return found;
}

if (failed) process.exit(1);
console.log(`Syntax and legacy-reference checks passed (${files.length} JavaScript files).`);
