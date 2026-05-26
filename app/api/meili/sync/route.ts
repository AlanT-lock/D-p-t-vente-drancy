import { NextRequest, NextResponse } from 'next/server';
import { syncProductById, deleteProductFromIndex } from '@/lib/meilisearch/sync';
import { serverEnv } from '@/lib/env';

type WebhookPayload = {
  type?: 'INSERT' | 'UPDATE' | 'DELETE';
  record?: { id?: string; product_id?: string };
  old_record?: { id?: string; product_id?: string };
};

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== serverEnv().MEILI_WEBHOOK_SECRET) {
    return new NextResponse('forbidden', { status: 403 });
  }
  const body = (await req.json()) as WebhookPayload;

  const targetId =
    body.record?.id ?? body.record?.product_id ?? body.old_record?.id ?? body.old_record?.product_id;

  if (!targetId) {
    return NextResponse.json({ ok: false, reason: 'no id' }, { status: 400 });
  }

  if (body.type === 'DELETE' && body.old_record && !body.old_record.product_id) {
    // products row deleted
    await deleteProductFromIndex(targetId);
    return NextResponse.json({ ok: true, action: 'delete' });
  }

  await syncProductById(targetId);
  return NextResponse.json({ ok: true, action: 'sync' });
}
