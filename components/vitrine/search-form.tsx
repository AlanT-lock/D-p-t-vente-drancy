'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search } from 'lucide-react';
import { CONDITIONS } from '@/lib/condition';

export function SearchForm({
  initialQuery,
  initialMaxPrice,
  initialAvailable,
  initialConditions,
  initialSort,
}: {
  initialQuery: string;
  initialMaxPrice: string;
  initialAvailable: boolean;
  initialConditions: string[];
  initialSort: string;
}) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [, startTransition] = useTransition();

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    startTransition(() => router.push(`${path}?${next.toString()}`));
  };

  const conds = new Set(initialConditions);

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-8">
      <aside className="space-y-6 text-sm">
        <section>
          <h3 className="font-serif uppercase tracking-wider text-bronze text-xs mb-2">Prix max (€)</h3>
          <input
            type="number"
            min={0}
            defaultValue={initialMaxPrice}
            className="w-full rounded border border-navy/20 px-2 py-1 text-sm"
            onBlur={(e) => setParam('maxPrice', e.target.value)}
          />
        </section>
        <section>
          <h3 className="font-serif uppercase tracking-wider text-bronze text-xs mb-2">État</h3>
          <ul className="space-y-1">
            {CONDITIONS.map((c) => (
              <li key={c.value}>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={conds.has(c.value)}
                    onChange={(e) => {
                      const next = new Set(conds);
                      if (e.target.checked) next.add(c.value);
                      else next.delete(c.value);
                      setParam('conditions', Array.from(next).join(','));
                    }}
                  /> {c.label}
                </label>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked={initialAvailable}
              onChange={(e) => setParam('available', e.target.checked ? '1' : null)}
            /> Disponible uniquement
          </label>
        </section>
        <section>
          <h3 className="font-serif uppercase tracking-wider text-bronze text-xs mb-2">Tri</h3>
          <select
            defaultValue={initialSort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="w-full rounded border border-navy/20 px-2 py-1 text-sm bg-parchment-light"
          >
            <option value="relevance">Pertinence</option>
            <option value="recent">Plus récents</option>
            <option value="price_asc">Prix ↑</option>
            <option value="price_desc">Prix ↓</option>
          </select>
        </section>
      </aside>

      <form
        action={(fd) => {
          setParam('q', String(fd.get('q') ?? ''));
        }}
        className="self-start flex items-center gap-2 border border-navy/20 rounded-full px-4 py-2 bg-parchment-light w-full"
      >
        <Search className="size-4 text-bronze" />
        <input
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher…"
          className="flex-1 bg-transparent outline-none text-sm"
        />
        <button type="submit" className="text-xs underline text-bronze">Rechercher</button>
      </form>
    </div>
  );
}
