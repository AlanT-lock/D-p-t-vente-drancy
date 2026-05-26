import { phoneHref } from '@/lib/business';

export function StoreBanner() {
  return (
    <div className="bg-navy text-parchment text-center py-2 text-xs sm:text-sm">
      Boutique physique — pas de vente en ligne. <a href={phoneHref} className="underline ml-1">Appeler</a> ou venir sur place.
    </div>
  );
}
