import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { business } from '@/lib/business';

type Review = {
  id: string;
  author_name: string | null;
  rating: number | null;
  text: string | null;
  relative_time: string | null;
  profile_photo: string | null;
};

export async function GoogleReviews() {
  const supabase = await createClient();
  const [{ data: info }, { data: reviews }] = await Promise.all([
    supabase.from('google_business_info').select('*').eq('id', 1).maybeSingle(),
    supabase.from('google_reviews_cache').select('*').order('fetched_at', { ascending: false }).limit(5),
  ]);
  const list = (reviews ?? []) as Review[];
  if (!info && list.length === 0) return null;

  return (
    <section id="avis" className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-baseline justify-between mb-6 gap-4 flex-wrap">
        <h2 className="font-serif text-3xl">Avis clients</h2>
        {info && (
          <div className="text-sm">
            <span className="font-bold text-lg">{info.rating?.toFixed(1)}</span>
            <span className="text-bronze"> / 5 · {info.total_reviews} avis Google</span>
          </div>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 pl-1 pr-4 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {list.map((r) => (
          <article
            key={r.id}
            className="snap-start shrink-0 w-[85%] sm:w-[360px] bg-parchment-light rounded-lg p-4 border border-navy/10 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-2">
              {r.profile_photo && (
                <div className="relative size-8 rounded-full overflow-hidden bg-bronze/10 shrink-0">
                  <Image src={r.profile_photo} alt="" fill className="object-cover" sizes="32px" />
                </div>
              )}
              <div className="min-w-0">
                <div className="font-serif text-sm truncate">{r.author_name}</div>
                <div className="text-[10px] text-bronze">{r.relative_time}</div>
              </div>
            </div>
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-3.5 ${i < (r.rating ?? 0) ? 'fill-brass text-brass' : 'text-bronze/30'}`}
                />
              ))}
            </div>
            <p className="text-sm leading-relaxed line-clamp-6">{r.text}</p>
          </article>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 flex-wrap">
        <Link
          href="/informations"
          className="rounded-full border border-navy/30 px-5 py-2.5 text-sm font-semibold"
        >
          Informations
        </Link>
        <a href={business.googleBusinessUrl} target="_blank" rel="noopener" className="text-xs underline">
          Voir tous les avis sur Google →
        </a>
      </div>
    </section>
  );
}
