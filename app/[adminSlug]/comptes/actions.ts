'use server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentMember } from '@/lib/auth/role';
import { parseInviteEmail, canDeleteMember } from '@/lib/auth/accounts';
import { siteUrl } from '@/lib/site';

const slug = () => process.env.ADMIN_SLUG;

export async function inviteEmployee(formData: FormData): Promise<{ error: string } | { ok: true }> {
  const actor = await getCurrentMember();
  if (!actor || actor.role !== 'admin') return { error: 'Action réservée aux administrateurs.' };

  const parsed = parseInviteEmail(String(formData.get('email') ?? ''));
  if (!parsed.ok) return { error: parsed.error };

  const admin = createAdminClient();
  const redirectTo = `${siteUrl()}/${slug()}/bienvenue`;
  const { error } = await admin.auth.admin.inviteUserByEmail(parsed.email, { redirectTo });
  if (error) return { error: error.message };

  revalidatePath(`/${slug()}/comptes`);
  return { ok: true };
}

export async function deleteEmployee(formData: FormData): Promise<{ error: string } | { ok: true }> {
  const actor = await getCurrentMember();
  if (!actor || actor.role !== 'admin') return { error: 'Action réservée aux administrateurs.' };

  const targetId = String(formData.get('id') ?? '');
  if (!targetId) return { error: 'Compte introuvable.' };

  const admin = createAdminClient();
  const { data: target } = await admin
    .from('profiles')
    .select('id, role')
    .eq('id', targetId)
    .maybeSingle();
  if (!target) return { error: 'Compte introuvable.' };

  const guard = canDeleteMember(actor, { id: target.id, role: target.role });
  if (!guard.ok) return { error: guard.error };

  const { error } = await admin.auth.admin.deleteUser(targetId);
  if (error) return { error: error.message };

  revalidatePath(`/${slug()}/comptes`);
  return { ok: true };
}
