/**
 * Product Summary Component
 * Wrapper that builds ProductSummaryCard props from Reverse Convertible terms
 */

import type { ReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import { formatPercent, formatNumber } from '../../core/utils/math';
import { formatDate } from '../../core/types/dates';
import { addMonths, getCurrentISODate } from '../../core/types/dates';
import { frequencyToString } from '../../products/common/productTypes';
import { ProductSummaryCard } from './ProductSummaryCard';
import { Calendar, DollarSign, Layers, Shield, BadgePercent } from 'lucide-react';

interface ProductSummaryProps {
  terms: ReverseConvertibleTerms;
}

export function ProductSummary({ terms }: ProductSummaryProps) {
  const maturityDate = addMonths(getCurrentISODate(), terms.tenorMonths);
  const couponRateText = formatPercent(terms.couponRatePA, 2) + ' p.a.';
  
  // Build badges
  const badges = [
    {
      icon: <Calendar className="w-4 h-4" />,
      label: `${terms.tenorMonths}M Duration`,
      color: 'blue' as const,
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: terms.currency,
      color: 'orange' as const,
    },
  ];

  // Add basket type badge if worst-of
  if (terms.basketType === 'worst_of') {
    badges.push({
      icon: <Layers className="w-4 h-4" />,
      label: 'Worst-Of',
      color: 'teal' as const,
    });
  }

  // Add barrier/strike badge
  if (terms.variant === 'standard_barrier_rc' && terms.barrierPct) {
    badges.push({
      icon: <Shield className="w-4 h-4" />,
      label: `${formatPercent(terms.barrierPct, 0)} European Barrier`,
      color: 'purple' as const,
    });
  } else if (terms.variant === 'low_strike_geared_put' && terms.strikePct) {
    badges.push({
      icon: <BadgePercent className="w-4 h-4" />,
      label: `${formatPercent(terms.strikePct, 0)} Strike`,
      color: 'purple' as const,
    });
  }

  // Build specs
  const specs = [
    {
      label: 'Barrier',
      value: terms.barrierPct ? formatPercent(terms.barrierPct, 0) : 'N/A',
    },
  ];

  if (terms.variant === 'low_strike_geared_put' && terms.strikePct) {
    specs.push({
      label: 'Strike',
      value: formatPercent(terms.strikePct, 0),
    });
  }

  if (terms.variant === 'low_strike_geared_put' && terms.knockInBarrierPct) {
    specs.push({
      label: 'Knock-in Barrier',
      value: formatPercent(terms.knockInBarrierPct, 0),
    });
  }

  specs.push(
    {
      label: 'Coupon Frequency',
      value: frequencyToString(terms.couponFreqPerYear),
    },
    {
      label: 'Maturity',
      value: formatDate(maturityDate, 'short'),
    },
    {
      label: 'Conversion Ratio',
      value: formatNumber(terms.conversionRatio, 2),
    },
    {
      label: 'Delivery',
      value: 'Cash / Shares',
    }
  );

  // Add worst-of underlyings if basket
  if (terms.basketType === 'worst_of' && terms.underlyings.length > 1) {
    specs.push({
      label: 'Worst-Of',
      value: terms.underlyings.map(u => u.ticker).join(' / '),
    });
  }

  // Determine product color
  const productColor = terms.variant === 'standard_barrier_rc' ? 'blue' : 'purple';

  return (
    <ProductSummaryCard
      productType="Reverse Convertible"
      headlineRateText={couponRateText}
      underlyings={terms.underlyings.map(u => ({
        symbol: u.ticker,
        name: u.name,
      }))}
      badges={badges}
      specs={specs}
      productColor={productColor}
    />
  );
}

