import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Après activation : si l'utilisateur est authentifié, on le redirige vers
// l'espace admin (le slug reste secret car révélé uniquement à un utilisateur connecté).
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    return NextResponse.redirect(new URL(`/${process.env.ADMIN_SLUG}`, origin));
  }
  return NextResponse.redirect(new URL('/', origin));
}
