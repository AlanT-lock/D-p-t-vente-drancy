import { serverEnv } from './env';

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
