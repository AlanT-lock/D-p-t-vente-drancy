# Dépôt Vente de Drancy — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire le site vitrine + admin du Dépôt Vente de Drancy selon la spec `2026-05-26-depot-vente-drancy-design.md`.

**Architecture:** Mono-repo Next.js 15 (App Router) avec deux sections de routes (vitrine publique + admin protégé par middleware + slug secret). Données dans Supabase (Postgres + Auth + Storage). Recherche e-commerce via Meilisearch Cloud synchronisé par webhook. Avis Google rafraîchis quotidiennement par cron Vercel.

**Tech Stack:** Next.js 15 (App Router, RSC), TypeScript, Tailwind CSS, shadcn/ui, Supabase (@supabase/ssr), Meilisearch (meilisearch-js + react-instantsearch), Vitest + Playwright, Vercel.

---

## Pré-requis (à faire manuellement par Alan avant la Phase 1)

Avant que les tâches automatisables démarrent, créer les ressources externes :

1. **Projet Supabase** — créer un projet prod (free tier) sur supabase.com, noter `SUPABASE_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY`.
2. **Compte Meilisearch Cloud** — créer un projet, créer 1 index `products`, noter `MEILI_HOST`, `MEILI_ADMIN_KEY`, et générer une clé search-only restreinte à `products`.
3. **Google Cloud** — activer l'API Places (New), créer une clé API restreinte à cette API + au domaine de prod ; récupérer le `place_id` du Dépôt Vente de Drancy via le Place ID Finder.
4. **Vercel** — créer un projet vide lié au repo GitHub (créé en Phase 1).
5. **Compte admin Supabase** — créer manuellement l'utilisateur admin dans Supabase Auth (email + mot de passe choisi par Alan).

Ces valeurs alimenteront le `.env.local` créé en Tâche 1.3.

---

## Phase 1 — Setup projet

### Tâche 1.1 : Initialiser Next.js + TypeScript

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/`, `public/`

- [ ] **Step 1: Bootstrap Next.js**

Run depuis `/Users/alantouati/depot-vente-drancy/` :

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*" --use-npm --no-eslint
```

Répondre :
- "Ok to proceed?" → y
- "Would you like to use Turbopack for next dev?" → Yes
- "Would you like to customize the default import alias?" → No (déjà `@/*`)

Si le dossier n'est pas vide à cause du `docs/`, accepter d'écraser uniquement les fichiers concernés.

- [ ] **Step 2: Vérifier que le projet démarre**

```bash
npm run dev
```
Expected: serveur sur `http://localhost:3000`, page d'accueil par défaut visible. `Ctrl+C` pour arrêter.

- [ ] **Step 3: Installer ESLint + Prettier**

```bash
npm i -D eslint eslint-config-next prettier eslint-config-prettier
```

Créer `.eslintrc.json` :

```json
{
  "extends": ["next/core-web-vitals", "prettier"]
}
```

Créer `.prettierrc` :

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: bootstrap Next.js 15 + TS + Tailwind"
```

---

### Tâche 1.2 : Installer les dépendances projet

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Installer les libs runtime**

```bash
npm i @supabase/supabase-js @supabase/ssr meilisearch react-instantsearch instantsearch.js zod clsx tailwind-merge lucide-react
```

- [ ] **Step 2: Installer shadcn/ui**

```bash
npx shadcn@latest init -d
```

Accepter les défauts (Style: Default, Base color: Neutral, CSS variables: Yes).

- [ ] **Step 3: Installer les composants shadcn de base**

```bash
npx shadcn@latest add button input label select textarea dialog dropdown-menu toast card badge separator skeleton
```

- [ ] **Step 4: Installer les libs de test**

```bash
npm i -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @playwright/test
npx playwright install --with-deps chromium
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: ajoute dépendances Supabase, Meilisearch, shadcn/ui, tests"
```

---

### Tâche 1.3 : Configuration variables d'environnement

**Files:**
- Create: `.env.local.example`, `.env.local`, `lib/env.ts`
- Test: `lib/env.test.ts`

- [ ] **Step 1: Créer `.env.local.example`**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_MEILI_HOST=
NEXT_PUBLIC_MEILI_SEARCH_KEY=
MEILI_ADMIN_KEY=
MEILI_WEBHOOK_SECRET=

GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=
CRON_SECRET=

ADMIN_SLUG=admin-xY3kQ9

NEXT_PUBLIC_BUSINESS_NAME=Dépôt Vente de Drancy
NEXT_PUBLIC_BUSINESS_PHONE=
NEXT_PUBLIC_BUSINESS_ADDRESS=
NEXT_PUBLIC_BUSINESS_LAT=
NEXT_PUBLIC_BUSINESS_LNG=
NEXT_PUBLIC_BUSINESS_HOURS_JSON=[]
NEXT_PUBLIC_GOOGLE_BUSINESS_URL=
```

- [ ] **Step 2: Créer `.env.local`** (à remplir avec les vraies valeurs Supabase/Meili/Google récupérées dans les pré-requis)

Copier le contenu du fichier `.env.local.example` dans `.env.local` et remplir chaque valeur.

- [ ] **Step 3: Écrire le test pour `lib/env.ts`**

Créer `lib/env.test.ts` :

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('env validation', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    process.env.NEXT_PUBLIC_MEILI_HOST = 'https://meili.cloud';
    process.env.NEXT_PUBLIC_MEILI_SEARCH_KEY = 'search';
    process.env.ADMIN_SLUG = 'admin-test';
    process.env.NEXT_PUBLIC_BUSINESS_NAME = 'Test';
    process.env.NEXT_PUBLIC_BUSINESS_PHONE = '+33 1 23 45 67 89';
    process.env.NEXT_PUBLIC_BUSINESS_ADDRESS = '1 rue test';
    process.env.NEXT_PUBLIC_BUSINESS_LAT = '48.92';
    process.env.NEXT_PUBLIC_BUSINESS_LNG = '2.45';
    process.env.NEXT_PUBLIC_BUSINESS_HOURS_JSON = '[]';
    process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL = 'https://g.co/business';
  });

  it('parses public env successfully', async () => {
    const { publicEnv } = await import('./env');
    expect(publicEnv.BUSINESS_NAME).toBe('Test');
    expect(publicEnv.BUSINESS_LAT).toBeCloseTo(48.92);
  });

  it('throws on missing required public var', async () => {
    delete process.env.NEXT_PUBLIC_BUSINESS_NAME;
    await expect(import('./env')).rejects.toThrow();
  });
});
```

- [ ] **Step 4: Configurer Vitest**

Créer `vitest.config.ts` :

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
});
```

Créer `vitest.setup.ts` :

```typescript
import '@testing-library/jest-dom/vitest';
```

Ajouter dans `package.json` :

```json
"scripts": {
  "test": "vitest",
  "test:e2e": "playwright test"
}
```

- [ ] **Step 5: Lancer le test (doit échouer)**

```bash
npm test -- lib/env --run
```
Expected: FAIL — `lib/env` module not found.

- [ ] **Step 6: Implémenter `lib/env.ts`**

```typescript
import { z } from 'zod';

const publicSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  MEILI_HOST: z.string().url(),
  MEILI_SEARCH_KEY: z.string().min(1),
  BUSINESS_NAME: z.string().min(1),
  BUSINESS_PHONE: z.string().min(1),
  BUSINESS_ADDRESS: z.string().min(1),
  BUSINESS_LAT: z.coerce.number(),
  BUSINESS_LNG: z.coerce.number(),
  BUSINESS_HOURS_JSON: z.string(),
  GOOGLE_BUSINESS_URL: z.string().url(),
});

export const publicEnv = publicSchema.parse({
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  MEILI_HOST: process.env.NEXT_PUBLIC_MEILI_HOST,
  MEILI_SEARCH_KEY: process.env.NEXT_PUBLIC_MEILI_SEARCH_KEY,
  BUSINESS_NAME: process.env.NEXT_PUBLIC_BUSINESS_NAME,
  BUSINESS_PHONE: process.env.NEXT_PUBLIC_BUSINESS_PHONE,
  BUSINESS_ADDRESS: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS,
  BUSINESS_LAT: process.env.NEXT_PUBLIC_BUSINESS_LAT,
  BUSINESS_LNG: process.env.NEXT_PUBLIC_BUSINESS_LNG,
  BUSINESS_HOURS_JSON: process.env.NEXT_PUBLIC_BUSINESS_HOURS_JSON,
  GOOGLE_BUSINESS_URL: process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL,
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  MEILI_ADMIN_KEY: z.string().min(1),
  MEILI_WEBHOOK_SECRET: z.string().min(1),
  GOOGLE_PLACES_API_KEY: z.string().min(1),
  GOOGLE_PLACE_ID: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  ADMIN_SLUG: z.string().min(1),
});

export function serverEnv() {
  return serverSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    MEILI_ADMIN_KEY: process.env.MEILI_ADMIN_KEY,
    MEILI_WEBHOOK_SECRET: process.env.MEILI_WEBHOOK_SECRET,
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
    GOOGLE_PLACE_ID: process.env.GOOGLE_PLACE_ID,
    CRON_SECRET: process.env.CRON_SECRET,
    ADMIN_SLUG: process.env.ADMIN_SLUG,
  });
}
```

- [ ] **Step 7: Test doit passer**

```bash
npm test -- lib/env --run
```
Expected: PASS (2 tests).

- [ ] **Step 8: Vérifier que `.env.local` est ignoré par git**

```bash
grep -q "^.env.local$" .gitignore || echo ".env.local" >> .gitignore
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: typed env via zod + vitest setup"
```

---

### Tâche 1.4 : Configuration Tailwind avec la palette du design

**Files:**
- Modify: `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Modifier `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: { DEFAULT: '#F4ECD8', light: '#FBF6E8' },
        navy: '#1B2A3A',
        brass: '#C9A961',
        bronze: '#8B6F47',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
```

- [ ] **Step 2: Charger Inter + Fraunces dans `app/layout.tsx`**

```typescript
import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });

export const metadata: Metadata = {
  title: 'Dépôt Vente de Drancy',
  description: 'Brocante et dépôt-vente à Drancy. Trouvailles uniques en boutique.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="bg-parchment text-navy font-sans antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Remplacer le contenu de `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  h1, h2, h3 { @apply font-serif; }
}
```

- [ ] **Step 4: Vérifier visuellement**

`npm run dev` → la page par défaut doit s'afficher avec un fond crème `#F4ECD8` et le texte en navy.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: palette + typographies parchemin/navy/laiton, Inter + Fraunces"
```

---

## Phase 2 — Schéma BDD + RLS + seed

### Tâche 2.1 : Installer Supabase CLI et init local

**Files:**
- Create: `supabase/config.toml`

- [ ] **Step 1: Installer Supabase CLI**

```bash
brew install supabase/tap/supabase
```

- [ ] **Step 2: Init**

```bash
supabase init
```
Accepte les défauts.

- [ ] **Step 3: Lier au projet prod**

```bash
supabase login
supabase link --project-ref <PROJECT_REF>   # noter le ref depuis l'URL Supabase
```

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "chore: init Supabase CLI lié au projet prod"
```

---

### Tâche 2.2 : Migration schéma + check contraintes

**Files:**
- Create: `supabase/migrations/0001_schema.sql`

- [ ] **Step 1: Créer la migration**

```bash
supabase migration new schema
# crée supabase/migrations/<timestamp>_schema.sql — renommer en 0001_schema.sql
```

Contenu de `0001_schema.sql` :

```sql
create extension if not exists "pgcrypto";

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Subcategories
create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  position int not null default 0,
  unique (category_id, slug)
);

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  subcategory_id uuid not null references public.subcategories(id) on delete restrict,
  name text not null,
  slug text unique not null,
  description text,
  price_cents int not null check (price_cents >= 0),
  quantity int not null default 1 check (quantity >= 0),
  condition text not null check (condition in ('neuf','tres_bon_etat','bon_etat','etat_usage')),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_subcategory on public.products(subcategory_id);
create index idx_products_published on public.products(is_published) where is_published = true;

-- Product photos
create table public.product_photos (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  position int not null check (position between 0 and 4),
  unique (product_id, position)
);

-- Google reviews cache
create table public.google_reviews_cache (
  id uuid primary key default gen_random_uuid(),
  author_name text,
  rating int check (rating between 1 and 5),
  text text,
  relative_time text,
  profile_photo text,
  fetched_at timestamptz not null default now()
);

create table public.google_business_info (
  id int primary key default 1 check (id = 1),
  rating numeric(2,1),
  total_reviews int,
  fetched_at timestamptz not null default now()
);

-- Trigger updated_at
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();
```

- [ ] **Step 2: Pousser la migration**

```bash
supabase db push
```
Expected: migration `0001_schema.sql` appliquée, aucune erreur.

- [ ] **Step 3: Vérifier via dashboard Supabase**

