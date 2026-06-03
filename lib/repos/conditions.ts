import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_CONDITIONS, type ConditionOption } from '@/lib/condition';

/**
 * Liste des états depuis la base, ordonnée. Mémoïsée par requête (React cache),
 * donc lisible plusieurs fois dans un même rendu sans requête supplémentaire.
 * Repli sur DEFAULT_CONDITIONS si la table est vide ou en erreur (la vitrine ne
 * doit jamais casser à cause des états).
 */
export const getConditions = cache(async (): Promise<ConditionOption[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_conditions')
    .select('slug, label, position')
    .order('position');
  if (error || !data || data.length === 0) return DEFAULT_CONDITIONS;
  return data.map((c) => ({ slug: c.slug, label: c.label }));
});
