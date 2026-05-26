'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import dynamic from 'next/dynamic';

const SearchOverlay = dynamic(() => import('./search-overlay').then((m) => m.SearchOverlay), { ssr: false });

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} type="button" className="w-full flex items-center gap-2 rounded-full border border-navy/20 bg-parchment-light px-4 py-2 text-sm text-navy/60 hover:border-brass" aria-label="Ouvrir la recherche">
        <Search className="size-4" />
        <span>Rechercher un article…</span>
      </button>
      <SearchOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
