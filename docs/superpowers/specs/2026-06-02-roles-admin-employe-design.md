# Rôles Admin / Employé + invitations par email — Design

Date : 2026-06-02
Statut : validé

## Contexte

L'espace admin actuel vit sous `/[adminSlug]` (slug secret via `ADMIN_SLUG`). L'accès
est protégé par le `middleware.ts` : toute personne **connectée** (n'importe quel
compte Supabase Auth) accède à tout. Il n'existe aucune notion de rôle. La RLS
(`0002_rls.sql`) accorde l'écriture complète à `authenticated`.

## Objectif

Introduire deux rôles :

- **admin** : peut tout faire ce qu'un employé fait **+** gérer les comptes employés
  (inviter / supprimer). C'est un super-employé.
- **employee** : peut faire tout ce qui existe aujourd'hui (produits, catégories,
  avis) mais **ne voit pas** la gestion des comptes.

L'ajout d'un employé déclenche un **email d'invitation Supabase** ; l'employé crée
son mot de passe via le lien reçu. Le domaine de production est
`https://depotventedrancy.fr` (configuré sur Vercel).

## Décisions de conception

1. **Rôle stocké en base** (pas en env) → permet d'ajouter d'autres admins plus tard.
2. **Premier admin** : `alantouati22@gmail.com`, promu via une migration de seed.
3. **Login unique** : une seule page de connexion ; redirection selon le rôle après login.
4. **Config Supabase** : appliquée manuellement au dashboard (étapes fournies).
5. **Création d'admin** : l'UI n'invite que des **employés**. Pour promouvoir un admin,
   on modifie la colonne `role` dans `profiles` via le dashboard Supabase.

## Modèle de données

Nouvelle migration `supabase/migrations/0007_roles.sql` :

```sql
-- Table profiles : 1 ligne par utilisateur auth
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'employee' check (role in ('admin','employee')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Fonction is_admin() (security definer) pour la RLS et les checks serveur
create or replace function public.is_admin() returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Trigger : à chaque création d'un user auth, créer son profil (employee par défaut)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'employee')
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill : créer les profils des users déjà existants
insert into public.profiles (id, email, role)
select id, email, 'employee' from auth.users
on conflict (id) do nothing;

-- Seed du premier admin
update public.profiles set role = 'admin'
where email = 'alantouati22@gmail.com';

-- RLS profiles :
--   tout utilisateur connecté peut lire les profils (besoin pour la nav + page comptes)
--   seuls les admins peuvent écrire (en backstop ; l'UI passe par le service role)
create policy "auth read profiles" on public.profiles
  for select to authenticated using (true);
create policy "admin manage profiles" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
```

Note : la suppression d'un utilisateur via `auth.admin.deleteUser` supprime la ligne
`auth.users`, ce qui supprime en cascade la ligne `profiles`.

Le type `Database` (`lib/supabase/types.ts`) sera étendu avec la table `profiles`.

## Contrôle d'accès

- `middleware.ts` : **inchangé** (gating connecté / non-connecté + redirections login).
- `app/[adminSlug]/layout.tsx` : après `getUser()`, lit le rôle via
  `profiles` (`select role where id = user.id`). Passe `role` à `<AdminNav>`.
- `components/admin/admin-nav.tsx` : ajoute un lien **« Comptes »** rendu uniquement si
  `role === 'admin'`.
- `app/[adminSlug]/comptes/page.tsx` : vérifie le rôle côté serveur ; `redirect('/'+adminSlug)`
  si non-admin. La RLS sert de backstop.

Un helper `lib/auth/role.ts` exposera `getCurrentRole()` / `requireAdmin()` côté serveur
pour factoriser la lecture du rôle.

## Page « Comptes » (admin only)

`app/[adminSlug]/comptes/page.tsx` :

- Liste les membres (depuis `profiles`, triés par rôle puis email) : email, rôle, date.
- Formulaire **Inviter un employé** : champ email → server action `inviteEmployee`.
- Bouton **Supprimer** par employé → server action `deleteEmployee`.

Server actions dans `app/[adminSlug]/comptes/actions.ts` :

- `inviteEmployee(formData)` :
  - `requireAdmin()` (sinon erreur).
  - valide l'email (zod).
  - `createAdminClient().auth.admin.inviteUserByEmail(email, { redirectTo: '<baseUrl>/<adminSlug>/bienvenue' })`.
  - `baseUrl` = `https://depotventedrancy.fr` en prod, `request`/env-dérivé en dev.
  - retourne `{ error }` visible dans l'UI en cas d'échec ; sinon `revalidatePath`.
- `deleteEmployee(formData)` :
  - `requireAdmin()`.
  - garde-fous : refuse si la cible est **admin** ou si c'est **soi-même**.
  - `createAdminClient().auth.admin.deleteUser(id)`.
  - `revalidatePath`.

L'URL de base de redirection est centralisée (constante `SITE_URL` dérivée d'une env
publique optionnelle `NEXT_PUBLIC_SITE_URL`, défaut `https://depotventedrancy.fr`).

## Flux d'invitation / création de mot de passe

`app/[adminSlug]/bienvenue/page.tsx` + composant client :

- Le lien d'invitation Supabase ramène l'utilisateur avec un token (hash `#access_token`
  ou `?code=` selon le flow). Le client Supabase (`@supabase/ssr` côté navigateur)
  établit la session à l'arrivée.
- Formulaire **« Définir votre mot de passe »** → `supabase.auth.updateUser({ password })`.
- Succès → redirection vers `/[adminSlug]` (tableau de bord).
- Gestion d'erreur : lien expiré / invalide → message clair + invite à recontacter l'admin.

## Config Supabase (dashboard — étapes fournies à l'utilisateur)

1. **Authentication → URL Configuration**
   - Site URL : `https://depotventedrancy.fr`
   - Redirect URLs : ajouter `https://depotventedrancy.fr/**` et `http://localhost:3000/**`.
2. **Authentication → Email Templates → Invite user** : vérifier que le template pointe
   bien vers `{{ .ConfirmationURL }}` (défaut OK).
3. Aucune nouvelle clé serveur : on réutilise `SUPABASE_SERVICE_ROLE_KEY`.
4. (Optionnel) Ajouter `NEXT_PUBLIC_SITE_URL=https://depotventedrancy.fr` aux env Vercel
   pour rendre l'URL de redirection explicite.

## Gestion des erreurs

- Toute server action retourne `{ error: string }` rendu visiblement dans l'UI
  (pattern déjà en place dans le projet, cf. login + suppression produit).
- Garde-fous de suppression (pas d'auto-suppression, pas de suppression d'admin).
- Page `bienvenue` : messages explicites pour lien expiré / session absente.

## Tests

- **Unitaires (vitest)** : validation email d'invitation ; logique des garde-fous de
  `deleteEmployee` (cible admin / soi-même refusée) en isolant le client Supabase (mock).
- **Helper rôle** : `getCurrentRole` / `requireAdmin` testés avec un client mocké.
- **E2E (playwright)** : facultatif/manuel pour le flux email (dépend du mail réel).
  On documente un test manuel : inviter → recevoir le mail → définir mot de passe →
  accès employé sans lien « Comptes ».

## Hors périmètre (YAGNI)

- Promotion d'admin via l'UI (fait en base).
- Réinitialisation de mot de passe employé par l'admin (Supabase gère « mot de passe oublié »).
- Journalisation/audit des actions admin.
