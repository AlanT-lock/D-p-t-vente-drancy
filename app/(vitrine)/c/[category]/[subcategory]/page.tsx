import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug } from '@/lib/repos/categories';
import { listProductsBySubcategory, type ListOpts } from '@/lib/repos/products';
import { ProductGrid } from '@/components/vitrine/product-grid';
import { Filters } from '@/components/vitrine/filters';
import { SortSelect } from '@/components/vitrine/sort-select';
import { getConditions } from '@/lib/repos/conditions';

export const revalidate = 60;

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; subcategory: string }>;
  searchParams: Promise<{ sort?: string; maxPrice?: string; conditions?: string; available?: string }>;
}) {
  const { category: catSlug, subcategory: subSlug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(catSlug).catch(() => null);
  if (!category) notFound();
  const sub = category.subcategories.find((s) => s.slug === subSlug);
  if (!sub) notFound();

  const opts: ListOpts = {
    sort: sp.sort as ListOpts['sort'],
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) * 100 : undefined,
    conditions: sp.conditions?.split(',').filter(Boolean),
    availableOnly: sp.available === '1',
  };
  const products = await listProductsBySubcategory(sub.id, opts);
  const conditions = await getConditions();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-xs text-bronze mb-4">
        <Link href="/categories">Catégories</Link> <span className="mx-1">/</span>
        <Link href={`/c/${category.slug}`}>{category.name}</Link> <span className="mx-1">/</span>
        <span>{sub.name}</span>
      </nav>
      <h1 className="font-serif text-4xl">{sub.name}</h1>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
          <p className="text-sm text-bronze">{products.length} produit{products.length > 1 ? 's' : ''}</p>
          <SortSelect />
        </div>
        <Filters conditions={conditions} />
        <ProductGrid products={products} subcategoryNameById={{ [sub.id]: sub.name }} conditions={conditions} />
      </div>
    </div>
  );
}
