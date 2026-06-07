// Formatage 100% déterministe (sans Intl) pour éviter les divergences
// d'espace insécable entre Node (serveur) et le navigateur (client)
// qui causent des hydration mismatches en SSR.

function groupThousands(n: number): string {
  return String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function formatPrice(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const wholeEuros = Math.floor(abs / 100);
  const decimals = abs % 100;
  const whole = groupThousands(wholeEuros);
  if (decimals === 0) {
    return `${sign}${whole} €`;
  }
  return `${sign}${whole},${String(decimals).padStart(2, '0')} €`;
}

/**
 * Réduction en pourcentage (entier) entre un prix neuf et le prix de vente.
 * Renvoie 0 s'il n'y a pas de réduction réelle (prix neuf absent, nul, ou
 * inférieur/égal au prix de vente) — le composant d'affichage peut alors masquer.
 */
export function discountPercent(originalCents: number | null | undefined, currentCents: number): number {
  if (!originalCents || originalCents <= 0) return 0;
  if (currentCents < 0 || currentCents >= originalCents) return 0;
  return Math.round((1 - currentCents / originalCents) * 100);
}

export function parsePrice(input: string): number {
  const normalized = input.replace(',', '.').trim();
  const num = Number(normalized);
  if (!Number.isFinite(num) || num < 0) {
    throw new Error(`Prix invalide: "${input}"`);
  }
  return Math.round(num * 100);
}
