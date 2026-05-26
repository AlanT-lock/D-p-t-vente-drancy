import Link from 'next/link';
import { Phone } from 'lucide-react';
import { business, phoneHref } from '@/lib/business';
import { SearchTrigger } from './search-trigger';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-parchment/90 backdrop-blur border-b border-navy/10">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
        <Link href="/" className="font-serif text-xl font-semibold whitespace-nowrap">
          {business.name.split(' ').slice(0, 2).join(' ')} <span className="text-brass italic">de</span> Drancy
        </Link>
        <div className="flex-1"><SearchTrigger /></div>
        <nav className="hidden md:flex gap-5 text-sm">
          <Link href="/categories">Catégories</Link>
          <Link href="/#avis">Avis</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <a href={phoneHref} className="inline-flex items-center gap-1.5 rounded-full bg-navy text-parchment px-3 py-1.5 text-xs font-semibold" aria-label="Appeler la boutique">
          <Phone className="size-3.5" />
          <span className="hidden sm:inline">Appeler</span>
        </a>
      </div>
    </header>
  );
}
