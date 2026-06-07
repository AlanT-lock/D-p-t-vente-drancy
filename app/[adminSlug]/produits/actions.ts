'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/slugify';
import { parsePrice } from '@/lib/format';
import { ensureUniqueSlug } from '@/lib/unique-slug';

// Rafraîchit les pages vitrine impactées par un changement de produit, pour que
// les modifications (prix, prix neuf, etc.) apparaissent tout de suite côté client
// au lieu d'attendre l'expiration du cache ISR (60s).
function revalidatePublicProductPages() {
  revalidatePath('/');
  revalidatePath('/produit/[slug]', 'page');
  revalidatePath('/c/[category]', 'page');
  revalidatePath('/c/[category]/[subcategory]', 'page');
}

const productSchema = z.object({
  name: z.string().min(1),
  // Sous-catégorie optionnelle : '' ou null acceptés
  subcategory_id: z
    .string()
    .uuid()
    .nullable()
    .or(z.literal('').transform(() => null))
    .or(z.literal('none').transform(() => null)),
  price: z.string().min(1),
  // Prix neuf optionnel : vide ou nombre (1 ou 2 décimales).
  original_price: z
    .string()
    .optional()
    .transform((v) => (v ?? '').trim())
    .refine((v) => v === '' || /^\d+([.,]\d{1,2})?$/.test(v), 'Prix neuf invalide'),
  quantity: z.coerce.number().int().min(0),
  // États dynamiques (table product_conditions). La FK products.condition garantit
  // la validité côté base ; le formulaire ne propose que des états existants.
  condition: z.string().min(1),
  description: z.string().optional(),
  is_published: z.coerce.boolean().optional(),
});

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('unauthorized');
  return supabase;
}

export async function createProductReturningId(
  formData: FormData,
): Promise<{ id: string } | { error: string }> {
  const supabase = await requireAuth();
  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    subcategory_id: formData.get('subcategory_id'),
    price: formData.get('price'),
    original_price: formData.get('original_price') ?? '',
    quantity: formData.get('quantity'),
    condition: formData.get('condition'),
    description: formData.get('description') ?? '',
    is_published: formData.get('is_published') === 'on',
  });
  if (!parsed.success) return { error: parsed.error.message };
  const base = slugify(parsed.data.name);
  const slug = await ensureUniqueSlug(base, async (s) => {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('slug', s);
    return (count ?? 0) > 0;
  });
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: parsed.data.name,
      slug,
      subcategory_id: parsed.data.subcategory_id,
      price_cents: parsePrice(parsed.data.price),
      original_price_cents: parsed.data.original_price ? parsePrice(parsed.data.original_price) : null,
      quantity: parsed.data.quantity,
      condition: parsed.data.condition,
      description: parsed.data.description ?? null,
      is_published: parsed.data.is_published ?? true,
    })
    .select('id')
    .single();
  if (error || !data) return { error: error?.message ?? 'Erreur de création' };
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits`);
  revalidatePublicProductPages();
  return { id: data.id };
}

export async function createProduct(formData: FormData): Promise<void> {
  const supabase = await requireAuth();
  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    subcategory_id: formData.get('subcategory_id'),
    price: formData.get('price'),
    original_price: formData.get('original_price') ?? '',
    quantity: formData.get('quantity'),
    condition: formData.get('condition'),
    description: formData.get('description') ?? '',
    is_published: formData.get('is_published') === 'on',
  });
  if (!parsed.success) return;
  const base = slugify(parsed.data.name);
  const slug = await ensureUniqueSlug(base, async (s) => {
    const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('slug', s);
    return (count ?? 0) > 0;
  });
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: parsed.data.name,
      slug,
      subcategory_id: parsed.data.subcategory_id,
      price_cents: parsePrice(parsed.data.price),
      original_price_cents: parsed.data.original_price ? parsePrice(parsed.data.original_price) : null,
      quantity: parsed.data.quantity,
      condition: parsed.data.condition,
      description: parsed.data.description ?? null,
      is_published: parsed.data.is_published ?? true,
    })
    .select('id')
    .single();
  if (error || !data) return;
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits`);
  revalidatePublicProductPages();
  redirect(`/${process.env.ADMIN_SLUG}/produits/${data.id}`);
}

export async function updateProduct(id: string, formData: FormData): Promise<void> {
  const supabase = await requireAuth();
  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    subcategory_id: formData.get('subcategory_id'),
    price: formData.get('price'),
    original_price: formData.get('original_price') ?? '',
    quantity: formData.get('quantity'),
    condition: formData.get('condition'),
    description: formData.get('description') ?? '',
    is_published: formData.get('is_published') === 'on',
  });
  if (!parsed.success) return;
  await supabase
    .from('products')
    .update({
      name: parsed.data.name,
      subcategory_id: parsed.data.subcategory_id,
      price_cents: parsePrice(parsed.data.price),
      original_price_cents: parsed.data.original_price ? parsePrice(parsed.data.original_price) : null,
      quantity: parsed.data.quantity,
      condition: parsed.data.condition,
      description: parsed.data.description ?? null,
      is_published: parsed.data.is_published ?? true,
    })
    .eq('id', id);
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits`);
  revalidatePublicProductPages();
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await requireAuth();
  await supabase.from('products').delete().eq('id', id);
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits`);
  revalidatePublicProductPages();
  redirect(`/${process.env.ADMIN_SLUG}/produits`);
}

export async function deleteProductFromList(id: string): Promise<void> {
  const supabase = await requireAuth();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(`Suppression : ${error.message}`);
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits`);
  revalidatePublicProductPages();
}

/** Variante FormData (passée comme `action` à un form, ou via fd.append). */
export async function deleteProductFromListForm(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('id manquant');
  await deleteProductFromList(id);
}

export async function setProductQuantity(id: string, formData: FormData): Promise<void> {
  const supabase = await requireAuth();
  const q = Number(formData.get('quantity'));
  if (!Number.isInteger(q) || q < 0) return;
  await supabase.from('products').update({ quantity: q }).eq('id', id);
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits`);
  revalidatePublicProductPages();
}
