import type { ProductWithPhotos } from '@/lib/repos/types';
import { ProductCard } from './product-card';

export function ProductGrid({
  products,
  subcategoryNameById,
}: {
  products: ProductWithPhotos[];
  subcategoryNameById?: Record<string, string>;
}) {
  if (!products.length) {
    return <p className="text-center text-bronze py-12">Aucun produit pour le moment.</p>;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} subcategoryName={subcategoryNameById?.[p.subcategory_id]} />
      ))}
    </div>
  );
}
