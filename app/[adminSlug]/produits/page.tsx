import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ProductRow } from '@/components/admin/product-row';
import { deleteProductFromListForm, setProductQuantity } from './actions';
import { getConditions } from '@/lib/repos/conditions';

type Row = {
  id: string;
  name: string;
  price_cents: number;
  quantity: number;
  condition: string;
  is_published: boolean;
  created_at: string;
  subcategory_id: string | null;
  photos: { storage_path: string; position: number }[];
};
type Sub = { id: string; name: string; category_id: string; position: number };
type Cat = { id: string; name: string; position: number; subcategories: Sub[] };

export default async function ProductsAdmin({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;
  const supabase = await createClient();
  const [{ data: productsData }, { data: catsData }] = await Promise.all([
    supabase
      .from('products')
      .select(
        'id, name, price_cents, quantity, condition, is_published, created_at, subcategory_id, photos:product_photos(storage_path, position)',
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('id, name, position, subcategories(id, name, category_id, position)')
      .order('position'),
  ]);

  const products = (productsData ?? []) as unknown as Row[];
  const categories = (catsData ?? []) as unknown as Cat[];
  const conditions = await getConditions();

  const subToCat = new Map<string, string>();
  categories.forEach((c) => (c.subcategories ?? []).forEach((s) => subToCat.set(s.id, c.id)));

  const grouped = new Map<string, Row[]>();
  const orphans: Row[] = [];
  for (const p of products) {
    const catId = p.subcategory_id ? subToCat.get(p.subcategory_id) : undefined;
    if (catId) {
      const list = grouped.get(catId) ?? [];
      list.push(p);
      grouped.set(catId, list);
    } else {
      orphans.push(p);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
        <h1 className="font-serif text-3xl">Produits</h1>
        <Link
          href={`/${adminSlug}/produits/nouveau`}
          className="rounded-full bg-navy text-parchment px-4 py-2 text-sm font-semibold"
        >
          + Ajouter
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-bronze italic py-6">
          Aucun produit pour le moment. Clique « + Ajouter » pour créer le premier.
        </p>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => {
            const list = grouped.get(cat.id) ?? [];
            if (list.length === 0) return null;
            return (
              <details
                key={cat.id}
                open
                className="bg-parchment-light/50 border border-navy/10 rounded-lg overflow-hidden"
              >
                <summary className="cursor-pointer select-none px-4 py-3 flex items-center justify-between bg-parchment-light hover:bg-brass/10 transition">
                  <span className="font-serif text-lg">{cat.name}</span>
                  <span className="text-xs text-bronze">
                    {list.length} produit{list.length > 1 ? 's' : ''}
                  </span>
                </summary>
                <ul className="p-3 space-y-2">
                  {list.map((p) => (
                    <ProductRow
                      key={p.id}
                      product={p}
                      adminSlug={adminSlug}
                      setQuantity={setProductQuantity.bind(null, p.id)}
                      deleteAction={deleteProductFromListForm}
                      conditions={conditions}
                    />
                  ))}
                </ul>
              </details>
            );
          })}

          {orphans.length > 0 && (
            <details
              open
              className="bg-parchment-light/50 border border-navy/30 rounded-lg overflow-hidden"
            >
              <summary className="cursor-pointer select-none px-4 py-3 flex items-center justify-between bg-parchment-light">
                <span className="font-serif text-lg">Sans catégorie</span>
                <span className="text-xs text-bronze">
                  {orphans.length} produit{orphans.length > 1 ? 's' : ''}
                </span>
              </summary>
              <ul className="p-3 space-y-2">
                {orphans.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    adminSlug={adminSlug}
                    setQuantity={setProductQuantity.bind(null, p.id)}
                    deleteAction={deleteProductFromListForm}
                  />
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
