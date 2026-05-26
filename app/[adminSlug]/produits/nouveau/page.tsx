import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/product-form';
import { createProduct } from '../actions';

type Cat = { id: string; name: string; subcategories: { id: string; name: string; category_id: string }[] };

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: cats } = await supabase.from('categories').select('*, subcategories(*)').order('position');
  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Nouveau produit</h1>
      <ProductForm action={createProduct} categories={(cats as unknown as Cat[]) ?? []} submitLabel="Enregistrer" />
    </div>
  );
}
