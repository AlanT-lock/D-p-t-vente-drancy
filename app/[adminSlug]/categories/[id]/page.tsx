import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createSubcategory, deleteSubcategory, renameCategory, deleteCategory } from '../actions';

type SubRow = { id: string; name: string; slug: string; position: number };
type CatWithSubs = { id: string; name: string; slug: string; subcategories: SubRow[] };

export default async function CategoryDetailAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('*, subcategories(*)')
    .eq('id', id)
    .single();
  if (!data) notFound();
  const cat = data as unknown as CatWithSubs;
  const subs = (cat.subcategories ?? [])
    .slice()
    .sort((a, b) => a.position - b.position);

  return (
    <div>
      <form
        action={async (fd: FormData) => {
          'use server';
          await renameCategory(id, String(fd.get('name') ?? ''));
        }}
        className="mb-4"
      >
        <label className="block text-xs uppercase tracking-wider text-bronze mb-1">Nom de la catégorie</label>
        <div className="flex gap-2">
          <input name="name" defaultValue={cat.name} required className="flex-1 rounded border border-navy/20 px-3 py-2" />
          <button className="rounded bg-navy text-parchment px-3 py-2 text-sm">Renommer</button>
        </div>
      </form>

      <h2 className="font-serif text-xl mt-8 mb-3">Sous-catégories</h2>
      <form
        action={async (fd: FormData) => {
          'use server';
          await createSubcategory(id, String(fd.get('name') ?? ''));
        }}
        className="flex gap-2 mb-4"
      >
        <input name="name" required placeholder="Nouvelle sous-catégorie" className="flex-1 rounded border border-navy/20 px-3 py-2" />
        <button className="rounded bg-navy text-parchment px-3 py-2 text-sm">Ajouter</button>
      </form>
      <ul className="space-y-2">
        {subs.map((sc) => (
          <li key={sc.id} className="flex items-center justify-between bg-parchment-light border border-navy/10 rounded p-2">
            <span>{sc.name}</span>
            <form
              action={async () => {
                'use server';
                await deleteSubcategory(sc.id);
              }}
            >
              <button className="text-xs text-red-700">Supprimer</button>
            </form>
          </li>
        ))}
      </ul>

      <hr className="my-8 border-navy/10" />
      <form
        action={async () => {
          'use server';
          await deleteCategory(id);
        }}
      >
        <button className="text-sm text-red-700">Supprimer cette catégorie</button>
      </form>
    </div>
  );
}
