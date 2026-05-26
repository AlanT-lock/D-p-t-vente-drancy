import { conditionLabel, type Condition } from '@/lib/condition';

export function ConditionBadge({ condition }: { condition: Condition }) {
  return (
    <span className="text-[10px] uppercase tracking-wider text-bronze font-semibold">
      {conditionLabel(condition)}
    </span>
  );
}
