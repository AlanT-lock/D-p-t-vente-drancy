import { createClient } from '@/lib/supabase/server';
import type { Role } from './accounts';

/** Renvoie l'utilisateur connecté et son rôle, ou null si non connecté. */
export async function getCurrentMember(): Promise<{ id: string; email: string; role: Role } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .maybeSingle();
  return {
    id: user.id,
    email: profile?.email ?? user.email ?? '',
    role: (profile?.role as Role) ?? 'employee',
  };
}

/** Renvoie le rôle de l'utilisateur connecté ('employee' par défaut). */
export async function getCurrentRole(): Promise<Role | null> {
  const member = await getCurrentMember();
  return member?.role ?? null;
}

/** Renvoie le membre connecté s'il est admin, sinon null. */
export async function requireAdmin(): Promise<{ id: string; email: string; role: Role } | null> {
  const member = await getCurrentMember();
  return member && member.role === 'admin' ? member : null;
}
