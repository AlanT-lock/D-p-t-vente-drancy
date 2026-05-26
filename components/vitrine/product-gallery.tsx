'use client';
import { useState } from 'react';
import Image from 'next/image';
import { publicEnv } from '@/lib/env';
import type { ProductPhoto } from '@/lib/repos/types';

export function ProductGallery({ photos, name }: { photos: ProductPhoto[]; name: string }) {
  const sorted = [...photos].sort((a, b) => a.position - b.position);
  const [active, setActive] = useState(0);
  if (!sorted.length) return <div className="aspect-square bg-bronze/10 rounded-lg" />;
  const url = (p: ProductPhoto) =>
    `${publicEnv.SUPABASE_URL}/storage/v1/object/public/product-photos/${p.storage_path}`;
  return (
    <div>
      <div className="relative aspect-square bg-parchment-light rounded-lg overflow-hidden">
        <Image src={url(sorted[active])} alt={name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 mt-3">
          {sorted.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActive(i)}
              className={`relative aspect-square w-16 rounded overflow-hidden border-2 ${i === active ? 'border-brass' : 'border-transparent'}`}
              aria-label={`Photo ${i + 1}`}
            >
              <Image src={url(p)} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
