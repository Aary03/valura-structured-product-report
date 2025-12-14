/**
 * Report Header Component
 * Product name badge and key features
 */

import type { ReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import { formatPercent } from '../../core/utils/math';

interface HeaderProps {
  terms: ReverseConvertibleTerms;
}

export function Header({ terms }: HeaderProps) {
  const couponRatePercent = formatPercent(terms.couponRatePA, 1);
  const variantLabel =
    terms.variant === 'standard_barrier_rc'
      ? 'Standard Barrier'
      : 'Low Strike / Geared Put';

  const barrierOrStrike =
    terms.variant === 'standard_barrier_rc'
      ? `Barrier: ${formatPercent(terms.barrierPct || 0, 0)}`
      : `Strike: ${formatPercent(terms.strikePct || 0, 0)}`;

  return (
    <div className="flex justify-between items-start mb-6">
      <div className="flex-1">
        <h1 className="text-4xl font-bold text-grey-dark mb-2">
          Reverse Convertible {couponRatePercent}
        </h1>
        <p className="text-grey-medium text-lg">{variantLabel}</p>
      </div>
      <div className="header-badge flex-shrink-0 ml-4">
        <div className="text-sm font-normal mb-1 opacity-90">Key Features</div>
        <div className="text-base">
          {terms.tenorMonths}M • {terms.currency} • {barrierOrStrike}
        </div>
      </div>
    </div>
  );
}

