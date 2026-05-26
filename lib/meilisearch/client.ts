import { Meilisearch } from 'meilisearch';
import { publicEnv, serverEnv } from '@/lib/env';

export function searchClient() {
  return new Meilisearch({ host: publicEnv.MEILI_HOST, apiKey: publicEnv.MEILI_SEARCH_KEY });
}

export function adminClient() {
  return new Meilisearch({ host: publicEnv.MEILI_HOST, apiKey: serverEnv().MEILI_ADMIN_KEY });
}
