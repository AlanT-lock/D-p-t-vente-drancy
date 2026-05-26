'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const OPTIONS = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'name', label: 'Nom A-Z' },
];

export function SortSelect() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const current = params.get('sort') ?? 'recent';
  return (
    <select
      className="rounded-full border border-navy/20 bg-parchment-light px-3 py-1.5 text-sm"
      value={current}
      onChange={(e) => {
        const next = new URLSearchParams(params);
        next.set('sort', e.target.value);
        router.push(`${path}?${next.toString()}`);
      }}
    >
      {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
