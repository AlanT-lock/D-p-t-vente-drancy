'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { AdminSearchOverlay } from './admin-search-overlay';

export function AdminSearchTrigger({ adminSlug }: { adminSlug: string }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        onPointerUp={handleOpen}
        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'rgba(201,169,97,0.3)' }}
        className="inline-flex items-center justify-center size-9 rounded-full border border-parchment/40 text-parchment active:bg-brass/30"
        aria-label="Rechercher un produit"
        title="Rechercher un produit"
      >
        <Search className="size-4 pointer-events-none" aria-hidden="true" />
      </button>
      <AdminSearchOverlay open={open} onClose={() => setOpen(false)} adminSlug={adminSlug} />
    </>
  );
}
