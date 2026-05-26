import Link from 'next/link';

export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <div className="text-xs uppercase tracking-[2px] text-bronze font-semibold">
        Brocante · Dépôt-vente · Drancy
      </div>
      <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] mt-3 max-w-3xl">
        Des trouvailles <em className="text-brass not-italic font-light italic">uniques</em><br />
        à découvrir en boutique.
      </h1>
      <p className="mt-4 max-w-xl text-bronze">
        Mobilier, décoration, vaisselle, vêtements… chaque pièce a une histoire. Venez sur place.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/categories" className="rounded-full bg-navy text-parchment px-5 py-2.5 text-sm font-semibold">
          Voir les catégories
        </Link>
        <Link href="/contact" className="rounded-full border border-navy/30 px-5 py-2.5 text-sm font-semibold">
          Nous trouver
        </Link>
      </div>
    </section>
  );
}
