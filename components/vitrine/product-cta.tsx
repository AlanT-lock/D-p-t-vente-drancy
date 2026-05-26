import { Phone, MapPin, Mail } from 'lucide-react';
import { business, phoneHref, mapsUrls } from '@/lib/business';

export function ProductCTA() {
  return (
    <div className="bg-parchment-light border border-brass/40 rounded-lg p-5 mt-6">
      <p className="font-serif text-lg">Cet article vous intéresse ?</p>
      <p className="text-sm text-bronze mt-1">Réservation possible par téléphone.</p>
      <div className="flex flex-wrap gap-2 mt-4">
        <a href={phoneHref} className="inline-flex items-center gap-2 rounded-full bg-navy text-parchment px-4 py-2 text-sm font-semibold">
          <Phone className="size-4" /> Appeler la boutique
        </a>
        <a href={mapsUrls.google()} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-navy/30 px-4 py-2 text-sm font-semibold">
          <MapPin className="size-4" /> Venir voir l'article
        </a>
        <a href={`mailto:?subject=Article sur ${business.name}`} className="inline-flex items-center gap-2 rounded-full border border-navy/30 px-4 py-2 text-sm font-semibold">
          <Mail className="size-4" /> Demander des infos
        </a>
      </div>
    </div>
  );
}
