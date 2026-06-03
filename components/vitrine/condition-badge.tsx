import { conditionLabel, type ConditionOption } from '@/lib/condition';

export function ConditionBadge({
  condition,
  conditions,
}: {
  condition: string;
  conditions?: ConditionOption[];
}) {
  return (
    <span className="text-[10px] uppercase tracking-wider text-bronze font-semibold">
      {conditionLabel(condition, conditions)}
    </span>
  );
}
