import type { Product } from '@/lib/repos/types';
import { publicEnv } from '@/lib/env';

export type IndexedProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  quantity: number;
  condition: string;
  is_published: boolean;
  available: boolean;
  category_slug: string;
  category_name: string;
  subcategory_slug: string;
  subcategory_name: string;
  main_photo_url: string | null;
  created_at_ts: number;
};

export function toIndexedProduct(
  p: Product,
  ctx: { categorySlug: string; categoryName: string; subcategorySlug: string; subcategoryName: string; mainStoragePath: string | null },
): IndexedProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price_cents: p.price_cents,
    quantity: p.quantity,
    condition: p.condition,
    is_published: p.is_published,
    available: p.is_published && p.quantity > 0,
    category_slug: ctx.categorySlug,
    category_name: ctx.categoryName,
    subcategory_slug: ctx.subcategorySlug,
    subcategory_name: ctx.subcategoryName,
    main_photo_url: ctx.mainStoragePath
      ? `${publicEnv.SUPABASE_URL}/storage/v1/object/public/product-photos/${ctx.mainStoragePath}`
      : null,
    created_at_ts: new Date(p.created_at).getTime(),
  };
}
