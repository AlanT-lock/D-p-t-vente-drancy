import { adminClient } from '@/lib/meilisearch/client';
import { INDEX_NAME, indexSettings } from '@/lib/meilisearch/schema';

async function main() {
  const client = adminClient();
  try {
    await client.createIndex(INDEX_NAME, { primaryKey: 'id' });
  } catch {
    // index exists
  }
  await client.index(INDEX_NAME).updateSettings(indexSettings);
  console.log('Index Meilisearch configuré');
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
