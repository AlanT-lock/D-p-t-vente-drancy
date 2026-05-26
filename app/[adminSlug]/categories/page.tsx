import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createCategory } from './actions';

export default async function CategoriesAdmin({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;
  const supabase = await createClient();
  const { data: cats } = await supabase.from('categories').select('*').order('position');
  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Catégories</h1>
      <form action={createCategory} className="flex gap-2 mb-6">
        <input name="name" placeholder="Nouvelle catégorie" className="flex-1 rounded border border-navy/20 px-3 py-2" required />
        <button className="rounded bg-navy text-parchment px-4 py-2 text-sm font-semibold">Ajouter</button>
      </form>
      <ul className="space-y-2">
        {cats?.map((c) => (
          <li key={c.id} className="flex items-center justify-between bg-parchment-light border border-navy/10 rounded p-3">
            <Link href={`/${adminSlug}/categories/${c.id}`} className="font-serif">{c.name}</Link>
            <span className="text-xs text-bronze">{c.slug}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
