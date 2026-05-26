import { describe, it, expect } from 'vitest';
import { ensureUniqueSlug } from './unique-slug';

describe('ensureUniqueSlug', () => {
  it("retourne le slug tel quel s'il n'existe pas", async () => {
    const result = await ensureUniqueSlug('fauteuil-club', async () => false);
    expect(result).toBe('fauteuil-club');
  });
  it('ajoute -2 si le slug existe déjà', async () => {
    const result = await ensureUniqueSlug('fauteuil-club', async (s) => s === 'fauteuil-club');
    expect(result).toBe('fauteuil-club-2');
  });
});
