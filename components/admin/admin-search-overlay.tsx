'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { X, Search as SearchIcon, EyeOff } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { publicEnv } from '@/lib/env';

type Hit = {
  id: string;
  name: string;
  price_cents: number;
  quantity: number;
  subcategory_name: string;
  category_name: string;
  is_published: boolean;
  main_photo: string | null;
};

export function AdminSearchOverlay({
  open,
  onClose,
  adminSlug,
}: {
  open: boolean;
  onClose: () => void;
  adminSlug: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

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
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) {
          setResults([]);
          return;
        }
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
    <div
      className="fixed inset-0 z-[60] bg-navy/50 backdrop-blur-lg flex items-start justify-center px-4 pt-16 md:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Rechercher un produit (admin)"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-parchment rounded-2xl shadow-2xl border border-navy/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-navy/10">
          <span className="font-serif text-sm uppercase tracking-wider text-bronze">
            Rechercher un produit
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-bronze hover:text-navy p-1"
            aria-label="Fermer la recherche"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-4 sm:px-5 py-4">
          <div className="flex items-center gap-2 border border-navy/20 rounded-full px-3 sm:px-4 py-2 bg-parchment-light focus-within:border-brass">
            <SearchIcon className="size-4 text-bronze shrink-0" />
            <input
              ref={inputRef}
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom du produit, description…"
              enterKeyHint="search"
              inputMode="search"
              autoCapitalize="off"
              autoCorrect="off"
              className="flex-1 min-w-0 bg-transparent outline-none text-base sm:text-sm"
            />
          </div>
        </div>

        <div className="px-3 pb-4 max-h-[min(60vh,500px)] overflow-y-auto">
          {loading && <p className="text-xs text-bronze py-2 px-2">Recherche…</p>}
          {!loading && query.trim() && results.length === 0 && (
            <p className="text-sm text-bronze py-3 px-2">
              Aucun produit pour « {query.trim()} ».
            </p>
          )}
          {!query.trim() && (
            <p className="text-xs text-bronze italic py-2 px-2">
              Tapez quelques lettres pour trouver un produit.
            </p>
          )}
          <ul className="space-y-0.5">
            {results.map((hit) => (
              <li key={hit.id}>
                <a
                  href={`/${adminSlug}/produits/${hit.id}`}
                  className="flex items-center gap-3 p-2 hover:bg-parchment-light rounded"
                >
                  <div className="relative w-12 h-12 bg-parchment-light rounded overflow-hidden shrink-0">
                    {hit.main_photo && (
                      <Image
                        src={photoUrl(hit.main_photo)}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-sm truncate inline-flex items-center gap-1.5">
                      {hit.name}
                      {!hit.is_published && (
                        <EyeOff
                          className="size-3 text-bronze shrink-0"
                          aria-label="Non publié"
                        />
                      )}
                    </div>
                    <div className="text-xs text-bronze">
                      {hit.category_name} · {hit.subcategory_name} · {formatPrice(hit.price_cents)} · qté {hit.quantity}
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
