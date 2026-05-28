import Link from 'next/link';
import type { CategoryWithSubs } from '@/lib/repos/types';

export function CategoryTiles({ categories }: { categories: CategoryWithSubs[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="font-serif text-3xl mb-6">Catégories</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/c/${c.slug}`}
            className="flex items-center justify-center bg-parchment-light rounded-lg p-3 aspect-square border border-navy/10 hover:border-brass transition text-center"
          >
            <h3 className="font-serif text-sm md:text-base leading-tight">{c.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
