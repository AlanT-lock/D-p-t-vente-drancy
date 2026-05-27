'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { CONDITIONS } from '@/lib/condition';

type Sub = { id: string; name: string; category_id: string };
type Cat = { id: string; name: string; subcategories: Sub[] };
type PendingPhoto = { id: string; dataUrl: string };

const MAX_PHOTOS = 5;

export function NewProductForm({
  categories,
  adminSlug,
  createAction,
  addPhotoAction,
}: {
  categories: Cat[];
  adminSlug: string;
  createAction: (formData: FormData) => Promise<{ id: string } | { error: string }>;
  addPhotoAction: (productId: string, dataUrl: string) => Promise<void>;
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();

  const subs = categories.find((c) => c.id === categoryId)?.subcategories ?? [];
  const remaining = MAX_PHOTOS - photos.length;

  const handleFiles = async (files: FileList) => {
    setError(null);
    setCompressing(true);
    try {
      const list = Array.from(files).slice(0, remaining);
      for (const file of list) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1600,
          fileType: 'image/webp',
          useWebWorker: true,
        });
        const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
        setPhotos((prev) => [...prev, { id: crypto.randomUUID(), dataUrl }]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Compression échouée');
    } finally {
      setCompressing(false);
    }
  };

  const removePhoto = (id: string) => setPhotos((prev) => prev.filter((p) => p.id !== id));

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      setError(null);
      const result = await createAction(formData);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      // Upload séquentiel des photos contre le nouveau product id
      for (const photo of photos) {
        try {
          await addPhotoAction(result.id, photo.dataUrl);
        } catch (e) {
          console.error('Upload photo échoué', e);
        }
      }
      router.push(`/${adminSlug}/produits/${result.id}`);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4 pb-24">
      {/* Photos section */}
      <section className="bg-parchment-light border border-navy/10 rounded-lg p-4">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-serif text-xl">Photos du produit</h2>
          <span className="text-xs text-bronze">{photos.length} / {MAX_PHOTOS}</span>
        </div>

        {photos.length < MAX_PHOTOS && (
          <label className="flex items-center justify-center gap-2 w-full cursor-pointer rounded-lg border-2 border-dashed border-brass bg-parchment hover:bg-brass/10 px-4 py-5 text-navy font-medium transition">
            {compressing ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Préparation…</span>
              </>
            ) : (
              <>
                <ImagePlus className="size-5" />
                <span>
                  {photos.length === 0
                    ? `Ajouter des photos (jusqu'à ${MAX_PHOTOS})`
                    : `Ajouter ${remaining === 1 ? 'une photo' : `${remaining} photos de plus`}`}
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleFiles(e.target.files);
                  e.target.value = '';
                }
              }}
            />
          </label>
        )}

        {photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
            {photos.map((p, i) => (
              <div
                key={p.id}
                className="relative aspect-square rounded overflow-hidden border border-navy/10 bg-parchment"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.dataUrl} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-brass text-navy text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Principale
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(p.id)}
                  className="absolute top-1 right-1 bg-navy/85 text-parchment rounded-full size-6 inline-flex items-center justify-center hover:bg-red-700"
                  aria-label="Retirer cette photo"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-[11px] text-bronze italic mt-2">
          La première photo sera l&apos;image principale du produit.
        </p>
      </section>

      {/* Form fields */}
      <Field label="Nom du produit">
        <input
          name="name"
          required
          className="w-full rounded border border-navy/20 px-3 py-2"
        />
      </Field>

      <Field label="Catégorie">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded border border-navy/20 px-3 py-2"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Sous-catégorie">
        <select
          name="subcategory_id"
          required
          className="w-full rounded border border-navy/20 px-3 py-2"
        >
          {subs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Prix (€)">
          <input
            name="price"
            required
            inputMode="decimal"
            className="w-full rounded border border-navy/20 px-3 py-2"
          />
        </Field>
        <Field label="Quantité">
          <input
            name="quantity"
            type="number"
            min={0}
            required
            defaultValue={1}
            className="w-full rounded border border-navy/20 px-3 py-2"
          />
        </Field>
      </div>

      <Field label="État">
        <select
          name="condition"
          required
          defaultValue="bon_etat"
          className="w-full rounded border border-navy/20 px-3 py-2"
        >
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Description">
        <textarea
          name="description"
          rows={5}
          className="w-full rounded border border-navy/20 px-3 py-2"
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_published" defaultChecked /> Publié
      </label>

      {error && <p className="text-sm text-red-700">⚠ {error}</p>}

      <div className="fixed bottom-0 inset-x-0 bg-parchment border-t border-navy/10 px-4 py-3">
        <button
          disabled={saving || compressing}
          className="w-full rounded-full bg-green-700 text-parchment py-3 font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {photos.length > 0
                ? `Création + ${photos.length} photo${photos.length > 1 ? 's' : ''}…`
                : 'Création…'}
            </>
          ) : (
            'Enregistrer'
          )}
        </button>
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
