'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/role';
import { slugify } from '@/lib/slugify';
import { ensureUniqueSlug } from '@/lib/unique-slug';
import { serverEnv } from '@/lib/env';

const etatsPath = () => `/${serverEnv().ADMIN_SLUG}/etats`;

export async function createCondition(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) redirect(`${etatsPath()}?error=forbidden`);

  const label = String(formData.get('label') ?? '').trim();
  if (!label) return;
  const base = slugify(label);
  if (!base) redirect(`${etatsPath()}?error=slug`);

  const supabase = await createClient();
  const slug = await ensureUniqueSlug(base, async (s) => {
    const { count } = await supabase
      .from('product_conditions')
      .select('*', { count: 'exact', head: true })
      .eq('slug', s);
    return (count ?? 0) > 0;
  });

  // Place le nouvel état en dernier.
  const { data: last } = await supabase
    .from('product_conditions')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? -1) + 1;

  const { error } = await supabase.from('product_conditions').insert({ slug, label, position });
  if (error) redirect(`${etatsPath()}?error=creation`);
  revalidatePath(etatsPath());
  revalidatePath('/');
  redirect(etatsPath());
}

export async function deleteCondition(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) redirect(`${etatsPath()}?error=forbidden`);

  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const supabase = await createClient();
  const { data: cond } = await supabase
    .from('product_conditions')
    .select('slug')
    .eq('id', id)
    .maybeSingle();
  if (!cond) return;

  // La FK products.condition est ON DELETE RESTRICT : on détecte les produits
  // concernés pour afficher un message clair plutôt qu'un échec silencieux.
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('condition', cond.slug);
  if ((count ?? 0) > 0) {
    redirect(`${etatsPath()}?error=produits&n=${count}`);
  }

  const { error } = await supabase.from('product_conditions').delete().eq('id', id);
  if (error) redirect(`${etatsPath()}?error=suppression`);
  revalidatePath(etatsPath());
  revalidatePath('/');
  redirect(etatsPath());
}
