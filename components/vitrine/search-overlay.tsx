'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ferme automatiquement quand l'URL change (après navigation par lien/form)
  const lastKeyRef = useRef(`${pathname}?${searchParams.toString()}`);
  useEffect(() => {
    const key = `${pathname}?${searchParams.toString()}`;
    if (open && key !== lastKeyRef.current) {
      onClose();
    }
    lastKeyRef.current = key;
  }, [pathname, searchParams, open, onClose]);

  // Reset + focus on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Lock body scroll while overlay open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Debounced live results
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

  const submitSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/recherche?q=${encodeURIComponent(trimmed)}`);
    // onClose() est appelé par l'effect sur changement d'URL
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-sm flex items-start justify-center px-4 pt-16 md:pt-24"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Recherche"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-parchment rounded-2xl shadow-2xl border border-navy/10 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-navy/10">
          <span className="font-serif text-sm uppercase tracking-wider text-bronze">Recherche</span>
          <button
            type="button"
            onClick={onClose}
            className="text-bronze hover:text-navy"
            aria-label="Fermer la recherche"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch();
          }}
          className="px-4 sm:px-5 py-4 flex items-stretch gap-2"
        >
          <div className="flex-1 min-w-0 flex items-center gap-2 border border-navy/20 rounded-full px-3 sm:px-4 py-2 bg-parchment-light focus-within:border-brass">
            <SearchIcon className="size-4 text-bronze shrink-0" />
            <input
              ref={inputRef}
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
          <Link
            href={query.trim() ? `/recherche?q=${encodeURIComponent(query.trim())}` : '#'}
            aria-disabled={!query.trim()}
            tabIndex={query.trim() ? 0 : -1}
            onClick={(e) => {
              if (!query.trim()) e.preventDefault();
            }}
            className={`shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full text-parchment px-4 sm:px-5 py-2 text-sm font-semibold ${
              query.trim() ? 'bg-navy hover:opacity-90' : 'bg-navy/40 cursor-not-allowed pointer-events-none'
            }`}
            aria-label="Lancer la recherche"
          >
            <SearchIcon className="size-4 sm:hidden" />
            <span className="hidden sm:inline">Rechercher</span>
          </Link>
        </form>

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
                <Link
                  href={`/produit/${hit.slug}`}
                  onClick={onClose}
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
                </Link>
              </li>
            ))}
          </ul>
          {results.length > 0 && (
            <button
              type="button"
              onClick={submitSearch}
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
