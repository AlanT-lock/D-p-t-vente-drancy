import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/format';
import { publicEnv } from '@/lib/env';
import type { ProductWithPhotos } from '@/lib/repos/types';
import { ConditionBadge } from './condition-badge';

export function ProductCard({
  product,
  subcategoryName,
}: {
  product: ProductWithPhotos;
  subcategoryName?: string;
}) {
  const main = [...product.photos].sort((a, b) => a.position - b.position)[0];
  const imageUrl = main
    ? `${publicEnv.SUPABASE_URL}/storage/v1/object/public/product-photos/${main.storage_path}`
    : null;
  return (
    <Link href={`/produit/${product.slug}`} className="group block">
      <article className="bg-parchment-light rounded-lg overflow-hidden border border-navy/10">
        <div className="relative aspect-square bg-bronze/10">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          )}
          {product.quantity === 1 && (
            <span className="absolute top-2 left-2 bg-navy text-brass text-[9px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full">
              Pièce unique
            </span>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between gap-2">
            {subcategoryName && (
              <span className="text-[10px] uppercase tracking-wider text-bronze">{subcategoryName}</span>
            )}
            <ConditionBadge condition={product.condition} />
          </div>
          <h3 className="font-serif text-base mt-1">{product.name}</h3>
          <p className="font-semibold mt-1">{formatPrice(product.price_cents)}</p>
        </div>
      </article>
    </Link>
  );
}
