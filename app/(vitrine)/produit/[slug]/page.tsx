import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, listProductsBySubcategory } from '@/lib/repos/products';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/format';
import { conditionLabel, type Condition } from '@/lib/condition';
import { ProductGallery } from '@/components/vitrine/product-gallery';
import { ProductCTA } from '@/components/vitrine/product-cta';
import { ProductGrid } from '@/components/vitrine/product-grid';

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const supabase = await createClient();
  const { data: subRaw } = await supabase
    .from('subcategories')
    .select('*, category:categories(*)')
    .eq('id', product.subcategory_id)
    .single();
  if (!subRaw) notFound();
  const sub = subRaw as unknown as {
    id: string;
    slug: string;
    name: string;
    category: { slug: string; name: string };
  };
  const cat = sub.category;

  const suggestions = await listProductsBySubcategory(sub.id);
  const others = suggestions.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-xs text-bronze mb-4">
        <Link href={`/c/${cat.slug}`}>{cat.name}</Link> <span className="mx-1">/</span>
        <Link href={`/c/${cat.slug}/${sub.slug}`}>{sub.name}</Link>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <ProductGallery photos={product.photos} name={product.name} />
        <div>
          <p className="text-xs uppercase tracking-wider text-bronze">{sub.name} · {conditionLabel(product.condition as Condition)}</p>
          <h1 className="font-serif text-4xl mt-2">{product.name}</h1>
          <p className="text-2xl font-semibold mt-3">{formatPrice(product.price_cents)}</p>
          {product.quantity === 0 ? (
            <p className="text-sm text-red-700 mt-1 font-semibold">Plus disponible</p>
          ) : product.quantity === 1 ? (
            <p className="text-sm text-brass mt-1 font-semibold">Pièce unique · 1 disponible</p>
          ) : (
            <p className="text-sm text-bronze mt-1">
              {product.quantity} exemplaires disponibles
            </p>
          )}
          {product.description && (
            <div className="mt-6 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</div>
          )}
          <ProductCTA />
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl mb-6">Dans la même catégorie</h2>
          <ProductGrid products={others} subcategoryNameById={{ [sub.id]: sub.name }} />
        </section>
      )}
    </div>
  );
}
