import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/search/products';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  if (!q.trim()) return NextResponse.json({ results: [] });
  const results = await searchProducts(q, { limit: 8 });
  return NextResponse.json({
    results: results.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      price_cents: r.price_cents,
      subcategory_name: r.subcategory_name,
      main_photo:
        r.photos.sort((a, b) => a.position - b.position)[0]?.storage_path ?? null,
    })),
  });
}
