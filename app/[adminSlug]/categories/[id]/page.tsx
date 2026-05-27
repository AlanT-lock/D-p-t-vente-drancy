import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  createSubcategory,
  deleteSubcategory,
  renameSubcategory,
  renameCategory,
  deleteCategory,
} from '../actions';

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
  const subs = (cat.subcategories ?? []).slice().sort((a, b) => a.position - b.position);

  return (
    <div>
      {/* Renommer la catégorie */}
      <form
        action={async (fd: FormData) => {
          'use server';
          await renameCategory(id, String(fd.get('name') ?? ''));
        }}
        className="mb-6"
      >
        <label className="block text-xs uppercase tracking-wider text-bronze mb-1">Nom de la catégorie</label>
        <div className="flex gap-2">
          <input
            name="name"
            defaultValue={cat.name}
            required
            className="flex-1 rounded border border-navy/20 px-3 py-2"
          />
          <button className="rounded bg-navy text-parchment px-3 py-2 text-sm">Renommer</button>
        </div>
      </form>

      <hr className="my-6 border-navy/10" />

      {/* Sous-catégories */}
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-serif text-xl">Sous-catégories</h2>
        <span className="text-xs text-bronze">{subs.length} au total</span>
      </div>

      {/* Ajouter */}
      <form
        action={async (fd: FormData) => {
          'use server';
          await createSubcategory(id, String(fd.get('name') ?? ''));
        }}
        className="flex gap-2 mb-4"
      >
        <input
          name="name"
          required
          placeholder="Nouvelle sous-catégorie"
          className="flex-1 rounded border border-navy/20 px-3 py-2"
        />
        <button className="rounded bg-navy text-parchment px-4 py-2 text-sm font-semibold">+ Ajouter</button>
      </form>

      {/* Liste avec renommage + suppression */}
      {subs.length === 0 ? (
        <p className="text-sm text-bronze italic py-4">Aucune sous-catégorie pour le moment.</p>
      ) : (
        <ul className="space-y-2">
          {subs.map((sc) => (
            <li
              key={sc.id}
              className="bg-parchment-light border border-navy/10 rounded p-2 flex items-center gap-2"
            >
              <form
                action={async (fd: FormData) => {
                  'use server';
                  await renameSubcategory(sc.id, String(fd.get('name') ?? ''));
                }}
                className="flex-1 flex gap-2"
              >
                <input
                  name="name"
                  defaultValue={sc.name}
                  required
                  className="flex-1 rounded border border-navy/20 px-3 py-1.5 text-sm bg-parchment"
                />
                <button className="text-xs rounded bg-navy text-parchment px-3 py-1.5 font-medium whitespace-nowrap">
                  Renommer
                </button>
              </form>
              <form
                action={async () => {
                  'use server';
                  await deleteSubcategory(sc.id);
                }}
              >
                <button
                  type="submit"
                  className="text-xs rounded border border-red-700/40 text-red-700 px-3 py-1.5 font-medium whitespace-nowrap hover:bg-red-700/10"
                  aria-label={`Supprimer ${sc.name}`}
                >
                  Supprimer
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <hr className="my-8 border-navy/10" />

      {/* Zone danger : supprimer la catégorie entière */}
      <details className="text-sm">
        <summary className="cursor-pointer text-red-700 font-medium">Zone de danger</summary>
        <form
          action={async () => {
            'use server';
            await deleteCategory(id);
          }}
          className="mt-3"
        >
          <p className="text-xs text-bronze mb-2">
            Supprime définitivement cette catégorie et toutes ses sous-catégories. Les produits qui y sont rattachés bloqueront la suppression.
          </p>
          <button
            type="submit"
            className="rounded border border-red-700 text-red-700 px-3 py-1.5 text-xs font-medium hover:bg-red-700 hover:text-parchment"
          >
            Supprimer cette catégorie
          </button>
        </form>
      </details>
    </div>
  );
}
