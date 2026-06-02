import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const adminSlug = process.env.ADMIN_SLUG;
  const path = request.nextUrl.pathname;

  if (!adminSlug) {
    // mauvaise config — bloquer toute route admin par défaut
    return NextResponse.next();
  }

  // Match anything starting with `/<adminSlug>` (the admin section)
  if (path === `/${adminSlug}` || path.startsWith(`/${adminSlug}/`)) {
    const { response, user } = await updateSession(request);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');

    const isLogin = path === `/${adminSlug}/login`;
    if (!user && !isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = `/${adminSlug}/login`;
      return NextResponse.redirect(url);
    }
    if (user && isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = `/${adminSlug}`;
      return NextResponse.redirect(url);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
