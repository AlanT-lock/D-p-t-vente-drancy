import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminHome({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;
  const supabase = await createClient();
  const [{ count: productCount }, { count: catCount }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
  ]);
  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-parchment-light p-4 rounded border border-navy/10">
          <div className="text-xs text-bronze uppercase tracking-wider">Produits</div>
          <div className="text-2xl font-serif mt-1">{productCount ?? 0}</div>
        </div>
        <div className="bg-parchment-light p-4 rounded border border-navy/10">
          <div className="text-xs text-bronze uppercase tracking-wider">Catégories</div>
          <div className="text-2xl font-serif mt-1">{catCount ?? 0}</div>
        </div>
      </div>
      <Link href={`/${adminSlug}/produits/nouveau`} className="inline-block rounded-full bg-navy text-parchment px-5 py-2.5 font-semibold">
        + Ajouter un produit
      </Link>
    </div>
  );
}
