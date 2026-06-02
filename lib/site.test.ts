import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('siteUrl', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it('utilise le domaine de production par défaut', async () => {
    const { siteUrl } = await import('./site');
    expect(siteUrl()).toBe('https://depotventredrancy.fr');
  });

  it('respecte NEXT_PUBLIC_SITE_URL si défini, sans slash final', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000/';
    const { siteUrl } = await import('./site');
    expect(siteUrl()).toBe('http://localhost:3000');
  });
});
