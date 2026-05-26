# Dépôt Vente de Drancy — Site vitrine & espace admin

**Date :** 2026-05-26
**Statut :** design validé, prêt pour la planification d'implémentation

## Contexte

Création d'un site vitrine moderne pour le commerce **Dépôt Vente de Drancy**. Le site présente le catalogue produits (catégories + sous-catégories) sans permettre l'achat en ligne : l'objectif est de **drainer les visiteurs en boutique**. Un espace admin mobile-first permet au gérant d'ajouter/modifier produits, catégories et sous-catégories depuis son téléphone.

Le commerce n'a pas d'identité de marque installée — la direction visuelle est libre, validée à "moderne + vintage".

## Objectifs

- **Vitrine moderne type e-commerce** (recherche instantanée, filtres facettes, galerie photos), mais **sans tunnel d'achat** : tous les CTA produit dirigent vers le téléphone ou la visite en boutique.
- **Admin mobile-first** : le gérant doit pouvoir ajouter un produit avec photos depuis son iPhone en moins d'une minute.
- **Avis Google réels** affichés sur le site (rafraîchis quotidiennement).
- **Intégration cartes** : boutons Google Maps / Apple Maps / Waze toujours accessibles.

## Hors scope

- Achat / paiement en ligne, panier, favoris, comptes utilisateurs côté vitrine.
- Notifications email/SMS, multi-utilisateurs admin, brouillons, audit trail.
- Analytics avancée (Vercel Analytics pourra être ajouté plus tard).
- Réservation en ligne d'articles.

## Stack technique

- **Next.js 15** (App Router) déployé sur **Vercel**
- **Supabase** : Postgres (données), Auth (admin), Storage (photos)
- **Meilisearch Cloud** : index produits, recherche instantanée et facettes
- **Google Places API** : avis + note du commerce
- **Tailwind CSS + shadcn/ui** : design system

### Stratégie de rendu Next.js

| Type de page | Rendu |
|---|---|
| Pages statiques (accueil, contact, mentions) | SSG |
| Catégorie / sous-catégorie / page produit | RSC dynamique + cache 60s |
| Recherche (barre + facettes) | Côté client, requêtes directes à Meilisearch |
| Admin | RSC dynamique, sans cache |

## Direction visuelle

Structure e-commerce moderne (Inter sans-serif corps + Fraunces serif titres) avec palette parchemin/navy/laiton.

**Palette finale**
| Rôle | Hex |
|---|---|
| Fond principal | `#F4ECD8` (parchemin) |
| Fond cartes / surface | `#FBF6E8` (parchemin clair) |
| Texte principal, CTA primaire | `#1B2A3A` (navy) |
| Accent (italiques, badges, liens actifs) | `#C9A961` (laiton) |
| Sous-titres / labels | `#8B6F47` (bronze) |

**Typographies**
- Titres : **Fraunces** (variable, italique expressif)
- Corps : **Inter**

Tonalité : "brocante haut de gamme moderne", proche de Selency dans la rigueur du layout, mais avec une signature couleur plus chaude.

## Modèle de données

### Tables Supabase

