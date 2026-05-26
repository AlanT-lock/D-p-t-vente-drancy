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
select c.id, v.n, v.s, v.p
from public.categories c, (values
  ('Canapés', 'canapes', 0),
  ('Tables', 'tables', 1),
  ('Chaises', 'chaises', 2),
  ('Rangements', 'rangements', 3),
  ('Lits', 'lits', 4)
) as v(n, s, p)
where c.slug = 'mobilier';

-- Sous-catégories Décoration
insert into public.subcategories (category_id, name, slug, position)
select c.id, v.n, v.s, v.p
from public.categories c, (values
  ('Luminaires', 'luminaires', 0),
  ('Miroirs', 'miroirs', 1),
  ('Vases', 'vases', 2),
  ('Tableaux', 'tableaux', 3)
) as v(n, s, p)
where c.slug = 'decoration';

-- Sous-catégories Vaisselle
insert into public.subcategories (category_id, name, slug, position)
select c.id, v.n, v.s, v.p
from public.categories c, (values
  ('Assiettes', 'assiettes', 0),
  ('Verres', 'verres', 1),
  ('Couverts', 'couverts', 2)
) as v(n, s, p)
where c.slug = 'vaisselle';

-- Sous-catégories Vêtements
insert into public.subcategories (category_id, name, slug, position)
select c.id, v.n, v.s, v.p
from public.categories c, (values
  ('Femme', 'femme', 0),
  ('Homme', 'homme', 1),
  ('Enfant', 'enfant', 2)
) as v(n, s, p)
where c.slug = 'vetements';