Aller sur l'onglet Database → Tables, vérifier que les 6 tables sont créées.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "feat(db): schéma initial (categories, subcategories, products, photos, google cache)"
```

---

### Tâche 2.3 : Politiques RLS

**Files:**
- Create: `supabase/migrations/0002_rls.sql`

- [ ] **Step 1: Créer la migration RLS**

```sql
-- Activer RLS partout
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.products enable row level security;
alter table public.product_photos enable row level security;
alter table public.google_reviews_cache enable row level security;
alter table public.google_business_info enable row level security;

-- Lecture publique
create policy "public read categories" on public.categories
  for select using (true);
create policy "public read subcategories" on public.subcategories
  for select using (true);
create policy "public read published products" on public.products
  for select using (is_published = true);
create policy "public read product_photos" on public.product_photos
  for select using (true);
create policy "public read google_reviews" on public.google_reviews_cache
  for select using (true);
create policy "public read google_business" on public.google_business_info
  for select using (true);

-- Écriture authenticated (admin)
create policy "auth write categories" on public.categories
  for all to authenticated using (true) with check (true);
create policy "auth write subcategories" on public.subcategories
  for all to authenticated using (true) with check (true);
create policy "auth write products" on public.products
  for all to authenticated using (true) with check (true);
create policy "auth write product_photos" on public.product_photos
  for all to authenticated using (true) with check (true);

-- Admin doit aussi voir les produits non publiés
create policy "auth read all products" on public.products
  for select to authenticated using (true);
```

- [ ] **Step 2: Pousser**

```bash
supabase db push
```

- [ ] **Step 3: Vérifier**

Dashboard Supabase → Authentication → Policies, vérifier que toutes les policies apparaissent.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "feat(db): RLS — lecture publique, écriture admin"
```

---

### Tâche 2.4 : Seed catégories + sous-catégories

**Files:**
- Create: `supabase/migrations/0003_seed_categories.sql`

- [ ] **Step 1: Créer le seed**

```sql
insert into public.categories (name, slug, position) values
  ('Mobilier', 'mobilier', 0),
  ('Décoration', 'decoration', 1),
  ('Vaisselle', 'vaisselle', 2),
  ('Vêtements', 'vetements', 3),
  ('Bijoux & accessoires', 'bijoux-accessoires', 4),
  ('Électroménager', 'electromenager', 5),
  ('Livres & disques', 'livres-disques', 6);

-- Sous-catégories Mobilier
insert into public.subcategories (category_id, name, slug, position)
select id, n, s, p from public.categories, lateral (values
  ('Canapés', 'canapes', 0),
  ('Tables', 'tables', 1),
  ('Chaises', 'chaises', 2),
  ('Rangements', 'rangements', 3),
  ('Lits', 'lits', 4)
) as v(n, s, p)
where slug = 'mobilier';

-- Sous-catégories Décoration
insert into public.subcategories (category_id, name, slug, position)
select id, n, s, p from public.categories, lateral (values
  ('Luminaires', 'luminaires', 0),
  ('Miroirs', 'miroirs', 1),
  ('Vases', 'vases', 2),
  ('Tableaux', 'tableaux', 3)
) as v(n, s, p)
where slug = 'decoration';

-- Sous-catégories Vaisselle
insert into public.subcategories (category_id, name, slug, position)
select id, n, s, p from public.categories, lateral (values
  ('Assiettes', 'assiettes', 0),
  ('Verres', 'verres', 1),
  ('Couverts', 'couverts', 2)
) as v(n, s, p)
where slug = 'vaisselle';

-- Sous-catégories Vêtements
insert into public.subcategories (category_id, name, slug, position)
select id, n, s, p from public.categories, lateral (values
  ('Femme', 'femme', 0),
  ('Homme', 'homme', 1),
  ('Enfant', 'enfant', 2)
) as v(n, s, p)
where slug = 'vetements';
```

- [ ] **Step 2: Pousser et vérifier**

```bash
supabase db push
```
Dashboard → Table editor → `categories` doit avoir 7 lignes, `subcategories` 15 lignes.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat(db): seed initial des catégories et sous-catégories"
```

---

### Tâche 2.5 : Storage bucket pour les photos produits

**Files:**
- Create: `supabase/migrations/0004_storage.sql`

- [ ] **Step 1: Créer le bucket via SQL**

```sql
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

-- Lecture publique
create policy "public read product photos" on storage.objects
  for select using (bucket_id = 'product-photos');

-- Écriture authenticated
create policy "auth write product photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-photos');
create policy "auth update product photos" on storage.objects
  for update to authenticated using (bucket_id = 'product-photos');
create policy "auth delete product photos" on storage.objects
  for delete to authenticated using (bucket_id = 'product-photos');
```

- [ ] **Step 2: Pousser**

```bash
supabase db push
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat(storage): bucket product-photos public en lecture, écriture admin"
```

---

## Phase 3 — Clients & helpers partagés

### Tâche 3.1 : Clients Supabase (browser + server + middleware)

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`, `lib/supabase/middleware.ts`, `lib/supabase/types.ts`

- [ ] **Step 1: Générer les types TS depuis Supabase**

```bash
supabase gen types typescript --linked > lib/supabase/types.ts
```

- [ ] **Step 2: `lib/supabase/client.ts` (browser)**

```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';
import { publicEnv } from '@/lib/env';

export function createClient() {
  return createBrowserClient<Database>(publicEnv.SUPABASE_URL, publicEnv.SUPABASE_ANON_KEY);
}
```

- [ ] **Step 3: `lib/supabase/server.ts` (RSC / route handlers)**

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';
import { publicEnv } from '@/lib/env';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(publicEnv.SUPABASE_URL, publicEnv.SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // appelé depuis un RSC en lecture seule, ignorer
        }
      },
    },
  });
}
```

- [ ] **Step 4: `lib/supabase/admin.ts` (service role, serveur uniquement)**

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { publicEnv } from '@/lib/env';
import { serverEnv } from '@/lib/env';

export function createAdminClient() {
  return createClient<Database>(publicEnv.SUPABASE_URL, serverEnv().SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
```

- [ ] **Step 5: `lib/supabase/middleware.ts`**

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './types';
import { publicEnv } from '@/lib/env';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(
    publicEnv.SUPABASE_URL,
    publicEnv.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({ request });
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return { response, user };
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/
git commit -m "feat(supabase): clients browser/server/admin + middleware helper"
```

---

### Tâche 3.2 : Helpers prix, slug, état

**Files:**
- Create: `lib/format.ts`, `lib/slugify.ts`, `lib/condition.ts`
- Test: `lib/format.test.ts`, `lib/slugify.test.ts`, `lib/condition.test.ts`

- [ ] **Step 1: Écrire les tests `lib/format.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { formatPrice, parsePrice } from './format';

describe('formatPrice', () => {
  it('formate les centimes en euros avec espace', () => {
    expect(formatPrice(24000)).toBe('240 €');
    expect(formatPrice(8550)).toBe('85,50 €');
    expect(formatPrice(0)).toBe('0 €');
  });
});

describe('parsePrice', () => {
  it('parse une chaîne "240,50" en 24050 centimes', () => {
    expect(parsePrice('240,50')).toBe(24050);
    expect(parsePrice('240.50')).toBe(24050);
    expect(parsePrice('240')).toBe(24000);
  });
  it('rejette les valeurs négatives ou non numériques', () => {
    expect(() => parsePrice('-1')).toThrow();
    expect(() => parsePrice('abc')).toThrow();
  });
});
```

- [ ] **Step 2: Écrire les tests `lib/slugify.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('crée des slugs propres', () => {
    expect(slugify('Fauteuil Club')).toBe('fauteuil-club');
    expect(slugify('Décoration & Brocante')).toBe('decoration-brocante');
    expect(slugify('  espaces  multiples  ')).toBe('espaces-multiples');
    expect(slugify('Été 2024')).toBe('ete-2024');
  });
});
```

- [ ] **Step 3: Écrire les tests `lib/condition.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { CONDITIONS, conditionLabel } from './condition';

describe('CONDITIONS', () => {
  it('expose 4 valeurs ordonnées', () => {
    expect(CONDITIONS.map((c) => c.value)).toEqual([
      'neuf', 'tres_bon_etat', 'bon_etat', 'etat_usage',
    ]);
  });
});

describe('conditionLabel', () => {
  it('renvoie le label français', () => {
    expect(conditionLabel('neuf')).toBe('Neuf');
    expect(conditionLabel('tres_bon_etat')).toBe('Très bon état');
    expect(conditionLabel('etat_usage')).toBe('État d\'usage');
  });
});
```

- [ ] **Step 4: Lancer les tests (doivent échouer)**

```bash
npm test -- --run
```
Expected: FAIL — modules manquants.

- [ ] **Step 5: Implémenter `lib/format.ts`**

```typescript
const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

export function formatPrice(cents: number): string {
  const euros = cents / 100;
  const formatted = fmt.format(euros);
  // Intl met parfois "240,00 €" — on enlève les zéros décimaux
  return formatted.replace(/,00\s/, ' ');
}

export function parsePrice(input: string): number {
  const normalized = input.replace(',', '.').trim();
  const num = Number(normalized);
  if (!Number.isFinite(num) || num < 0) {
    throw new Error(`Prix invalide: "${input}"`);
  }
  return Math.round(num * 100);
}
```

- [ ] **Step 6: Implémenter `lib/slugify.ts`**

```typescript
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

- [ ] **Step 7: Implémenter `lib/condition.ts`**

```typescript
export const CONDITIONS = [
  { value: 'neuf', label: 'Neuf' },
  { value: 'tres_bon_etat', label: 'Très bon état' },
  { value: 'bon_etat', label: 'Bon état' },
  { value: 'etat_usage', label: 'État d\'usage' },
] as const;

export type Condition = (typeof CONDITIONS)[number]['value'];

export function conditionLabel(value: Condition): string {
  const found = CONDITIONS.find((c) => c.value === value);
  if (!found) throw new Error(`Condition inconnue: ${value}`);
  return found.label;
}
```

- [ ] **Step 8: Lancer les tests (doivent passer)**

```bash
npm test -- --run
```
Expected: PASS (au moins 9 tests).

- [ ] **Step 9: Commit**

```bash
git add lib/
git commit -m "feat(lib): helpers prix, slug, conditions (avec tests)"
```

---

### Tâche 3.3 : Helper business config

**Files:**
- Create: `lib/business.ts`
- Test: `lib/business.test.ts`

- [ ] **Step 1: Écrire le test**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('business', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BUSINESS_LAT = '48.925';
    process.env.NEXT_PUBLIC_BUSINESS_LNG = '2.443';
  });

  it('génère les bonnes URLs de cartes', async () => {
    const { mapsUrls } = await import('./business');
    expect(mapsUrls.google()).toBe('https://www.google.com/maps/dir/?api=1&destination=48.925,2.443');
    expect(mapsUrls.apple()).toBe('https://maps.apple.com/?daddr=48.925,2.443');
    expect(mapsUrls.waze()).toBe('https://waze.com/ul?ll=48.925,2.443&navigate=yes');
  });
});
```

- [ ] **Step 2: Lancer le test (FAIL)**

```bash
npm test -- lib/business --run
```

- [ ] **Step 3: Implémenter `lib/business.ts`**

```typescript
import { publicEnv } from './env';

export const business = {
  name: publicEnv.BUSINESS_NAME,
  phone: publicEnv.BUSINESS_PHONE,
  address: publicEnv.BUSINESS_ADDRESS,
  lat: publicEnv.BUSINESS_LAT,
  lng: publicEnv.BUSINESS_LNG,
  googleBusinessUrl: publicEnv.GOOGLE_BUSINESS_URL,
};

const coords = `${business.lat},${business.lng}`;

export const mapsUrls = {
  google: () => `https://www.google.com/maps/dir/?api=1&destination=${coords}`,
  apple: () => `https://maps.apple.com/?daddr=${coords}`,
  waze: () => `https://waze.com/ul?ll=${coords}&navigate=yes`,
};

