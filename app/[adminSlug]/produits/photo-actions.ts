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
  // negative temp positions to avoid unique conflict
  await Promise.all(orderedPositions.map((oldPos, idx) =>
    admin.from('product_photos').update({ position: -(idx + 1) }).eq('product_id', productId).eq('position', oldPos),
  ));
  await Promise.all(orderedPositions.map((_, idx) =>
    admin.from('product_photos').update({ position: idx }).eq('product_id', productId).eq('position', -(idx + 1)),
  ));
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits/${productId}`);
}
