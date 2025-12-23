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

type BadgeColor = 'pink' | 'orange' | 'teal' | 'blue' | 'purple';

interface Badge {
  icon: React.ReactNode;
  label: string;
  color: BadgeColor;
}

export function CppnProductSummary({ terms }: { terms: CapitalProtectedParticipationTerms }) {
  const maturityDate = addMonths(getCurrentISODate(), terms.tenorMonths);
  const isBonusCertificate = terms.bonusEnabled;

  // Base badges (always shown)
  const badges: Badge[] = [
    {
      icon: <Calendar className="w-4 h-4" />,
      label: `${terms.tenorMonths}M Tenor`,
      color: 'blue',
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: terms.currency,
      color: 'orange',
    },
  ];

  if (terms.basketType !== 'single') {
    badges.push({
      icon: <Layers className="w-4 h-4" />,
      label: terms.basketType === 'worst_of' ? 'Worst-Of Basket' : terms.basketType === 'best_of' ? 'Best-Of Basket' : 'Average Basket',
      color: 'teal',
    });
  }

  // BONUS CERTIFICATE: Different badge structure
  if (isBonusCertificate) {
    // Bonus Certificate badges
    badges.push({
      icon: <BadgePercent className="w-4 h-4" />,
      label: `Bonus: ${terms.bonusLevelPct}%`,
      color: 'purple',
    });
    badges.push({
      icon: <Shield className="w-4 h-4" />,
      label: `Barrier: ${terms.bonusBarrierPct}%`,
      color: 'purple',
    });
    badges.push({
      icon: <BadgePercent className="w-4 h-4" />,
      label: `Strike: ${terms.participationStartPct}%`,
      color: 'teal',
    });
    badges.push({
      icon: <BadgePercent className="w-4 h-4" />,
      label: `Participation: ${terms.participationRatePct}%`,
      color: 'blue',
    });
    if (terms.capType === 'capped' && terms.capLevelPct) {
      badges.push({
        icon: <BadgePercent className="w-4 h-4" />,
        label: `Cap: ${terms.capLevelPct}%`,
        color: 'orange',
      });
    } else {
      badges.push({
        icon: <BadgePercent className="w-4 h-4" />,
        label: 'No Cap',
        color: 'orange',
      });
    }
  } else {
    // Standard CPPN badges
    if (terms.capitalProtectionPct > 0) {
      badges.push({
        icon: <Shield className="w-4 h-4" />,
        label: `${terms.capitalProtectionPct}% Protected`,
        color: 'purple',
      });
    }
    badges.push({
      icon: <BadgePercent className="w-4 h-4" />,
      label: `${terms.participationRatePct}% Participation`,
      color: 'blue',
    });
    badges.push({
      icon: <BadgePercent className="w-4 h-4" />,
      label: `Starts at ${terms.participationStartPct}%`,
      color: 'teal',
    });
    if (terms.capType === 'capped' && terms.capLevelPct) {
      badges.push({
        icon: <BadgePercent className="w-4 h-4" />,
        label: `Cap: ${terms.capLevelPct}%`,
        color: 'orange',
      });
    } else {
      badges.push({
        icon: <BadgePercent className="w-4 h-4" />,
        label: 'No Cap',
        color: 'orange',
      });
    }
    if (terms.knockInEnabled) {
      badges.push({
        icon: <Shield className="w-4 h-4" />,
        label: `KI: ${terms.knockInLevelPct}%`,
        color: 'purple',
      });
    } else {
      badges.push({
        icon: <Shield className="w-4 h-4" />,
        label: 'KI: Off',
        color: 'purple',
      });
    }
  }

  // Specs - Different structure for Bonus Certificate
  const specs = [];
  
  if (isBonusCertificate) {
    // Bonus Certificate specs (logical order)
    specs.push({ label: 'Bonus Level', value: `${terms.bonusLevelPct}%` });
    specs.push({ label: 'Bonus Barrier', value: `${terms.bonusBarrierPct}%` });
    specs.push({ label: 'Strike', value: `${terms.participationStartPct}%` });
    specs.push({ label: 'Participation Rate', value: `${terms.participationRatePct}%` });
    specs.push({ label: 'Cap', value: terms.capType === 'capped' ? `${terms.capLevelPct}%` : 'None' });
    specs.push({ label: 'Maturity', value: formatDate(maturityDate, 'short') });
    specs.push({ label: 'Settlement', value: 'Cash' });
    specs.push({ label: 'Notional', value: `$${formatNumber(terms.notional, 0)}` });
    if (terms.basketType !== 'single') {
      specs.push({ label: 'Basket', value: terms.underlyings.map((u) => u.ticker).join(' / ') });
    }
  } else {
    // Standard CPPN specs
    if (terms.capitalProtectionPct > 0) {
      specs.push({ label: 'Capital Protection', value: `${terms.capitalProtectionPct}%` });
    }
    specs.push({ label: 'Participation Starts At', value: `${terms.participationStartPct}%` });
    specs.push({ label: 'Direction', value: terms.participationDirection === 'up' ? 'Upside Participation' : 'Downside Participation' });
    specs.push({ label: 'Cap', value: terms.capType === 'capped' ? `${terms.capLevelPct}%` : 'None' });
    specs.push({ label: 'Maturity', value: formatDate(maturityDate, 'short') });
    specs.push({ label: 'Settlement', value: 'Cash' });
    specs.push({ label: 'Notional', value: `$${formatNumber(terms.notional, 0)}` });
    if (terms.knockInEnabled) {
      specs.push({ label: 'Knock-In (KI)', value: `${terms.knockInLevelPct}%` });
      specs.push({ label: 'Downside Strike (S)', value: `${terms.downsideStrikePct ?? terms.knockInLevelPct}%` });
    }
    if (terms.basketType !== 'single') {
      specs.push({ label: 'Basket', value: terms.underlyings.map((u) => u.ticker).join(' / ') });
    }
  }

  return (
    <ProductSummaryCard
      productType={isBonusCertificate ? 'Bonus Certificate' : 'Capital Protected Participation Note'}
      headlineRateText={isBonusCertificate ? `Bonus: ${terms.bonusLevelPct}% if barrier not breached` : `${terms.participationRatePct}% participation`}
      underlyings={terms.underlyings.map((u) => ({ symbol: u.ticker, name: u.name }))}
      badges={badges}
      specs={specs}
      productColor="blue"
    />
  );
}






