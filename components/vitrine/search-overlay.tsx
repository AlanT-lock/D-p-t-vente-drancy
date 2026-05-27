'use client';

import { useEffect, useState, useRef } from 'react';
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
  const formRef = useRef<HTMLFormElement>(null);

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
    <div
      className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-sm flex items-start justify-center px-4 pt-16 md:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Recherche"
      onClick={(e) => {
        // Ferme uniquement si on clique vraiment sur le backdrop (pas un enfant)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-parchment rounded-2xl shadow-2xl border border-navy/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-navy/10">
          <span className="font-serif text-sm uppercase tracking-wider text-bronze">Recherche</span>
          <button
            type="button"
            onClick={onClose}
            className="text-bronze hover:text-navy p-1"
            aria-label="Fermer la recherche"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form GET natif — submit du navigateur direct vers /recherche */}
        <form
          ref={formRef}
          action="/recherche"
          method="get"
          className="px-4 sm:px-5 py-4 flex items-stretch gap-2"
        >
          <div className="flex-1 min-w-0 flex items-center gap-2 border border-navy/20 rounded-full px-3 sm:px-4 py-2 bg-parchment-light focus-within:border-brass">
            <SearchIcon className="size-4 text-bronze shrink-0" />
            <input
              ref={inputRef}
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Quel article cherchez-vous ?"
              enterKeyHint="search"
              inputMode="search"
              autoCapitalize="off"
              autoCorrect="off"
              className="flex-1 min-w-0 bg-transparent outline-none text-base sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full bg-navy text-parchment px-4 sm:px-5 py-2 text-sm font-semibold active:opacity-80 hover:opacity-90"
            aria-label="Lancer la recherche"
          >
            <SearchIcon className="size-4 sm:hidden" />
            <span className="hidden sm:inline">Rechercher</span>
          </button>
        </form>

        {/* DIAGNOSTIC TEMPORAIRE — sera retiré dès qu'on confirme que le tap marche */}
        <div className="px-4 sm:px-5 pb-3 flex flex-col gap-2">
          <a
            href="/recherche?q=test"
            className="block text-center bg-red-600 text-white font-bold py-3 rounded-lg"
          >
            TEST A — lien direct /recherche?q=test
          </a>
          <a
            href="/categories"
            className="block text-center bg-orange-500 text-white font-bold py-3 rounded-lg"
          >
            TEST B — lien direct /categories
          </a>
          <p className="text-[10px] text-bronze text-center">
            Build : 2026-05-27 search v8
          </p>
        </div>

        <div className="px-3 pb-4 max-h-[min(60vh,500px)] overflow-y-auto">
          {loading && <p className="text-xs text-bronze py-2 px-2">Recherche…</p>}
          {!loading && query.trim() && results.length === 0 && (
            <p className="text-sm text-bronze py-3 px-2">Aucun résultat pour « {query.trim()} ».</p>
          )}
          {!query.trim() && (
            <p className="text-xs text-bronze italic py-2 px-2">
              Tapez quelques lettres puis cliquez Rechercher, ou choisissez un résultat ci-dessous.
            </p>
          )}
          <ul className="space-y-0.5">
            {results.map((hit) => (
              <li key={hit.id}>
                <a
                  href={`/produit/${hit.slug}`}
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
                    <div className="font-serif text-sm truncate">{hit.name}</div>
                    <div className="text-xs text-bronze">
                      {hit.subcategory_name} · {formatPrice(hit.price_cents)}
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
          {results.length > 0 && (
            <button
              type="button"
              onClick={() => formRef.current?.submit()}
              className="block w-full text-center text-xs underline text-bronze py-3 hover:text-navy"
            >
              Voir tous les résultats →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
