/**
 * Reverse Convertible Flow Builder
 * Builds scenario flow for Reverse Convertible products
 */

import type { ReverseConvertibleTerms } from '../../../products/reverseConvertible/terms';
import type { ScenarioFlow } from '../types';
import { formatPercent } from '../../../core/utils/math';
import { formatNumber } from '../../../core/utils/math';

interface BasketInfo {
  basketType: 'single' | 'worst_of';
  worstOfLabel?: string;
  barrierPct: number;
  strikePct?: number;
  gearing?: number;
  conversionRatio: number;
  settlement: 'cash' | 'physical' | 'cash/physical';
}

export function buildRCFlow(terms: ReverseConvertibleTerms, basketInfo: BasketInfo): ScenarioFlow {
  const { basketType, worstOfLabel, barrierPct, strikePct, gearing, conversionRatio, settlement } = basketInfo;
  
  // Build condition text
  const levelLabel = basketType === 'worst_of' 
    ? (worstOfLabel || 'Worst-Of') + ' Final Level'
    : 'Final Level';
  
  let conditionText: string;
  let noteText: string | undefined;
  
  if (terms.variant === 'standard_barrier_rc') {
    conditionText = `Is ${levelLabel} ≥ Barrier Level (${formatPercent(barrierPct, 0)})?`;
  } else {
    // Low strike / geared put
    const ki = terms.knockInBarrierPct ?? strikePct ?? barrierPct;
    if (ki !== barrierPct) {
      conditionText = `Is ${levelLabel} ≥ Knock-In (${formatPercent(ki, 0)})?`;
      noteText = `Knock-in barrier: ${formatPercent(ki, 0)}`;
    } else {
      conditionText = `Is ${levelLabel} ≥ Barrier Level (${formatPercent(barrierPct, 0)})?`;
    }
  }

  // YES outcome (Cash Redemption)
  const yesOutcome = {
    title: 'Cash Redemption',
    lines: [
      '100% notional returned',
      'Coupons paid as scheduled (unconditional)',
      settlement.includes('cash') ? 'Settlement: Cash' : 'Settlement: Cash / Shares',
    ],
  };

  // NO outcome (Share Conversion)
  let noOutcome: {
    title: string;
    lines: string[];
    note?: string;
  };

  if (terms.variant === 'standard_barrier_rc') {
    noOutcome = {
      title: 'Share Conversion',
      lines: [
        basketType === 'worst_of' 
          ? 'Converted into worst-performing underlying'
          : 'Converted into underlying shares',
        `Shares delivered = Notional / (Initial Fixing × ${formatNumber(conversionRatio, 2)})`,
        'Final value = Shares × Final Price',
      ],
      note: basketType === 'worst_of'
        ? 'Payoff% ≈ (Worst Final / Worst Initial) × 100%'
        : 'Payoff% ≈ (Final / Initial) × 100%',
    };
  } else {
    // Low strike / geared put
    const strikeText = strikePct ? formatPercent(strikePct, 0) : 'Strike';
    noOutcome = {
      title: 'Geared Share Conversion',
      lines: [
        basketType === 'worst_of'
          ? 'Converted into worst-performing underlying'
          : 'Converted into underlying shares',
        `Downside is geared below Strike (${strikeText})`,
        gearing ? `Payoff% = (Final Level / Strike) × 100% (Gearing: ${formatNumber(gearing, 2)}x)`
          : `Payoff% = (Final Level / Strike) × 100%`,
        `Shares delivered = Notional / (Initial Fixing × ${formatNumber(strikePct || 0, 2)} × ${formatNumber(conversionRatio, 2)})`,
      ],
      note: `Below strike, losses are amplified by gearing = ${gearing ? formatNumber(gearing, 2) : '1/Strike'}x`,
    };
  }

  // Meta chips
  const metaChips: string[] = [];
  if (basketType === 'worst_of') {
    metaChips.push('Worst-Of Basket');
  }
  if (terms.variant === 'low_strike_geared_put' && gearing) {
    metaChips.push(`Gearing: ${formatNumber(gearing, 2)}x`);
  }

  const node = {
    id: 'rc-maturity',
    stage: 'maturity' as const,
    condition: conditionText,
    yes: yesOutcome,
    no: noOutcome,
    note: noteText,
    metaChips: metaChips.length > 0 ? metaChips : undefined,
  };

  return {
    title: 'Understand the Scenarios',
    subtitle: 'What happens at maturity based on final underlying level',
    nodes: [node],
  };
}

