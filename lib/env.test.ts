import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('env validation', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    process.env.NEXT_PUBLIC_MEILI_HOST = 'https://meili.cloud';
    process.env.NEXT_PUBLIC_MEILI_SEARCH_KEY = 'search';
    process.env.ADMIN_SLUG = 'admin-test';
    process.env.NEXT_PUBLIC_BUSINESS_NAME = 'Test';
    process.env.NEXT_PUBLIC_BUSINESS_PHONE = '+33 1 23 45 67 89';
    process.env.NEXT_PUBLIC_BUSINESS_ADDRESS = '1 rue test';
    process.env.NEXT_PUBLIC_BUSINESS_LAT = '48.92';
    process.env.NEXT_PUBLIC_BUSINESS_LNG = '2.45';
    process.env.NEXT_PUBLIC_BUSINESS_HOURS_JSON = '[]';
    process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL = 'https://g.co/business';
  });

  it('parses public env successfully', async () => {
    const { publicEnv } = await import('./env');
    expect(publicEnv.BUSINESS_NAME).toBe('Test');
    expect(publicEnv.BUSINESS_LAT).toBeCloseTo(48.92);
  });

  it('throws on missing required public var', async () => {
    delete process.env.NEXT_PUBLIC_BUSINESS_NAME;
    await expect(import('./env')).rejects.toThrow();
  });
});
