import { describe, it, expect } from 'vitest';
import { formatPrice, parsePrice } from './format';

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
