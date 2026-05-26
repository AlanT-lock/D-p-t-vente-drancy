export const CONDITIONS = [
  { value: 'neuf', label: 'Neuf' },
  { value: 'tres_bon_etat', label: 'Très bon état' },
  { value: 'bon_etat', label: 'Bon état' },
  { value: 'etat_usage', label: "État d'usage" },
] as const;

export type Condition = (typeof CONDITIONS)[number]['value'];

export function conditionLabel(value: Condition): string {
  const found = CONDITIONS.find((c) => c.value === value);
  if (!found) throw new Error(`Condition inconnue: ${value}`);
  return found.label;
}