export const phoneHref = `tel:${business.phone.replace(/\s/g, '')}`;
```

- [ ] **Step 4: Test PASS**

```bash
npm test -- lib/business --run
```

- [ ] **Step 5: Commit**

```bash
git add lib/
git commit -m "feat(lib): business config + URLs Maps (Google/Apple/Waze)"
```

---

## Phase 4 — Layout vitrine

### Tâche 4.1 : Header sticky

**Files:**
- Create: `components/vitrine/header.tsx`, `components/vitrine/search-trigger.tsx`
- Test: `components/vitrine/header.test.tsx`

- [ ] **Step 1: Écrire le test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './header';

describe('Header', () => {
  it('affiche le nom du commerce et un bouton appeler sur mobile', () => {
    render(<Header />);
    expect(screen.getByText(/Dépôt Vente/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /appeler/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Lancer le test (FAIL)**

- [ ] **Step 3: Implémenter `components/vitrine/header.tsx`**

```tsx
import Link from 'next/link';
import { Phone } from 'lucide-react';
import { business, phoneHref } from '@/lib/business';
import { SearchTrigger } from './search-trigger';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-parchment/90 backdrop-blur border-b border-navy/10">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
        <Link href="/" className="font-serif text-xl font-semibold whitespace-nowrap">
          {business.name.split(' ').slice(0, 2).join(' ')} <span className="text-brass italic">de</span> Drancy
        </Link>
        <div className="flex-1"><SearchTrigger /></div>
        <nav className="hidden md:flex gap-5 text-sm">
          <Link href="/categories">Catégories</Link>
          <Link href="/#avis">Avis</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <a href={phoneHref} className="inline-flex items-center gap-1.5 rounded-full bg-navy text-parchment px-3 py-1.5 text-xs font-semibold">
          <Phone className="size-3.5" />
          <span className="hidden sm:inline">Appeler</span>
        </a>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Implémenter `components/vitrine/search-trigger.tsx`** (stub pour l'instant — sera connecté à Meilisearch en Phase 8)

```tsx
'use client';
import { Search } from 'lucide-react';

export function SearchTrigger() {
  return (
    <button
      type="button"
      className="w-full flex items-center gap-2 rounded-full border border-navy/20 bg-parchment-light px-4 py-2 text-sm text-navy/60 hover:border-brass"
      aria-label="Ouvrir la recherche"
    >
      <Search className="size-4" />
      <span>Rechercher un article…</span>
    </button>
  );
}
```

- [ ] **Step 5: Test PASS**

- [ ] **Step 6: Commit**

```bash
git add components/ tests/
git commit -m "feat(vitrine): header sticky avec logo, recherche, CTA appeler"
```

---

### Tâche 4.2 : Footer avec adresse + boutons Maps

**Files:**
- Create: `components/vitrine/footer.tsx`, `components/vitrine/maps-buttons.tsx`, `components/vitrine/hours.tsx`
- Test: `components/vitrine/maps-buttons.test.tsx`

- [ ] **Step 1: Écrire le test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapsButtons } from './maps-buttons';

describe('MapsButtons', () => {
  it('rend 3 liens : Google, Apple, Waze', () => {
    render(<MapsButtons />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute('href', expect.stringContaining('google.com/maps'));
    expect(links[1]).toHaveAttribute('href', expect.stringContaining('maps.apple.com'));
    expect(links[2]).toHaveAttribute('href', expect.stringContaining('waze.com'));
  });
});
```

- [ ] **Step 2: Implémenter `components/vitrine/maps-buttons.tsx`**

```tsx
import { mapsUrls } from '@/lib/business';

export function MapsButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <a href={mapsUrls.google()} target="_blank" rel="noopener" className="rounded-full bg-navy text-parchment px-4 py-2 text-sm font-medium">📍 Google Maps</a>
      <a href={mapsUrls.apple()} target="_blank" rel="noopener" className="rounded-full bg-navy text-parchment px-4 py-2 text-sm font-medium">🍎 Apple Maps</a>
      <a href={mapsUrls.waze()} target="_blank" rel="noopener" className="rounded-full bg-navy text-parchment px-4 py-2 text-sm font-medium">🚗 Waze</a>
    </div>
  );
}
```

- [ ] **Step 3: Implémenter `components/vitrine/hours.tsx`**

```tsx
import { publicEnv } from '@/lib/env';

type DayHours = { day: string; open: string; close: string } | { day: string; closed: true };

