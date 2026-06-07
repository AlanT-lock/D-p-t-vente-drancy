'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut } from 'lucide-react';
import type { Role } from '@/lib/auth/accounts';

export function AdminMenu({ slug, role }: { slug: string; role: Role }) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: `/${slug}/produits`, label: 'Produits' },
    { href: `/${slug}/categories`, label: 'Catégories' },
    ...(role === 'admin'
      ? [
          { href: `/${slug}/etats`, label: 'États' },
          { href: `/${slug}/comptes`, label: 'Comptes' },
        ]
      : []),
  ];

  // Fermer le menu mobile avec Échap.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const logoutForm = (className: string) => (
    <form action={`/${slug}/logout`} method="post">
      <button type="submit" className={className}>
        <LogOut className="size-4" aria-hidden="true" /> Déconnexion
      </button>
    </form>
  );

  return (
    <>
      {/* Ordinateur : liens + déconnexion dans le header */}
      <div className="hidden md:flex items-center gap-4 text-sm">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-brass">
            {l.label}
          </Link>
        ))}
        {logoutForm(
          'inline-flex items-center gap-1.5 rounded-full border border-parchment/40 px-3 py-1 hover:bg-brass/20',
        )}
      </div>

      {/* Mobile : bouton menu */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="inline-flex items-center justify-center size-9 rounded-full border border-parchment/40 text-parchment active:bg-brass/30"
        >
          {open ? (
            <X className="size-4 pointer-events-none" aria-hidden="true" />
          ) : (
            <Menu className="size-4 pointer-events-none" aria-hidden="true" />
          )}
        </button>

        {open && (
          <>
            {/* Voile pour fermer au clic extérieur */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-2 top-full mt-1 z-50 w-56 bg-navy border border-parchment/15 rounded-lg shadow-xl py-2 text-sm">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 hover:bg-brass/15"
                >
                  {l.label}
                </Link>
              ))}
              <div className="border-t border-parchment/15 my-1" />
              {logoutForm(
                'w-full text-left px-4 py-2 inline-flex items-center gap-2 hover:bg-brass/15',
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
