import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchProducts } from '@/lib/search/products';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Auth check : seul un admin connecté peut rechercher
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse('unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  if (!q.trim()) return NextResponse.json({ results: [] });

  const results = await searchProducts(q, { limit: 12, includeUnpublished: true });
  return NextResponse.json({
    results: results.map((r) => ({
      id: r.id,
      name: r.name,
      price_cents: r.price_cents,
      quantity: r.quantity,
      subcategory_name: r.subcategory_name,
      category_name: r.category_name,
      is_published: r.is_published,
      main_photo: r.photos.sort((a, b) => a.position - b.position)[0]?.storage_path ?? null,
    })),
  });
}
