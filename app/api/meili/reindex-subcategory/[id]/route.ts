import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncProductById } from '@/lib/meilisearch/sync';
import { serverEnv } from '@/lib/env';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (req.headers.get('x-webhook-secret') !== serverEnv().MEILI_WEBHOOK_SECRET) {
    return new NextResponse('forbidden', { status: 403 });
  }
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from('products').select('id').eq('subcategory_id', id);
  for (const p of data ?? []) await syncProductById(p.id);
  return NextResponse.json({ ok: true, reindexed: data?.length ?? 0 });
}
