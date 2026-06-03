import { describe, it, expect, vi, beforeEach } from 'vitest';

const getUser = vi.fn();
const subSingle = vi.fn();
const productsEq = vi.fn();
const subDeleteEq = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser },
    from: (table: string) => {
      if (table === 'products') {
        return { select: () => ({ eq: productsEq }) };
      }
      // subcategories
      return {
        select: () => ({ eq: () => ({ single: subSingle }) }),
        delete: () => ({ eq: subDeleteEq }),
      };
    },
  }),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

const SLUG = 'secret-admin';
const CATPATH = `/${SLUG}/categories/cat1`;

async function runDelete(id: string) {
  const { deleteSubcategory } = await import('./actions');
  try {
    await deleteSubcategory(id);
    return null; // pas de redirect
  } catch (e) {
    return (e as Error).message.replace('REDIRECT:', '');
  }
}

describe('deleteSubcategory', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.ADMIN_SLUG = SLUG;
    getUser.mockReset().mockResolvedValue({ data: { user: { id: 'u1' } } });
    subSingle.mockReset().mockResolvedValue({ data: { category_id: 'cat1' } });
    productsEq.mockReset();
    subDeleteEq.mockReset();
  });

  it('supprime et redirige vers la catégorie quand aucune produit n’est rattaché', async () => {
    productsEq.mockResolvedValue({ count: 0 });
    subDeleteEq.mockResolvedValue({ error: null });
    const dest = await runDelete('sub1');
    expect(subDeleteEq).toHaveBeenCalled();
    expect(dest).toBe(CATPATH);
  });

  it('bloque la suppression avec un message quand des produits sont rattachés', async () => {
    productsEq.mockResolvedValue({ count: 3 });
    const dest = await runDelete('sub1');
    expect(subDeleteEq).not.toHaveBeenCalled(); // pas de delete tenté
    expect(dest).toBe(`${CATPATH}?error=produits&n=3`);
  });

  it('signale un échec de suppression côté base', async () => {
    productsEq.mockResolvedValue({ count: 0 });
    subDeleteEq.mockResolvedValue({ error: { message: 'fk' } });
    const dest = await runDelete('sub1');
    expect(dest).toBe(`${CATPATH}?error=suppression`);
  });

  it('ne fait rien si la sous-catégorie est introuvable', async () => {
    subSingle.mockResolvedValue({ data: null });
    const dest = await runDelete('sub1');
    expect(dest).toBeNull();
    expect(subDeleteEq).not.toHaveBeenCalled();
  });
});