```sql
-- Catégories (niveau 1)
categories (
  id          uuid PK
  name        text NOT NULL
  slug        text UNIQUE NOT NULL
  position    int DEFAULT 0
  created_at  timestamptz DEFAULT now()
)

-- Sous-catégories (niveau 2)
subcategories (
  id            uuid PK
  category_id   uuid FK → categories.id ON DELETE CASCADE
  name          text NOT NULL
  slug          text NOT NULL
  position      int DEFAULT 0
  UNIQUE (category_id, slug)
)

-- Produits
products (
  id              uuid PK
  subcategory_id  uuid FK → subcategories.id ON DELETE RESTRICT
  name            text NOT NULL
  slug            text UNIQUE NOT NULL
  description     text
  price_cents     int NOT NULL              -- centimes, jamais de float
  quantity        int NOT NULL DEFAULT 1
  condition       text NOT NULL
    CHECK (condition IN ('neuf','tres_bon_etat','bon_etat','etat_usage'))
  is_published    boolean NOT NULL DEFAULT true
  created_at      timestamptz DEFAULT now()
  updated_at      timestamptz DEFAULT now()
)

-- Photos (1 à 5 par produit, ordre maîtrisé, position 0 = principale)
product_photos (
  id           uuid PK
  product_id   uuid FK → products.id ON DELETE CASCADE
  storage_path text NOT NULL          -- ex "<product_id>/0.webp"
  position     int NOT NULL CHECK (position BETWEEN 0 AND 4)
  UNIQUE (product_id, position)
)

-- Cache des avis Google (refresh quotidien)
google_reviews_cache (
  id            uuid PK DEFAULT gen_random_uuid()
  author_name   text
  rating        int CHECK (rating BETWEEN 1 AND 5)
  text          text
  relative_time text
  profile_photo text
  fetched_at    timestamptz DEFAULT now()
)

-- Singleton : note moyenne + total
google_business_info (
  id            int PK DEFAULT 1 CHECK (id = 1)
  rating        numeric(2,1)
  total_reviews int
  fetched_at    timestamptz DEFAULT now()
)
```

### Storage

- Bucket `product-photos`, public en lecture
- Path : `<product_id>/<position>.webp`
- Conversion en webp côté serveur à l'upload (taille max ~1600px côté long)

### Row Level Security

- Lecture publique : `categories`, `subcategories`, `products` (avec `is_published = true`), `product_photos`, `google_reviews_cache`, `google_business_info`
- Écriture : rôle `authenticated` uniquement (admin connecté)
- Storage : lecture publique, écriture authenticated uniquement

### Seed initial

