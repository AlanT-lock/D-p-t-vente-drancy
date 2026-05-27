'use client';

import { useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Check } from 'lucide-react';
import { publicEnv } from '@/lib/env';
import { formatPrice } from '@/lib/format';
import { conditionLabel, type Condition } from '@/lib/condition';

type Photo = { storage_path: string; position: number };
type Product = {
  id: string;
  name: string;
  price_cents: number;
  quantity: number;
  condition: Condition;
  is_published: boolean;
  photos: Photo[];
};

export function ProductRow({
  product,
  adminSlug,
  setQuantity,
  deleteAction,
}: {
  product: Product;
  adminSlug: string;
  setQuantity: (formData: FormData) => Promise<void>;
  deleteAction: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const main = [...product.photos].sort((a, b) => a.position - b.position)[0];
  const url = main
    ? `${publicEnv.SUPABASE_URL}/storage/v1/object/public/product-photos/${main.storage_path}`
    : null;

  return (
    <li className="bg-parchment-light border border-navy/10 rounded p-3 flex items-center gap-3">
      <Link
        href={`/${adminSlug}/produits/${product.id}`}
        className="relative w-14 h-14 rounded overflow-hidden bg-bronze/10 flex-shrink-0"
      >
        {url && <Image src={url} alt="" fill className="object-cover" sizes="56px" />}
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/${adminSlug}/produits/${product.id}`} className="font-serif truncate block">
          {product.name}{' '}
          {!product.is_published && <span className="text-xs text-bronze">(masqué)</span>}
        </Link>
        <div className="text-xs text-bronze truncate">
          {formatPrice(product.price_cents)} · {conditionLabel(product.condition)}
        </div>
      </div>

      <form action={setQuantity} className="flex items-center gap-1">
        <label className="text-[10px] uppercase tracking-wider text-bronze font-semibold mr-1">
          Qté
        </label>
        <input
          name="quantity"
          type="number"
          min={0}
          defaultValue={product.quantity}
          className="w-14 rounded border border-navy/20 px-2 py-1.5 text-sm text-center"
          aria-label="Quantité"
        />
        <button
          type="submit"
          className="rounded bg-navy text-parchment p-1.5 hover:opacity-90"
          aria-label="Enregistrer la quantité"
          title="Enregistrer"
        >
          <Check className="size-3.5" />
        </button>
      </form>

      <form
        action={() => {
          startTransition(async () => {
            await deleteAction();
          });
        }}
        onSubmit={(e) => {
          if (!confirm(`Supprimer définitivement « ${product.name} » ?`)) {
            e.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-red-700/40 text-red-700 p-1.5 hover:bg-red-700/10 disabled:opacity-50"
          aria-label="Supprimer"
          title="Supprimer"
        >
          <Trash2 className="size-3.5" />
        </button>
      </form>
    </li>
  );
}
