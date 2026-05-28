'use client';
import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { publicEnv } from '@/lib/env';
import type { ProductPhoto } from '@/lib/repos/types';

export function ProductGallery({ photos, name }: { photos: ProductPhoto[]; name: string }) {
  const sorted = [...photos].sort((a, b) => a.position - b.position);
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const url = useCallback(
    (p: ProductPhoto) =>
      `${publicEnv.SUPABASE_URL}/storage/v1/object/public/product-photos/${p.storage_path}`,
    [],
  );

  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setActive((cur) => (cur === i ? cur : i));
  }, []);

  const scrollTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
    setActive(i);
  };

  if (!sorted.length) {
    return <div className="aspect-square bg-bronze/10 rounded-lg" />;
  }

  return (
    <div>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory rounded-lg bg-parchment-light scroll-smooth touch-pan-x [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {sorted.map((p, i) => (
          <div
            key={p.id}
            className="relative aspect-square w-full shrink-0 snap-center snap-always"
          >
            <Image
              src={url(p)}
              alt={i === 0 ? name : ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {sorted.length > 1 && (
        <>
          {/* Pagination dots (mobile-first signal) */}
          <div className="flex justify-center gap-1.5 mt-3">
            {sorted.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? 'w-6 bg-navy' : 'w-1.5 bg-navy/25'
                }`}
                aria-label={`Aller à la photo ${i + 1}`}
              />
            ))}
          </div>

          {/* Thumbnails (desktop-friendly precision) */}
          <div className="hidden md:flex gap-2 mt-3 overflow-x-auto">
            {sorted.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => scrollTo(i)}
                className={`relative aspect-square w-16 shrink-0 rounded overflow-hidden border-2 transition ${
                  i === active ? 'border-brass' : 'border-transparent'
                }`}
                aria-label={`Photo ${i + 1}`}
              >
                <Image src={url(p)} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
