import { describe, it, expect } from 'vitest';
import { formatPrice, parsePrice, discountPercent } from './format';

describe('formatPrice', () => {
  it('formate les centimes en euros avec espace', () => {
    expect(formatPrice(24000)).toBe('240 €');
    expect(formatPrice(8550)).toBe('85,50 €');
    expect(formatPrice(0)).toBe('0 €');
  });
});

describe('parsePrice', () => {
  it('parse une chaîne "240,50" en 24050 centimes', () => {
    expect(parsePrice('240,50')).toBe(24050);
    expect(parsePrice('240.50')).toBe(24050);
    expect(parsePrice('240')).toBe(24000);
  });
  it('rejette les valeurs négatives ou non numériques', () => {
    expect(() => parsePrice('-1')).toThrow();
    expect(() => parsePrice('abc')).toThrow();
  });
});

describe('discountPercent', () => {
  it('calcule la réduction arrondie', () => {
    expect(discountPercent(10000, 7500)).toBe(25);
    expect(discountPercent(9000, 6000)).toBe(33);
  });
  it('renvoie 0 sans réduction réelle', () => {
    expect(discountPercent(null, 5000)).toBe(0);
    expect(discountPercent(0, 5000)).toBe(0);
    expect(discountPercent(5000, 5000)).toBe(0);
    expect(discountPercent(4000, 5000)).toBe(0);
  });
});
