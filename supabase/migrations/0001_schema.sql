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
