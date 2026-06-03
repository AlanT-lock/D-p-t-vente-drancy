import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/product-form';
import { PhotoUploader } from '@/components/admin/photo-uploader';
import { updateProduct, deleteProduct } from '../actions';
import { getConditions } from '@/lib/repos/conditions';

type Cat = { id: string; name: string; subcategories: { id: string; name: string; category_id: string }[] };
type Photo = { id: string; position: number; storage_path: string };
type ProductWithPhotos = {
  id: string;
  name: string;
  price_cents: number;
  quantity: number;
  condition: string;
  description: string | null;
  subcategory_id: string;
  is_published: boolean;
  photos: Photo[];
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: productRaw }, { data: cats }] = await Promise.all([
    supabase.from('products').select('*, photos:product_photos(*)').eq('id', id).single(),
    supabase.from('categories').select('*, subcategories(*)').order('position'),
  ]);
  if (!productRaw) notFound();
  const product = productRaw as unknown as ProductWithPhotos;
  const photos = product.photos ?? [];
  const conditions = await getConditions();
  const update = updateProduct.bind(null, id);
  const del = deleteProduct.bind(null, id);
  const noPhotos = photos.length === 0;

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Modifier · {product.name}</h1>

      <section className="mb-8 bg-parchment-light border border-navy/10 rounded-lg p-4">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-serif text-xl">Photos du produit</h2>
          {noPhotos && (
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
              À ajouter
            </span>
          )}
        </div>
        <PhotoUploader productId={id} initial={photos} />
      </section>

      <section className="mb-6">
        <h2 className="font-serif text-xl mb-3">Informations</h2>
        <ProductForm
          action={update}
          categories={(cats as unknown as Cat[]) ?? []}
          conditions={conditions}
          submitLabel="Mettre à jour"
          defaults={{
            name: product.name,
            price: (product.price_cents / 100).toFixed(2),
            quantity: product.quantity,
            condition: product.condition,
            description: product.description ?? '',
            subcategory_id: product.subcategory_id,
            is_published: product.is_published,
          }}
        />
      </section>

      <form action={del} className="fixed bottom-20 inset-x-0 px-4">
        <button className="w-full rounded-full bg-red-700 text-parchment py-2 text-sm font-semibold">
          Supprimer ce produit
        </button>
      </form>
    </div>
  );
}
