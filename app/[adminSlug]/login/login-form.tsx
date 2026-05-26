'use client';
import { useActionState } from 'react';
import { login } from './actions';

type State = { error: string } | null;

async function action(_prev: State, formData: FormData): Promise<State> {
  const result = await login(formData);
  if (result && 'error' in result) return { error: result.error };
  return null;
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(action, null);
  return (
    <form action={formAction} className="w-full max-w-sm bg-parchment-light border border-navy/10 rounded-lg p-6 space-y-4">
      <h1 className="font-serif text-2xl">Espace admin</h1>
      <label className="block">
        <span className="text-xs uppercase tracking-wider text-bronze">Email</span>
        <input name="email" type="email" required className="mt-1 w-full rounded border border-navy/20 px-3 py-2" autoComplete="email" />
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-wider text-bronze">Mot de passe</span>
        <input name="password" type="password" required className="mt-1 w-full rounded border border-navy/20 px-3 py-2" autoComplete="current-password" />
      </label>
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="w-full rounded-full bg-navy text-parchment py-2 font-semibold disabled:opacity-60">
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
