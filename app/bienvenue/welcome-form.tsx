'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Affiché uniquement quand la session est déjà établie (cf. app/bienvenue/page.tsx).
// Le navigateur lit la session dans les cookies ; updateUser définit le mot de passe.
export function WelcomeForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
