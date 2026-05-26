import { mapsUrls } from '@/lib/business';

export function MapsButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <a href={mapsUrls.google()} target="_blank" rel="noopener" className="rounded-full bg-navy text-parchment px-4 py-2 text-sm font-medium">📍 Google Maps</a>
      <a href={mapsUrls.apple()} target="_blank" rel="noopener" className="rounded-full bg-navy text-parchment px-4 py-2 text-sm font-medium">🍎 Apple Maps</a>
      <a href={mapsUrls.waze()} target="_blank" rel="noopener" className="rounded-full bg-navy text-parchment px-4 py-2 text-sm font-medium">🚗 Waze</a>
    </div>
  );
}
