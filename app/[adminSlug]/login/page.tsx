import { login } from './actions';

export default async function LoginPage({ params }: { params: Promise<{ adminSlug: string }> }) {
  await params;
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-parchment">
      <form action={login} className="w-full max-w-sm bg-parchment-light border border-navy/10 rounded-lg p-6 space-y-4">
        <h1 className="font-serif text-2xl">Espace admin</h1>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-bronze">Email</span>
          <input name="email" type="email" required className="mt-1 w-full rounded border border-navy/20 px-3 py-2" autoComplete="email" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-bronze">Mot de passe</span>
          <input name="password" type="password" required className="mt-1 w-full rounded border border-navy/20 px-3 py-2" autoComplete="current-password" />
        </label>
        <button className="w-full rounded-full bg-navy text-parchment py-2 font-semibold">Se connecter</button>
      </form>
    </div>
  );
}
