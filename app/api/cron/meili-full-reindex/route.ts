import { NextRequest, NextResponse } from 'next/server';
import { fullReindex } from '@/lib/meilisearch/sync';
import { serverEnv } from '@/lib/env';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${serverEnv().CRON_SECRET}`) {
    return new NextResponse('forbidden', { status: 403 });
  }
  const count = await fullReindex();
  return NextResponse.json({ ok: true, indexed: count });
}
