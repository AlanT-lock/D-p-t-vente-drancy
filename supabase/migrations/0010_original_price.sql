-- Prix neuf (prix de vente d'origine, avant dépôt-vente). Optionnel.
-- Quand il est renseigné et supérieur au prix du magasin, la vitrine l'affiche
-- barré avec le pourcentage de réduction.
alter table public.products
  add column if not exists original_price_cents int
  check (original_price_cents is null or original_price_cents >= 0);
