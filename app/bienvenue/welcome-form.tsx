'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function WelcomeForm() {
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Le lien d'invitation établit la session via le jeton dans l'URL ;
  // le client navigateur lit le hash automatiquement. On attend qu'une session
  // apparaisse (onAuthStateChange ou getSession) ; sinon on conclut au lien expiré.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Erreur explicite renvoyée par Supabase dans le hash (lien expiré/déjà utilisé).
    if (/error=|otp_expired|error_code=/.test(window.location.hash)) {
      setSessionError(true);
      return;
    }
    const supabase = createClient();
    let settled = false;
    const markReady = () => {
      if (settled) return;
      settled = true;
      setReady(true);
      setSessionError(false);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) markReady();
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) markReady();
    });
    // Aucun jeton de session valide après un délai → lien invalide ou expiré.
    const timer = setTimeout(() => {
      if (!settled) setSessionError(true);
    }, 5000);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setPending(false);
      setError(updateError.message);
      return;
    }
    // Navigation pleine page : la route serveur lit le cookie de session
    // puis redirige vers l'espace admin (le slug reste secret).
    window.location.assign('/bienvenue/go');
  }

  if (sessionError) {
    return (
      <div className="w-full max-w-sm bg-parchment-light border border-navy/10 rounded-lg p-6 text-center">
        <h1 className="font-serif text-2xl mb-2">Lien expiré</h1>
        <p className="text-sm text-bronze">
          Ce lien d&apos;invitation est invalide ou a déjà été utilisé. Demandez à votre
          administrateur de vous renvoyer une invitation.
        </p>
      </div>
    );
  }
  if (!ready) {
    return <p className="text-sm text-bronze">Vérification de votre invitation…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm bg-parchment-light border border-navy/10 rounded-lg p-6 space-y-4">
      <h1 className="font-serif text-2xl">Bienvenue</h1>
      <p className="text-sm text-bronze">Choisissez votre mot de passe pour activer votre compte.</p>
      <label className="block">
        <span className="text-xs uppercase tracking-wider text-bronze">Mot de passe</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
          autoComplete="new-password"
        />
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-wider text-bronze">Confirmer</span>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
          autoComplete="new-password"
        />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-full bg-navy text-parchment py-2 font-semibold disabled:opacity-60"
      >
        {pending ? 'Activation…' : 'Activer mon compte'}
      </button>
    </form>
  );
}
