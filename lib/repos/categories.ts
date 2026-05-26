import { createClient } from '@/lib/supabase/server';
import type { CategoryWithSubs } from './types';

export async function listCategoriesWithSubs(): Promise<CategoryWithSubs[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*, subcategories(*)')
    .order('position');
  if (error) throw error;
  const rows = (data ?? []) as unknown as CategoryWithSubs[];
  return rows.map((c) => ({
    ...c,
    subcategories: (c.subcategories ?? []).sort((a, b) => a.position - b.position),
  }));
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*, subcategories(*)')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data as CategoryWithSubs;
}
