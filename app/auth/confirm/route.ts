import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Type de jeton OTP par email accepté par Supabase (sous-ensemble qui nous concerne).
type EmailOtpType = 'invite' | 'recovery' | 'magiclink' | 'signup' | 'email';
const ALLOWED_TYPES: readonly EmailOtpType[] = ['invite', 'recovery', 'magiclink', 'signup', 'email'];

/**
 * Confirmation d'un lien email côté serveur (invitation, magic link, reset…).
 *
 * Le lien de l'email pointe ici avec `token_hash` + `type` (cf. template
 * `supabase/email-templates/invite-user.html`). On vérifie le jeton via
 * `verifyOtp`, ce qui établit la session directement dans les cookies — sans
 * dépendre du flux PKCE côté navigateur (impossible pour une invitation
 * générée côté serveur) ni d'une détection de jeton dans l'URL.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  // `next` doit rester un chemin interne pour éviter un open-redirect.
  const rawNext = url.searchParams.get('next') ?? '/bienvenue';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/bienvenue';

  if (tokenHash && type && ALLOWED_TYPES.includes(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL('/bienvenue?error=expired', url.origin));
}
