import '@testing-library/jest-dom/vitest';

// Default env stubs for component tests that import lib/env via lib/business.
// Individual tests can still override these before re-importing modules.
process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'https://placeholder.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'x';
process.env.NEXT_PUBLIC_BUSINESS_NAME ??= 'Dépôt Vente de Drancy';
process.env.NEXT_PUBLIC_BUSINESS_PHONE ??= '+33 1 23 45 67 89';
process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ??= '1 rue de Test, 93700 Drancy';
process.env.NEXT_PUBLIC_BUSINESS_LAT ??= '48.925';
process.env.NEXT_PUBLIC_BUSINESS_LNG ??= '2.443';
process.env.NEXT_PUBLIC_BUSINESS_HOURS_JSON ??= '[]';
process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL ??= 'https://g.co/x';
