import Link from 'next/link';
import { AdminSearchTrigger } from './admin-search-trigger';

export function AdminNav({ slug }: { slug: string }) {
  return (
    <nav className="bg-navy text-parchment px-4 py-3 flex flex-wrap gap-3 items-center justify-between sticky top-0 z-30">
      <Link href={`/${slug}`} className="font-serif text-lg">Admin</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href={`/${slug}/produits`}>Produits</Link>
        <Link href={`/${slug}/categories`}>Catégories</Link>
      </div>
      <div className="flex items-center gap-3">
        <AdminSearchTrigger adminSlug={slug} />
        <form action={`/${slug}/logout`} method="post">
          <button className="text-xs underline">Déconnexion</button>
        </form>
      </div>
    </nav>
  );
}
