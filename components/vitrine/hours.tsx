import { publicEnv } from '@/lib/env';

type DayHours = { day: string; open: string; close: string } | { day: string; closed: true };

export function Hours() {
  let parsed: DayHours[] = [];
  try {
    parsed = JSON.parse(publicEnv.BUSINESS_HOURS_JSON) as DayHours[];
  } catch {
    parsed = [];
  }
  if (!parsed.length) return <p className="text-sm text-bronze">Horaires à venir</p>;
  return (
    <ul className="text-sm space-y-1">
      {parsed.map((h) => (
        <li key={h.day} className="flex justify-between gap-4">
          <span className="text-bronze">{h.day}</span>
          <span>{'closed' in h ? 'Fermé' : `${h.open} – ${h.close}`}</span>
        </li>
      ))}
    </ul>
  );
}
