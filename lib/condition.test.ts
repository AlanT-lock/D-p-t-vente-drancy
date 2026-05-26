import { describe, it, expect } from 'vitest';
import { CONDITIONS, conditionLabel } from './condition';

describe('CONDITIONS', () => {
  it('expose 4 valeurs ordonnées', () => {
    expect(CONDITIONS.map((c) => c.value)).toEqual([
      'neuf',
      'tres_bon_etat',
      'bon_etat',
      'etat_usage',
    ]);
  });
});

describe('conditionLabel', () => {
  it('renvoie le label français', () => {
    expect(conditionLabel('neuf')).toBe('Neuf');
    expect(conditionLabel('tres_bon_etat')).toBe('Très bon état');
    expect(conditionLabel('etat_usage')).toBe("État d'usage");
  });
});
