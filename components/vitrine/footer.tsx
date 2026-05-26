import Link from 'next/link';
import { business, phoneHref } from '@/lib/business';
import { MapsButtons } from './maps-buttons';
import { Hours } from './hours';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-navy/10 bg-parchment-light">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-serif text-lg mb-2">{business.name}</h3>
          <p className="text-sm text-bronze">{business.address}</p>
          <p className="text-sm mt-2"><a href={phoneHref}>{business.phone}</a></p>
        </div>
        <div>
          <h3 className="font-serif text-lg mb-2">Horaires</h3>
          <Hours />
        </div>
        <div>
          <h3 className="font-serif text-lg mb-2">S'y rendre</h3>
          <MapsButtons />
          <p className="mt-4 text-xs">
            <a href={business.googleBusinessUrl} target="_blank" rel="noopener" className="underline">
              Voir tous les avis sur Google
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-navy/10 py-4 text-center text-xs text-bronze">
        <Link href="/mentions-legales">Mentions légales</Link>
      </div>
    </footer>
  );
}
