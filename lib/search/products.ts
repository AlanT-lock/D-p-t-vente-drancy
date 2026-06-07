import { createClient } from '@/lib/supabase/server';
import type { ProductWithPhotos } from '@/lib/repos/types';

export type SearchOpts = {
  categorySlug?: string;
  subcategorySlug?: string;
  conditions?: string[];
  minPriceCents?: number;
  maxPriceCents?: number;
  availableOnly?: boolean;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'recent';
  limit?: number;
  /** Inclure les produits non-publiés (réservé à l'admin) */
  includeUnpublished?: boolean;
};

export type SearchResult = ProductWithPhotos & {
  subcategory_name: string;
  category_slug: string;
  category_name: string;
};

export async function searchProducts(query: string, opts: SearchOpts = {}): Promise<SearchResult[]> {
  const supabase = await createClient();
  const trimmed = query.trim();

  // Base select with relations needed for display
  let q = supabase
    .from('products')
    .select(`
      *,
      photos:product_photos(*),
      subcategory:subcategories!inner(slug, name, category:categories!inner(slug, name))
    `);
  if (!opts.includeUnpublished) {
    q = q.eq('is_published', true);
  }

  if (opts.subcategorySlug) {
    q = q.eq('subcategory.slug', opts.subcategorySlug);
  } else if (opts.categorySlug) {
    q = q.eq('subcategory.category.slug', opts.categorySlug);
  }
  if (opts.conditions?.length) {
    q = q.in('condition', opts.conditions);
  }
  if (opts.minPriceCents != null) q = q.gte('price_cents', opts.minPriceCents);
  if (opts.maxPriceCents != null) q = q.lte('price_cents', opts.maxPriceCents);
  if (opts.availableOnly) q = q.gt('quantity', 0);

  if (trimmed) {
    // Combine FTS (websearch_to_tsquery, french config) with an ILIKE fallback
    // on name for trigram-like fuzzy behaviour exposed via PostgREST.
    const escaped = trimmed.replace(/[%,()]/g, ' ');
    q = q.or(
      `search_vector.wfts(french).${escaped},name.ilike.%${escaped}%`
    );
  }

  switch (opts.sort) {
    case 'price_asc': q = q.order('price_cents'); break;
    case 'price_desc': q = q.order('price_cents', { ascending: false }); break;
    case 'recent': q = q.order('created_at', { ascending: false }); break;
    default:
      // 'relevance' — fallback to created_at desc when no query
      q = q.order('created_at', { ascending: false });
  }

  q = q.limit(opts.limit ?? 60);

  const { data, error } = await q;
  if (error) throw error;

  type Row = {
    id: string; slug: string; name: string; description: string | null;
    price_cents: number; original_price_cents: number | null; quantity: number;
    condition: string;
    is_published: boolean; created_at: string; updated_at: string;
    subcategory_id: string;
    photos: { id: string; product_id: string; storage_path: string; position: number }[];
    subcategory: { slug: string; name: string; category: { slug: string; name: string } };
  };

  return (data as unknown as Row[]).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price_cents: p.price_cents,
    original_price_cents: p.original_price_cents,
    quantity: p.quantity,
    condition: p.condition,
    is_published: p.is_published,
    created_at: p.created_at,
    updated_at: p.updated_at,
    subcategory_id: p.subcategory_id,
    photos: p.photos,
    subcategory_name: p.subcategory.name,
    category_slug: p.subcategory.category.slug,
    category_name: p.subcategory.category.name,
  }));
}
