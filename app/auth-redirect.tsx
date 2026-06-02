'use client';
import { useEffect } from 'react';

/**
 * Filet de sécurité pour le flux d'invitation Supabase.
 *
 * Quand Supabase ne peut pas honorer le `redirectTo` (URL absente de l'allow-list),
 * il retombe sur la Site URL (souvent la racine) en laissant le jeton dans le hash
 * (#access_token=…&type=invite) ou une erreur (#error=…&error_code=otp_expired).
 * Ce composant, monté globalement, détecte ce hash sur n'importe quelle page et
 * renvoie l'utilisateur vers /bienvenue en conservant le hash intact.
 */
export function AuthHashRedirect() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash) return;
    const isAuthHash =
      /\baccess_token=/.test(hash) ||
      /\btype=(invite|recovery|signup)\b/.test(hash) ||
      /\berror_code=/.test(hash) ||
      /\berror=access_denied\b/.test(hash);
    if (!isAuthHash) return;
    if (window.location.pathname === '/bienvenue') return;
    window.location.replace('/bienvenue' + hash);
  }, []);
  return null;
}
