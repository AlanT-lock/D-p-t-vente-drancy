-- États de produit gérables en base (au lieu d'un CHECK figé).
-- Les admins peuvent ajouter/supprimer des états ; ils sont visibles côté vitrine.

create table public.product_conditions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Seed des états existants (préserve les valeurs déjà stockées dans products.condition).
insert into public.product_conditions (slug, label, position) values
  ('neuf',          'Neuf',            0),
  ('tres_bon_etat', 'Très bon état',   1),
  ('bon_etat',      'Bon état',        2),
  ('etat_usage',    'État d''usage',   3)
on conflict (slug) do nothing;

-- products.condition : on retire le CHECK figé et on rattache à la table par FK.
-- La FK ON DELETE RESTRICT empêche de supprimer un état encore utilisé.
-- Drop défensif de TOUTE contrainte CHECK sur products portant sur "condition"
-- (le nom auto-généré peut varier selon la version de Postgres).
do $$
declare c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'products'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%condition%'
  loop
    execute format('alter table public.products drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.products
  add constraint products_condition_fkey
  foreign key (condition) references public.product_conditions(slug)
  on update cascade on delete restrict;

-- RLS : lecture publique (vitrine), écriture réservée aux admins.
alter table public.product_conditions enable row level security;

create policy "public read product_conditions" on public.product_conditions
  for select using (true);

create policy "admin manage product_conditions" on public.product_conditions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
