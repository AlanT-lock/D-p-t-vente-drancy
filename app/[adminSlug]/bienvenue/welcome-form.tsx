'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function WelcomeForm({ adminSlug }: { adminSlug: string }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Le lien d'invitation établit la session via l'URL ; on écoute onAuthStateChange
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setReady(true);
        setSessionError(false);
      } else {
        setSessionError(true);
      }
    });
    return () => subscription.unsubscribe();
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
    setPending(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push(`/${adminSlug}`);
  }

  if (sessionError) {
    return (
      <p className="text-sm text-red-700">
        Lien d&apos;invitation invalide ou expiré. Demandez à l&apos;administrateur de vous réinviter.
      </p>
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
