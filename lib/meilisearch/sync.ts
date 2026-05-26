import { adminClient } from './client';
import { INDEX_NAME } from './schema';
import { toIndexedProduct } from './index-document';
import { createAdminClient } from '@/lib/supabase/admin';

type ProductWithRels = {
  id: string; slug: string; name: string; description: string | null;
  price_cents: number; quantity: number;
  condition: 'neuf' | 'tres_bon_etat' | 'bon_etat' | 'etat_usage';
  is_published: boolean; created_at: string; updated_at: string;
  subcategory_id: string;
  photos: { storage_path: string; position: number }[];
  subcategory: {
    id: string; slug: string; name: string; position: number; category_id: string;
    category: { id: string; slug: string; name: string };
  };
};

export async function syncProductById(productId: string): Promise<void> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('products')
    .select('*, photos:product_photos(*), subcategory:subcategories(*, category:categories(*))')
    .eq('id', productId)
    .single();
  if (!data) {
    await adminClient().index(INDEX_NAME).deleteDocument(productId);
    return;
  }
  const product = data as unknown as ProductWithRels;
  const main = [...product.photos].sort((a, b) => a.position - b.position)[0];
  const doc = toIndexedProduct(product, {
    categorySlug: product.subcategory.category.slug,
    categoryName: product.subcategory.category.name,
    subcategorySlug: product.subcategory.slug,
    subcategoryName: product.subcategory.name,
    mainStoragePath: main?.storage_path ?? null,
  });
  await adminClient().index(INDEX_NAME).addDocuments([doc]);
}

export async function deleteProductFromIndex(productId: string): Promise<void> {
  await adminClient().index(INDEX_NAME).deleteDocument(productId);
}

export async function fullReindex(): Promise<number> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('products')
    .select('*, photos:product_photos(*), subcategory:subcategories(*, category:categories(*))');
  const rows = (data ?? []) as unknown as ProductWithRels[];
  const docs = rows.map((p) => {
    const main = [...p.photos].sort((a, b) => a.position - b.position)[0];
    return toIndexedProduct(p, {
      categorySlug: p.subcategory.category.slug,
      categoryName: p.subcategory.category.name,
      subcategorySlug: p.subcategory.slug,
      subcategoryName: p.subcategory.name,
      mainStoragePath: main?.storage_path ?? null,
    });
  });
  await adminClient().index(INDEX_NAME).deleteAllDocuments();
  await adminClient().index(INDEX_NAME).addDocuments(docs);
  return docs.length;
}
