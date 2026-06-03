import Link from 'next/link';
import type { Role } from '@/lib/auth/accounts';
import { AdminSearchTrigger } from './admin-search-trigger';

export function AdminNav({ slug, role }: { slug: string; role: Role }) {
  return (
    <nav className="bg-navy text-parchment px-4 py-3 flex flex-wrap gap-3 items-center justify-between sticky top-0 z-30">
      <Link href={`/${slug}`} className="font-serif text-lg">Admin</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href={`/${slug}/produits`}>Produits</Link>
        <Link href={`/${slug}/categories`}>Catégories</Link>
        {role === 'admin' && <Link href={`/${slug}/etats`}>États</Link>}
        {role === 'admin' && <Link href={`/${slug}/comptes`}>Comptes</Link>}
      </div>
      <AdminSearchTrigger adminSlug={slug} />
    </nav>
  );
}
