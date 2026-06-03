import { createClient } from '@/lib/supabase/server';
import { WelcomeForm } from './welcome-form';

export const dynamic = 'force-dynamic';

export const metadata = { robots: { index: false, follow: false } };

// La session est établie côté serveur par /auth/confirm (verifyOtp → cookies).
// On la lit donc directement ici : plus aucune détection de jeton côté client,
// plus aucun délai d'attente, plus de faux « lien expiré ».
export default async function BienvenuePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const expired = !user || error === 'expired';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-parchment">
      {expired ? (
        <div className="w-full max-w-sm bg-parchment-light border border-navy/10 rounded-lg p-6 text-center">
          <h1 className="font-serif text-2xl mb-2">Lien expiré</h1>
          <p className="text-sm text-bronze">
            Ce lien d&apos;invitation est invalide ou a déjà été utilisé. Demandez à votre
            administrateur de vous renvoyer une invitation.
          </p>
        </div>
      ) : (
        <WelcomeForm />
      )}
    </div>
  );
}
