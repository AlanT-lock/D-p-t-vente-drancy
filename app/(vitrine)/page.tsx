import { listCategoriesWithSubs } from '@/lib/repos/categories';
import { listRecentPublishedProducts } from '@/lib/repos/products';
import { StoreBanner } from '@/components/vitrine/store-banner';
import { Hero } from '@/components/vitrine/hero';
import { CategoryTiles } from '@/components/vitrine/category-tiles';
import { ProductGrid } from '@/components/vitrine/product-grid';

export const revalidate = 60;

export default async function HomePage() {
  const [categories, recent] = await Promise.all([
    listCategoriesWithSubs(),
    listRecentPublishedProducts(6),
  ]);
  return (
    <>
      <StoreBanner />
      <Hero />
      <CategoryTiles categories={categories} />
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="font-serif text-3xl mb-6">Récemment ajoutés</h2>
        <ProductGrid products={recent} />
      </section>
    </>
  );
}
