import imageCompression from 'browser-image-compression';

/**
 * Compresse une image en webp ≤ 0.5 MB / 1600 px côté long.
 * Renvoie le File compressé (pas un dataURL, pour éviter l'inflation base64
 * lors des uploads via Server Actions).
 */
export async function compressToWebpFile(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1600,
    fileType: 'image/webp',
    useWebWorker: true,
  });
  // imageCompression peut renvoyer un Blob ; on garantit un File pour avoir un nom
  if (compressed instanceof File) return compressed;
  return new File([compressed], 'photo.webp', { type: 'image/webp' });
}

/** dataURL → File (utilisé pour les captures caméra qui produisent un dataURL). */
export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

/** File → dataURL (pour afficher une preview locale). */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
