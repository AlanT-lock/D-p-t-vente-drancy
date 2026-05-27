import Link from 'next/link';
import Image from 'next/image';
import { Phone } from 'lucide-react';
import { business, phoneHref } from '@/lib/business';
import { SearchTrigger } from './search-trigger';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-parchment/90 backdrop-blur border-b border-navy/10">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center shrink-0" aria-label={business.name}>
          <Image
            src="/logo.png"
            alt={business.name}
            width={64}
            height={64}
            priority
            className="h-12 w-12 md:h-14 md:w-14 object-contain"
          />
        </Link>

        <div className="flex items-center gap-3 md:gap-5">
          <nav className="hidden md:flex gap-5 text-sm">
            <Link href="/categories">Catégories</Link>
            <Link href="/#avis">Avis</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <SearchTrigger />
          <a
            href={phoneHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy text-parchment px-3 py-2 text-xs font-semibold h-10"
            aria-label="Appeler la boutique"
          >
            <Phone className="size-3.5" />
            <span className="hidden sm:inline">Appeler</span>
          </a>
        </div>
      </div>
    </header>
  );
}
