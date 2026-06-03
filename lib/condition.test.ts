import { describe, it, expect } from 'vitest';
import { DEFAULT_CONDITIONS, conditionLabel } from './condition';

describe('DEFAULT_CONDITIONS', () => {
  it('expose les 4 états historiques, ordonnés', () => {
    expect(DEFAULT_CONDITIONS.map((c) => c.slug)).toEqual([
      'neuf',
      'tres_bon_etat',
      'bon_etat',
      'etat_usage',
    ]);
  });
});

describe('conditionLabel', () => {
  it('renvoie le libellé depuis la liste par défaut', () => {
    expect(conditionLabel('neuf')).toBe('Neuf');
    expect(conditionLabel('tres_bon_etat')).toBe('Très bon état');
    expect(conditionLabel('etat_usage')).toBe("État d'usage");
  });

  it('utilise la liste fournie (états dynamiques)', () => {
    const custom = [{ slug: 'comme_neuf', label: 'Comme neuf' }];
    expect(conditionLabel('comme_neuf', custom)).toBe('Comme neuf');
  });

  it('retombe sur le slug si introuvable', () => {
    expect(conditionLabel('inconnu')).toBe('inconnu');
  });
});
