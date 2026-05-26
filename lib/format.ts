const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

export function formatPrice(cents: number): string {
  const euros = cents / 100;
  const formatted = fmt.format(euros).replace(/[  ]/g, ' ');
  return formatted.replace(/,00\s€/, ' €');
}

export function parsePrice(input: string): number {
  const normalized = input.replace(',', '.').trim();
  const num = Number(normalized);
  if (!Number.isFinite(num) || num < 0) {
    throw new Error(`Prix invalide: "${input}"`);
  }
  return Math.round(num * 100);
}