Création automatique au premier déploiement (modifiable depuis l'admin) :

| Catégorie | Sous-catégories |
|---|---|
| Mobilier | Canapés, Tables, Chaises, Rangements, Lits |
| Décoration | Luminaires, Miroirs, Vases, Tableaux |
| Vaisselle | Assiettes, Verres, Couverts |
| Vêtements | Femme, Homme, Enfant |
| Bijoux & accessoires | (vide) |
| Électroménager | (vide) |
| Livres & disques | (vide) |

## Site vitrine — pages

| Route | Contenu |
|---|---|
| `/` | Hero, bandeau "pas de vente en ligne", grille catégories, 6 produits récents, bloc avis Google, bloc contact |
| `/categories` | Grille de toutes les catégories |
| `/c/[category-slug]` | Sous-catégories + produits de la catégorie + filtres |
| `/c/[category-slug]/[subcategory-slug]` | Produits de la sous-catégorie + filtres |
| `/produit/[product-slug]` | Galerie photos swipeable, infos produit, CTA "appeler / venir voir", suggestions même sous-catégorie |
| `/recherche?q=...` | Résultats Meilisearch instantanés + facettes |
| `/contact` | Adresse, carte intégrée, horaires, téléphone, boutons Maps |
| `/mentions-legales` | Standard |

### Composants clés

**Header** (sticky, mobile + desktop)
- Logo "Dépôt Vente de Drancy" (Fraunces)
- Barre de recherche (déclenche overlay Meilisearch)
- Nav : Accueil, Catégories (dropdown), Avis, Contact
- Bouton "📞 Appeler" toujours visible sur mobile

**Footer**
- Adresse, horaires, téléphone
- 3 boutons côte à côte : Google Maps · Apple Maps · Waze
- Lien "Voir tous les avis sur Google"
- Mentions légales

**Carte produit**
- Photo principale
- Sous-catégorie (uppercase, bronze) · État
- Nom produit (Fraunces)
- Prix
- Badge "Pièce unique" (navy/laiton) si `quantity = 1`

**Filtres** (sidebar desktop, drawer mobile)
- Sous-catégorie
- Fourchette de prix (slider)
- État (checkboxes multi-sélection)
- Toggle "Disponible uniquement" (cache les produits à quantité 0)

**Tri** : Récents · Prix ↑ · Prix ↓ · Nom A-Z

**Bloc CTA page produit** ("règle anti-achat-en-ligne")
- Aucun bouton "Acheter" ou "Panier"
- Bloc proéminent **"Cet article vous intéresse ?"** avec 3 boutons :
  - 📞 Appeler la boutique (`tel:` link)
  - 📍 Venir voir l'article (ouvre Google/Apple/Waze)
  - 💬 Demander des infos (`mailto:` ou WhatsApp si numéro pro fourni plus tard)
- Mention "Réservation possible par téléphone" + horaires du jour

## Espace admin — mobile-first

### Accès

- URL secrète à slug aléatoire stockée dans `ADMIN_SLUG` (ex: `admin-xY3kQ9`)
- Header `X-Robots-Tag: noindex, nofollow` sur toutes les routes admin
- Page de login Supabase Auth (email + password)
- Compte admin créé manuellement dans Supabase (pas de signup public)
- Session via cookie httpOnly, refresh auto
- Middleware Next.js protège `/<ADMIN_SLUG>/*` (sauf `/login`)

### Pages

| Route | Contenu |
|---|---|
| `/<ADMIN_SLUG>/login` | Email + password |
| `/<ADMIN_SLUG>` | Dashboard : compteurs, dernier produit, CTA "+ Ajouter un produit" |
| `/<ADMIN_SLUG>/produits` | Liste paginée + recherche + filtre catégorie |
| `/<ADMIN_SLUG>/produits/nouveau` | Formulaire création |
| `/<ADMIN_SLUG>/produits/[id]` | Formulaire édition |
| `/<ADMIN_SLUG>/categories` | Liste catégories avec drag-to-reorder, création |
| `/<ADMIN_SLUG>/categories/[id]` | Édition catégorie + gestion sous-catégories |

### Formulaire produit (mobile-first)

Champs :
- **Photos** (1 à 5) — bouton "+ Ajouter une photo" ouvre la pellicule iPhone, conversion auto en webp, drag-to-reorder, position 0 = principale
- **Catégorie** — `<select>` natif
- **Sous-catégorie** — `<select>` natif, filtré dynamiquement selon catégorie
- **Nom** — input texte
- **Prix (€)** — input numérique, conversion en centimes en BDD
- **Quantité** — input numérique, défaut 1
- **État** — dropdown : Neuf / Très bon état / Bon état / État d'usage
- **Description** — textarea
- **Publié** — toggle, par défaut on

Boutons sticky en bas : "Enregistrer" (vert), "Supprimer" (rouge, édition uniquement)

## Intégrations externes

### Google Places API

- Variables : `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID`
- Cron Vercel quotidien `/api/cron/refresh-google-reviews` :
  1. Fetch `place details` (champs : `rating`, `user_ratings_total`, `reviews` — max 5)
  2. Upsert dans `google_business_info` + remplacement complet de `google_reviews_cache`
- Le site lit toujours depuis la BDD (jamais l'API en direct)
- Route protégée par `Authorization: Bearer ${CRON_SECRET}`

### Meilisearch Cloud

- Index `products`
- `searchableAttributes` : `name`, `description`, `category_name`, `subcategory_name`
- `filterableAttributes` : `subcategory_slug`, `category_slug`, `condition`, `price_cents`, `is_published`
- `sortableAttributes` : `price_cents`, `created_at`
- **Sync** : Supabase Database Webhook sur INSERT/UPDATE/DELETE de `products` → `/api/meili/sync` (HMAC-signé via header secret)
- **Sync sur catégories/sous-catégories** : webhook équivalent qui re-indexe les produits affectés
- **Cron Vercel quotidien** : full re-index de sécurité
- Côté client : `meilisearch-js` + composants `react-instantsearch` (ou équivalent léger)

### Boutons Maps

Toujours visibles dans le footer, la page produit et la page contact :

- 🗺️ **Google Maps** : `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`
- 🍎 **Apple Maps** : `https://maps.apple.com/?daddr=<lat>,<lng>`
- 🚗 **Waze** : `https://waze.com/ul?ll=<lat>,<lng>&navigate=yes`

Coordonnées et adresse en variables d'env (cf. ci-dessous).

## Configuration

### Variables d'environnement

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=                # serveur uniquement

NEXT_PUBLIC_MEILI_HOST=
NEXT_PUBLIC_MEILI_SEARCH_KEY=             # clé search-only
MEILI_ADMIN_KEY=                          # serveur uniquement
MEILI_WEBHOOK_SECRET=                     # HMAC pour /api/meili/sync

GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=
CRON_SECRET=

ADMIN_SLUG=admin-xY3kQ9

NEXT_PUBLIC_BUSINESS_NAME=Dépôt Vente de Drancy
NEXT_PUBLIC_BUSINESS_PHONE=
NEXT_PUBLIC_BUSINESS_ADDRESS=
NEXT_PUBLIC_BUSINESS_LAT=
NEXT_PUBLIC_BUSINESS_LNG=
NEXT_PUBLIC_BUSINESS_HOURS_JSON=          # JSON des horaires
NEXT_PUBLIC_GOOGLE_BUSINESS_URL=          # lien direct fiche Google
```

### Structure repo

```
depot-vente-drancy/
├── app/
│   ├── (vitrine)/
│   │   ├── page.tsx                      # accueil
│   │   ├── categories/page.tsx
│   │   ├── c/[category]/page.tsx
│   │   ├── c/[category]/[subcategory]/page.tsx
│   │   ├── produit/[slug]/page.tsx
│   │   ├── recherche/page.tsx
│   │   ├── contact/page.tsx
│   │   └── layout.tsx                    # header + footer vitrine
│   ├── admin-xY3kQ9/                     # nom dépend de ADMIN_SLUG, mais routé dynamiquement
│   │   ├── login/page.tsx
│   │   ├── page.tsx                      # dashboard
│   │   ├── produits/
│   │   ├── categories/
│   │   └── layout.tsx                    # layout admin + auth guard
│   └── api/
│       ├── meili/sync/route.ts
│       └── cron/refresh-google-reviews/route.ts
├── lib/
│   ├── supabase/                         # clients server / client / middleware
│   ├── meilisearch/
│   ├── google-places.ts
│   └── business-config.ts                # parsing des env NEXT_PUBLIC_BUSINESS_*
├── components/
│   ├── vitrine/
│   └── admin/
├── supabase/
│   └── migrations/                       # schéma + seed initial
├── middleware.ts                         # protection admin
├── docs/superpowers/
│   ├── specs/
│   └── plans/
└── public/
```

> Note d'implémentation : le segment de route admin est physiquement nommé selon `ADMIN_SLUG`. Pour permettre de le changer sans renommer le dossier, on peut soit utiliser un nom de dossier fixe protégé par middleware + rewrite, soit garder le slug en dur dans le nom du dossier. Choix tranché lors de la planification.

## Sécurité

- RLS activé partout, écriture restreinte aux utilisateurs authentifiés
- Service role key et clé admin Meilisearch jamais exposées côté client
- `X-Robots-Tag: noindex` sur toutes les routes admin
- Storage bucket : lecture publique, écriture authenticated
- Webhook Meilisearch protégé par HMAC, route cron par bearer token
- HTTPS forcé (Vercel par défaut)

## Déploiement

- **Vercel** lié au repo GitHub
- Branches : `main` → production, PRs → previews
- Domaine `depotventedrancy.fr` à brancher quand acheté (temporairement `.vercel.app`)
- Supabase : 1 projet prod dédié (free tier au démarrage)
- Meilisearch Cloud : free tier (100k docs/mois — largement suffisant)

## Critères de succès

- Le gérant peut créer un produit complet (5 photos + tous les champs) depuis son iPhone en moins d'une minute.
- La recherche affiche des résultats instantanés (< 100ms) avec fautes de frappe tolérées.
- Aucun CTA "Acheter" n'apparaît sur la vitrine ; chaque page produit pousse vers le téléphone ou la visite.
- Les avis Google s'affichent avec la note réelle, rafraîchis dans les 24h.
- Le site passe Lighthouse mobile ≥ 90 (Performance / Accessibility / Best Practices / SEO).
- L'URL admin est introuvable sans la connaître (noindex + slug aléatoire + auth obligatoire).
