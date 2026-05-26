export const INDEX_NAME = 'products';

export const indexSettings = {
  searchableAttributes: ['name', 'description', 'category_name', 'subcategory_name'],
  filterableAttributes: ['category_slug', 'subcategory_slug', 'category_name', 'subcategory_name', 'condition', 'price_cents', 'is_published', 'available'],
  sortableAttributes: ['price_cents', 'created_at_ts'],
  rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  typoTolerance: { enabled: true, minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 } },
  faceting: { maxValuesPerFacet: 100 },
};
