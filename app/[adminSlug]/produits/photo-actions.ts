'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('unauthorized');
}

/**
 * Ajoute une photo à un produit.
 * Reçoit un FormData avec :
 *   - productId : string (uuid)
 *   - photo     : File (image, idéalement déjà compressée en webp)
 *
 * On passe par FormData/File au lieu d'un dataURL base64 :
 *   - Pas de "Maximum array nesting" (limite Next 16)
 *   - 25 % plus petit (pas d'overhead base64)
 *   - Streamé, pas chargé tout en mémoire pour la sérialisation
 */
export async function addPhoto(formData: FormData): Promise<void> {
  await requireAuth();

  const productId = String(formData.get('productId') ?? '');
  const file = formData.get('photo');
  if (!productId) throw new Error('productId manquant');
  if (!(file instanceof File)) throw new Error('Fichier photo manquant');
  if (file.size === 0) throw new Error('Photo vide');

  const admin = createAdminClient();

  // 1) Vérifier que le produit existe
  const { data: prod, error: prodErr } = await admin
    .from('products')
    .select('id')
    .eq('id', productId)
    .maybeSingle();
  if (prodErr) throw new Error(`Vérif produit : ${prodErr.message}`);
  if (!prod) throw new Error(`Produit introuvable (id=${productId})`);

  // 2) Trouver la prochaine position libre
  const { data: existing, error: existingErr } = await admin
    .from('product_photos')
    .select('position')
    .eq('product_id', productId)
    .order('position');
  if (existingErr) throw new Error(`Lecture photos : ${existingErr.message}`);

  // Première position libre (pas de plafond : nombre de photos illimité).
  const usedPositions = new Set((existing ?? []).map((p) => p.position));
  let nextPos = 0;
  while (usedPositions.has(nextPos)) nextPos++;

  // 3) Convertir le File en Buffer Node
  const arrayBuf = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);
  if (buffer.length === 0) throw new Error('Buffer photo vide après lecture');

  // 4) Uploader dans Supabase Storage
  const path = `${productId}/${nextPos}.webp`;
  const contentType = file.type && file.type.startsWith('image/') ? file.type : 'image/webp';
  const { error: upErr } = await admin.storage
    .from('product-photos')
    .upload(path, buffer, { contentType, upsert: true });
  if (upErr) throw new Error(`Upload storage : ${upErr.message}`);

  // 5) Enregistrer la référence en BDD
  const { error: insErr } = await admin
    .from('product_photos')
    .upsert(
      { product_id: productId, storage_path: path, position: nextPos },
      { onConflict: 'product_id,position' },
    );
  if (insErr) throw new Error(`Insert product_photos : ${insErr.message}`);

  revalidatePath(`/${process.env.ADMIN_SLUG}/produits/${productId}`);
}

export async function deletePhoto(productId: string, position: number): Promise<void> {
  await requireAuth();
  const admin = createAdminClient();
  await admin.storage.from('product-photos').remove([`${productId}/${position}.webp`]);
  await admin
    .from('product_photos')
    .delete()
    .eq('product_id', productId)
    .eq('position', position);
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits/${productId}`);
}

export async function reorderPhotos(
  productId: string,
  orderedPositions: number[],
): Promise<void> {
  await requireAuth();
  const admin = createAdminClient();

  const { data: rows } = await admin
    .from('product_photos')
    .select('position, storage_path')
    .eq('product_id', productId);
  const byPos = new Map((rows ?? []).map((r) => [r.position, r.storage_path]));

  await admin.from('product_photos').delete().eq('product_id', productId);

  const toInsert = orderedPositions
    .map((oldPos, idx) => {
      const storagePath = byPos.get(oldPos);
      if (!storagePath) return null;
      return { product_id: productId, position: idx, storage_path: storagePath };
    })
    .filter(
      (x): x is { product_id: string; position: number; storage_path: string } => x !== null,
    );

  if (toInsert.length) {
    await admin.from('product_photos').insert(toInsert);
  }
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits/${productId}`);
}
