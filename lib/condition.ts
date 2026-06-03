// Les états de produit sont désormais stockés en base (table product_conditions)
// et gérables par les admins. Ce module ne contient que des types et helpers purs,
// utilisables côté client comme serveur. La source de vérité est la BDD ; voir
// lib/repos/conditions.ts (getConditions) côté serveur.

export type ConditionOption = { slug: string; label: string };

/** Un état est identifié par son slug (texte libre, généré depuis le libellé). */
export type Condition = string;

/**
 * Liste de secours = les 4 états historiques. Sert de valeur par défaut pour les
 * composants d'affichage qui ne reçoivent pas la liste à jour, et de repli si la
 * table product_conditions est vide.
 */
export const DEFAULT_CONDITIONS: ConditionOption[] = [
  { slug: 'neuf', label: 'Neuf' },
  { slug: 'tres_bon_etat', label: 'Très bon état' },
  { slug: 'bon_etat', label: 'Bon état' },
  { slug: 'etat_usage', label: "État d'usage" },
];

/** Libellé d'un état d'après la liste fournie ; repli sur le slug si introuvable. */
export function conditionLabel(
  slug: string,
  options: ConditionOption[] = DEFAULT_CONDITIONS,
): string {
  return options.find((o) => o.slug === slug)?.label ?? slug;
}
