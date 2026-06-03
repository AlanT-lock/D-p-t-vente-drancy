'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/slugify';
import { ensureUniqueSlug } from '@/lib/unique-slug';

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
  const base = slugify(name);
  const slug = await ensureUniqueSlug(base, async (s) => {
    const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true }).eq('slug', s);
    return (count ?? 0) > 0;
  });
  await supabase.from('categories').insert({ name, slug });
  revalidatePath(`/${process.env.ADMIN_SLUG}/categories`);
  revalidatePath('/');
}

export async function renameCategory(id: string, name: string): Promise<void> {
  const supabase = await requireAuth();
  const base = slugify(name);
  const slug = await ensureUniqueSlug(base, async (s) => {
    const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true }).eq('slug', s).neq('id', id);
    return (count ?? 0) > 0;
  });
  await supabase.from('categories').update({ name, slug }).eq('id', id);
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
  const base = slugify(name);
  const slug = await ensureUniqueSlug(base, async (s) => {
    const { count } = await supabase
      .from('subcategories')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId)
      .eq('slug', s);
    return (count ?? 0) > 0;
  });
  await supabase.from('subcategories').insert({ category_id: categoryId, name, slug });
  revalidatePath(`/${process.env.ADMIN_SLUG}/categories/${categoryId}`);
}

export async function renameSubcategory(id: string, name: string): Promise<void> {
  const supabase = await requireAuth();
  const { data: existing } = await supabase.from('subcategories').select('category_id').eq('id', id).single();
  if (!existing) return;
  const base = slugify(name);
  const slug = await ensureUniqueSlug(base, async (s) => {
    const { count } = await supabase
      .from('subcategories')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', existing.category_id)
      .eq('slug', s)
      .neq('id', id);
    return (count ?? 0) > 0;
  });
  await supabase.from('subcategories').update({ name, slug }).eq('id', id);
  revalidatePath(`/${process.env.ADMIN_SLUG}/categories/${existing.category_id}`);
  revalidatePath(`/${process.env.ADMIN_SLUG}/categories`);
  revalidatePath('/');
}

export async function deleteSubcategory(id: string): Promise<void> {
  const supabase = await requireAuth();
  const { data: sub } = await supabase
    .from('subcategories')
    .select('category_id')
    .eq('id', id)
    .single();
  if (!sub) return;
  const catPath = `/${process.env.ADMIN_SLUG}/categories/${sub.category_id}`;

  // La FK products.subcategory_id est ON DELETE RESTRICT : si des produits y sont
  // rattachés, la suppression échoue côté base. On le détecte pour afficher un
  // message clair plutôt qu'un échec silencieux.
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('subcategory_id', id);
  if ((count ?? 0) > 0) {
    redirect(`${catPath}?error=produits&n=${count}`);
  }

  const { error } = await supabase.from('subcategories').delete().eq('id', id);
  if (error) {
    redirect(`${catPath}?error=suppression`);
  }
  revalidatePath(catPath);
  revalidatePath('/');
  redirect(catPath);
}
