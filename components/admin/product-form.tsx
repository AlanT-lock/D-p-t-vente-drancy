'use client';
import { useState } from 'react';
import { DEFAULT_CONDITIONS, type ConditionOption } from '@/lib/condition';
import { AutoGrowTextarea } from './auto-grow-textarea';

type Sub = { id: string; name: string; category_id: string };
type Cat = { id: string; name: string; subcategories: Sub[] };

export function ProductForm({
  action,
  categories,
  conditions = DEFAULT_CONDITIONS,
  defaults,
  submitLabel,
}: {
  action: (fd: FormData) => void | Promise<void>;
  categories: Cat[];
  conditions?: ConditionOption[];
  defaults?: {
    name?: string;
    price?: string;
    original_price?: string;
    quantity?: number;
    condition?: string;
    description?: string;
    subcategory_id?: string;
    is_published?: boolean;
  };
  submitLabel: string;
}) {
  const initialCat = defaults?.subcategory_id
    ? categories.find((c) => c.subcategories.some((s) => s.id === defaults.subcategory_id))?.id
    : categories[0]?.id;
  const [categoryId, setCategoryId] = useState(initialCat ?? '');
  const subs = categories.find((c) => c.id === categoryId)?.subcategories ?? [];

  return (
    <form action={action} className="space-y-4 pb-24">
      <Field label="Nom du produit">
        <input name="name" required defaultValue={defaults?.name} className="w-full rounded border border-navy/20 px-3 py-2" />
      </Field>

      <Field label="Catégorie">
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded border border-navy/20 px-3 py-2">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>

      <Field label="Sous-catégorie (optionnel)">
        <select name="subcategory_id" defaultValue={defaults?.subcategory_id ?? 'none'} className="w-full rounded border border-navy/20 px-3 py-2">
          <option value="none">— Aucune —</option>
          {subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Prix dépôt-vente (€)">
          <input name="price" required defaultValue={defaults?.price} inputMode="decimal" className="w-full rounded border border-navy/20 px-3 py-2" />
        </Field>
        <Field label="Prix neuf (€, optionnel)">
          <input name="original_price" defaultValue={defaults?.original_price} inputMode="decimal" placeholder="—" className="w-full rounded border border-navy/20 px-3 py-2" />
        </Field>
        <Field label="Quantité">
          <input name="quantity" type="number" min={0} required defaultValue={defaults?.quantity ?? 1} className="w-full rounded border border-navy/20 px-3 py-2" />
        </Field>
      </div>

      <Field label="État">
        <select name="condition" required defaultValue={defaults?.condition ?? conditions[0]?.slug} className="w-full rounded border border-navy/20 px-3 py-2">
          {conditions.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
        </select>
      </Field>

      <Field label="Description">
        <AutoGrowTextarea name="description" defaultValue={defaults?.description} rows={5} className="w-full rounded border border-navy/20 px-3 py-2" />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_published" defaultChecked={defaults?.is_published ?? true} /> Publié
      </label>

      <div className="fixed bottom-0 inset-x-0 bg-parchment border-t border-navy/10 px-4 py-3">
        <button className="w-full rounded-full bg-green-700 text-parchment py-3 font-semibold">{submitLabel}</button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-bronze">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
