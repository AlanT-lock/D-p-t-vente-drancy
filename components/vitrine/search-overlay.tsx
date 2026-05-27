'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Search as SearchIcon } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { publicEnv } from '@/lib/env';

type Hit = {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  subcategory_name: string;
  main_photo: string | null;
};

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = (await res.json()) as { results: Hit[] };
        setResults(data.results);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query, open]);

  if (!open) return null;
  const photoUrl = (path: string) =>
    `${publicEnv.SUPABASE_URL}/storage/v1/object/public/product-photos/${path}`;

  return (
    <div className="fixed inset-0 z-50 bg-parchment/95 backdrop-blur overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <button onClick={onClose} className="float-right text-bronze" aria-label="Fermer"><X /></button>
        <div className="mt-6 flex items-center gap-2 border border-navy/20 rounded-full px-4 py-2 bg-parchment-light">
          <SearchIcon className="size-4 text-bronze" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>

        <div className="mt-4 space-y-1">
          {loading && <p className="text-xs text-bronze py-2">Recherche…</p>}
          {!loading && query && results.length === 0 && (
            <p className="text-sm text-bronze py-2">Aucun résultat.</p>
          )}
          {results.map((hit) => (
            <Link
              key={hit.id}
              href={`/produit/${hit.slug}`}
              onClick={onClose}
              className="flex items-center gap-3 p-2 hover:bg-parchment-light rounded"
            >
              <div className="relative w-12 h-12 bg-parchment-light rounded overflow-hidden">
                {hit.main_photo && (
                  <Image src={photoUrl(hit.main_photo)} alt="" fill className="object-cover" sizes="48px" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-sm truncate">{hit.name}</div>
                <div className="text-xs text-bronze">{hit.subcategory_name} · {formatPrice(hit.price_cents)}</div>
              </div>
            </Link>
          ))}
          {results.length > 0 && (
            <Link
              href={`/recherche?q=${encodeURIComponent(query.trim())}`}
              onClick={onClose}
              className="block text-center text-xs underline text-bronze py-3"
            >
              Voir tous les résultats →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
