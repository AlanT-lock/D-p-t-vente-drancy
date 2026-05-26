import { createClient } from '@/lib/supabase/server';
import type { ProductWithPhotos } from './types';

export async function listRecentPublishedProducts(limit = 6): Promise<ProductWithPhotos[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, photos:product_photos(*)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ProductWithPhotos[];
}

export async function getProductBySlug(slug: string): Promise<ProductWithPhotos | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('*, photos:product_photos(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  return data as ProductWithPhotos | null;
}

export type ListOpts = {
  sort?: 'recent' | 'price_asc' | 'price_desc' | 'name';
  minPrice?: number;
  maxPrice?: number;
  conditions?: string[];
  availableOnly?: boolean;
};

export async function listProductsBySubcategory(
  subcategoryId: string,
  opts: ListOpts = {},
): Promise<ProductWithPhotos[]> {
  const supabase = await createClient();
  let q = supabase
    .from('products')
    .select('*, photos:product_photos(*)')
    .eq('is_published', true)
    .eq('subcategory_id', subcategoryId);

  if (opts.minPrice != null) q = q.gte('price_cents', opts.minPrice);
  if (opts.maxPrice != null) q = q.lte('price_cents', opts.maxPrice);
  if (opts.conditions?.length) q = q.in('condition', opts.conditions as never[]);
  if (opts.availableOnly) q = q.gt('quantity', 0);

  switch (opts.sort) {
    case 'price_asc':
      q = q.order('price_cents');
      break;
    case 'price_desc':
      q = q.order('price_cents', { ascending: false });
      break;
    case 'name':
      q = q.order('name');
      break;
    default:
      q = q.order('created_at', { ascending: false });
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ProductWithPhotos[];
}
