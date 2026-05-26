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
