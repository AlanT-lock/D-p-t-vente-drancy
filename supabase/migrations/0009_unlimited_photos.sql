-- Retire la limite de 5 photos par produit.
-- La contrainte CHECK (position between 0 and 4) plafonnait à 5 positions (0..4).
-- On la supprime ; l'unicité (product_id, position) suffit pour l'ordre des photos.
do $$
declare c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'product_photos'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%position%'
  loop
    execute format('alter table public.product_photos drop constraint %I', c.conname);
  end loop;
end $$;
