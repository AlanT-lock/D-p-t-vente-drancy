import { NextRequest, NextResponse } from 'next/server';
import { refreshGoogleReviews } from '@/lib/google-places';
import { serverEnv } from '@/lib/env';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${serverEnv().CRON_SECRET}`) {
    return new NextResponse('forbidden', { status: 403 });
  }
  const result = await refreshGoogleReviews();
  return NextResponse.json(result);
}
