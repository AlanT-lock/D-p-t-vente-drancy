import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('crée des slugs propres', () => {
    expect(slugify('Fauteuil Club')).toBe('fauteuil-club');
    expect(slugify('Décoration & Brocante')).toBe('decoration-brocante');
    expect(slugify('  espaces  multiples  ')).toBe('espaces-multiples');
    expect(slugify('Été 2024')).toBe('ete-2024');
  });
});
