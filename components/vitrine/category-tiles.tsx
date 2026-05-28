import Link from 'next/link';
import type { CategoryWithSubs } from '@/lib/repos/types';

export function CategoryTiles({ categories }: { categories: CategoryWithSubs[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="font-serif text-3xl mb-6">Catégories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/c/${c.slug}`}
            className="flex items-center justify-center bg-parchment-light rounded-lg p-6 aspect-square border border-navy/10 hover:border-brass transition text-center"
          >
            <h3 className="font-serif text-xl">{c.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
