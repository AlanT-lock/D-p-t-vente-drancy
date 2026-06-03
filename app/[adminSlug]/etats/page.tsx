import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/role';
import { createCondition, deleteCondition } from './actions';

export const dynamic = 'force-dynamic';

type CondRow = { id: string; slug: string; label: string; position: number };

const ERRORS: Record<string, string> = {
  suppression: 'La suppression a échoué. Veuillez réessayer.',
  creation: "La création de l'état a échoué.",
  slug: "Ce libellé ne produit pas d'identifiant valide. Essayez un autre nom.",
  forbidden: 'Action réservée aux administrateurs.',
};

export default async function EtatsPage({
  params,
  searchParams,
}: {
  params: Promise<{ adminSlug: string }>;
  searchParams: Promise<{ error?: string; n?: string }>;
}) {
  const { adminSlug } = await params;
  const member = await requireAdmin();
  if (!member) redirect(`/${adminSlug}`);

  const { error, n } = await searchParams;
  const supabase = await createClient();

  const [{ data: condData }, { data: prodConds }] = await Promise.all([
    supabase.from('product_conditions').select('id, slug, label, position').order('position'),
    supabase.from('products').select('condition'),
  ]);
  const conditions = (condData ?? []) as CondRow[];

  // Nombre de produits par état (pour avertir avant suppression).
  const counts = new Map<string, number>();
  for (const p of (prodConds ?? []) as { condition: string }[]) {
    counts.set(p.condition, (counts.get(p.condition) ?? 0) + 1);
  }

  const errorMessage =
    error === 'produits'
      ? `Impossible de supprimer : ${n ?? 'des'} produit(s) utilisent encore cet état. Réassignez-les à un autre état avant de le supprimer.`
      : error
        ? (ERRORS[error] ?? 'Une erreur est survenue.')
        : null;

  return (
    <div>
      <h1 className="font-serif text-3xl mb-2">États des produits</h1>
      <p className="text-sm text-bronze mb-6">
        Les états proposés lors de la création d&apos;un produit et dans les filtres du site.
      </p>

      {errorMessage && (
        <p className="mb-4 rounded border border-red-700/40 bg-red-700/10 px-3 py-2 text-sm text-red-800">
          {errorMessage}
        </p>
      )}

      <form action={createCondition} className="flex gap-2 mb-6">
        <input
          name="label"
          required
          placeholder="Nouvel état (ex : Comme neuf)"
          className="flex-1 rounded border border-navy/20 px-3 py-2"
        />
        <button className="rounded bg-navy text-parchment px-4 py-2 text-sm font-semibold">
          Ajouter
        </button>
      </form>

      {conditions.length === 0 ? (
        <p className="text-sm text-bronze italic py-4">Aucun état pour le moment.</p>
      ) : (
        <ul className="space-y-2">
          {conditions.map((c) => {
            const used = counts.get(c.slug) ?? 0;
            return (
              <li
                key={c.id}
                className="bg-parchment-light border border-navy/10 rounded p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-serif">{c.label}</div>
                  <div className="text-xs text-bronze">
                    {used > 0 ? `${used} produit${used > 1 ? 's' : ''}` : 'Aucun produit'}
                  </div>
                </div>
                <form action={deleteCondition}>
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    type="submit"
                    className="text-xs rounded border border-red-700/40 text-red-700 px-3 py-1.5 font-medium whitespace-nowrap hover:bg-red-700/10"
                    aria-label={`Supprimer ${c.label}`}
                  >
                    Supprimer
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
