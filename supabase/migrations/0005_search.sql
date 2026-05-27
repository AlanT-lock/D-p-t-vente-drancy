create extension if not exists pg_trgm;

-- Trigram index on name for fuzzy/typo-tolerant matching
create index idx_products_name_trgm on public.products using gin (name gin_trgm_ops);

-- Generated tsvector column for fulltext (French config)
alter table public.products
  add column search_vector tsvector
  generated always as (
    to_tsvector('french', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) stored;

create index idx_products_search_vector on public.products using gin (search_vector);
