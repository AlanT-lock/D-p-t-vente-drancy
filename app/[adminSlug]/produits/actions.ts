'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/slugify';
import { parsePrice } from '@/lib/format';
import { ensureUniqueSlug } from '@/lib/unique-slug';

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
  quantity: z.coerce.number().int().min(0),
  condition: z.enum(['neuf', 'tres_bon_etat', 'bon_etat', 'etat_usage']),
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
      quantity: parsed.data.quantity,
      condition: parsed.data.condition,
      description: parsed.data.description ?? null,
      is_published: parsed.data.is_published ?? true,
    })
    .select('id')
    .single();
  if (error || !data) return { error: error?.message ?? 'Erreur de création' };
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits`);
  return { id: data.id };
}

export async function createProduct(formData: FormData): Promise<void> {
  const supabase = await requireAuth();
  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    subcategory_id: formData.get('subcategory_id'),
    price: formData.get('price'),
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
      quantity: parsed.data.quantity,
      condition: parsed.data.condition,
      description: parsed.data.description ?? null,
      is_published: parsed.data.is_published ?? true,
    })
    .select('id')
    .single();
  if (error || !data) return;
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits`);
  redirect(`/${process.env.ADMIN_SLUG}/produits/${data.id}`);
}

export async function updateProduct(id: string, formData: FormData): Promise<void> {
  const supabase = await requireAuth();
  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    subcategory_id: formData.get('subcategory_id'),
    price: formData.get('price'),
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
      quantity: parsed.data.quantity,
      condition: parsed.data.condition,
      description: parsed.data.description ?? null,
      is_published: parsed.data.is_published ?? true,
    })
    .eq('id', id);
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits`);
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await requireAuth();
  await supabase.from('products').delete().eq('id', id);
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits`);
  redirect(`/${process.env.ADMIN_SLUG}/produits`);
}

export async function deleteProductFromList(id: string): Promise<void> {
  const supabase = await requireAuth();
  await supabase.from('products').delete().eq('id', id);
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits`);
}

export async function setProductQuantity(id: string, formData: FormData): Promise<void> {
  const supabase = await requireAuth();
  const q = Number(formData.get('quantity'));
  if (!Number.isInteger(q) || q < 0) return;
  await supabase.from('products').update({ quantity: q }).eq('id', id);
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits`);
}
