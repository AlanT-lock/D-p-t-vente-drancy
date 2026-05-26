'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/slugify';

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('unauthorized');
  return supabase;
}

export async function createCategory(formData: FormData): Promise<void> {
  const supabase = await requireAuth();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;
  await supabase.from('categories').insert({ name, slug: slugify(name) });
  revalidatePath(`/${process.env.ADMIN_SLUG}/categories`);
  revalidatePath('/');
}

export async function renameCategory(id: string, name: string): Promise<void> {
  const supabase = await requireAuth();
  await supabase.from('categories').update({ name, slug: slugify(name) }).eq('id', id);
  revalidatePath(`/${process.env.ADMIN_SLUG}/categories`);
  revalidatePath('/');
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await requireAuth();
  await supabase.from('categories').delete().eq('id', id);
  revalidatePath(`/${process.env.ADMIN_SLUG}/categories`);
  revalidatePath('/');
  redirect(`/${process.env.ADMIN_SLUG}/categories`);
}

export async function createSubcategory(categoryId: string, name: string): Promise<void> {
  const supabase = await requireAuth();
  if (!name.trim()) return;
  await supabase.from('subcategories').insert({ category_id: categoryId, name, slug: slugify(name) });
  revalidatePath(`/${process.env.ADMIN_SLUG}/categories/${categoryId}`);
}

export async function renameSubcategory(id: string, name: string): Promise<void> {
  const supabase = await requireAuth();
  await supabase.from('subcategories').update({ name, slug: slugify(name) }).eq('id', id);
}

export async function deleteSubcategory(id: string): Promise<void> {
  const supabase = await requireAuth();
  await supabase.from('subcategories').delete().eq('id', id);
}
