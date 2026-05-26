'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('unauthorized');
}

export async function addPhoto(productId: string, dataUrl: string): Promise<void> {
  await requireAuth();
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from('product_photos')
    .select('position')
    .eq('product_id', productId)
    .order('position');
  const usedPositions = new Set((existing ?? []).map((p) => p.position));
  let nextPos = 0;
  while (usedPositions.has(nextPos) && nextPos < 5) nextPos++;
  if (nextPos > 4) throw new Error('max 5 photos');

  const base64 = dataUrl.split(',')[1] ?? '';
  const buffer = Buffer.from(base64, 'base64');
  const path = `${productId}/${nextPos}.webp`;
  const { error: upErr } = await admin.storage.from('product-photos').upload(path, buffer, {
    contentType: 'image/webp',
    upsert: true,
  });
  if (upErr) throw upErr;
  await admin.from('product_photos').upsert(
    { product_id: productId, storage_path: path, position: nextPos },
    { onConflict: 'product_id,position' },
  );
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits/${productId}`);
}

export async function deletePhoto(productId: string, position: number): Promise<void> {
  await requireAuth();
  const admin = createAdminClient();
  await admin.storage.from('product-photos').remove([`${productId}/${position}.webp`]);
  await admin.from('product_photos').delete().eq('product_id', productId).eq('position', position);
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits/${productId}`);
}

export async function reorderPhotos(productId: string, orderedPositions: number[]): Promise<void> {
  await requireAuth();
  const admin = createAdminClient();

  // Read current rows to map old position -> storage_path
  const { data: rows } = await admin
    .from('product_photos')
    .select('position, storage_path')
    .eq('product_id', productId);
  const byPos = new Map((rows ?? []).map((r) => [r.position, r.storage_path]));

  // Delete current rows
  await admin.from('product_photos').delete().eq('product_id', productId);

  // Re-insert in new order with positions 0..N-1
  const toInsert = orderedPositions
    .map((oldPos, idx) => {
      const storagePath = byPos.get(oldPos);
      if (!storagePath) return null;
      return { product_id: productId, position: idx, storage_path: storagePath };
    })
    .filter((x): x is { product_id: string; position: number; storage_path: string } => x !== null);

  if (toInsert.length) {
    await admin.from('product_photos').insert(toInsert);
  }
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits/${productId}`);
}
