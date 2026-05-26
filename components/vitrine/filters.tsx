'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CONDITIONS } from '@/lib/condition';

export function Filters({ maxPriceDefault = 1000 }: { maxPriceDefault?: number }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    router.push(`${path}?${next.toString()}`);
  };

  const selectedConditions = new Set(params.get('conditions')?.split(',').filter(Boolean) ?? []);

  return (
    <aside className="space-y-6">
      <section>
        <h3 className="font-serif text-sm uppercase tracking-wider text-bronze mb-2">Prix max (€)</h3>
        <input type="number" min={0} defaultValue={params.get('maxPrice') ?? ''} placeholder={String(maxPriceDefault)} className="w-full rounded border border-navy/20 px-2 py-1 text-sm"
          onBlur={(e) => setParam('maxPrice', e.target.value)} />
      </section>
      <section>
        <h3 className="font-serif text-sm uppercase tracking-wider text-bronze mb-2">État</h3>
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
                /> {c.label}
              </label>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={params.get('available') === '1'}
            onChange={(e) => setParam('available', e.target.checked ? '1' : null)}
          /> Disponible uniquement
        </label>
      </section>
    </aside>
  );
}
