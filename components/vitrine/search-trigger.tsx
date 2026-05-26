'use client';
import { Search } from 'lucide-react';

export function SearchTrigger() {
  return (
    <button
      type="button"
      className="w-full flex items-center gap-2 rounded-full border border-navy/20 bg-parchment-light px-4 py-2 text-sm text-navy/60 hover:border-brass"
      aria-label="Ouvrir la recherche"
    >
      <Search className="size-4" />
      <span>Rechercher un article…</span>
    </button>
  );
}
