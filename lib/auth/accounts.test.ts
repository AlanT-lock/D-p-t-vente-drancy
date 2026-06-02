import { describe, it, expect } from 'vitest';
import { parseInviteEmail, canDeleteMember } from './accounts';

describe('parseInviteEmail', () => {
  it('accepte un email valide et le normalise', () => {
    expect(parseInviteEmail('  Jean.Dupont@Example.COM ')).toEqual({
      ok: true,
      email: 'jean.dupont@example.com',
    });
  });

  it('rejette un email invalide', () => {
    expect(parseInviteEmail('pas-un-email')).toEqual({
      ok: false,
      error: 'Adresse email invalide.',
    });
  });

  it('rejette une valeur vide', () => {
    expect(parseInviteEmail('')).toEqual({ ok: false, error: 'Adresse email invalide.' });
  });
});

describe('canDeleteMember', () => {
  const actor = { id: 'admin-1', role: 'admin' as const };

  it('autorise la suppression d\'un employé par un admin', () => {
    expect(canDeleteMember(actor, { id: 'emp-1', role: 'employee' })).toEqual({ ok: true });
  });

  it('refuse de se supprimer soi-même', () => {
    expect(canDeleteMember(actor, { id: 'admin-1', role: 'admin' })).toEqual({
      ok: false,
      error: 'Vous ne pouvez pas supprimer votre propre compte.',
    });
  });

  it('refuse de supprimer un autre admin', () => {
    expect(canDeleteMember(actor, { id: 'admin-2', role: 'admin' })).toEqual({
      ok: false,
      error: 'Impossible de supprimer un compte administrateur.',
    });
  });
});
