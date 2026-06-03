import Link from 'next/link';
import Image from 'next/image';
import { searchProducts } from '@/lib/search/products';
import { formatPrice } from '@/lib/format';
import { conditionLabel } from '@/lib/condition';
import { getConditions } from '@/lib/repos/conditions';
import { publicEnv } from '@/lib/env';
import { SearchForm } from '@/components/vitrine/search-form';

export const dynamic = 'force-dynamic';

type Search = {
  q?: string;
  categorie?: string;
  sousCategorie?: string;
  conditions?: string;
  maxPrice?: string;
  available?: string;
  sort?: string;
};

export default async function RecherchePage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = sp.q ?? '';
  const conditions = sp.conditions?.split(',').filter(Boolean);
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) * 100 : undefined;

  const results = q || sp.categorie || sp.sousCategorie || conditions?.length || maxPrice || sp.available
    ? await searchProducts(q, {
        categorySlug: sp.categorie,
        subcategorySlug: sp.sousCategorie,
        conditions,
        maxPriceCents: maxPrice,
        availableOnly: sp.available === '1',
        sort: (sp.sort as 'relevance' | 'price_asc' | 'price_desc' | 'recent') ?? 'relevance',
        limit: 60,
      })
    : [];

  const conditionOptions = await getConditions();

  const photoUrl = (path: string) =>
    `${publicEnv.SUPABASE_URL}/storage/v1/object/public/product-photos/${path}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <SearchForm
        initialQuery={q}
        initialMaxPrice={sp.maxPrice ?? ''}
        initialAvailable={sp.available === '1'}
        initialConditions={conditions ?? []}
        initialSort={sp.sort ?? 'relevance'}
        conditions={conditionOptions}
      />

      <p className="text-sm text-bronze mt-6">
        {q ? `${results.length} résultat${results.length > 1 ? 's' : ''} pour "${q}"` : `${results.length} produit${results.length > 1 ? 's' : ''}`}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {results.map((p) => {
          const main = [...p.photos].sort((a, b) => a.position - b.position)[0];
          return (
            <Link key={p.id} href={`/produit/${p.slug}`} className="block bg-parchment-light rounded-lg border border-navy/10 overflow-hidden">
              <div className="relative aspect-square">
                {main && (
                  <Image src={photoUrl(main.storage_path)} alt={p.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                )}
              </div>
              <div className="p-3">
                <div className="text-xs text-bronze uppercase tracking-wider">{p.subcategory_name} · {conditionLabel(p.condition, conditionOptions)}</div>
                <h3 className="font-serif text-base mt-1">{p.name}</h3>
                <p className="font-semibold mt-1">{formatPrice(p.price_cents)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
