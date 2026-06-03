import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, listProductsBySubcategory } from '@/lib/repos/products';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/format';
import { conditionLabel } from '@/lib/condition';
import { getConditions } from '@/lib/repos/conditions';
import { ProductGallery } from '@/components/vitrine/product-gallery';
import { ProductCTA } from '@/components/vitrine/product-cta';
import { ProductGrid } from '@/components/vitrine/product-grid';

export const revalidate = 60;

type SubWithCat = {
  id: string;
  slug: string;
  name: string;
  category: { slug: string; name: string };
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const supabase = await createClient();

  let sub: SubWithCat | null = null;
  if (product.subcategory_id) {
    const { data: subRaw } = await supabase
      .from('subcategories')
      .select('*, category:categories(*)')
      .eq('id', product.subcategory_id)
      .single();
    if (subRaw) sub = subRaw as unknown as SubWithCat;
  }
  const cat = sub?.category ?? null;

  const suggestions = sub ? await listProductsBySubcategory(sub.id) : [];
  const others = suggestions.filter((p) => p.id !== product.id).slice(0, 4);
  const conditions = await getConditions();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {cat && sub && (
        <nav className="text-xs text-bronze mb-4">
          <Link href={`/c/${cat.slug}`}>{cat.name}</Link> <span className="mx-1">/</span>
          <Link href={`/c/${cat.slug}/${sub.slug}`}>{sub.name}</Link>
        </nav>
      )}

      <div className="grid md:grid-cols-2 gap-10">
        <ProductGallery photos={product.photos} name={product.name} />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-bronze">
            {sub ? `${sub.name} · ` : ''}
            {conditionLabel(product.condition, conditions)}
          </p>
          <h1 className="font-serif text-4xl mt-2 break-words">{product.name}</h1>
          <p className="text-2xl font-semibold mt-3">{formatPrice(product.price_cents)}</p>
          {product.quantity === 0 ? (
            <p className="text-sm text-red-700 mt-1 font-semibold">Plus disponible</p>
          ) : product.quantity === 1 ? (
            <p className="text-sm text-brass mt-1 font-semibold">Pièce unique · 1 disponible</p>
          ) : (
            <p className="text-sm text-bronze mt-1">{product.quantity} exemplaires disponibles</p>
          )}
          {product.description && (
            <div className="mt-6 text-sm leading-relaxed whitespace-pre-wrap break-words">
              {product.description}
            </div>
          )}
          <ProductCTA />
        </div>
      </div>

      {sub && others.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl mb-6">Dans la même catégorie</h2>
          <ProductGrid products={others} subcategoryNameById={{ [sub.id]: sub.name }} conditions={conditions} />
        </section>
      )}
    </div>
  );
}
