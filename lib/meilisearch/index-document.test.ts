import { describe, it, expect } from 'vitest';
import { toIndexedProduct } from './index-document';
import type { Product } from '@/lib/repos/types';

const base: Product = {
  id: '1', slug: 'x', name: 'X', description: null, price_cents: 100, quantity: 1,
  condition: 'neuf', is_published: true,
  subcategory_id: 's', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
};
const ctx = { categorySlug: 'c', categoryName: 'C', subcategorySlug: 's', subcategoryName: 'S', mainStoragePath: null };

describe('toIndexedProduct', () => {
  it('calcule available = is_published && quantity > 0', () => {
    expect(toIndexedProduct(base, ctx).available).toBe(true);
    expect(toIndexedProduct({ ...base, quantity: 0 }, ctx).available).toBe(false);
    expect(toIndexedProduct({ ...base, is_published: false }, ctx).available).toBe(false);
  });
});
