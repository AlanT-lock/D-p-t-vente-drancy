'use client';
import { useState, useTransition } from 'react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { publicEnv } from '@/lib/env';
import { addPhoto, deletePhoto } from '@/app/[adminSlug]/produits/photo-actions';

export function PhotoUploader({
  productId,
  initial,
}: {
  productId: string;
  initial: { position: number; storage_path: string }[];
}) {
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();
  const url = (p: string) => `${publicEnv.SUPABASE_URL}/storage/v1/object/public/product-photos/${p}`;
  const sorted = [...initial].sort((a, b) => a.position - b.position);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1600,
        fileType: 'image/webp',
        useWebWorker: true,
      });
      const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
      await addPhoto(productId, dataUrl);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
        {sorted.map((p) => (
          <div key={p.position} className="relative aspect-square bg-parchment-light rounded overflow-hidden border border-navy/10">
            <Image src={url(p.storage_path)} alt="" fill className="object-cover" sizes="120px" />
            <form
              action={() => {
                startTransition(async () => {
                  await deletePhoto(productId, p.position);
                });
              }}
              className="absolute top-1 right-1"
            >
              <button type="submit" className="text-xs bg-navy/80 text-parchment rounded px-1.5 py-0.5">✕</button>
            </form>
            {p.position === 0 && (
              <span className="absolute bottom-1 left-1 bg-brass text-navy text-[9px] font-bold px-1.5 py-0.5 rounded">Principale</span>
            )}
          </div>
        ))}
        {sorted.length < 5 && (
          <label className="aspect-square flex items-center justify-center border-2 border-dashed border-navy/30 rounded cursor-pointer text-bronze">
            {busy ? '…' : '+'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        )}
      </div>
    </div>
  );
}
