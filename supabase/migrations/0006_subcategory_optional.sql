-- Rend la sous-catégorie optionnelle. Un produit peut être rattaché directement
-- à une catégorie via une sous-catégorie, ou ne pas avoir de sous-catégorie du tout.

alter table public.products
  alter column subcategory_id drop not null;

-- Note : la FK avec ON DELETE RESTRICT est conservée.
-- Si la sous-catégorie est supprimée, le produit doit d'abord être réassigné (ou détaché).
