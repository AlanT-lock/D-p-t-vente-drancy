import type { ProductWithPhotos } from '@/lib/repos/types';
import type { ConditionOption } from '@/lib/condition';
import { ProductCard } from './product-card';

export function ProductGrid({
  products,
  subcategoryNameById,
  conditions,
}: {
  products: ProductWithPhotos[];
  subcategoryNameById?: Record<string, string>;
  conditions?: ConditionOption[];
}) {
  if (!products.length) {
    return <p className="text-center text-bronze py-12">Aucun produit pour le moment.</p>;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          subcategoryName={p.subcategory_id ? subcategoryNameById?.[p.subcategory_id] : undefined}
          conditions={conditions}
        />
      ))}
    </div>
  );
}
