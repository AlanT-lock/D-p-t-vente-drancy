#!/usr/bin/env node
/**
 * Lit .env.local et pousse chaque variable vers Vercel via `vercel env add`.
 * Les valeurs sont transmises via stdin (jamais affichées en console).
 * Utilise spawnSync (pas de shell, pas d'injection possible).
 *
 * Usage : node scripts/push-env-vercel.mjs [environment]
 *   environment = production | preview | development (par défaut : production)
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const env = process.argv[2] ?? 'production';
if (!['production', 'preview', 'development'].includes(env)) {
  console.error(`Environnement invalide : ${env}`);
  process.exit(1);
}

if (!existsSync('.env.local')) {
  console.error('.env.local introuvable.');
  process.exit(1);
}

const raw = readFileSync('.env.local', 'utf-8');
const entries = raw
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const eq = l.indexOf('=');
    if (eq < 0) return null;
    const name = l.slice(0, eq).trim();
    let value = l.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return { name, value };
  })
  .filter((e) => e && e.name && e.value);

console.log(`Pousse ${entries.length} variables vers Vercel (${env})…\n`);

// Liste les variables déjà présentes pour éviter les doublons
const existingNames = new Set();
const list = spawnSync('vercel', ['env', 'ls', env], { encoding: 'utf-8' });
if (list.status === 0) {
  for (const line of (list.stdout ?? '').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s+/);
    if (m) existingNames.add(m[1]);
  }
}

let ok = 0;
let skipped = 0;
let failed = 0;

for (const { name, value } of entries) {
  if (existingNames.has(name)) {
    console.log(`  ↷ ${name} (déjà présent, ignoré)`);
    skipped++;
    continue;
  }
  const result = spawnSync('vercel', ['env', 'add', name, env], {
    input: value,
    stdio: ['pipe', 'pipe', 'pipe'],
    encoding: 'utf-8',
  });
  if (result.status === 0) {
    console.log(`  ✓ ${name}`);
    ok++;
  } else {
    const msg = (result.stderr || result.stdout || '').trim().slice(0, 200);
    console.log(`  ✗ ${name} — ${msg}`);
    failed++;
  }
}

console.log(`\n${ok} ajoutées · ${skipped} déjà présentes · ${failed} échecs`);
process.exit(failed === 0 ? 0 : 1);
