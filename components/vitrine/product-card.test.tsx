import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from './product-card';
import type { ProductWithPhotos } from '@/lib/repos/types';

const mockProduct: ProductWithPhotos = {
  id: '1',
  slug: 'fauteuil-club',
  name: 'Fauteuil club',
  price_cents: 24000,
  quantity: 1,
  condition: 'bon_etat',
  subcategory_id: 's1',
  description: null,
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  photos: [{ id: 'p1', product_id: '1', storage_path: '1/0.webp', position: 0 }],
};

describe('ProductCard', () => {
  it('affiche nom, prix, badge unique', () => {
    render(<ProductCard product={mockProduct} subcategoryName="Canapés" />);
    expect(screen.getByText('Fauteuil club')).toBeInTheDocument();
    expect(screen.getByText('240 €')).toBeInTheDocument();
    expect(screen.getByText(/pièce unique/i)).toBeInTheDocument();
  });
});
