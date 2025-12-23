/**
 * CPPN Product Summary
 * Wrapper that builds ProductSummaryCard props from CPPN terms.
 */

import type { CapitalProtectedParticipationTerms } from '../../products/capitalProtectedParticipation/terms';
import { formatNumber } from '../../core/utils/math';
import { formatDate } from '../../core/types/dates';
import { addMonths, getCurrentISODate } from '../../core/types/dates';
import { ProductSummaryCard } from './ProductSummaryCard';
import { Calendar, DollarSign, Layers, Shield, BadgePercent } from 'lucide-react';

export function CppnProductSummary({ terms }: { terms: CapitalProtectedParticipationTerms }) {
  const maturityDate = addMonths(getCurrentISODate(), terms.tenorMonths);

  const badges = [
    {
      icon: <Calendar className="w-4 h-4" />,
      label: `${terms.tenorMonths}M Tenor`,
      color: 'blue' as const,
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: terms.currency,
      color: 'orange' as const,
    },
  ];

  if (terms.basketType !== 'single') {
    badges.push({
      icon: <Layers className="w-4 h-4" />,
      label: terms.basketType === 'worst_of' ? 'Worst-Of Basket' : terms.basketType === 'best_of' ? 'Best-Of Basket' : 'Average Basket',
      color: 'teal' as const,
    });
  }

  // Only show capital protection badge if > 0%
  if (terms.capitalProtectionPct > 0) {
    badges.push({
      icon: <Shield className="w-4 h-4" />,
      label: `${terms.capitalProtectionPct}% Protected`,
      color: 'purple' as const,
    });
  }

  badges.push({
    icon: <BadgePercent className="w-4 h-4" />,
    label: `${terms.participationRatePct}% Participation`,
    color: 'blue' as const,
  });

  badges.push({
    icon: <BadgePercent className="w-4 h-4" />,
    label: `Starts at ${terms.participationStartPct}%`,
    color: 'teal' as const,
  });

  if (terms.capType === 'capped' && terms.capLevelPct) {
    badges.push({
      icon: <BadgePercent className="w-4 h-4" />,
      label: `Cap: ${terms.capLevelPct}%`,
      color: 'orange' as const,
    });
  } else {
    badges.push({
      icon: <BadgePercent className="w-4 h-4" />,
      label: 'No Cap',
      color: 'orange' as const,
    });
  }

  if (terms.knockInEnabled) {
    badges.push({
      icon: <Shield className="w-4 h-4" />,
      label: `KI: ${terms.knockInLevelPct}%`,
      color: 'purple' as const,
    });
  } else {
    badges.push({
      icon: <Shield className="w-4 h-4" />,
      label: 'KI: Off',
      color: 'purple' as const,
    });
  }

  const specs = [
    ...(terms.capitalProtectionPct > 0 ? [{ label: 'Capital Protection', value: `${terms.capitalProtectionPct}%` }] : []),
    { label: 'Participation Starts At', value: `${terms.participationStartPct}%` },
    { label: 'Direction', value: terms.participationDirection === 'up' ? 'Upside Participation' : 'Downside Participation' },
    { label: 'Cap', value: terms.capType === 'capped' ? `${terms.capLevelPct}%` : 'None' },
    { label: 'Maturity', value: formatDate(maturityDate, 'short') },
    { label: 'Settlement', value: 'Cash' },
    { label: 'Notional', value: `$${formatNumber(terms.notional, 0)}` },
  ];

  if (terms.knockInEnabled) {
    specs.push({ label: 'Knock-In (KI)', value: `${terms.knockInLevelPct}%` });
    specs.push({ label: 'Downside Strike (S)', value: `${terms.downsideStrikePct ?? terms.knockInLevelPct}%` });
  }

  if (terms.bonusEnabled) {
    badges.push({
      icon: <BadgePercent className="w-4 h-4" />,
      label: `🎁 Bonus: ${terms.bonusLevelPct}%`,
      color: 'purple' as const,
    });
    specs.push({ label: '🎁 Bonus Level', value: `${terms.bonusLevelPct}%` });
    specs.push({ label: '🎁 Bonus Barrier', value: `${terms.bonusBarrierPct}%` });
  }

  if (terms.basketType !== 'single') {
    specs.push({ label: 'Basket', value: terms.underlyings.map((u) => u.ticker).join(' / ') });
  }

  return (
    <ProductSummaryCard
      productType="Capital Protected Participation Note"
      headlineRateText={`${terms.participationRatePct}% participation`}
      underlyings={terms.underlyings.map((u) => ({ symbol: u.ticker, name: u.name }))}
      badges={badges}
      specs={specs}
      productColor="blue"
    />
  );
}






