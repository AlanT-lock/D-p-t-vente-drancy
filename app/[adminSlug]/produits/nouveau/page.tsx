import { createClient } from '@/lib/supabase/server';
import { NewProductForm } from '@/components/admin/new-product-form';
import { createProductReturningId } from '../actions';
import { addPhoto } from '../photo-actions';
import { getConditions } from '@/lib/repos/conditions';

type Cat = {
  id: string;
  name: string;
  subcategories: { id: string; name: string; category_id: string }[];
};

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ adminSlug: string }>;
}) {
  const { adminSlug } = await params;
  const supabase = await createClient();
  const { data: cats } = await supabase
    .from('categories')
    .select('*, subcategories(*)')
    .order('position');
  const conditions = await getConditions();

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Nouveau produit</h1>
      <NewProductForm
        categories={(cats as unknown as Cat[]) ?? []}
        adminSlug={adminSlug}
        conditions={conditions}
        createAction={createProductReturningId}
        addPhotoAction={addPhoto}
      />
    </div>
  );
}
