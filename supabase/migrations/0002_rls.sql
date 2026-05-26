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
