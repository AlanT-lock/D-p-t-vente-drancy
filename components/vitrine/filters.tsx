'use client';
import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { CONDITIONS } from '@/lib/condition';

export function Filters({ maxPriceDefault = 1000 }: { maxPriceDefault?: number }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    router.push(`${path}?${next.toString()}`);
  };

  const selectedConditions = new Set(params.get('conditions')?.split(',').filter(Boolean) ?? []);
  const maxPrice = params.get('maxPrice');
  const availableOnly = params.get('available') === '1';

  const activeCount =
    (maxPrice ? 1 : 0) + selectedConditions.size + (availableOnly ? 1 : 0);

  const clearAll = () => {
    const next = new URLSearchParams(params);
    next.delete('maxPrice');
    next.delete('conditions');
    next.delete('available');
    router.push(`${path}${next.toString() ? `?${next.toString()}` : ''}`);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 h-11 rounded-full border border-navy/30 bg-parchment-light px-5 text-sm font-medium leading-none hover:border-brass active:bg-brass/10"
        >
          <SlidersHorizontal className="size-4" />
          <span>Filtres</span>
          {activeCount > 0 && (
            <span className="bg-navy text-parchment text-[10px] font-bold rounded-full h-5 min-w-5 inline-flex items-center justify-center px-1.5 leading-none">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-xs text-bronze underline hover:text-navy"
          >
            <X className="size-3" /> Réinitialiser
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3 bg-parchment-light border border-navy/10 rounded-lg p-4 grid sm:grid-cols-3 gap-6">
          <section>
            <h3 className="font-serif text-xs uppercase tracking-wider text-bronze mb-2">
              Prix max (€)
            </h3>
            <input
              type="number"
              min={0}
              defaultValue={maxPrice ?? ''}
              placeholder={String(maxPriceDefault)}
              className="w-full rounded border border-navy/20 px-2 py-1.5 text-sm bg-parchment"
              onBlur={(e) => setParam('maxPrice', e.target.value)}
            />
          </section>

          <section>
            <h3 className="font-serif text-xs uppercase tracking-wider text-bronze mb-2">État</h3>
            <ul className="space-y-1">
              {CONDITIONS.map((c) => (
                <li key={c.value}>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedConditions.has(c.value)}
                      onChange={(e) => {
                        const next = new Set(selectedConditions);
                        if (e.target.checked) next.add(c.value);
                        else next.delete(c.value);
                        setParam('conditions', Array.from(next).join(','));
                      }}
                    />{' '}
                    {c.label}
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="font-serif text-xs uppercase tracking-wider text-bronze mb-2">
              Disponibilité
            </h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setParam('available', e.target.checked ? '1' : null)}
              />{' '}
              Disponible uniquement
            </label>
          </section>
        </div>
      )}
    </div>
  );
}
