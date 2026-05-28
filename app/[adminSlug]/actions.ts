'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { refreshGoogleReviews } from '@/lib/google-places';

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('unauthorized');
}

export async function refreshGoogleReviewsAction(): Promise<{
  ok: boolean;
  reviews?: number;
  rating?: number | null;
  total?: number | null;
  error?: string;
}> {
  try {
    await requireAuth();
    const result = await refreshGoogleReviews();
    revalidatePath('/', 'layout');
    return result;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
  }
}
