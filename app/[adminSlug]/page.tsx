import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { RefreshReviewsButton } from '@/components/admin/refresh-reviews-button';

export default async function AdminHome({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;
  const supabase = await createClient();
  const [{ count: productCount }, { count: catCount }, { data: reviewsInfo }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('google_business_info').select('rating, total_reviews, fetched_at').eq('id', 1).maybeSingle(),
  ]);

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-parchment-light p-4 rounded border border-navy/10">
          <div className="text-xs text-bronze uppercase tracking-wider">Produits</div>
          <div className="text-2xl font-serif mt-1">{productCount ?? 0}</div>
        </div>
        <div className="bg-parchment-light p-4 rounded border border-navy/10">
          <div className="text-xs text-bronze uppercase tracking-wider">Catégories</div>
          <div className="text-2xl font-serif mt-1">{catCount ?? 0}</div>
        </div>
      </div>

      <Link
        href={`/${adminSlug}/produits/nouveau`}
        className="inline-block rounded-full bg-navy text-parchment px-5 py-2.5 font-semibold"
      >
        + Ajouter un produit
      </Link>

      <section className="mt-10 bg-parchment-light border border-navy/10 rounded-lg p-4">
        <h2 className="font-serif text-lg mb-1">Avis Google</h2>
        <p className="text-xs text-bronze mb-3">
          {reviewsInfo
            ? `Dernière mise à jour : ${new Date(reviewsInfo.fetched_at).toLocaleString('fr-FR')} · ${reviewsInfo.rating?.toFixed(1) ?? '–'} / 5 · ${reviewsInfo.total_reviews ?? 0} avis`
            : 'Aucun avis chargé pour le moment. Rafraîchis pour récupérer les avis Google.'}
        </p>
        <RefreshReviewsButton />
        <p className="text-[11px] text-bronze italic mt-3">
          En production, un cron quotidien (4h00) rafraîchit les avis automatiquement.
        </p>
      </section>
    </div>
  );
}
