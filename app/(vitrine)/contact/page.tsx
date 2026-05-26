import { business, phoneHref } from '@/lib/business';
import { MapsButtons } from '@/components/vitrine/maps-buttons';
import { Hours } from '@/components/vitrine/hours';
import { publicEnv } from '@/lib/env';

export default function ContactPage() {
  const lat = publicEnv.BUSINESS_LAT;
  const lng = publicEnv.BUSINESS_LNG;
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-4xl">Nous trouver</h1>
      <div className="grid md:grid-cols-2 gap-10 mt-8">
        <div>
          <p className="text-bronze">{business.address}</p>
          <p className="mt-2"><a href={phoneHref} className="underline">{business.phone}</a></p>
          <div className="mt-6">
            <h2 className="font-serif text-xl mb-2">Horaires</h2>
            <Hours />
          </div>
          <div className="mt-6">
            <MapsButtons />
          </div>
        </div>
        <div className="aspect-video w-full rounded-lg overflow-hidden border border-navy/10">
          <iframe
            title="Carte"
            src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
            className="w-full h-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
