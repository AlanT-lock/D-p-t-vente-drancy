'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { ImagePlus, Loader2, X, Star } from 'lucide-react';
import { publicEnv } from '@/lib/env';
import { addPhoto, deletePhoto } from '@/app/[adminSlug]/produits/photo-actions';

export function PhotoUploader({
  productId,
  initial,
}: {
  productId: string;
  initial: { position: number; storage_path: string }[];
}) {
  const [pending, setPending] = useState(0); // nombre de photos en cours d'upload
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const url = (p: string) =>
    `${publicEnv.SUPABASE_URL}/storage/v1/object/public/product-photos/${p}`;
  const sorted = [...initial].sort((a, b) => a.position - b.position);
  const remainingSlots = Math.max(0, 5 - sorted.length);

  const handleFiles = async (files: FileList) => {
    setError(null);
    const list = Array.from(files).slice(0, remainingSlots);
    if (list.length === 0) return;

    for (const file of list) {
      setPending((n) => n + 1);
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1600,
          fileType: 'image/webp',
          useWebWorker: true,
        });
        const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
        await addPhoto(productId, dataUrl);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload échoué');
      } finally {
        setPending((n) => n - 1);
      }
    }
  };

  return (
    <div>
      {/* Compteur + état */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-bronze">
          {sorted.length} / 5 photo{sorted.length > 1 ? 's' : ''}
          {sorted.length === 0 && ' — ajoute au moins une photo pour que le produit s\'affiche sur le site'}
        </p>
        {pending > 0 && (
          <p className="text-xs text-bronze inline-flex items-center gap-1">
            <Loader2 className="size-3 animate-spin" /> {pending} en cours…
          </p>
        )}
      </div>

      {/* Bouton principal d'ajout */}
      {remainingSlots > 0 && (
        <label className="flex items-center justify-center gap-2 w-full cursor-pointer rounded-lg border-2 border-dashed border-brass bg-parchment-light hover:bg-brass/10 px-4 py-6 text-navy font-medium transition">
          <ImagePlus className="size-5" />
          <span>
            {sorted.length === 0
              ? 'Ajouter des photos (jusqu\'à 5)'
              : `Ajouter ${remainingSlots === 1 ? 'une photo' : `${remainingSlots} photos de plus`}`}
          </span>
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

      {error && (
        <p className="text-xs text-red-700 mt-2">⚠ {error}</p>
      )}

      {/* Grille des photos existantes */}
      {sorted.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
          {sorted.map((p) => (
            <div
              key={p.position}
              className="relative aspect-square bg-parchment-light rounded overflow-hidden border border-navy/10 group"
            >
              <Image
                src={url(p.storage_path)}
                alt=""
                fill
                className="object-cover"
                sizes="120px"
              />
              {p.position === 0 && (
                <span className="absolute bottom-1 left-1 bg-brass text-navy text-[9px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                  <Star className="size-2.5 fill-navy" /> Principale
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!confirm('Supprimer cette photo ?')) return;
                  startTransition(async () => {
                    await deletePhoto(productId, p.position);
                  });
                }}
                className="absolute top-1 right-1 bg-navy/85 text-parchment rounded-full size-6 inline-flex items-center justify-center hover:bg-red-700"
                aria-label="Supprimer cette photo"
                title="Supprimer"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {sorted.length === 5 && (
        <p className="text-xs text-bronze italic mt-2">
          Limite de 5 photos atteinte. Supprime-en une pour en ajouter d'autres.
        </p>
      )}
    </div>
  );
}
