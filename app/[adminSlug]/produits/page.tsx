import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ProductRow } from '@/components/admin/product-row';
import { deleteProductFromList, setProductQuantity } from './actions';
import type { Condition } from '@/lib/condition';

type Row = {
  id: string;
  name: string;
  price_cents: number;
  quantity: number;
  condition: Condition;
  is_published: boolean;
  created_at: string;
  photos: { storage_path: string; position: number }[];
};

export default async function ProductsAdmin({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('id, name, price_cents, quantity, condition, is_published, created_at, photos:product_photos(storage_path, position)')
    .order('created_at', { ascending: false });
  const products = (data ?? []) as unknown as Row[];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
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
        <ul className="space-y-2">
          {products.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              adminSlug={adminSlug}
              setQuantity={setProductQuantity.bind(null, p.id)}
              deleteAction={deleteProductFromList.bind(null, p.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
