'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { SearchOverlay } from './search-overlay';

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        // Fallback explicite pour iOS Safari : certains contextes (sticky header,
        // backdrop-blur parent) cassent le synthesized click. onPointerUp marche
        // partout — souris, stylet, doigt.
        onPointerUp={handleOpen}
        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        className="inline-flex items-center justify-center size-11 rounded-full border border-navy/30 bg-parchment-light text-navy active:bg-brass active:border-brass cursor-pointer"
        aria-label="Ouvrir la recherche"
        title="Rechercher"
      >
        <Search className="size-5 pointer-events-none" aria-hidden="true" />
      </button>
      <SearchOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
