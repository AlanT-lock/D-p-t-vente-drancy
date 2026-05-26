'use client';
import { SearchBox, Hits } from 'react-instantsearch';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { InstantSearchProvider } from './instantsearch-provider';

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
    <Link href={`/produit/${hit.slug}`} className="flex items-center gap-3 p-2 hover:bg-parchment-light rounded">
      <div className="relative w-12 h-12 bg-parchment-light rounded overflow-hidden">
        {hit.main_photo_url && <Image src={hit.main_photo_url} alt="" fill className="object-cover" sizes="48px" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-serif text-sm truncate">{hit.name}</div>
        <div className="text-xs text-bronze">{hit.subcategory_name} · {formatPrice(hit.price_cents)}</div>
      </div>
    </Link>
  );
}

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-parchment/95 backdrop-blur overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <button onClick={onClose} className="float-right text-bronze" aria-label="Fermer"><X /></button>
        <InstantSearchProvider>
          <SearchBox placeholder="Rechercher…" classNames={{ input: 'w-full rounded-full border border-navy/20 px-4 py-2 mt-6' }} />
          <div className="mt-6">
            <Hits<Hit> hitComponent={HitItem} />
          </div>
        </InstantSearchProvider>
      </div>
    </div>
  );
}
