'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import dynamic from 'next/dynamic';

const SearchOverlay = dynamic(() => import('./search-overlay').then((m) => m.SearchOverlay), {
  ssr: false,
});

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        type="button"
        className="inline-flex items-center justify-center size-10 rounded-full border border-navy/30 bg-parchment-light text-navy hover:bg-brass hover:border-brass hover:text-navy transition"
        aria-label="Ouvrir la recherche"
        title="Rechercher"
      >
        <Search className="size-5" />
      </button>
      <SearchOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
