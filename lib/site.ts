const DEFAULT_SITE_URL = 'https://depotventedrancy.fr';

/** URL de base du site, sans slash final. Utilisée pour les redirections d'auth. */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, '');
}
