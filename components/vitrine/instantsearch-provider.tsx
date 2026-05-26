'use client';
import { InstantSearch, Configure } from 'react-instantsearch';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { publicEnv } from '@/lib/env';

const { searchClient } = instantMeiliSearch(publicEnv.MEILI_HOST, publicEnv.MEILI_SEARCH_KEY);

export function InstantSearchProvider({ children }: { children: React.ReactNode }) {
  return (
    <InstantSearch indexName="products" searchClient={searchClient} future={{ preserveSharedStateOnUnmount: true }}>
      <Configure {...({ filters: 'is_published = true' } as Record<string, unknown>)} />
      {children}
    </InstantSearch>
  );
}
