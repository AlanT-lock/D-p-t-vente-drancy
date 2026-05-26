import { NextRequest, NextResponse } from 'next/server';
import { fetchPlaceDetails } from '@/lib/google-places';
import { createAdminClient } from '@/lib/supabase/admin';
import { serverEnv } from '@/lib/env';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${serverEnv().CRON_SECRET}`) {
    return new NextResponse('forbidden', { status: 403 });
  }
  const details = await fetchPlaceDetails();
  const admin = createAdminClient();

  await admin
    .from('google_business_info')
    .upsert({
      id: 1,
      rating: details.rating ?? null,
      total_reviews: details.user_ratings_total ?? null,
      fetched_at: new Date().toISOString(),
    });

  // Clear the table then insert fresh reviews
  await admin.from('google_reviews_cache').delete().not('id', 'is', null);

  if (details.reviews?.length) {
    await admin.from('google_reviews_cache').insert(
      details.reviews.map((r) => ({
        author_name: r.author_name,
        rating: r.rating,
        text: r.text,
        relative_time: r.relative_time_description,
        profile_photo: r.profile_photo_url,
      })),
    );
  }
  return NextResponse.json({ ok: true, reviews: details.reviews?.length ?? 0 });
}
