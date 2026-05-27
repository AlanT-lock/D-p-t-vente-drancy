import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createCategory } from './actions';

type SubRow = { id: string; name: string; position: number };
type CatRow = { id: string; name: string; slug: string; subcategories: SubRow[] };

export default async function CategoriesAdmin({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, subcategories(id, name, position)')
    .order('position');
  const cats = (data ?? []) as unknown as CatRow[];

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Catégories</h1>

      <form action={createCategory} className="flex gap-2 mb-6">
        <input name="name" placeholder="Nouvelle catégorie" className="flex-1 rounded border border-navy/20 px-3 py-2" required />
        <button className="rounded bg-navy text-parchment px-4 py-2 text-sm font-semibold">Ajouter</button>
      </form>

      <ul className="space-y-3">
        {cats.map((c) => {
          const subs = [...(c.subcategories ?? [])].sort((a, b) => a.position - b.position);
          return (
            <li key={c.id} className="bg-parchment-light border border-navy/10 rounded p-3">
              <div className="flex items-center justify-between gap-3">
                <Link href={`/${adminSlug}/categories/${c.id}`} className="font-serif text-lg">{c.name}</Link>
                <Link href={`/${adminSlug}/categories/${c.id}`} className="text-xs underline text-bronze whitespace-nowrap">
                  Gérer →
                </Link>
              </div>
              {subs.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {subs.map((s) => (
                    <span key={s.id} className="text-xs bg-parchment border border-navy/15 rounded-full px-2.5 py-1">
                      {s.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-bronze mt-2 italic">Aucune sous-catégorie</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
