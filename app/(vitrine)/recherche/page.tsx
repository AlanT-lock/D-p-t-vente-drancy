'use client';
import { InstantSearchProvider } from '@/components/vitrine/instantsearch-provider';
import { SearchBox, Hits, RefinementList, RangeInput, SortBy, ClearRefinements, CurrentRefinements } from 'react-instantsearch';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/format';

type Hit = {
  objectID: string;
  slug: string;
  name: string;
  subcategory_name: string;
  price_cents: number;
  main_photo_url: string | null;
};

function HitItem({ hit }: { hit: Hit }) {
  return (
    <Link href={`/produit/${hit.slug}`} className="block bg-parchment-light rounded-lg border border-navy/10 overflow-hidden">
      <div className="relative aspect-square">
        {hit.main_photo_url && <Image src={hit.main_photo_url} alt={hit.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />}
      </div>
      <div className="p-3">
        <div className="text-xs text-bronze uppercase tracking-wider">{hit.subcategory_name}</div>
        <h3 className="font-serif text-base mt-1">{hit.name}</h3>
        <p className="font-semibold mt-1">{formatPrice(hit.price_cents)}</p>
      </div>
    </Link>
  );
}

export default function RecherchePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <InstantSearchProvider>
        <SearchBox placeholder="Rechercher…" classNames={{ input: 'w-full rounded-full border border-navy/20 px-4 py-2' }} />
        <div className="grid md:grid-cols-[220px_1fr] gap-8 mt-6">
          <aside className="space-y-6 text-sm">
            <div>
              <h3 className="font-serif uppercase tracking-wider text-bronze text-xs mb-2">Catégorie</h3>
              <RefinementList attribute="category_name" />
            </div>
            <div>
              <h3 className="font-serif uppercase tracking-wider text-bronze text-xs mb-2">Sous-catégorie</h3>
              <RefinementList attribute="subcategory_name" />
            </div>
            <div>
              <h3 className="font-serif uppercase tracking-wider text-bronze text-xs mb-2">État</h3>
              <RefinementList attribute="condition" />
            </div>
            <div>
              <h3 className="font-serif uppercase tracking-wider text-bronze text-xs mb-2">Prix (cts)</h3>
              <RangeInput attribute="price_cents" />
            </div>
            <ClearRefinements />
          </aside>
          <div>
            <div className="flex justify-between items-center mb-4">
              <CurrentRefinements />
              <SortBy
                items={[
                  { value: 'products', label: 'Pertinence' },
                  { value: 'products:price_cents:asc', label: 'Prix ↑' },
                  { value: 'products:price_cents:desc', label: 'Prix ↓' },
                  { value: 'products:created_at_ts:desc', label: 'Récents' },
                ]}
              />
            </div>
            <Hits<Hit> hitComponent={HitItem} classNames={{ list: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' }} />
          </div>
        </div>
      </InstantSearchProvider>
    </div>
  );
}
