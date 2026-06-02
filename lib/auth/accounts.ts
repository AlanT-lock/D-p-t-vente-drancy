import { z } from 'zod';

export type Role = 'admin' | 'employee';
export type Member = { id: string; role: Role };

const emailSchema = z.email();

export type ParseResult = { ok: true; email: string } | { ok: false; error: string };

export function parseInviteEmail(raw: string): ParseResult {
  const normalized = raw.trim().toLowerCase();
  const parsed = emailSchema.safeParse(normalized);
  if (!parsed.success) return { ok: false, error: 'Adresse email invalide.' };
  return { ok: true, email: parsed.data };
}

export type GuardResult = { ok: true } | { ok: false; error: string };

export function canDeleteMember(actor: Member, target: Member): GuardResult {
  if (actor.id === target.id) {
    return { ok: false, error: 'Vous ne pouvez pas supprimer votre propre compte.' };
  }
  if (target.role === 'admin') {
    return { ok: false, error: 'Impossible de supprimer un compte administrateur.' };
  }
  return { ok: true };
}
