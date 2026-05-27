import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('business', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'x';
    process.env.NEXT_PUBLIC_BUSINESS_NAME = 'Test';
    process.env.NEXT_PUBLIC_BUSINESS_PHONE = '+33 1 23 45 67 89';
    process.env.NEXT_PUBLIC_BUSINESS_ADDRESS = '1 rue';
    process.env.NEXT_PUBLIC_BUSINESS_LAT = '48.925';
    process.env.NEXT_PUBLIC_BUSINESS_LNG = '2.443';
    process.env.NEXT_PUBLIC_BUSINESS_HOURS_JSON = '[]';
    process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL = 'https://g.co/x';
  });

  it('génère les bonnes URLs de cartes', async () => {
    const { mapsUrls } = await import('./business');
    expect(mapsUrls.google()).toBe('https://www.google.com/maps/dir/?api=1&destination=48.925,2.443');
    expect(mapsUrls.apple()).toBe('https://maps.apple.com/?daddr=48.925,2.443');
    expect(mapsUrls.waze()).toBe('https://waze.com/ul?ll=48.925,2.443&navigate=yes');
  });
});
