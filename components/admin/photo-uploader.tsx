'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, X, Star, Camera } from 'lucide-react';
import { publicEnv } from '@/lib/env';
import { addPhoto, deletePhoto } from '@/app/[adminSlug]/produits/photo-actions';
import { compressToWebpFile, dataUrlToFile } from '@/lib/image';
import { CameraCapture } from './camera-capture';

export function PhotoUploader({
  productId,
  initial,
}: {
  productId: string;
  initial: { position: number; storage_path: string }[];
}) {
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [, startTransition] = useTransition();

  const url = (p: string) =>
    `${publicEnv.SUPABASE_URL}/storage/v1/object/public/product-photos/${p}`;
  const sorted = [...initial].sort((a, b) => a.position - b.position);

  const uploadFiles = async (files: File[]) => {
    setError(null);
    for (const file of files) {
      setPending((n) => n + 1);
      try {
        const compressed = await compressToWebpFile(file);
        const fd = new FormData();
        fd.append('productId', productId);
        fd.append('photo', compressed);
        await addPhoto(fd);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload échoué');
      } finally {
        setPending((n) => n - 1);
      }
    }
  };

  const handleGalleryFiles = (files: FileList) => uploadFiles(Array.from(files));

  const handleCameraDone = async (dataUrls: string[]) => {
    setCameraOpen(false);
    if (dataUrls.length === 0) return;
    const files = await Promise.all(
      dataUrls.map((u, i) => dataUrlToFile(u, `camera-${Date.now()}-${i}.jpg`)),
    );
    await uploadFiles(files);
  };

  return (
    <div>
      {cameraOpen && (
        <CameraCapture onCapture={handleCameraDone} onClose={() => setCameraOpen(false)} />
      )}

      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-bronze">
          {sorted.length} photo{sorted.length > 1 ? 's' : ''}
          {sorted.length === 0 &&
            " — ajoute au moins une photo pour que le produit s'affiche sur le site"}
        </p>
        {pending > 0 && (
          <p className="text-xs text-bronze inline-flex items-center gap-1">
            <Loader2 className="size-3 animate-spin" /> {pending} en cours…
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setCameraOpen(true)}
            disabled={pending > 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-brass bg-parchment-light hover:bg-brass/10 px-3 py-4 text-navy font-medium transition disabled:opacity-50"
          >
            <Camera className="size-5" />
            <span className="text-sm">Appareil photo</span>
          </button>
          <label className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-brass bg-parchment-light hover:bg-brass/10 px-3 py-4 text-navy font-medium transition cursor-pointer">
            <ImagePlus className="size-5" />
            <span className="text-sm">Galerie</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleGalleryFiles(e.target.files);
                  e.target.value = '';
                }
              }}
            />
          </label>
      </div>

      {error && <p className="text-xs text-red-700 mt-2">⚠ {error}</p>}

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

    </div>
  );
}
