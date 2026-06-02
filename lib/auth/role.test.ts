import { describe, it, expect, vi, beforeEach } from 'vitest';

const getUser = vi.fn();
const maybeSingle = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle }),
      }),
    }),
  }),
}));

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.resetModules();
    getUser.mockReset();
    maybeSingle.mockReset();
  });

  it('renvoie le membre quand il est admin', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.c' } } });
    maybeSingle.mockResolvedValue({ data: { role: 'admin', email: 'a@b.c' } });
    const { requireAdmin } = await import('./role');
    expect(await requireAdmin()).toEqual({ id: 'u1', email: 'a@b.c', role: 'admin' });
  });

  it('renvoie null pour un employé', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u2', email: 'e@b.c' } } });
    maybeSingle.mockResolvedValue({ data: { role: 'employee', email: 'e@b.c' } });
    const { requireAdmin } = await import('./role');
    expect(await requireAdmin()).toBeNull();
  });

  it('renvoie null si non connecté', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const { requireAdmin } = await import('./role');
    expect(await requireAdmin()).toBeNull();
  });
});
