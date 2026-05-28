import { serverEnv } from './env';
import { createAdminClient } from '@/lib/supabase/admin';

export type PlaceReview = {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url: string;
};

type PlaceDetailsResponse = {
  result: {
    rating?: number;
    user_ratings_total?: number;
    reviews?: PlaceReview[];
  };
  status: string;
};

export type PlaceDetailsResult = PlaceDetailsResponse['result'];

export async function fetchPlaceDetails(): Promise<PlaceDetailsResult> {
  const { GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID } = serverEnv();
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(GOOGLE_PLACE_ID)}&fields=rating,user_ratings_total,reviews&language=fr&reviews_sort=most_relevant&key=${encodeURIComponent(GOOGLE_PLACES_API_KEY)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Google Places HTTP ${res.status}`);
  const data = (await res.json()) as PlaceDetailsResponse;
  if (data.status !== 'OK') throw new Error(`Google Places status: ${data.status}`);
  return data.result;
}

export async function refreshGoogleReviews(): Promise<{
  ok: true;
  reviews: number;
  rating: number | null;
  total: number | null;
}> {
  const details = await fetchPlaceDetails();
  const admin = createAdminClient();

  await admin.from('google_business_info').upsert({
    id: 1,
    rating: details.rating ?? null,
    total_reviews: details.user_ratings_total ?? null,
    fetched_at: new Date().toISOString(),
  });

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

  return {
    ok: true,
    reviews: details.reviews?.length ?? 0,
    rating: details.rating ?? null,
    total: details.user_ratings_total ?? null,
  };
}
