/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

type Check = {
  key: string;
  present: boolean;
  ok: boolean;
  hint: string;
};

const checks: Check[] = [];

function add(key: string, validate: (v: string) => string | true): void {
  const raw = process.env[key];
  if (raw == null || raw === '') {
    checks.push({ key, present: false, ok: false, hint: 'absente / vide' });
    return;
  }
  const result = validate(raw);
  checks.push({
    key,
    present: true,
    ok: result === true,
    hint: result === true ? `OK (${raw.length} chars)` : (result as string),
  });
}

const placeholder = (v: string): boolean =>
  /placeholder|example|changeme|your.?key/i.test(v);

// Supabase
add('NEXT_PUBLIC_SUPABASE_URL', (v) => {
  if (placeholder(v)) return 'encore un placeholder';
  try {
    const u = new URL(v);
    if (!u.hostname.endsWith('.supabase.co')) return `hôte inattendu : ${u.hostname}`;
    return true;
  } catch {
    return 'URL invalide';
  }
});
add('NEXT_PUBLIC_SUPABASE_ANON_KEY', (v) => {
  if (placeholder(v)) return 'encore un placeholder';
  // Supabase anon keys are JWTs (3 segments) OR sb_publishable_xxx
  if (v.startsWith('sb_publishable_')) return true;
  if (v.split('.').length === 3) return true;
  return 'format inattendu (ni JWT ni sb_publishable_)';
});
add('SUPABASE_SERVICE_ROLE_KEY', (v) => {
  if (placeholder(v)) return 'encore un placeholder';
  if (v.startsWith('sb_secret_')) return true;
  if (v.split('.').length === 3) return true;
  return 'format inattendu (ni JWT ni sb_secret_)';
});

// Google Places
add('GOOGLE_PLACES_API_KEY', (v) => {
  if (placeholder(v)) return 'encore un placeholder';
  // Google API keys typically start with "AIza" and are 39 chars
  if (v.startsWith('AIza') && v.length >= 35) return true;
  return 'ne ressemble pas à une clé Google Maps (devrait commencer par AIza)';
});
add('GOOGLE_PLACE_ID', (v) => {
  if (placeholder(v)) return 'encore un placeholder';
  if (v.startsWith('ChIJ') && v.length >= 20) return true;
  return 'ne ressemble pas à un Place ID (devrait commencer par ChIJ)';
});

// Cron / admin
add('CRON_SECRET', (v) => {
  if (placeholder(v)) return 'encore un placeholder';
  if (v.length < 16) return `trop court (${v.length} chars, mini 16 recommandé)`;
  return true;
});
add('ADMIN_SLUG', (v) => {
  if (placeholder(v) && v !== 'admin-xY3kQ9') return 'placeholder';
  if (!/^[a-z0-9-]+$/i.test(v)) return 'doit contenir uniquement lettres/chiffres/tirets';
  if (v === 'admin' || v === 'admin-xY3kQ9') return 'trop devinable — change la valeur par défaut !';
  if (v.length < 8) return 'trop court, vise 10+ caractères imprévisibles';
  return true;
});

// Business
add('NEXT_PUBLIC_BUSINESS_NAME', (v) => {
  if (placeholder(v)) return 'placeholder';
  return v.length >= 2 ? true : 'trop court';
});
add('NEXT_PUBLIC_BUSINESS_PHONE', (v) => {
  const digits = v.replace(/\D/g, '');
  if (digits.length < 9) return `seulement ${digits.length} chiffres`;
  if (v.startsWith('+33') || v.startsWith('0')) return true;
  return 'devrait commencer par +33 ou 0';
});
add('NEXT_PUBLIC_BUSINESS_ADDRESS', (v) => {
  if (placeholder(v)) return 'placeholder';
  return v.length >= 8 ? true : 'trop court pour une adresse';
});
add('NEXT_PUBLIC_BUSINESS_LAT', (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 'pas un nombre';
  if (n < 41 || n > 52) return `${n} hors plage France métro (41–52)`;
  // Drancy ≈ 48.93
  if (Math.abs(n - 48.93) > 0.05) return `${n} : loin de Drancy (≈48.93)`;
  return true;
});
add('NEXT_PUBLIC_BUSINESS_LNG', (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 'pas un nombre';
  if (n < -5 || n > 9) return `${n} hors plage France métro (-5…9)`;
  // Drancy ≈ 2.44
  if (Math.abs(n - 2.44) > 0.05) return `${n} : loin de Drancy (≈2.44)`;
  return true;
});
add('NEXT_PUBLIC_BUSINESS_HOURS_JSON', (v) => {
  if (v === '[]') return 'vide (le site affichera « Horaires à venir »)';
  try {
    const parsed = JSON.parse(v);
    if (!Array.isArray(parsed)) return 'pas un tableau JSON';
    if (parsed.length === 0) return 'tableau vide';
    for (const h of parsed) {
      if (!h || typeof h !== 'object') return 'élément non-objet';
      if (!('day' in h)) return 'élément sans champ "day"';
      if (!('closed' in h) && (!('open' in h) || !('close' in h))) return 'élément sans closed:true ni open/close';
    }
    return true;
  } catch (e: any) {
    return `JSON invalide : ${e.message}`;
  }
});
add('NEXT_PUBLIC_GOOGLE_BUSINESS_URL', (v) => {
  if (placeholder(v)) return 'placeholder';
  try {
    const u = new URL(v);
    if (
      u.hostname === 'maps.app.goo.gl' ||
      u.hostname === 'maps.google.com' ||
      u.hostname === 'www.google.com' ||
      u.hostname === 'goo.gl' ||
      u.hostname === 'g.page'
    ) return true;
    return `hôte inattendu : ${u.hostname}`;
  } catch {
    return 'URL invalide';
  }
});

// Print
let okCount = 0;
let failCount = 0;
const pad = (s: string, n: number) => s + ' '.repeat(Math.max(0, n - s.length));

console.log('\nVérification du .env.local\n');
for (const c of checks) {
  const icon = c.ok ? '✅' : c.present ? '⚠️ ' : '❌';
  console.log(`  ${icon} ${pad(c.key, 38)} ${c.hint}`);
  if (c.ok) okCount++;
  else failCount++;
}
console.log(`\n${okCount} OK · ${failCount} à corriger\n`);
process.exit(failCount === 0 ? 0 : 1);
