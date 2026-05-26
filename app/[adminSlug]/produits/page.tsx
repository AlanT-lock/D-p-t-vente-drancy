import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/format';
import { conditionLabel, type Condition } from '@/lib/condition';

export default async function ProductsAdmin({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price_cents, quantity, condition, is_published, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl">Produits</h1>
        <Link href={`/${adminSlug}/produits/nouveau`} className="rounded-full bg-navy text-parchment px-4 py-2 text-sm font-semibold">+ Ajouter</Link>
      </div>
      <ul className="space-y-2">
        {products?.map((p) => (
          <li key={p.id}>
            <Link href={`/${adminSlug}/produits/${p.id}`} className="flex items-center gap-3 bg-parchment-light border border-navy/10 rounded p-3">
              <div className="flex-1">
                <div className="font-serif">{p.name} {!p.is_published && <span className="text-xs text-bronze">(masqué)</span>}</div>
                <div className="text-xs text-bronze">{formatPrice(p.price_cents)} · qté {p.quantity} · {conditionLabel(p.condition as Condition)}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
