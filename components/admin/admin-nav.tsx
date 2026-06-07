import Link from 'next/link';
import type { Role } from '@/lib/auth/accounts';
import { AdminSearchTrigger } from './admin-search-trigger';
import { AdminMenu } from './admin-menu';

export function AdminNav({ slug, role }: { slug: string; role: Role }) {
  return (
    <nav className="bg-navy text-parchment px-4 py-3 flex items-center justify-between gap-3 sticky top-0 z-30">
      <Link href={`/${slug}`} className="font-serif text-lg">Admin</Link>
      <div className="flex items-center gap-3">
        <AdminMenu slug={slug} role={role} />
        <AdminSearchTrigger adminSlug={slug} />
      </div>
    </nav>
  );
}