export function Hours() {
  const parsed = JSON.parse(publicEnv.BUSINESS_HOURS_JSON) as DayHours[];
  if (!parsed.length) return <p className="text-sm text-bronze">Horaires à venir</p>;
  return (
    <ul className="text-sm space-y-1">
      {parsed.map((h) => (
        <li key={h.day} className="flex justify-between gap-4">
          <span className="text-bronze">{h.day}</span>
          <span>{'closed' in h ? 'Fermé' : `${h.open} – ${h.close}`}</span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Implémenter `components/vitrine/footer.tsx`**

```tsx
import Link from 'next/link';
import { business, phoneHref } from '@/lib/business';
import { MapsButtons } from './maps-buttons';
import { Hours } from './hours';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-navy/10 bg-parchment-light">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-serif text-lg mb-2">{business.name}</h3>
          <p className="text-sm text-bronze">{business.address}</p>
          <p className="text-sm mt-2"><a href={phoneHref}>{business.phone}</a></p>
        </div>
        <div>
          <h3 className="font-serif text-lg mb-2">Horaires</h3>
          <Hours />
        </div>
        <div>
          <h3 className="font-serif text-lg mb-2">S'y rendre</h3>
          <MapsButtons />
          <p className="mt-4 text-xs">
            <a href={business.googleBusinessUrl} target="_blank" rel="noopener" className="underline">
              Voir tous les avis sur Google
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-navy/10 py-4 text-center text-xs text-bronze">
        <Link href="/mentions-legales">Mentions légales</Link>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Test PASS**

- [ ] **Step 6: Commit**

```bash
git add components/
git commit -m "feat(vitrine): footer avec horaires, adresse, boutons Maps Google/Apple/Waze"
```

---

### Tâche 4.3 : Layout vitrine et structure dossiers route group

**Files:**
- Create: `app/(vitrine)/layout.tsx`, `app/(vitrine)/page.tsx` (placeholder), supprimer `app/page.tsx` par défaut

- [ ] **Step 1: Créer le layout vitrine**

```tsx
import { Header } from '@/components/vitrine/header';
import { Footer } from '@/components/vitrine/footer';

export default function VitrineLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Placeholder accueil**

```tsx
export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-serif text-4xl">Bienvenue</h1>
      <p className="mt-2 text-bronze">Page d'accueil — en cours de construction.</p>
    </div>
  );
}
```

- [ ] **Step 3: Supprimer l'ancien `app/page.tsx`**

```bash
rm app/page.tsx
```

- [ ] **Step 4: Vérifier visuellement**

`npm run dev` → http://localhost:3000 doit afficher header + placeholder + footer en parchemin/navy/laiton.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(vitrine): layout route group (vitrine) avec header/footer"
```

---

## Phase 5 — Vitrine : catalogue (catégories, sous-catégories, produits)

### Tâche 5.1 : Repository produits (data layer)

**Files:**
- Create: `lib/repos/products.ts`, `lib/repos/categories.ts`
- Test: `lib/repos/products.test.ts`

- [ ] **Step 1: Définir les types résultat**

Créer `lib/repos/types.ts` :

```typescript
import type { Database } from '@/lib/supabase/types';

export type Category = Database['public']['Tables']['categories']['Row'];
export type Subcategory = Database['public']['Tables']['subcategories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductPhoto = Database['public']['Tables']['product_photos']['Row'];

export type ProductWithPhotos = Product & { photos: ProductPhoto[] };
export type CategoryWithSubs = Category & { subcategories: Subcategory[] };
```

- [ ] **Step 2: Implémenter `lib/repos/categories.ts`**

```typescript
import { createClient } from '@/lib/supabase/server';
import type { CategoryWithSubs } from './types';

export async function listCategoriesWithSubs(): Promise<CategoryWithSubs[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*, subcategories(*)')
    .order('position');
  if (error) throw error;
  return (data ?? []).map((c) => ({
    ...c,
    subcategories: (c.subcategories ?? []).sort((a, b) => a.position - b.position),
  }));
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*, subcategories(*)')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data as CategoryWithSubs;
}
```

- [ ] **Step 3: Implémenter `lib/repos/products.ts`**

```typescript
import { createClient } from '@/lib/supabase/server';
import type { ProductWithPhotos } from './types';

export async function listRecentPublishedProducts(limit = 6): Promise<ProductWithPhotos[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, photos:product_photos(*)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ProductWithPhotos[];
}

export async function getProductBySlug(slug: string): Promise<ProductWithPhotos | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('*, photos:product_photos(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  return data as ProductWithPhotos | null;
}

export async function listProductsBySubcategory(
  subcategoryId: string,
  opts: { sort?: 'recent' | 'price_asc' | 'price_desc' | 'name'; minPrice?: number; maxPrice?: number; conditions?: string[]; availableOnly?: boolean } = {},
): Promise<ProductWithPhotos[]> {
  const supabase = await createClient();
  let q = supabase
    .from('products')
    .select('*, photos:product_photos(*)')
    .eq('is_published', true)
    .eq('subcategory_id', subcategoryId);

  if (opts.minPrice != null) q = q.gte('price_cents', opts.minPrice);
  if (opts.maxPrice != null) q = q.lte('price_cents', opts.maxPrice);
  if (opts.conditions?.length) q = q.in('condition', opts.conditions);
  if (opts.availableOnly) q = q.gt('quantity', 0);

  switch (opts.sort) {
    case 'price_asc': q = q.order('price_cents'); break;
    case 'price_desc': q = q.order('price_cents', { ascending: false }); break;
    case 'name': q = q.order('name'); break;
    default: q = q.order('created_at', { ascending: false });
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ProductWithPhotos[];
}
```

- [ ] **Step 4: Test de smoke (vérifie la connexion DB réelle)**

Créer `lib/repos/products.test.ts` :

```typescript
import { describe, it, expect } from 'vitest';
import { listCategoriesWithSubs } from './categories';

describe('categories repo', () => {
  it('liste les 7 catégories seed', async () => {
    const cats = await listCategoriesWithSubs();
    expect(cats.length).toBeGreaterThanOrEqual(7);
    expect(cats[0].slug).toBe('mobilier');
    expect(cats[0].subcategories.length).toBeGreaterThan(0);
  });
});
```

Note : ce test nécessite `.env.local` valide. Lancer :

```bash
npm test -- lib/repos --run
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/
git commit -m "feat(repos): repositories categories + products avec types"
```

---

### Tâche 5.2 : Carte produit & grille

**Files:**
- Create: `components/vitrine/product-card.tsx`, `components/vitrine/product-grid.tsx`, `components/vitrine/condition-badge.tsx`
- Test: `components/vitrine/product-card.test.tsx`

- [ ] **Step 1: Écrire le test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from './product-card';

const mockProduct = {
  id: '1',
  slug: 'fauteuil-club',
  name: 'Fauteuil club',
  price_cents: 24000,
  quantity: 1,
  condition: 'bon_etat',
  subcategory_id: 's1',
  description: null,
  is_published: true,
  created_at: '',
  updated_at: '',
  photos: [{ id: 'p1', product_id: '1', storage_path: '1/0.webp', position: 0 }],
} as any;

describe('ProductCard', () => {
  it('affiche nom, prix, badge unique', () => {
    render(<ProductCard product={mockProduct} subcategoryName="Canapés" />);
    expect(screen.getByText('Fauteuil club')).toBeInTheDocument();
    expect(screen.getByText('240 €')).toBeInTheDocument();
    expect(screen.getByText(/pièce unique/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implémenter `components/vitrine/condition-badge.tsx`**

```tsx
import { conditionLabel, type Condition } from '@/lib/condition';

export function ConditionBadge({ condition }: { condition: Condition }) {
  return (
    <span className="text-[10px] uppercase tracking-wider text-bronze font-semibold">
      {conditionLabel(condition)}
    </span>
  );
}
```

- [ ] **Step 3: Implémenter `components/vitrine/product-card.tsx`**

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/format';
import { publicEnv } from '@/lib/env';
import type { ProductWithPhotos } from '@/lib/repos/types';
import { ConditionBadge } from './condition-badge';

export function ProductCard({
  product,
  subcategoryName,
}: {
  product: ProductWithPhotos;
  subcategoryName?: string;
}) {
  const main = [...product.photos].sort((a, b) => a.position - b.position)[0];
  const imageUrl = main
    ? `${publicEnv.SUPABASE_URL}/storage/v1/object/public/product-photos/${main.storage_path}`
    : null;
  return (
    <Link href={`/produit/${product.slug}`} className="group block">
      <article className="bg-parchment-light rounded-lg overflow-hidden border border-navy/8">
        <div className="relative aspect-square bg-bronze/10">
          {imageUrl && (
            <Image src={imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 768px) 50vw, 25vw" />
          )}
          {product.quantity === 1 && (
            <span className="absolute top-2 left-2 bg-navy text-brass text-[9px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full">
              Pièce unique
            </span>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between gap-2">
            {subcategoryName && (
              <span className="text-[10px] uppercase tracking-wider text-bronze">{subcategoryName}</span>
            )}
            <ConditionBadge condition={product.condition as any} />
          </div>
          <h3 className="font-serif text-base mt-1">{product.name}</h3>
          <p className="font-semibold mt-1">{formatPrice(product.price_cents)}</p>
        </div>
      </article>
    </Link>
  );
}
```

- [ ] **Step 4: Implémenter `components/vitrine/product-grid.tsx`**

```tsx
import type { ProductWithPhotos } from '@/lib/repos/types';
import { ProductCard } from './product-card';

export function ProductGrid({
  products,
  subcategoryNameById,
}: {
  products: ProductWithPhotos[];
  subcategoryNameById?: Record<string, string>;
}) {
  if (!products.length) {
    return <p className="text-center text-bronze py-12">Aucun produit pour le moment.</p>;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} subcategoryName={subcategoryNameById?.[p.subcategory_id]} />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Test PASS**

```bash
npm test -- components/vitrine/product-card --run
```

- [ ] **Step 6: Commit**

```bash
git add components/
git commit -m "feat(vitrine): carte produit + grille (image, prix, badge unique, état)"
```

---

### Tâche 5.3 : Page d'accueil

**Files:**
- Modify: `app/(vitrine)/page.tsx`
- Create: `components/vitrine/hero.tsx`, `components/vitrine/category-tiles.tsx`, `components/vitrine/store-banner.tsx`

- [ ] **Step 1: `components/vitrine/store-banner.tsx`**

```tsx
import { Phone } from 'lucide-react';
import { phoneHref } from '@/lib/business';

export function StoreBanner() {
  return (
    <div className="bg-navy text-parchment text-center py-2 text-xs sm:text-sm">
      Boutique physique — pas de vente en ligne. <a href={phoneHref} className="underline ml-1">Appeler</a> ou venir sur place.
    </div>
  );
}
```

- [ ] **Step 2: `components/vitrine/hero.tsx`**

```tsx
import Link from 'next/link';
import { business } from '@/lib/business';

export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <div className="text-xs uppercase tracking-[2px] text-bronze font-semibold">
        Brocante · Dépôt-vente · Drancy
      </div>
      <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] mt-3 max-w-3xl">
        Des trouvailles <em className="text-brass not-italic font-light italic">uniques</em><br />
        à découvrir en boutique.
      </h1>
      <p className="mt-4 max-w-xl text-bronze">
        Mobilier, décoration, vaisselle, vêtements… chaque pièce a une histoire. Venez sur place.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/categories" className="rounded-full bg-navy text-parchment px-5 py-2.5 text-sm font-semibold">
          Voir les catégories
        </Link>
        <Link href="/contact" className="rounded-full border border-navy/30 px-5 py-2.5 text-sm font-semibold">
          Nous trouver
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: `components/vitrine/category-tiles.tsx`**

```tsx
import Link from 'next/link';
import type { CategoryWithSubs } from '@/lib/repos/types';

export function CategoryTiles({ categories }: { categories: CategoryWithSubs[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="font-serif text-3xl mb-6">Catégories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((c) => (
          <Link key={c.id} href={`/c/${c.slug}`} className="block bg-parchment-light rounded-lg p-6 border border-navy/8 hover:border-brass transition">
            <h3 className="font-serif text-xl">{c.name}</h3>
            <p className="text-xs text-bronze mt-2">{c.subcategories.length} sous-catégorie{c.subcategories.length > 1 ? 's' : ''}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Réécrire `app/(vitrine)/page.tsx`**

```tsx
import { listCategoriesWithSubs } from '@/lib/repos/categories';
import { listRecentPublishedProducts } from '@/lib/repos/products';
import { StoreBanner } from '@/components/vitrine/store-banner';
import { Hero } from '@/components/vitrine/hero';
import { CategoryTiles } from '@/components/vitrine/category-tiles';
import { ProductGrid } from '@/components/vitrine/product-grid';

export const revalidate = 60;

export default async function HomePage() {
  const [categories, recent] = await Promise.all([
    listCategoriesWithSubs(),
    listRecentPublishedProducts(6),
  ]);
  return (
    <>
      <StoreBanner />
      <Hero />
      <CategoryTiles categories={categories} />
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="font-serif text-3xl mb-6">Récemment ajoutés</h2>
        <ProductGrid products={recent} />
      </section>
      {/* Bloc avis Google ajouté en Phase 7 */}
    </>
  );
}
```

- [ ] **Step 5: Vérifier visuellement**

`npm run dev` → accueil avec bandeau, hero, catégories, grille vide (pas encore de produits seed).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(vitrine): page d'accueil (hero, bandeau boutique, catégories, récents)"
```

---

### Tâche 5.4 : Page catégorie et sous-catégorie

**Files:**
- Create: `app/(vitrine)/categories/page.tsx`, `app/(vitrine)/c/[category]/page.tsx`, `app/(vitrine)/c/[category]/[subcategory]/page.tsx`
- Create: `components/vitrine/filters.tsx`, `components/vitrine/sort-select.tsx`

- [ ] **Step 1: Page `/categories`**

```tsx
import { listCategoriesWithSubs } from '@/lib/repos/categories';
import { CategoryTiles } from '@/components/vitrine/category-tiles';

export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await listCategoriesWithSubs();
  return <CategoryTiles categories={categories} />;
}
```

- [ ] **Step 2: Composants Filters + SortSelect**

`components/vitrine/sort-select.tsx` :

```tsx
'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const OPTIONS = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'name', label: 'Nom A-Z' },
];

export function SortSelect() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const current = params.get('sort') ?? 'recent';
  return (
    <select
      className="rounded-full border border-navy/20 bg-parchment-light px-3 py-1.5 text-sm"
      value={current}
      onChange={(e) => {
        const next = new URLSearchParams(params);
        next.set('sort', e.target.value);
        router.push(`${path}?${next.toString()}`);
      }}
    >
      {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
```

`components/vitrine/filters.tsx` :

```tsx
'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CONDITIONS } from '@/lib/condition';

export function Filters({ maxPriceDefault = 1000 }: { maxPriceDefault?: number }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    router.push(`${path}?${next.toString()}`);
  };

  const selectedConditions = new Set(params.get('conditions')?.split(',').filter(Boolean) ?? []);

  return (
    <aside className="space-y-6">
      <section>
        <h3 className="font-serif text-sm uppercase tracking-wider text-bronze mb-2">Prix max (€)</h3>
        <input type="number" min={0} defaultValue={params.get('maxPrice') ?? ''} placeholder={String(maxPriceDefault)} className="w-full rounded border border-navy/20 px-2 py-1 text-sm"
          onBlur={(e) => setParam('maxPrice', e.target.value)} />
      </section>
      <section>
        <h3 className="font-serif text-sm uppercase tracking-wider text-bronze mb-2">État</h3>
        <ul className="space-y-1">
          {CONDITIONS.map((c) => (
            <li key={c.value}>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedConditions.has(c.value)}
                  onChange={(e) => {
                    const next = new Set(selectedConditions);
                    e.target.checked ? next.add(c.value) : next.delete(c.value);
                    setParam('conditions', Array.from(next).join(','));
                  }}
                /> {c.label}
              </label>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={params.get('available') === '1'}
            onChange={(e) => setParam('available', e.target.checked ? '1' : null)}
          /> Disponible uniquement
        </label>
      </section>
    </aside>
  );
}
```

- [ ] **Step 3: Page `/c/[category]`**

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug } from '@/lib/repos/categories';
import { listProductsBySubcategory } from '@/lib/repos/products';
import { ProductGrid } from '@/components/vitrine/product-grid';
import { Filters } from '@/components/vitrine/filters';
import { SortSelect } from '@/components/vitrine/sort-select';

export const revalidate = 60;

type Search = { sort?: string; maxPrice?: string; conditions?: string; available?: string };

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Search>;
}) {
  const { category: slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) notFound();

  const products = (
    await Promise.all(
      category.subcategories.map((sc) =>
        listProductsBySubcategory(sc.id, {
          sort: sp.sort as any,
          maxPrice: sp.maxPrice ? Number(sp.maxPrice) * 100 : undefined,
          conditions: sp.conditions?.split(',').filter(Boolean),
          availableOnly: sp.available === '1',
        }),
      ),
    )
  ).flat();

  const subcategoryNameById = Object.fromEntries(category.subcategories.map((s) => [s.id, s.name]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-xs text-bronze mb-4">
        <Link href="/categories">Catégories</Link> <span className="mx-1">/</span> <span>{category.name}</span>
      </nav>
      <h1 className="font-serif text-4xl">{category.name}</h1>

      <div className="flex flex-wrap gap-2 mt-6">
        {category.subcategories.map((sc) => (
          <Link key={sc.id} href={`/c/${category.slug}/${sc.slug}`} className="rounded-full border border-navy/20 px-3 py-1 text-sm hover:border-brass">
            {sc.name}
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-8 mt-8">
        <Filters />
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-bronze">{products.length} produit{products.length > 1 ? 's' : ''}</p>
            <SortSelect />
          </div>
          <ProductGrid products={products} subcategoryNameById={subcategoryNameById} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Page `/c/[category]/[subcategory]`**

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug } from '@/lib/repos/categories';
import { listProductsBySubcategory } from '@/lib/repos/products';
import { ProductGrid } from '@/components/vitrine/product-grid';
import { Filters } from '@/components/vitrine/filters';
import { SortSelect } from '@/components/vitrine/sort-select';

export const revalidate = 60;

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; subcategory: string }>;
  searchParams: Promise<{ sort?: string; maxPrice?: string; conditions?: string; available?: string }>;
}) {
  const { category: catSlug, subcategory: subSlug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(catSlug).catch(() => null);
  if (!category) notFound();
  const sub = category.subcategories.find((s) => s.slug === subSlug);
  if (!sub) notFound();

  const products = await listProductsBySubcategory(sub.id, {
    sort: sp.sort as any,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) * 100 : undefined,
    conditions: sp.conditions?.split(',').filter(Boolean),
    availableOnly: sp.available === '1',
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-xs text-bronze mb-4">
        <Link href="/categories">Catégories</Link> <span className="mx-1">/</span>
        <Link href={`/c/${category.slug}`}>{category.name}</Link> <span className="mx-1">/</span>
        <span>{sub.name}</span>
      </nav>
      <h1 className="font-serif text-4xl">{sub.name}</h1>

      <div className="grid md:grid-cols-[220px_1fr] gap-8 mt-8">
        <Filters />
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-bronze">{products.length} produit{products.length > 1 ? 's' : ''}</p>
            <SortSelect />
          </div>
          <ProductGrid products={products} subcategoryNameById={{ [sub.id]: sub.name }} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Vérifier visuellement**

Aller sur http://localhost:3000/c/mobilier → la page affiche les sous-catégories et la grille vide (pas encore de produits).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(vitrine): pages catégorie + sous-catégorie avec filtres et tri"
```

---

### Tâche 5.5 : Page produit

**Files:**
- Create: `app/(vitrine)/produit/[slug]/page.tsx`, `components/vitrine/product-gallery.tsx`, `components/vitrine/product-cta.tsx`

- [ ] **Step 1: `components/vitrine/product-gallery.tsx`**

```tsx
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { publicEnv } from '@/lib/env';
import type { ProductPhoto } from '@/lib/repos/types';

export function ProductGallery({ photos, name }: { photos: ProductPhoto[]; name: string }) {
  const sorted = [...photos].sort((a, b) => a.position - b.position);
  const [active, setActive] = useState(0);
  if (!sorted.length) return <div className="aspect-square bg-bronze/10 rounded-lg" />;
  const url = (p: ProductPhoto) =>
    `${publicEnv.SUPABASE_URL}/storage/v1/object/public/product-photos/${p.storage_path}`;
  return (
    <div>
      <div className="relative aspect-square bg-parchment-light rounded-lg overflow-hidden">
        <Image src={url(sorted[active])} alt={name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 mt-3">
          {sorted.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActive(i)}
              className={`relative aspect-square w-16 rounded overflow-hidden border-2 ${i === active ? 'border-brass' : 'border-transparent'}`}
            >
              <Image src={url(p)} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: `components/vitrine/product-cta.tsx`**

```tsx
import { Phone, MapPin, Mail } from 'lucide-react';
import { business, phoneHref, mapsUrls } from '@/lib/business';

export function ProductCTA() {
  return (
    <div className="bg-parchment-light border border-brass/40 rounded-lg p-5 mt-6">
      <p className="font-serif text-lg">Cet article vous intéresse ?</p>
      <p className="text-sm text-bronze mt-1">Réservation possible par téléphone.</p>
      <div className="flex flex-wrap gap-2 mt-4">
        <a href={phoneHref} className="inline-flex items-center gap-2 rounded-full bg-navy text-parchment px-4 py-2 text-sm font-semibold">
          <Phone className="size-4" /> Appeler la boutique
        </a>
        <a href={mapsUrls.google()} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-navy/30 px-4 py-2 text-sm font-semibold">
          <MapPin className="size-4" /> Venir voir l'article
        </a>
        <a href={`mailto:?subject=Article sur ${business.name}`} className="inline-flex items-center gap-2 rounded-full border border-navy/30 px-4 py-2 text-sm font-semibold">
          <Mail className="size-4" /> Demander des infos
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Page produit**

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, listProductsBySubcategory } from '@/lib/repos/products';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/format';
import { conditionLabel, type Condition } from '@/lib/condition';
import { ProductGallery } from '@/components/vitrine/product-gallery';
import { ProductCTA } from '@/components/vitrine/product-cta';
import { ProductGrid } from '@/components/vitrine/product-grid';

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from('subcategories')
    .select('*, category:categories(*)')
    .eq('id', product.subcategory_id)
    .single();
  if (!sub) notFound();

  const suggestions = await listProductsBySubcategory(sub.id);
  const others = suggestions.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-xs text-bronze mb-4">
        <Link href={`/c/${sub.category!.slug}`}>{sub.category!.name}</Link> <span className="mx-1">/</span>
        <Link href={`/c/${sub.category!.slug}/${sub.slug}`}>{sub.name}</Link>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <ProductGallery photos={product.photos} name={product.name} />
        <div>
          <p className="text-xs uppercase tracking-wider text-bronze">{sub.name} · {conditionLabel(product.condition as Condition)}</p>
          <h1 className="font-serif text-4xl mt-2">{product.name}</h1>
          <p className="text-2xl font-semibold mt-3">{formatPrice(product.price_cents)}</p>
          {product.quantity === 1 && (
            <p className="text-sm text-brass mt-1">Pièce unique</p>
          )}
          {product.quantity === 0 && (
            <p className="text-sm text-red-700 mt-1">Plus disponible</p>
          )}
          {product.description && (
            <div className="mt-6 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</div>
          )}
          <ProductCTA />
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl mb-6">Dans la même catégorie</h2>
          <ProductGrid products={others} subcategoryNameById={{ [sub.id]: sub.name }} />
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(vitrine): page produit (galerie, CTA téléphone/visite/maps, suggestions)"
```

---

### Tâche 5.6 : Pages contact et mentions légales

**Files:**
- Create: `app/(vitrine)/contact/page.tsx`, `app/(vitrine)/mentions-legales/page.tsx`

- [ ] **Step 1: Page contact**

```tsx
import { business, phoneHref } from '@/lib/business';
import { MapsButtons } from '@/components/vitrine/maps-buttons';
import { Hours } from '@/components/vitrine/hours';
import { publicEnv } from '@/lib/env';

export default function ContactPage() {
  const lat = publicEnv.BUSINESS_LAT;
  const lng = publicEnv.BUSINESS_LNG;
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-4xl">Nous trouver</h1>
      <div className="grid md:grid-cols-2 gap-10 mt-8">
        <div>
          <p className="text-bronze">{business.address}</p>
          <p className="mt-2"><a href={phoneHref} className="underline">{business.phone}</a></p>
          <div className="mt-6">
            <h2 className="font-serif text-xl mb-2">Horaires</h2>
            <Hours />
          </div>
          <div className="mt-6">
            <MapsButtons />
          </div>
        </div>
        <div className="aspect-video w-full rounded-lg overflow-hidden border border-navy/10">
          <iframe
            title="Carte"
            src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
            className="w-full h-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Mentions légales (squelette)**

```tsx
import { business } from '@/lib/business';

export default function MentionsLegalesPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 prose">
      <h1 className="font-serif text-3xl">Mentions légales</h1>
      <p><strong>Éditeur :</strong> {business.name}</p>
      <p><strong>Adresse :</strong> {business.address}</p>
      <p><strong>Téléphone :</strong> {business.phone}</p>
      <p>Hébergement : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.</p>
      <p>Ce site est un site vitrine non transactionnel. Les articles présentés sont disponibles uniquement en boutique.</p>
    </article>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(vitrine): pages contact (avec carte) et mentions légales"
```

---

## Phase 6 — Admin : auth & layout

### Tâche 6.1 : Middleware admin (slug secret + auth)

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Implémenter le middleware**

```typescript
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const adminSlug = process.env.ADMIN_SLUG!;
  const path = request.nextUrl.pathname;

  // Si la route est sous /admin (placeholder) mais que le slug ne matche pas → 404
  if (path.startsWith('/admin') && !path.startsWith(`/${adminSlug}`)) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Pour les routes admin : refresh la session et bloque si non authentifié
  if (path.startsWith(`/${adminSlug}`)) {
    const { response, user } = await updateSession(request);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    const isLogin = path === `/${adminSlug}/login`;
    if (!user && !isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = `/${adminSlug}/login`;
      return NextResponse.redirect(url);
    }
    if (user && isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = `/${adminSlug}`;
      return NextResponse.redirect(url);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
```

- [ ] **Step 2: Stratégie de routage du segment admin**

Le slug est dynamique mais Next.js a besoin d'un nom de dossier physique. Choix : utiliser un segment dynamique `[adminSlug]` mais protégé par middleware.

Créer la structure :

```bash
mkdir -p "app/[adminSlug]/login"
mkdir -p "app/[adminSlug]/produits/nouveau"
mkdir -p "app/[adminSlug]/produits/[id]"
mkdir -p "app/[adminSlug]/categories/[id]"
```

Le middleware déjà ci-dessus vérifie que `[adminSlug]` correspond bien à `process.env.ADMIN_SLUG`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(admin): middleware (slug secret + auth + noindex header)"
```

---

### Tâche 6.2 : Page de login admin

**Files:**
- Create: `app/[adminSlug]/login/page.tsx`, `app/[adminSlug]/login/actions.ts`

- [ ] **Step 1: Server action login**

```typescript
'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect(`/${process.env.ADMIN_SLUG}`);
}
```

- [ ] **Step 2: Page login**

```tsx
import { login } from './actions';

export default async function LoginPage({ params }: { params: Promise<{ adminSlug: string }> }) {
  await params;
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-parchment">
      <form action={login} className="w-full max-w-sm bg-parchment-light border border-navy/10 rounded-lg p-6 space-y-4">
        <h1 className="font-serif text-2xl">Espace admin</h1>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-bronze">Email</span>
          <input name="email" type="email" required className="mt-1 w-full rounded border border-navy/20 px-3 py-2" autoComplete="email" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-bronze">Mot de passe</span>
          <input name="password" type="password" required className="mt-1 w-full rounded border border-navy/20 px-3 py-2" autoComplete="current-password" />
        </label>
        <button className="w-full rounded-full bg-navy text-parchment py-2 font-semibold">Se connecter</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Vérifier manuellement**

`npm run dev` → aller sur `http://localhost:3000/<ADMIN_SLUG>/login`, se connecter avec l'utilisateur Supabase créé en pré-requis. La redirection vers `/<ADMIN_SLUG>` doit fonctionner (puis 404 car la page dashboard n'existe pas encore).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(admin): page login + server action signIn Supabase"
```

---

### Tâche 6.3 : Layout admin + dashboard

**Files:**
- Create: `app/[adminSlug]/layout.tsx`, `app/[adminSlug]/page.tsx`, `app/[adminSlug]/logout/route.ts`, `components/admin/admin-nav.tsx`

- [ ] **Step 1: Logout route**

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL(`/${process.env.ADMIN_SLUG}/login`, process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'));
}
```

- [ ] **Step 2: Nav admin**

```tsx
import Link from 'next/link';

export function AdminNav({ slug }: { slug: string }) {
  return (
    <nav className="bg-navy text-parchment px-4 py-3 flex flex-wrap gap-3 items-center justify-between sticky top-0 z-30">
      <Link href={`/${slug}`} className="font-serif text-lg">Admin</Link>
      <div className="flex gap-4 text-sm">
        <Link href={`/${slug}/produits`}>Produits</Link>
        <Link href={`/${slug}/categories`}>Catégories</Link>
      </div>
      <form action={`/${slug}/logout`} method="post">
        <button className="text-xs underline">Déconnexion</button>
      </form>
    </nav>
  );
}
```

- [ ] **Step 3: Layout admin (avec garde-fou auth)**

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminNav } from '@/components/admin/admin-nav';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ adminSlug: string }>;
}) {
  const { adminSlug } = await params;
  if (adminSlug !== process.env.ADMIN_SLUG) {
    redirect('/');
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // login page handles unauthenticated case, layout assumes user exists
  return (
    <div className="min-h-screen bg-parchment">
      {user && <AdminNav slug={adminSlug} />}
      <main className="px-4 py-6 max-w-3xl mx-auto">{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Dashboard**

```tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminHome({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;
  const supabase = await createClient();
  const [{ count: productCount }, { count: catCount }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
  ]);
  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-parchment-light p-4 rounded border border-navy/10">
          <div className="text-xs text-bronze uppercase tracking-wider">Produits</div>
          <div className="text-2xl font-serif mt-1">{productCount ?? 0}</div>
        </div>
        <div className="bg-parchment-light p-4 rounded border border-navy/10">
          <div className="text-xs text-bronze uppercase tracking-wider">Catégories</div>
          <div className="text-2xl font-serif mt-1">{catCount ?? 0}</div>
        </div>
      </div>
      <Link href={`/${adminSlug}/produits/nouveau`} className="inline-block rounded-full bg-navy text-parchment px-5 py-2.5 font-semibold">
        + Ajouter un produit
      </Link>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(admin): layout + dashboard avec compteurs et CTA + logout"
```

---

## Phase 7 — Admin : catégories et produits

### Tâche 7.1 : Server actions catégories / sous-catégories

**Files:**
- Create: `app/[adminSlug]/categories/actions.ts`

- [ ] **Step 1: Implémenter**

```typescript
'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/slugify';
import { redirect } from 'next/navigation';

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('unauthorized');
  return supabase;
}

export async function createCategory(formData: FormData) {
  const supabase = await requireAuth();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { error: 'Nom requis' };
  await supabase.from('categories').insert({ name, slug: slugify(name) });
  revalidatePath(`/${process.env.ADMIN_SLUG}/categories`);
  revalidatePath('/');
}

export async function renameCategory(id: string, name: string) {
  const supabase = await requireAuth();
  await supabase.from('categories').update({ name, slug: slugify(name) }).eq('id', id);
  revalidatePath(`/${process.env.ADMIN_SLUG}/categories`);
  revalidatePath('/');
}

export async function deleteCategory(id: string) {
  const supabase = await requireAuth();
  await supabase.from('categories').delete().eq('id', id);
  revalidatePath(`/${process.env.ADMIN_SLUG}/categories`);
  revalidatePath('/');
  redirect(`/${process.env.ADMIN_SLUG}/categories`);
}

export async function createSubcategory(categoryId: string, name: string) {
  const supabase = await requireAuth();
  if (!name.trim()) return { error: 'Nom requis' };
  await supabase.from('subcategories').insert({ category_id: categoryId, name, slug: slugify(name) });
  revalidatePath(`/${process.env.ADMIN_SLUG}/categories/${categoryId}`);
}

export async function renameSubcategory(id: string, name: string) {
  const supabase = await requireAuth();
  await supabase.from('subcategories').update({ name, slug: slugify(name) }).eq('id', id);
}

export async function deleteSubcategory(id: string) {
  const supabase = await requireAuth();
  await supabase.from('subcategories').delete().eq('id', id);
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(admin): server actions categories + subcategories CRUD"
```

---

### Tâche 7.2 : Pages catégories (liste + détail)

**Files:**
- Create: `app/[adminSlug]/categories/page.tsx`, `app/[adminSlug]/categories/[id]/page.tsx`

- [ ] **Step 1: Liste catégories**

```tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createCategory } from './actions';

export default async function CategoriesAdmin({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;
  const supabase = await createClient();
  const { data: cats } = await supabase.from('categories').select('*').order('position');
  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Catégories</h1>
      <form action={createCategory} className="flex gap-2 mb-6">
        <input name="name" placeholder="Nouvelle catégorie" className="flex-1 rounded border border-navy/20 px-3 py-2" required />
        <button className="rounded bg-navy text-parchment px-4 py-2 text-sm font-semibold">Ajouter</button>
      </form>
      <ul className="space-y-2">
        {cats?.map((c) => (
          <li key={c.id} className="flex items-center justify-between bg-parchment-light border border-navy/10 rounded p-3">
            <Link href={`/${adminSlug}/categories/${c.id}`} className="font-serif">{c.name}</Link>
            <span className="text-xs text-bronze">{c.slug}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Détail catégorie + sous-catégories**

```tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createSubcategory, deleteSubcategory, renameCategory, deleteCategory } from '../actions';

export default async function CategoryDetailAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: cat } = await supabase.from('categories').select('*, subcategories(*)').eq('id', id).single();
  if (!cat) notFound();

  return (
    <div>
      <form
        action={async (fd) => {
          'use server';
          await renameCategory(id, String(fd.get('name') ?? ''));
        }}
        className="mb-4"
      >
        <label className="block text-xs uppercase tracking-wider text-bronze mb-1">Nom de la catégorie</label>
        <div className="flex gap-2">
          <input name="name" defaultValue={cat.name} required className="flex-1 rounded border border-navy/20 px-3 py-2" />
          <button className="rounded bg-navy text-parchment px-3 py-2 text-sm">Renommer</button>
        </div>
      </form>

      <h2 className="font-serif text-xl mt-8 mb-3">Sous-catégories</h2>
      <form
        action={async (fd) => {
          'use server';
          await createSubcategory(id, String(fd.get('name') ?? ''));
        }}
        className="flex gap-2 mb-4"
      >
        <input name="name" required placeholder="Nouvelle sous-catégorie" className="flex-1 rounded border border-navy/20 px-3 py-2" />
        <button className="rounded bg-navy text-parchment px-3 py-2 text-sm">Ajouter</button>
      </form>
      <ul className="space-y-2">
        {(cat.subcategories ?? []).sort((a: any, b: any) => a.position - b.position).map((sc: any) => (
          <li key={sc.id} className="flex items-center justify-between bg-parchment-light border border-navy/10 rounded p-2">
            <span>{sc.name}</span>
            <form action={async () => { 'use server'; await deleteSubcategory(sc.id); }}>
              <button className="text-xs text-red-700">Supprimer</button>
            </form>
          </li>
        ))}
      </ul>

      <hr className="my-8 border-navy/10" />
      <form action={async () => { 'use server'; await deleteCategory(id); }}>
        <button className="text-sm text-red-700">Supprimer cette catégorie</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Vérifier manuellement** : créer/renommer/supprimer une catégorie et une sous-catégorie depuis l'UI.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(admin): pages catégories (liste + détail) avec CRUD sous-catégories"
```

---

### Tâche 7.3 : Server actions produits (sans photos)

**Files:**
- Create: `app/[adminSlug]/produits/actions.ts`
- Test: `app/[adminSlug]/produits/actions.test.ts`

- [ ] **Step 1: Test pour le helper de slug unique**

Créer `lib/unique-slug.test.ts` puis `lib/unique-slug.ts` :

```typescript
// lib/unique-slug.test.ts
import { describe, it, expect } from 'vitest';
import { ensureUniqueSlug } from './unique-slug';

describe('ensureUniqueSlug', () => {
  it('retourne le slug tel quel s\'il n\'existe pas', async () => {
    const result = await ensureUniqueSlug('fauteuil-club', async () => false);
    expect(result).toBe('fauteuil-club');
  });
  it('ajoute -2 si le slug existe déjà', async () => {
    let calls = 0;
    const result = await ensureUniqueSlug('fauteuil-club', async (s) => {
      calls++;
      return s === 'fauteuil-club';
    });
    expect(result).toBe('fauteuil-club-2');
  });
});
```

```typescript
// lib/unique-slug.ts
export async function ensureUniqueSlug(base: string, exists: (s: string) => Promise<boolean>): Promise<string> {
  let candidate = base;
  let i = 2;
  while (await exists(candidate)) {
    candidate = `${base}-${i++}`;
  }
  return candidate;
}
```

```bash
npm test -- lib/unique-slug --run
```

- [ ] **Step 2: Server actions produits**

```typescript
'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/slugify';
import { parsePrice } from '@/lib/format';
import { ensureUniqueSlug } from '@/lib/unique-slug';

const productSchema = z.object({
  name: z.string().min(1),
  subcategory_id: z.string().uuid(),
  price: z.string().min(1),
  quantity: z.coerce.number().int().min(0),
  condition: z.enum(['neuf', 'tres_bon_etat', 'bon_etat', 'etat_usage']),
  description: z.string().optional(),
  is_published: z.coerce.boolean().optional(),
});

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('unauthorized');
  return supabase;
}

export async function createProduct(formData: FormData) {
  const supabase = await requireAuth();
  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    subcategory_id: formData.get('subcategory_id'),
    price: formData.get('price'),
    quantity: formData.get('quantity'),
    condition: formData.get('condition'),
    description: formData.get('description') ?? '',
    is_published: formData.get('is_published') === 'on',
  });
  if (!parsed.success) return { error: parsed.error.message };
  const base = slugify(parsed.data.name);
  const slug = await ensureUniqueSlug(base, async (s) => {
    const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('slug', s);
    return (count ?? 0) > 0;
  });
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: parsed.data.name,
      slug,
      subcategory_id: parsed.data.subcategory_id,
      price_cents: parsePrice(parsed.data.price),
      quantity: parsed.data.quantity,
      condition: parsed.data.condition,
      description: parsed.data.description ?? null,
      is_published: parsed.data.is_published ?? true,
    })
    .select('id')
    .single();
  if (error || !data) return { error: error?.message ?? 'erreur' };
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits`);
  redirect(`/${process.env.ADMIN_SLUG}/produits/${data.id}`);
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await requireAuth();
  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    subcategory_id: formData.get('subcategory_id'),
    price: formData.get('price'),
    quantity: formData.get('quantity'),
    condition: formData.get('condition'),
    description: formData.get('description') ?? '',
    is_published: formData.get('is_published') === 'on',
  });
  if (!parsed.success) return { error: parsed.error.message };
  await supabase
    .from('products')
    .update({
      name: parsed.data.name,
      subcategory_id: parsed.data.subcategory_id,
      price_cents: parsePrice(parsed.data.price),
      quantity: parsed.data.quantity,
      condition: parsed.data.condition,
      description: parsed.data.description ?? null,
      is_published: parsed.data.is_published ?? true,
    })
    .eq('id', id);
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits`);
  revalidatePath(`/produit/${parsed.data.name}`);
}

export async function deleteProduct(id: string) {
  const supabase = await requireAuth();
  await supabase.from('products').delete().eq('id', id);
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits`);
  redirect(`/${process.env.ADMIN_SLUG}/produits`);
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(admin): server actions produits (create/update/delete) + slug unique"
```

---

### Tâche 7.4 : Composant uploader photos (Supabase Storage + webp)

**Files:**
- Create: `components/admin/photo-uploader.tsx`, `app/[adminSlug]/produits/photo-actions.ts`
- Install: `npm i browser-image-compression`

- [ ] **Step 1: Installer la lib**

```bash
npm i browser-image-compression
```

- [ ] **Step 2: Server actions photos**

```typescript
'use server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('unauthorized');
}

export async function addPhoto(productId: string, dataUrl: string) {
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

  const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');
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

export async function deletePhoto(productId: string, position: number) {
  await requireAuth();
  const admin = createAdminClient();
  await admin.storage.from('product-photos').remove([`${productId}/${position}.webp`]);
  await admin.from('product_photos').delete().eq('product_id', productId).eq('position', position);
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits/${productId}`);
}

export async function reorderPhotos(productId: string, orderedPositions: number[]) {
  await requireAuth();
  const admin = createAdminClient();
  // Pour préserver l'unicité (product_id, position), on passe par des positions négatives temporaires
  await Promise.all(orderedPositions.map((oldPos, idx) =>
    admin.from('product_photos').update({ position: -(idx + 1) }).eq('product_id', productId).eq('position', oldPos),
  ));
  await Promise.all(orderedPositions.map((_, idx) =>
    admin.from('product_photos').update({ position: idx }).eq('product_id', productId).eq('position', -(idx + 1)),
  ));
  revalidatePath(`/${process.env.ADMIN_SLUG}/produits/${productId}`);
}
```

- [ ] **Step 3: Composant uploader**

```tsx
'use client';
import { useState } from 'react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { publicEnv } from '@/lib/env';
import { addPhoto, deletePhoto } from '@/app/[adminSlug]/produits/photo-actions';

export function PhotoUploader({
  productId,
  initial,
}: {
  productId: string;
  initial: { position: number; storage_path: string }[];
}) {
  const [busy, setBusy] = useState(false);
  const url = (p: string) => `${publicEnv.SUPABASE_URL}/storage/v1/object/public/product-photos/${p}`;
  const sorted = [...initial].sort((a, b) => a.position - b.position);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1600,
        fileType: 'image/webp',
        useWebWorker: true,
      });
      const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
      await addPhoto(productId, dataUrl);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
        {sorted.map((p) => (
          <div key={p.position} className="relative aspect-square bg-parchment-light rounded overflow-hidden border border-navy/10">
            <Image src={url(p.storage_path)} alt="" fill className="object-cover" sizes="120px" />
            <form action={async () => { await deletePhoto(productId, p.position); }} className="absolute top-1 right-1">
              <button type="submit" className="text-xs bg-navy/80 text-parchment rounded px-1.5 py-0.5">✕</button>
            </form>
            {p.position === 0 && (
              <span className="absolute bottom-1 left-1 bg-brass text-navy text-[9px] font-bold px-1.5 py-0.5 rounded">Principale</span>
            )}
          </div>
        ))}
        {sorted.length < 5 && (
          <label className="aspect-square flex items-center justify-center border-2 border-dashed border-navy/30 rounded cursor-pointer text-bronze">
            {busy ? '…' : '+'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(admin): uploader photos (Supabase Storage + compression webp)"
```

---

### Tâche 7.5 : Pages produits admin

**Files:**
- Create: `app/[adminSlug]/produits/page.tsx`, `app/[adminSlug]/produits/nouveau/page.tsx`, `app/[adminSlug]/produits/[id]/page.tsx`, `components/admin/product-form.tsx`

- [ ] **Step 1: Composant formulaire produit**

```tsx
'use client';
import { useState } from 'react';
import { CONDITIONS } from '@/lib/condition';

type Sub = { id: string; name: string; category_id: string };
type Cat = { id: string; name: string; subcategories: Sub[] };

export function ProductForm({
  action,
  categories,
  defaults,
  submitLabel,
}: {
  action: (fd: FormData) => Promise<{ error?: string } | void>;
  categories: Cat[];
  defaults?: {
    name?: string;
    price?: string;
    quantity?: number;
    condition?: string;
    description?: string;
    subcategory_id?: string;
    is_published?: boolean;
  };
  submitLabel: string;
}) {
  const initialCat = defaults?.subcategory_id
    ? categories.find((c) => c.subcategories.some((s) => s.id === defaults.subcategory_id))?.id
    : categories[0]?.id;
  const [categoryId, setCategoryId] = useState(initialCat ?? '');
  const subs = categories.find((c) => c.id === categoryId)?.subcategories ?? [];

  return (
    <form action={action} className="space-y-4 pb-24">
      <Field label="Nom du produit">
        <input name="name" required defaultValue={defaults?.name} className="w-full rounded border border-navy/20 px-3 py-2" />
      </Field>

      <Field label="Catégorie">
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded border border-navy/20 px-3 py-2">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>

      <Field label="Sous-catégorie">
        <select name="subcategory_id" required defaultValue={defaults?.subcategory_id} className="w-full rounded border border-navy/20 px-3 py-2">
          {subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Prix (€)">
          <input name="price" required defaultValue={defaults?.price} inputMode="decimal" className="w-full rounded border border-navy/20 px-3 py-2" />
        </Field>
        <Field label="Quantité">
          <input name="quantity" type="number" min={0} required defaultValue={defaults?.quantity ?? 1} className="w-full rounded border border-navy/20 px-3 py-2" />
        </Field>
      </div>

      <Field label="État">
        <select name="condition" required defaultValue={defaults?.condition ?? 'bon_etat'} className="w-full rounded border border-navy/20 px-3 py-2">
          {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </Field>

      <Field label="Description">
        <textarea name="description" defaultValue={defaults?.description} rows={5} className="w-full rounded border border-navy/20 px-3 py-2" />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_published" defaultChecked={defaults?.is_published ?? true} /> Publié
      </label>

      <div className="fixed bottom-0 inset-x-0 bg-parchment border-t border-navy/10 px-4 py-3">
        <button className="w-full rounded-full bg-green-700 text-parchment py-3 font-semibold">{submitLabel}</button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-bronze">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
```

- [ ] **Step 2: Page liste produits**

```tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/format';
import { conditionLabel } from '@/lib/condition';

export default async function ProductsAdmin({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price_cents, quantity, condition, is_published, created_at, photos:product_photos(storage_path, position)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl">Produits</h1>
        <Link href={`/${adminSlug}/produits/nouveau`} className="rounded-full bg-navy text-parchment px-4 py-2 text-sm font-semibold">+ Ajouter</Link>
      </div>
      <ul className="space-y-2">
        {products?.map((p) => (
          <li key={p.id}>
            <Link href={`/${adminSlug}/produits/${p.id}`} className="flex items-center gap-3 bg-parchment-light border border-navy/10 rounded p-3">
              <div className="flex-1">
                <div className="font-serif">{p.name} {!p.is_published && <span className="text-xs text-bronze">(masqué)</span>}</div>
                <div className="text-xs text-bronze">{formatPrice(p.price_cents)} · qté {p.quantity} · {conditionLabel(p.condition as any)}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: Page création**

```tsx
import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/product-form';
import { createProduct } from '../actions';

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: cats } = await supabase.from('categories').select('*, subcategories(*)').order('position');
  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Nouveau produit</h1>
      <ProductForm action={createProduct} categories={(cats as any) ?? []} submitLabel="Enregistrer" />
    </div>
  );
}
```

- [ ] **Step 4: Page édition**

```tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/product-form';
import { PhotoUploader } from '@/components/admin/photo-uploader';
import { updateProduct, deleteProduct } from '../actions';
import { formatPrice } from '@/lib/format';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: product }, { data: cats }] = await Promise.all([
    supabase.from('products').select('*, photos:product_photos(*)').eq('id', id).single(),
    supabase.from('categories').select('*, subcategories(*)').order('position'),
  ]);
  if (!product) notFound();
  const update = updateProduct.bind(null, id);

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Modifier · {product.name}</h1>
      <section className="mb-6">
        <h2 className="font-serif text-xl mb-2">Photos (1 à 5)</h2>
        <PhotoUploader productId={id} initial={product.photos ?? []} />
      </section>
      <ProductForm
        action={update}
        categories={(cats as any) ?? []}
        submitLabel="Mettre à jour"
        defaults={{
          name: product.name,
          price: (product.price_cents / 100).toFixed(2),
          quantity: product.quantity,
          condition: product.condition,
          description: product.description ?? '',
          subcategory_id: product.subcategory_id,
          is_published: product.is_published,
        }}
      />
      <form action={async () => { 'use server'; await deleteProduct(id); }} className="fixed bottom-20 inset-x-0 px-4">
        <button className="w-full rounded-full bg-red-700 text-parchment py-2 text-sm font-semibold">Supprimer ce produit</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Vérifier de bout en bout (créer un produit avec photos)**

`npm run dev`, se connecter à l'admin, créer un produit avec 2-3 photos, vérifier qu'il apparaît sur la vitrine `/c/mobilier/canapes` et sur la page produit.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(admin): pages produits (liste, création, édition avec photos)"
```

---

## Phase 8 — Meilisearch : sync + recherche

### Tâche 8.1 : Client Meilisearch et schéma d'index

**Files:**
- Create: `lib/meilisearch/client.ts`, `lib/meilisearch/schema.ts`, `lib/meilisearch/index-document.ts`
- Test: `lib/meilisearch/index-document.test.ts`

- [ ] **Step 1: `lib/meilisearch/client.ts`**

```typescript
import { MeiliSearch } from 'meilisearch';
import { publicEnv } from '@/lib/env';
import { serverEnv } from '@/lib/env';

export function searchClient() {
  return new MeiliSearch({ host: publicEnv.MEILI_HOST, apiKey: publicEnv.MEILI_SEARCH_KEY });
}

export function adminClient() {
  return new MeiliSearch({ host: publicEnv.MEILI_HOST, apiKey: serverEnv().MEILI_ADMIN_KEY });
}
```

- [ ] **Step 2: `lib/meilisearch/schema.ts` (à appliquer une fois manuellement via script)**

```typescript
export const INDEX_NAME = 'products';

export const indexSettings = {
  searchableAttributes: ['name', 'description', 'category_name', 'subcategory_name'],
  filterableAttributes: ['category_slug', 'subcategory_slug', 'condition', 'price_cents', 'is_published', 'available'],
  sortableAttributes: ['price_cents', 'created_at_ts'],
  rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  typoTolerance: { enabled: true, minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 } },
  faceting: { maxValuesPerFacet: 100 },
};
```

- [ ] **Step 3: `lib/meilisearch/index-document.ts`**

```typescript
import type { Product } from '@/lib/repos/types';
import { publicEnv } from '@/lib/env';

export type IndexedProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  quantity: number;
  condition: string;
  is_published: boolean;
  available: boolean;
  category_slug: string;
  category_name: string;
  subcategory_slug: string;
  subcategory_name: string;
  main_photo_url: string | null;
  created_at_ts: number;
};

export function toIndexedProduct(
  p: Product,
  ctx: { categorySlug: string; categoryName: string; subcategorySlug: string; subcategoryName: string; mainStoragePath: string | null },
): IndexedProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price_cents: p.price_cents,
    quantity: p.quantity,
    condition: p.condition,
    is_published: p.is_published,
    available: p.is_published && p.quantity > 0,
    category_slug: ctx.categorySlug,
    category_name: ctx.categoryName,
    subcategory_slug: ctx.subcategorySlug,
    subcategory_name: ctx.subcategoryName,
    main_photo_url: ctx.mainStoragePath
      ? `${publicEnv.SUPABASE_URL}/storage/v1/object/public/product-photos/${ctx.mainStoragePath}`
      : null,
    created_at_ts: new Date(p.created_at).getTime(),
  };
}
```

- [ ] **Step 4: Test pour `toIndexedProduct`**

```typescript
import { describe, it, expect } from 'vitest';
import { toIndexedProduct } from './index-document';

describe('toIndexedProduct', () => {
  it('calcule available = is_published && quantity > 0', () => {
    const base = { id: '1', slug: 'x', name: 'X', description: null, price_cents: 100, quantity: 1, condition: 'neuf', is_published: true, created_at: new Date().toISOString(), updated_at: '', subcategory_id: 's' } as any;
    const ctx = { categorySlug: 'c', categoryName: 'C', subcategorySlug: 's', subcategoryName: 'S', mainStoragePath: null };
    expect(toIndexedProduct(base, ctx).available).toBe(true);
    expect(toIndexedProduct({ ...base, quantity: 0 }, ctx).available).toBe(false);
    expect(toIndexedProduct({ ...base, is_published: false }, ctx).available).toBe(false);
  });
});
```

```bash
npm test -- lib/meilisearch --run
```

- [ ] **Step 5: Script d'initialisation de l'index**

Créer `scripts/init-meilisearch.ts` :

```typescript
import { adminClient } from '@/lib/meilisearch/client';
import { INDEX_NAME, indexSettings } from '@/lib/meilisearch/schema';

async function main() {
  const client = adminClient();
  await client.createIndex(INDEX_NAME, { primaryKey: 'id' }).catch(() => {});
  await client.index(INDEX_NAME).updateSettings(indexSettings);
  console.log('Index Meilisearch configuré');
}
main();
```

Ajouter au `package.json` :

```json
"scripts": {
  "meili:init": "tsx scripts/init-meilisearch.ts"
}
```

Installer tsx :

```bash
npm i -D tsx
```

Lancer :

```bash
npm run meili:init
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(meili): client + schema + script init + helper indexation"
```

---

### Tâche 8.2 : Route de sync produits → Meilisearch

**Files:**
- Create: `app/api/meili/sync/route.ts`, `lib/meilisearch/sync.ts`

- [ ] **Step 1: `lib/meilisearch/sync.ts`**

```typescript
import { adminClient } from './client';
import { INDEX_NAME } from './schema';
import { toIndexedProduct } from './index-document';
import { createAdminClient } from '@/lib/supabase/admin';

export async function syncProductById(productId: string) {
  const supabase = createAdminClient();
  const { data: product } = await supabase
    .from('products')
    .select('*, photos:product_photos(*), subcategory:subcategories(*, category:categories(*))')
    .eq('id', productId)
    .single();
  if (!product) {
    await adminClient().index(INDEX_NAME).deleteDocument(productId);
    return;
  }
  const sub = (product as any).subcategory;
  const cat = sub.category;
  const mainPhoto = (product.photos ?? []).sort((a: any, b: any) => a.position - b.position)[0];
  const doc = toIndexedProduct(product as any, {
    categorySlug: cat.slug,
    categoryName: cat.name,
    subcategorySlug: sub.slug,
    subcategoryName: sub.name,
    mainStoragePath: mainPhoto?.storage_path ?? null,
  });
  await adminClient().index(INDEX_NAME).addDocuments([doc]);
}

export async function deleteProductFromIndex(productId: string) {
  await adminClient().index(INDEX_NAME).deleteDocument(productId);
}

export async function fullReindex() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from('products')
    .select('*, photos:product_photos(*), subcategory:subcategories(*, category:categories(*))');
  const docs = (products ?? []).map((p: any) => {
    const main = (p.photos ?? []).sort((a: any, b: any) => a.position - b.position)[0];
    return toIndexedProduct(p, {
      categorySlug: p.subcategory.category.slug,
      categoryName: p.subcategory.category.name,
      subcategorySlug: p.subcategory.slug,
      subcategoryName: p.subcategory.name,
      mainStoragePath: main?.storage_path ?? null,
    });
  });
  await adminClient().index(INDEX_NAME).deleteAllDocuments();
  await adminClient().index(INDEX_NAME).addDocuments(docs);
  return docs.length;
}
```

- [ ] **Step 2: Route `/api/meili/sync`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { syncProductById, deleteProductFromIndex } from '@/lib/meilisearch/sync';
import { serverEnv } from '@/lib/env';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== serverEnv().MEILI_WEBHOOK_SECRET) {
    return new NextResponse('forbidden', { status: 403 });
  }
  const body = await req.json();
  // Supabase database webhook envoie { type, table, record, old_record }
  if (body.type === 'DELETE' && body.old_record?.id) {
    await deleteProductFromIndex(body.old_record.id);
    return NextResponse.json({ ok: true });
  }
  const id = body.record?.id;
  if (!id) return NextResponse.json({ ok: false, reason: 'no id' }, { status: 400 });
  await syncProductById(id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Configurer le webhook Supabase**

Dans le dashboard Supabase → Database → Webhooks → New webhook :
- Table : `public.products`
- Events : insert, update, delete
- Type : HTTP Request, method POST
- URL : `https://<TON-DOMAINE>/api/meili/sync` (ou ngrok pour le dev)
- Header HTTP : `x-webhook-secret: <MEILI_WEBHOOK_SECRET>`

Faire pareil pour `public.product_photos` (un changement de photos doit re-indexer le produit). Pour la table photos, le payload contient `product_id` au lieu de `id` ; ajuster la route pour gérer ce cas :

```typescript
// dans la route, après extraction du body :
const id = body.record?.id ?? body.record?.product_id ?? body.old_record?.id ?? body.old_record?.product_id;
```

Faire un second webhook pour `subcategories` (rename d'une sous-catégorie doit reindexer les produits). Pour simplifier, ce webhook appelle un endpoint qui re-index tous les produits liés.

Ajouter une route `/api/meili/reindex-subcategory/[id]` :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncProductById } from '@/lib/meilisearch/sync';
import { serverEnv } from '@/lib/env';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (req.headers.get('x-webhook-secret') !== serverEnv().MEILI_WEBHOOK_SECRET) {
    return new NextResponse('forbidden', { status: 403 });
  }
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from('products').select('id').eq('subcategory_id', id);
  for (const p of data ?? []) await syncProductById(p.id);
  return NextResponse.json({ ok: true, reindexed: data?.length ?? 0 });
}
```

- [ ] **Step 4: Tester** : créer un produit depuis l'admin, vérifier dans le dashboard Meilisearch Cloud que le document apparaît dans l'index `products`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(meili): route /api/meili/sync + helpers + webhook Supabase"
```

---

### Tâche 8.3 : Recherche InstantSearch côté client

**Files:**
- Create: `app/(vitrine)/recherche/page.tsx`, `components/vitrine/search-overlay.tsx`, `components/vitrine/instantsearch-provider.tsx`
- Modify: `components/vitrine/search-trigger.tsx`

- [ ] **Step 1: Provider InstantSearch**

```tsx
'use client';
import { InstantSearch, Configure } from 'react-instantsearch';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { publicEnv } from '@/lib/env';

const { searchClient } = instantMeiliSearch(publicEnv.MEILI_HOST, publicEnv.MEILI_SEARCH_KEY);

export function InstantSearchProvider({ children }: { children: React.ReactNode }) {
  return (
    <InstantSearch indexName="products" searchClient={searchClient} future={{ preserveSharedStateOnUnmount: true }}>
      <Configure filters="is_published = true" />
      {children}
    </InstantSearch>
  );
}
```

Installer :

```bash
npm i @meilisearch/instant-meilisearch
```

- [ ] **Step 2: Overlay de recherche**

```tsx
'use client';
import { useState } from 'react';
import { SearchBox, Hits, RefinementList, Configure } from 'react-instantsearch';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { InstantSearchProvider } from './instantsearch-provider';

function Hit({ hit }: { hit: any }) {
  return (
    <Link href={`/produit/${hit.slug}`} className="flex items-center gap-3 p-2 hover:bg-parchment-light rounded">
      <div className="relative w-12 h-12 bg-parchment-light rounded overflow-hidden">
        {hit.main_photo_url && <Image src={hit.main_photo_url} alt="" fill className="object-cover" sizes="48px" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-serif text-sm truncate">{hit.name}</div>
        <div className="text-xs text-bronze">{hit.subcategory_name} · {formatPrice(hit.price_cents)}</div>
      </div>
    </Link>
  );
}

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-parchment/95 backdrop-blur overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <button onClick={onClose} className="float-right text-bronze"><X /></button>
        <InstantSearchProvider>
          <SearchBox placeholder="Rechercher…" classNames={{ input: 'w-full rounded-full border border-navy/20 px-4 py-2 mt-6' }} />
          <div className="mt-6">
            <Hits hitComponent={Hit} />
          </div>
        </InstantSearchProvider>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Modifier `SearchTrigger`**

```tsx
'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import dynamic from 'next/dynamic';

const SearchOverlay = dynamic(() => import('./search-overlay').then((m) => m.SearchOverlay), { ssr: false });

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} type="button" className="w-full flex items-center gap-2 rounded-full border border-navy/20 bg-parchment-light px-4 py-2 text-sm text-navy/60 hover:border-brass" aria-label="Ouvrir la recherche">
        <Search className="size-4" />
        <span>Rechercher un article…</span>
      </button>
      <SearchOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

- [ ] **Step 4: Page `/recherche` full (avec facettes)**

```tsx
'use client';
import { InstantSearchProvider } from '@/components/vitrine/instantsearch-provider';
import { SearchBox, Hits, RefinementList, RangeInput, SortBy, ClearRefinements, CurrentRefinements } from 'react-instantsearch';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/format';

function Hit({ hit }: any) {
  return (
    <Link href={`/produit/${hit.slug}`} className="block bg-parchment-light rounded-lg border border-navy/8 overflow-hidden">
      <div className="relative aspect-square">
        {hit.main_photo_url && <Image src={hit.main_photo_url} alt={hit.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />}
      </div>
      <div className="p-3">
        <div className="text-xs text-bronze uppercase tracking-wider">{hit.subcategory_name}</div>
        <h3 className="font-serif text-base mt-1">{hit.name}</h3>
        <p className="font-semibold mt-1">{formatPrice(hit.price_cents)}</p>
      </div>
    </Link>
  );
}

export default function RecherchePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <InstantSearchProvider>
        <SearchBox placeholder="Rechercher…" classNames={{ input: 'w-full rounded-full border border-navy/20 px-4 py-2' }} />
        <div className="grid md:grid-cols-[220px_1fr] gap-8 mt-6">
          <aside className="space-y-6 text-sm">
            <div>
              <h3 className="font-serif uppercase tracking-wider text-bronze text-xs mb-2">Catégorie</h3>
              <RefinementList attribute="category_name" />
            </div>
            <div>
              <h3 className="font-serif uppercase tracking-wider text-bronze text-xs mb-2">Sous-catégorie</h3>
              <RefinementList attribute="subcategory_name" />
            </div>
            <div>
              <h3 className="font-serif uppercase tracking-wider text-bronze text-xs mb-2">État</h3>
              <RefinementList attribute="condition" />
            </div>
            <div>
              <h3 className="font-serif uppercase tracking-wider text-bronze text-xs mb-2">Prix (cts)</h3>
              <RangeInput attribute="price_cents" />
            </div>
            <ClearRefinements />
          </aside>
          <div>
            <div className="flex justify-between items-center mb-4">
              <CurrentRefinements />
              <SortBy
                items={[
                  { value: 'products', label: 'Pertinence' },
                  { value: 'products:price_cents:asc', label: 'Prix ↑' },
                  { value: 'products:price_cents:desc', label: 'Prix ↓' },
                  { value: 'products:created_at_ts:desc', label: 'Récents' },
                ]}
              />
            </div>
            <Hits hitComponent={Hit} classNames={{ list: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' }} />
          </div>
        </div>
      </InstantSearchProvider>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(vitrine): recherche instantanée Meilisearch (overlay + page /recherche)"
```

---

## Phase 9 — Avis Google

### Tâche 9.1 : Helper Google Places + route cron

**Files:**
- Create: `lib/google-places.ts`, `app/api/cron/refresh-google-reviews/route.ts`

- [ ] **Step 1: `lib/google-places.ts`**

```typescript
import { serverEnv } from './env';

type PlaceReview = {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url: string;
};

type PlaceDetails = {
  result: {
    rating: number;
    user_ratings_total: number;
    reviews?: PlaceReview[];
  };
  status: string;
};

export async function fetchPlaceDetails() {
  const { GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID } = serverEnv();
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_PLACE_ID}&fields=rating,user_ratings_total,reviews&language=fr&reviews_sort=most_relevant&key=${GOOGLE_PLACES_API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Google Places: ${res.status}`);
  const data = (await res.json()) as PlaceDetails;
  if (data.status !== 'OK') throw new Error(`Google Places status: ${data.status}`);
  return data.result;
}
```

- [ ] **Step 2: Route cron**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { fetchPlaceDetails } from '@/lib/google-places';
import { createAdminClient } from '@/lib/supabase/admin';
import { serverEnv } from '@/lib/env';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${serverEnv().CRON_SECRET}`) {
    return new NextResponse('forbidden', { status: 403 });
  }
  const details = await fetchPlaceDetails();
  const admin = createAdminClient();

  await admin
    .from('google_business_info')
    .upsert({ id: 1, rating: details.rating, total_reviews: details.user_ratings_total, fetched_at: new Date().toISOString() });

  await admin.from('google_reviews_cache').delete().not('id', 'is', null);

  if (details.reviews?.length) {
    await admin.from('google_reviews_cache').insert(
      details.reviews.map((r) => ({
        author_name: r.author_name,
        rating: r.rating,
        text: r.text,
        relative_time: r.relative_time_description,
        profile_photo: r.profile_photo_url,
      })),
    );
  }
  return NextResponse.json({ ok: true, reviews: details.reviews?.length ?? 0 });
}
```

- [ ] **Step 3: Configurer le cron Vercel**

Créer `vercel.json` :

```json
{
  "crons": [
    { "path": "/api/cron/refresh-google-reviews", "schedule": "0 4 * * *" }
  ]
}
```

Vercel passe automatiquement le header `Authorization: Bearer $CRON_SECRET` si la variable est définie côté projet (à configurer dans Vercel → Settings → Cron Jobs).

- [ ] **Step 4: Tester manuellement**

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/refresh-google-reviews
```
Expected: `{"ok": true, "reviews": N}`, et la table Supabase `google_reviews_cache` se remplit.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(google): fetch place details + cron quotidien + cache BDD"
```

---

### Tâche 9.2 : Composant bloc avis sur l'accueil

**Files:**
- Create: `components/vitrine/google-reviews.tsx`
- Modify: `app/(vitrine)/page.tsx`

- [ ] **Step 1: Composant**

```tsx
import { Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { business } from '@/lib/business';

export async function GoogleReviews() {
  const supabase = await createClient();
  const [{ data: info }, { data: reviews }] = await Promise.all([
    supabase.from('google_business_info').select('*').eq('id', 1).maybeSingle(),
    supabase.from('google_reviews_cache').select('*').order('fetched_at', { ascending: false }).limit(5),
  ]);
  if (!info && !reviews?.length) return null;

  return (
    <section id="avis" className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="font-serif text-3xl">Avis clients</h2>
        {info && (
          <div className="text-sm">
            <span className="font-bold text-lg">{info.rating?.toFixed(1)}</span>
            <span className="text-bronze"> / 5 · {info.total_reviews} avis Google</span>
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(reviews ?? []).map((r) => (
          <article key={r.id} className="bg-parchment-light rounded-lg p-4 border border-navy/8">
            <div className="flex items-center gap-2 mb-2">
              {r.profile_photo && (
                <img src={r.profile_photo} alt="" className="size-8 rounded-full" />
              )}
              <div>
                <div className="font-serif text-sm">{r.author_name}</div>
                <div className="text-[10px] text-bronze">{r.relative_time}</div>
              </div>
            </div>
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`size-3.5 ${i < (r.rating ?? 0) ? 'fill-brass text-brass' : 'text-bronze/30'}`} />
              ))}
            </div>
            <p className="text-sm leading-relaxed line-clamp-6">{r.text}</p>
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs">
        <a href={business.googleBusinessUrl} target="_blank" rel="noopener" className="underline">Voir tous les avis sur Google →</a>
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Ajouter à `app/(vitrine)/page.tsx`** entre la grille des récents et le footer :

```tsx
import { GoogleReviews } from '@/components/vitrine/google-reviews';
// ...
<GoogleReviews />
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(vitrine): bloc avis Google avec note moyenne et 5 derniers avis"
```

---

## Phase 10 — Tests E2E & qualité

### Tâche 10.1 : Tests Playwright critiques

**Files:**
- Create: `playwright.config.ts`, `e2e/vitrine.spec.ts`, `e2e/admin.spec.ts`

- [ ] **Step 1: `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI, timeout: 60000 },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
});
```

- [ ] **Step 2: Test vitrine**

```typescript
import { test, expect } from '@playwright/test';

test('accueil affiche le bandeau et les catégories', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/pas de vente en ligne/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /Catégories/i })).toBeVisible();
});

test('navigation catégorie → sous-catégorie', async ({ page }) => {
  await page.goto('/c/mobilier');
  await expect(page.getByRole('heading', { name: 'Mobilier' })).toBeVisible();
  await page.getByRole('link', { name: 'Canapés' }).click();
  await expect(page).toHaveURL(/\/c\/mobilier\/canapes/);
});

test('aucun bouton acheter sur une page produit', async ({ page }) => {
  // Pré-requis : au moins un produit publié existe
  await page.goto('/');
  const firstProductLink = page.locator('a[href^="/produit/"]').first();
  if (await firstProductLink.count() > 0) {
    await firstProductLink.click();
    await expect(page.getByText(/cet article vous intéresse/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /acheter|panier/i })).toHaveCount(0);
  }
});
```

- [ ] **Step 3: Test admin (login + création)**

```typescript
import { test, expect } from '@playwright/test';

const SLUG = process.env.ADMIN_SLUG!;
const EMAIL = process.env.E2E_ADMIN_EMAIL!;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD!;

test('login admin et ajout produit', async ({ page }) => {
  test.skip(!EMAIL || !PASSWORD, 'identifiants e2e non configurés');
  await page.goto(`/${SLUG}/login`);
  await page.getByLabel('Email').fill(EMAIL);
  await page.getByLabel('Mot de passe').fill(PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(`/${SLUG}`);
  await expect(page.getByRole('heading', { name: /tableau de bord/i })).toBeVisible();
});
```

- [ ] **Step 4: Lancer**

```bash
npx playwright test
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test(e2e): playwright pour vitrine + admin (login)"
```

---

### Tâche 10.2 : Lighthouse audit

- [ ] **Step 1: Run en local**

```bash
npm run build && npm run start &
sleep 5
npx lighthouse http://localhost:3000 --preset=desktop --output=html --output-path=./lighthouse-desktop.html
npx lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-mobile.html
```

- [ ] **Step 2: Vérifier**

Ouvrir les rapports, vérifier ≥ 90 Performance / Accessibility / Best Practices / SEO. Si une métrique est sous 90, fixer (lazy loading images, alt texts manquants, contraste).

- [ ] **Step 3: Ajouter au `.gitignore`**

```bash
echo "lighthouse-*.html" >> .gitignore
```

- [ ] **Step 4: Commit (sans les rapports)**

```bash
git add .gitignore
git commit -m "chore: ignore lighthouse reports"
```

---

## Phase 11 — Déploiement Vercel

### Tâche 11.1 : Push GitHub + link Vercel

- [ ] **Step 1: Créer le repo GitHub**

```bash
gh repo create depot-vente-drancy --private --source=. --remote=origin --push
```

- [ ] **Step 2: Linker Vercel (CLI)**

```bash
npm i -g vercel
vercel link
```

Choisir/créer le projet `depot-vente-drancy`.

- [ ] **Step 3: Configurer les env vars sur Vercel**

Pour chaque variable du `.env.local` (sauf les valeurs de dev), faire :

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# coller la valeur, idem pour preview
```

À répéter pour TOUTES les variables (Supabase, Meili, Google, CRON, ADMIN_SLUG, BUSINESS_*).

- [ ] **Step 4: Premier déploiement**

```bash
vercel --prod
```

- [ ] **Step 5: Brancher le domaine** (quand `depotventedrancy.fr` sera acheté)

```bash
vercel domains add depotventedrancy.fr
```
Suivre les instructions DNS chez le registrar.

- [ ] **Step 6: Reconfigurer les webhooks Supabase avec l'URL prod**

Dans Supabase → Database → Webhooks, remplacer `localhost`/ngrok par `https://depotventedrancy.fr/api/meili/sync`.

- [ ] **Step 7: Vérifier le cron Vercel**

Vercel → Project → Settings → Cron Jobs : confirmer que `/api/cron/refresh-google-reviews` est listé et que la prochaine exécution est planifiée.

- [ ] **Step 8: Smoke test prod**

- Ouvrir `https://<vercel-url>/` → vitrine OK
- Ouvrir `https://<vercel-url>/<ADMIN_SLUG>` → redirige vers login
- Se connecter, créer un produit avec photo, vérifier sur la vitrine

- [ ] **Step 9: Commit final**

```bash
git add -A
git commit -m "chore: déploiement initial Vercel + webhooks prod configurés"
git push
```

---

## Définition de "terminé"

- [ ] Site vitrine déployé en HTTPS, navigation catégorie → sous-catégorie → produit fonctionnelle
- [ ] Aucun bouton "acheter" / "panier" nulle part
- [ ] Recherche instantanée Meilisearch avec fautes tolérées
- [ ] Boutons Google Maps / Apple Maps / Waze dans footer, contact, page produit
- [ ] Avis Google affichés sur l'accueil, refresh quotidien actif
- [ ] Admin accessible uniquement via l'URL secrète + auth Supabase
- [ ] Création d'un produit avec 5 photos depuis iPhone en moins d'une minute
- [ ] Lighthouse mobile ≥ 90 (Perf / A11y / BP / SEO)
- [ ] Tests E2E Playwright passent
