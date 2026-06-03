# États de produit gérables en base (variables)

## Objectif
Les états de produit (« Neuf », « Très bon état »…) sont aujourd'hui figés dans
le code (`lib/condition.ts` + contrainte `CHECK` SQL). On veut que les **admins**
puissent ajouter/supprimer des états, stockés en base, visibles côté vitrine.

## Décisions
- **Qui gère** : rôle `admin` existant (pas de nouveau rôle). Employés exclus.
- **Suppression d'un état utilisé** : bloquée, avec message indiquant le nombre de
  produits concernés (cohérent avec la suppression de sous-catégorie). Garanti au
  niveau base par une FK `ON DELETE RESTRICT`.

## Modèle de données (migration `0008_product_conditions.sql`)
Table `public.product_conditions` :
- `id uuid pk default gen_random_uuid()`
- `slug text unique not null` — identifiant stable, généré depuis le libellé
- `label text not null`
- `position int not null default 0`
- `created_at timestamptz default now()`

Seed des 4 états actuels (positions 0→3).

`products.condition` :
- retrait de la contrainte `CHECK` figée ;
- ajout FK `products.condition → product_conditions(slug) ON DELETE RESTRICT`.

RLS `product_conditions` : lecture publique (`for select using (true)`),
écriture admin (`for all to authenticated using (is_admin()) with check (is_admin())`).

## Code
- `lib/condition.ts` : `type Condition = string`, `DEFAULT_CONDITIONS` (les 4),
  `conditionLabel(slug, options = DEFAULT_CONDITIONS)` (fallback = slug).
- `lib/repos/conditions.ts` : `getConditions()` (cache par requête) lit la table,
  retombe sur `DEFAULT_CONDITIONS` si vide.
- `ConditionBadge` / `ProductCard` / `ProductGrid` : prop `conditions` optionnelle
  (défaut = `DEFAULT_CONDITIONS`) — reste **synchrone** (tests inchangés).
- Pages serveur (vitrine catégories, produit, recherche ; admin liste/édition/nouveau)
  appellent `getConditions()` et passent la liste aux formulaires/filtres/grilles.
- Formulaires (`product-form`, `new-product-form`) et filtres (`filters`, `search-form`)
  reçoivent `conditions` en prop au lieu d'importer la constante.
- `produits/actions.ts` : validation `z.string()` + appartenance à la liste DB
  (la FK reste le garde-fou).
- `lib/supabase/types.ts` : `condition: string`, ajout du type `product_conditions`.

## Admin
- `app/[adminSlug]/etats/page.tsx` + `actions.ts` (`createCondition`, `deleteCondition`),
  admin-only via `requireAdmin`, sur le modèle de la page Catégories.
- Lien « États » dans la nav admin (visible admins uniquement).

## Rollout
Le SQL de la migration est appliqué manuellement dans le dashboard Supabase
(le projet n'est pas lié en CLI), puis déploiement du code.
