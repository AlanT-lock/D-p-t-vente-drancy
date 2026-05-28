import imageCompression from 'browser-image-compression';

export async function compressToWebpDataUrl(file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1600,
    fileType: 'image/webp',
    useWebWorker: true,
  });
  return imageCompression.getDataUrlFromFile(compressed);
}

export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}
