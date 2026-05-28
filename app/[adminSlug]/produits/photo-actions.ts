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
 * Lève une Error avec un message explicite si quelque chose échoue.
 */
export async function addPhoto(productId: string, dataUrl: string): Promise<void> {
  await requireAuth();
  const admin = createAdminClient();

  // 1) Trouver la prochaine position libre
  const { data: existing, error: existingErr } = await admin
    .from('product_photos')
    .select('position')
    .eq('product_id', productId)
    .order('position');
  if (existingErr) throw new Error(`Lecture photos: ${existingErr.message}`);

  const usedPositions = new Set((existing ?? []).map((p) => p.position));
  let nextPos = 0;
  while (usedPositions.has(nextPos) && nextPos < 5) nextPos++;
  if (nextPos > 4) throw new Error('Maximum 5 photos atteint pour ce produit');

  // 2) Décoder la dataUrl
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx < 0) throw new Error('Format dataUrl invalide');
  const base64 = dataUrl.slice(commaIdx + 1);
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length === 0) throw new Error('Photo vide (base64 décodé = 0 octet)');

  // 3) Uploader dans Supabase Storage
  const path = `${productId}/${nextPos}.webp`;
  const { error: upErr } = await admin.storage.from('product-photos').upload(path, buffer, {
    contentType: 'image/webp',
    upsert: true,
  });
  if (upErr) {
    throw new Error(`Upload storage: ${upErr.message}`);
  }

  // 4) Enregistrer la référence en BDD
  const { error: insErr } = await admin.from('product_photos').upsert(
    { product_id: productId, storage_path: path, position: nextPos },
    { onConflict: 'product_id,position' },
  );
  if (insErr) {
    throw new Error(`Insert product_photos: ${insErr.message}`);
  }

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
