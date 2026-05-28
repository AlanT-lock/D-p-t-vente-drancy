'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Check, X, AlertCircle, RotateCcw } from 'lucide-react';

export function CameraCapture({
  onCapture,
  onClose,
}: {
  /** Appelé avec la liste des data URLs (JPEG 0.85) quand l'utilisateur valide. */
  onCapture: (dataUrls: string[]) => void;
  /** Appelé sans rien (annulation). */
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');

  // Démarre / redémarre le flux à chaque changement de caméra
  useEffect(() => {
    let cancelled = false;

    const stopCurrent = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };

    const start = async () => {
      stopCurrent();
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "L'accès à la caméra n'est pas disponible (HTTPS ou localhost requis).",
        );
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1920 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setError(null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/permission|denied|not allowed/i.test(msg)) {
          setError('Permission caméra refusée. Autorise l\'accès et recharge la page.');
        } else {
          setError(`Caméra indisponible : ${msg}`);
        }
      }
    };
    void start();
    return () => {
      cancelled = true;
      stopCurrent();
    };
  }, [facing]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    setBusy(true);
    try {
      const canvas = document.createElement('canvas');
      const maxSide = 1920;
      const w = video.videoWidth;
      const h = video.videoHeight;
      const scale = Math.min(1, maxSide / Math.max(w, h));
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPhotos((prev) => [...prev, dataUrl]);
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const finish = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onCapture(photos);
  };

  const cancel = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col">
      <div className="flex items-center justify-between px-3 py-3 bg-black/85 text-white">
        <button
          type="button"
          onClick={cancel}
          className="inline-flex items-center justify-center size-10 rounded-full active:bg-white/10"
          aria-label="Annuler"
        >
          <X className="size-6" />
        </button>
        <span className="text-sm font-medium">
          {photos.length} {photos.length === 1 ? 'photo prise' : 'photos prises'}
        </span>
        <button
          type="button"
          onClick={finish}
          disabled={photos.length === 0}
          className="inline-flex items-center gap-1.5 rounded-full bg-green-600 text-white px-4 h-10 text-sm font-semibold disabled:opacity-40"
        >
          <Check className="size-4" />
          Terminé
        </button>
      </div>

      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white text-center px-6 max-w-md">
            <AlertCircle className="size-12 mx-auto mb-3 text-red-400" />
            <p className="text-sm leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={cancel}
              className="mt-4 inline-block rounded-full border border-white/40 px-4 py-2 text-sm"
            >
              Fermer
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="max-h-full max-w-full"
          />
        )}
      </div>

      {photos.length > 0 && (
        <div className="bg-black/85 px-2 py-2 flex gap-1.5 overflow-x-auto">
          {photos.map((url, i) => (
            <div key={i} className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="size-16 object-cover rounded" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute -top-1 -right-1 bg-white text-black rounded-full size-5 inline-flex items-center justify-center"
                aria-label="Retirer cette photo"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!error && (
        <div className="bg-black/85 flex items-center justify-center gap-8 py-4 relative">
          {/* Bouton de switch caméra (gauche) */}
          <button
            type="button"
            onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
            className="absolute left-4 inline-flex items-center justify-center size-12 rounded-full bg-white/15 text-white active:bg-white/25"
            aria-label="Changer de caméra"
          >
            <RotateCcw className="size-5" />
          </button>

          {/* Bouton capture (centre) */}
          <button
            type="button"
            onClick={capture}
            disabled={busy}
            className="size-20 rounded-full border-4 border-white bg-white/20 active:bg-white/40 disabled:opacity-50 inline-flex items-center justify-center"
            aria-label="Prendre une photo"
          >
            <Camera className="size-9 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
