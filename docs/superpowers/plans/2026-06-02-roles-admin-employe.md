# Rôles Admin / Employé + invitations email — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduire deux rôles (admin / employee) où l'admin invite et supprime des comptes employés via email Supabase, l'employé conserve toutes les capacités actuelles.

**Architecture:** Le rôle est stocké dans une table `public.profiles` liée à `auth.users` (trigger d'auto-création + seed du premier admin). Le rôle est lu côté serveur via un helper (`lib/auth/role.ts`). La page `/[adminSlug]/comptes` (admin-only) appelle des server actions qui utilisent le service-role client pour `inviteUserByEmail` / `deleteUser`. Le lien d'invitation ramène l'employé sur `/[adminSlug]/bienvenue` pour définir son mot de passe.

**Tech Stack:** Next.js 16 (App Router), Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`), Postgres + RLS, Vitest, Zod, Tailwind.

---

## File Structure

- `supabase/migrations/0007_roles.sql` — **créer** : table `profiles`, `is_admin()`, trigger, backfill, seed admin, RLS.
- `lib/supabase/types.ts` — **modifier** : ajouter la table `profiles` + la fonction `is_admin` au type `Database`.
- `lib/site.ts` — **créer** : constante `SITE_URL` (base de redirection).
- `lib/site.test.ts` — **créer** : test de `SITE_URL`.
- `lib/auth/role.ts` — **créer** : `getCurrentRole()`, `requireAdmin()`.
- `lib/auth/accounts.ts` — **créer** : logique pure `canDelete()` + validation email (testable sans réseau).
- `lib/auth/accounts.test.ts` — **créer** : tests des garde-fous + validation.
- `app/[adminSlug]/layout.tsx` — **modifier** : lire le rôle, le passer à `<AdminNav>`.
- `components/admin/admin-nav.tsx` — **modifier** : lien « Comptes » si admin.
- `app/[adminSlug]/comptes/actions.ts` — **créer** : `inviteEmployee`, `deleteEmployee`.
- `app/[adminSlug]/comptes/page.tsx` — **créer** : liste + formulaires (server component).
- `app/[adminSlug]/comptes/accounts-ui.tsx` — **créer** : composants clients (formulaire invite + bouton supprimer).
- `app/[adminSlug]/bienvenue/page.tsx` — **créer** : page d'accueil invitation (server wrapper).
- `app/[adminSlug]/bienvenue/welcome-form.tsx` — **créer** : formulaire client « définir mot de passe ».
- `.env.local.example` — **modifier** : documenter `NEXT_PUBLIC_SITE_URL`.

---

## Task 1: Migration SQL des rôles

**Files:**
- Create: `supabase/migrations/0007_roles.sql`

- [ ] **Step 1: Écrire la migration**

Créer `supabase/migrations/0007_roles.sql` :

```sql
-- Rôles utilisateurs : table profiles liée à auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'employee' check (role in ('admin','employee')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- is_admin() : utilisé par la RLS et les checks serveur
create or replace function public.is_admin() returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- À la création d'un user auth, créer son profil (employee par défaut)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'employee')
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill des users existants
insert into public.profiles (id, email, role)
select id, email, 'employee' from auth.users
on conflict (id) do nothing;

-- Premier admin
update public.profiles set role = 'admin'
where email = 'alantouati22@gmail.com';

-- RLS : lecture par tout connecté ; écriture réservée aux admins (backstop)
create policy "auth read profiles" on public.profiles
  for select to authenticated using (true);
create policy "admin manage profiles" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
```

- [ ] **Step 2: Vérifier la syntaxe SQL localement (lecture)**

Run: `grep -c "create policy" supabase/migrations/0007_roles.sql`
Expected: `2`

> Note d'exécution : la migration sera appliquée sur Supabase par l'utilisateur
> (dashboard SQL editor ou `supabase db push`). Aucune commande locale ne l'exécute.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0007_roles.sql
git commit -m "feat(db): table profiles + rôles admin/employee (migration 0007)"
```

---

## Task 2: Étendre le type Database

**Files:**
- Modify: `lib/supabase/types.ts`

- [ ] **Step 1: Ajouter la table `profiles` aux Tables**

Dans `lib/supabase/types.ts`, juste après le bloc `google_business_info: { ... },` (avant la fermeture `};` de `Tables`), ajouter :

```ts
      profiles: {
        Row: { id: string; email: string; role: 'admin' | 'employee'; created_at: string };
        Insert: { id: string; email: string; role?: 'admin' | 'employee'; created_at?: string };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
```

- [ ] **Step 2: Déclarer la fonction `is_admin`**

Remplacer la ligne :

```ts
    Functions: Record<string, never>;
```

par :

```ts
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
```

- [ ] **Step 3: Vérifier la compilation TypeScript**

Run: `npx tsc --noEmit`
Expected: aucune erreur (exit 0).

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/types.ts
git commit -m "feat(types): table profiles + fonction is_admin dans Database"
```

---

## Task 3: Constante SITE_URL

**Files:**
- Create: `lib/site.ts`
- Test: `lib/site.test.ts`

- [ ] **Step 1: Écrire le test (échec attendu)**

Créer `lib/site.test.ts` :

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('siteUrl', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it('utilise le domaine de production par défaut', async () => {
    const { siteUrl } = await import('./site');
    expect(siteUrl()).toBe('https://depotventredrancy.fr');
  });

  it('respecte NEXT_PUBLIC_SITE_URL si défini, sans slash final', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000/';
    const { siteUrl } = await import('./site');
    expect(siteUrl()).toBe('http://localhost:3000');
  });
});
```

- [ ] **Step 2: Lancer le test (doit échouer)**

Run: `npx vitest run lib/site.test.ts`
Expected: FAIL (`Cannot find module './site'`).

- [ ] **Step 3: Implémenter `lib/site.ts`**

```ts
const DEFAULT_SITE_URL = 'https://depotventredrancy.fr';

/** URL de base du site, sans slash final. Utilisée pour les redirections d'auth. */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, '');
}
```

- [ ] **Step 4: Lancer le test (doit passer)**

Run: `npx vitest run lib/site.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/site.ts lib/site.test.ts
git commit -m "feat(site): helper siteUrl pour les redirections d'auth"
```

---

## Task 4: Logique pure des comptes (validation + garde-fous)

**Files:**
- Create: `lib/auth/accounts.ts`
- Test: `lib/auth/accounts.test.ts`

- [ ] **Step 1: Écrire le test (échec attendu)**

Créer `lib/auth/accounts.test.ts` :

```ts
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
```

- [ ] **Step 2: Lancer le test (doit échouer)**

Run: `npx vitest run lib/auth/accounts.test.ts`
Expected: FAIL (`Cannot find module './accounts'`).

- [ ] **Step 3: Implémenter `lib/auth/accounts.ts`**

```ts
import { z } from 'zod';

export type Role = 'admin' | 'employee';
export type Member = { id: string; role: Role };

const emailSchema = z.string().trim().toLowerCase().email();

export type ParseResult = { ok: true; email: string } | { ok: false; error: string };

export function parseInviteEmail(raw: string): ParseResult {
  const parsed = emailSchema.safeParse(raw);
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
```

- [ ] **Step 4: Lancer le test (doit passer)**

Run: `npx vitest run lib/auth/accounts.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/auth/accounts.ts lib/auth/accounts.test.ts
git commit -m "feat(auth): validation email invitation + garde-fous suppression"
```

---

## Task 5: Helper de rôle côté serveur

**Files:**
- Create: `lib/auth/role.ts`

- [ ] **Step 1: Implémenter `lib/auth/role.ts`**

```ts
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
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add lib/auth/role.ts
git commit -m "feat(auth): helper getCurrentMember/getCurrentRole côté serveur"
```

---

## Task 6: Nav conditionnelle + rôle dans le layout

**Files:**
- Modify: `app/[adminSlug]/layout.tsx`
- Modify: `components/admin/admin-nav.tsx`

- [ ] **Step 1: Passer le rôle au layout**

Dans `app/[adminSlug]/layout.tsx`, remplacer le corps de la fonction par :

```tsx
  const { adminSlug } = await params;
  if (adminSlug !== process.env.ADMIN_SLUG) {
    redirect('/');
  }
  const member = await getCurrentMember();
  return (
    <div className="min-h-screen bg-parchment">
      {member && <AdminNav slug={adminSlug} role={member.role} />}
      <main className="px-4 py-6 max-w-3xl mx-auto">{children}</main>
    </div>
  );
```

Et remplacer les imports en tête du fichier par :

```tsx
import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/auth/role';
import { AdminNav } from '@/components/admin/admin-nav';
```

(On retire l'import `createClient` devenu inutile.)

- [ ] **Step 2: Ajouter le lien Comptes dans la nav**

Remplacer le contenu de `components/admin/admin-nav.tsx` par :

```tsx
import Link from 'next/link';
import type { Role } from '@/lib/auth/accounts';
import { AdminSearchTrigger } from './admin-search-trigger';

export function AdminNav({ slug, role }: { slug: string; role: Role }) {
  return (
    <nav className="bg-navy text-parchment px-4 py-3 flex flex-wrap gap-3 items-center justify-between sticky top-0 z-30">
      <Link href={`/${slug}`} className="font-serif text-lg">Admin</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href={`/${slug}/produits`}>Produits</Link>
        <Link href={`/${slug}/categories`}>Catégories</Link>
        {role === 'admin' && <Link href={`/${slug}/comptes`}>Comptes</Link>}
      </div>
      <AdminSearchTrigger adminSlug={slug} />
    </nav>
  );
}
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add app/[adminSlug]/layout.tsx components/admin/admin-nav.tsx
git commit -m "feat(admin): lien Comptes visible pour les admins uniquement"
```

---

## Task 7: Server actions des comptes

**Files:**
- Create: `app/[adminSlug]/comptes/actions.ts`

- [ ] **Step 1: Implémenter les actions**

Créer `app/[adminSlug]/comptes/actions.ts` :

```ts
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
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/[adminSlug]/comptes/actions.ts
git commit -m "feat(comptes): server actions inviteEmployee/deleteEmployee"
```

---

## Task 8: UI clients de la page Comptes

**Files:**
- Create: `app/[adminSlug]/comptes/accounts-ui.tsx`

- [ ] **Step 1: Implémenter les composants clients**

Créer `app/[adminSlug]/comptes/accounts-ui.tsx` :

```tsx
'use client';
import { useActionState } from 'react';
import { inviteEmployee, deleteEmployee } from './actions';

type ActionResult = { error: string } | { ok: true };
type InviteState = { error?: string; success?: boolean } | null;

async function inviteAction(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const result: ActionResult = await inviteEmployee(formData);
  if ('error' in result) return { error: result.error };
  return { success: true };
}

export function InviteForm() {
  const [state, formAction, pending] = useActionState<InviteState, FormData>(inviteAction, null);
  return (
    <form action={formAction} className="bg-parchment-light border border-navy/10 rounded-lg p-4 space-y-3">
      <label className="block">
        <span className="text-xs uppercase tracking-wider text-bronze">Email de l'employé</span>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
          autoComplete="off"
        />
      </label>
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Invitation envoyée par email.</p>}
      <button
        disabled={pending}
        className="rounded-full bg-navy text-parchment px-5 py-2 font-semibold disabled:opacity-60"
      >
        {pending ? 'Envoi…' : 'Inviter'}
      </button>
    </form>
  );
}

type DeleteState = { error: string } | null;

async function deleteActionFn(_prev: DeleteState, formData: FormData): Promise<DeleteState> {
  const result: ActionResult = await deleteEmployee(formData);
  if ('error' in result) return { error: result.error };
  return null;
}

export function DeleteEmployeeButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState<DeleteState, FormData>(deleteActionFn, null);
  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <button
        disabled={pending}
        className="text-sm text-red-700 underline disabled:opacity-60"
      >
        {pending ? 'Suppression…' : 'Supprimer'}
      </button>
      {state?.error && <span className="text-xs text-red-700">{state.error}</span>}
    </form>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/[adminSlug]/comptes/accounts-ui.tsx
git commit -m "feat(comptes): composants clients invitation + suppression"
```

---

## Task 9: Page Comptes (server component, admin-only)

**Files:**
- Create: `app/[adminSlug]/comptes/page.tsx`

- [ ] **Step 1: Implémenter la page**

Créer `app/[adminSlug]/comptes/page.tsx` :

```tsx
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentMember } from '@/lib/auth/role';
import { InviteForm, DeleteEmployeeButton } from './accounts-ui';

export const dynamic = 'force-dynamic';

export default async function ComptesPage({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;
  const member = await getCurrentMember();
  if (!member || member.role !== 'admin') {
    redirect(`/${adminSlug}`);
  }

  const admin = createAdminClient();
  const { data: members } = await admin
    .from('profiles')
    .select('id, email, role, created_at')
    .order('role', { ascending: true })
    .order('email', { ascending: true });

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Comptes</h1>

      <section className="mb-8">
        <h2 className="font-serif text-lg mb-3">Inviter un employé</h2>
        <InviteForm />
      </section>

      <section>
        <h2 className="font-serif text-lg mb-3">Membres</h2>
        <ul className="space-y-2">
          {(members ?? []).map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 bg-parchment-light border border-navy/10 rounded p-3"
            >
              <div>
                <div className="text-sm">{m.email}</div>
                <div className="text-xs text-bronze uppercase tracking-wider">
                  {m.role === 'admin' ? 'Administrateur' : 'Employé'}
                </div>
              </div>
              {m.role === 'employee' && m.id !== member.id && <DeleteEmployeeButton id={m.id} />}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/[adminSlug]/comptes/page.tsx
git commit -m "feat(comptes): page de gestion des comptes (admin-only)"
```

---

## Task 10: Page bienvenue — formulaire de mot de passe

**Files:**
- Create: `app/[adminSlug]/bienvenue/welcome-form.tsx`
- Create: `app/[adminSlug]/bienvenue/page.tsx`

- [ ] **Step 1: Implémenter le formulaire client**

Créer `app/[adminSlug]/bienvenue/welcome-form.tsx` :

```tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function WelcomeForm({ adminSlug }: { adminSlug: string }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Le lien d'invitation établit la session automatiquement (detectSessionInUrl).
  // On vérifie qu'une session existe avant d'afficher le formulaire.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else setSessionError(true);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push(`/${adminSlug}`);
  }

  if (sessionError) {
    return (
      <p className="text-sm text-red-700">
        Lien d'invitation invalide ou expiré. Demandez à l'administrateur de vous réinviter.
      </p>
    );
  }
  if (!ready) {
    return <p className="text-sm text-bronze">Vérification de votre invitation…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm bg-parchment-light border border-navy/10 rounded-lg p-6 space-y-4">
      <h1 className="font-serif text-2xl">Bienvenue</h1>
      <p className="text-sm text-bronze">Choisissez votre mot de passe pour activer votre compte.</p>
      <label className="block">
        <span className="text-xs uppercase tracking-wider text-bronze">Mot de passe</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
          autoComplete="new-password"
        />
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-wider text-bronze">Confirmer</span>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
          autoComplete="new-password"
        />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-full bg-navy text-parchment py-2 font-semibold disabled:opacity-60"
      >
        {pending ? 'Activation…' : 'Activer mon compte'}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Implémenter la page wrapper**

Créer `app/[adminSlug]/bienvenue/page.tsx` :

```tsx
import { WelcomeForm } from './welcome-form';

export const dynamic = 'force-dynamic';

export default async function BienvenuePage({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-parchment">
      <WelcomeForm adminSlug={adminSlug} />
    </div>
  );
}
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add app/[adminSlug]/bienvenue/welcome-form.tsx app/[adminSlug]/bienvenue/page.tsx
git commit -m "feat(bienvenue): activation de compte employé (définir mot de passe)"
```

---

## Task 11: Middleware — autoriser /bienvenue sans session

**Files:**
- Modify: `middleware.ts`

**Contexte:** le lien d'invitation arrive sur `/[adminSlug]/bienvenue` AVANT que la session
côté serveur (cookies) ne soit posée — le token est dans le hash d'URL côté client. Le
middleware actuel redirigerait vers `/login`. On doit traiter `/bienvenue` comme une route
publique de l'espace admin (au même titre que `/login`).

- [ ] **Step 1: Modifier la condition de redirection**

Dans `middleware.ts`, remplacer :

```ts
    const isLogin = path === `/${adminSlug}/login`;
    if (!user && !isLogin) {
```

par :

```ts
    const isLogin = path === `/${adminSlug}/login`;
    const isWelcome = path === `/${adminSlug}/bienvenue`;
    if (!user && !isLogin && !isWelcome) {
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat(middleware): route bienvenue accessible sans session (invitation)"
```

---

## Task 12: Documenter NEXT_PUBLIC_SITE_URL

**Files:**
- Modify: `.env.local.example`

- [ ] **Step 1: Ajouter la variable**

Dans `.env.local.example`, ajouter après la ligne `ADMIN_SLUG=admin-xY3kQ9` :

```
# URL de base pour les redirections d'invitation (défaut: https://depotventredrancy.fr)
NEXT_PUBLIC_SITE_URL=https://depotventredrancy.fr
```

- [ ] **Step 2: Commit**

```bash
git add .env.local.example
git commit -m "docs(env): documenter NEXT_PUBLIC_SITE_URL"
```

---

## Task 13: Vérification finale + suite de tests

**Files:** aucun (vérification)

- [ ] **Step 1: Lancer toute la suite de tests unitaires**

Run: `npx vitest run`
Expected: PASS (tous les tests, dont `site.test.ts` et `accounts.test.ts`).

- [ ] **Step 2: Vérifier le typage global**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Build de production**

Run: `npm run build`
Expected: build réussi sans erreur de type ni de page.

---

## Étapes manuelles post-implémentation (utilisateur)

Ces étapes ne sont pas du code mais sont nécessaires pour que la fonctionnalité marche en production :

1. **Appliquer la migration** `0007_roles.sql` sur Supabase (SQL editor du dashboard, ou `supabase db push` si le projet est lié).
2. **Supabase → Authentication → URL Configuration** :
   - Site URL : `https://depotventredrancy.fr`
   - Redirect URLs : ajouter `https://depotventredrancy.fr/**` et `http://localhost:3000/**`.
3. **Supabase → Authentication → Email Templates → Invite user** : vérifier que le bouton pointe vers `{{ .ConfirmationURL }}` (défaut OK).
4. **Vercel** : ajouter la variable d'env `NEXT_PUBLIC_SITE_URL=https://depotventredrancy.fr` (Production), puis redéployer.
5. **Test manuel de bout en bout** : se connecter en admin → page Comptes → inviter un email → recevoir le mail → définir le mot de passe sur `/bienvenue` → vérifier l'accès employé (pas de lien « Comptes ») → en admin, supprimer cet employé.

---

## Self-Review (auteur du plan)

- **Couverture spec :** profiles+trigger+seed (T1), types (T2), SITE_URL (T3), validation+garde-fous (T4), helper rôle (T5), nav conditionnelle+layout (T6), actions invite/delete (T7), UI (T8), page comptes admin-only (T9), flux bienvenue (T10), middleware (T11), env (T12), config Supabase manuelle (section dédiée). ✅
- **Placeholders :** aucun — tout le code est fourni intégralement. ✅
- **Cohérence des types :** `Role`/`Member` définis en T4 et réutilisés en T5/T6/T7 ; `getCurrentMember` défini en T5, utilisé en T6/T7/T9 ; `siteUrl()` défini en T3, utilisé en T7 ; actions retournent `{ error } | { ok: true }` cohérent entre T7 et T8. ✅
