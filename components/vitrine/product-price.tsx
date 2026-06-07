import { formatPrice, discountPercent } from '@/lib/format';

/**
 * Affiche le prix du magasin (mis en avant) et, si un prix neuf supérieur est
 * renseigné, ce prix neuf barré + le pourcentage de réduction.
 * `size="lg"` pour la fiche produit, `size="sm"` (défaut) pour les vignettes.
 */
export function ProductPrice({
  priceCents,
  originalCents,
  size = 'sm',
  className = '',
}: {
  priceCents: number;
  originalCents?: number | null;
  size?: 'sm' | 'lg';
  className?: string;
}) {
  const discount = discountPercent(originalCents, priceCents);
  const lg = size === 'lg';

  return (
    <div className={`flex items-baseline gap-2 flex-wrap ${className}`}>
      <span className={lg ? 'text-2xl font-semibold' : 'font-semibold'}>
        {formatPrice(priceCents)}
      </span>
      {discount > 0 && (
        <>
          <span className={`text-bronze line-through ${lg ? 'text-base' : 'text-xs'}`}>
            {formatPrice(originalCents!)}
          </span>
          <span
            className={`bg-navy text-brass font-semibold rounded-full ${
              lg ? 'text-xs px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5'
            }`}
          >
            -{discount}%
          </span>
        </>
      )}
    </div>
  );
}
