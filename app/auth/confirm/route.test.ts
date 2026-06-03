import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const verifyOtp = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { verifyOtp } }),
}));

const ORIGIN = 'https://depotventedrancy.fr';
const call = async (qs: string) => {
  const { GET } = await import('./route');
  return GET(new NextRequest(`${ORIGIN}/auth/confirm${qs}`));
};

describe('GET /auth/confirm', () => {
  beforeEach(() => {
    vi.resetModules();
    verifyOtp.mockReset();
  });

  it('vérifie le jeton et redirige vers next quand verifyOtp réussit', async () => {
    verifyOtp.mockResolvedValue({ error: null });
    const res = await call('?token_hash=abc&type=invite&next=/bienvenue');
    expect(verifyOtp).toHaveBeenCalledWith({ token_hash: 'abc', type: 'invite' });
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(`${ORIGIN}/bienvenue`);
  });

  it('redirige vers /bienvenue?error=expired quand verifyOtp échoue', async () => {
    verifyOtp.mockResolvedValue({ error: { message: 'Token has expired' } });
    const res = await call('?token_hash=abc&type=invite');
    expect(res.headers.get('location')).toBe(`${ORIGIN}/bienvenue?error=expired`);
  });

  it('redirige en erreur sans appeler verifyOtp si le token_hash manque', async () => {
    const res = await call('?type=invite');
    expect(verifyOtp).not.toHaveBeenCalled();
    expect(res.headers.get('location')).toBe(`${ORIGIN}/bienvenue?error=expired`);
  });

  it('rejette un type inconnu', async () => {
    const res = await call('?token_hash=abc&type=bogus');
    expect(verifyOtp).not.toHaveBeenCalled();
    expect(res.headers.get('location')).toBe(`${ORIGIN}/bienvenue?error=expired`);
  });

  it('neutralise un next externe (anti open-redirect)', async () => {
    verifyOtp.mockResolvedValue({ error: null });
    const res = await call('?token_hash=abc&type=invite&next=//evil.com');
    expect(res.headers.get('location')).toBe(`${ORIGIN}/bienvenue`);
  });
});
