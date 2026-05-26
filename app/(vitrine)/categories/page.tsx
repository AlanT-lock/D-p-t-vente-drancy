import { listCategoriesWithSubs } from '@/lib/repos/categories';
import { CategoryTiles } from '@/components/vitrine/category-tiles';

export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await listCategoriesWithSubs();
  return <CategoryTiles categories={categories} />;
}
