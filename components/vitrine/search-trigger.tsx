'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { SearchOverlay } from './search-overlay';

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  const [taps, setTaps] = useState(0);
  const handleOpen = () => {
    setTaps((c) => c + 1);
    setOpen(true);
  };
  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        onPointerUp={handleOpen}
        onTouchEnd={handleOpen}
        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'rgba(201,169,97,0.3)' }}
        className="relative inline-flex items-center justify-center size-11 rounded-full border border-navy/30 bg-parchment-light text-navy cursor-pointer"
        aria-label="Ouvrir la recherche"
        title="Rechercher"
      >
        <Search className="size-5 pointer-events-none" aria-hidden="true" />
        {taps > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center pointer-events-none">
            {taps}
          </span>
        )}
      </button>
      <SearchOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
