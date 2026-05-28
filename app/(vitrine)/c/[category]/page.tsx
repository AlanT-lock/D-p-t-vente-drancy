import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug } from '@/lib/repos/categories';
import { listProductsBySubcategory, type ListOpts } from '@/lib/repos/products';
import { ProductGrid } from '@/components/vitrine/product-grid';
import { Filters } from '@/components/vitrine/filters';
import { SortSelect } from '@/components/vitrine/sort-select';

export const revalidate = 60;

type Search = { sort?: string; maxPrice?: string; conditions?: string; available?: string };

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Search>;
}) {
  const { category: slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) notFound();

  const opts: ListOpts = {
    sort: sp.sort as ListOpts['sort'],
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) * 100 : undefined,
    conditions: sp.conditions?.split(',').filter(Boolean),
    availableOnly: sp.available === '1',
  };

  const productsBySubs = await Promise.all(
    category.subcategories.map((sc) => listProductsBySubcategory(sc.id, opts)),
  );
  const products = productsBySubs.flat();
  const subcategoryNameById = Object.fromEntries(category.subcategories.map((s) => [s.id, s.name]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-xs text-bronze mb-4">
        <Link href="/categories">Catégories</Link> <span className="mx-1">/</span> <span>{category.name}</span>
      </nav>
      <h1 className="font-serif text-4xl">{category.name}</h1>

      <div className="flex flex-wrap gap-2 mt-6">
        {category.subcategories.map((sc) => (
          <Link key={sc.id} href={`/c/${category.slug}/${sc.slug}`} className="rounded-full border border-navy/20 px-3 py-1 text-sm hover:border-brass">
            {sc.name}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
          <p className="text-sm text-bronze">{products.length} produit{products.length > 1 ? 's' : ''}</p>
          <SortSelect />
        </div>
        <Filters />
        <ProductGrid products={products} subcategoryNameById={subcategoryNameById} />
      </div>
    </div>
  );
}
