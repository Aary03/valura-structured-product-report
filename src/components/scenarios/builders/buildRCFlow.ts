/**
 * Reverse Convertible Flow Builder
 * Builds scenario flow for Reverse Convertible products
 */

import type { ReverseConvertibleTerms } from '../../../products/reverseConvertible/terms';
import type { ScenarioFlow } from '../types';
import { formatPercent } from '../../../core/utils/math';
import { formatNumber } from '../../../core/utils/math';
import {
  getRCCashRedemption,
  getRCShareConversion,
} from '../../../services/scenarioDescriptions';

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
  const { basketType, barrierPct, strikePct } = basketInfo;
  
  // Get user-friendly descriptions
  const cashDesc = getRCCashRedemption(terms, terms.notional);
  const shareDesc = getRCShareConversion(terms, terms.notional);
  
  // Build condition text
  const levelText = basketType === 'worst_of' 
    ? 'worst-performing stock'
    : 'underlying stock';
  
  const thresholdPct = terms.variant === 'low_strike_geared_put' 
    ? (strikePct || barrierPct) 
    : barrierPct;
  
  let conditionText: string;
  if (terms.variant === 'standard_barrier_rc') {
    conditionText = `Does ${levelText} stay above ${formatPercent(thresholdPct, 0)} at maturity?`;
  } else {
    conditionText = `Does ${levelText} stay above ${formatPercent(thresholdPct, 0)} at maturity?`;
  }

  // Meta chips
  const metaChips: string[] = [];
  if (basketType === 'worst_of') {
    metaChips.push('Worst-Of Basket');
  }
  if (terms.variant === 'low_strike_geared_put') {
    metaChips.push('Enhanced Cushion Structure');
  }
  metaChips.push(`${formatNumber(terms.couponRatePA * 100, 1)}% Annual Income`);

  const node = {
    id: 'rc-maturity',
    stage: 'maturity' as const,
    condition: conditionText,
    yes: {
      title: cashDesc.title,
      lines: cashDesc.lines,
      note: cashDesc.example,
    },
    no: {
      title: shareDesc.title,
      lines: shareDesc.lines,
      note: shareDesc.example,
    },
    metaChips,
  };

  return {
    title: 'Understand the Scenarios',
    subtitle: 'What happens at maturity based on how your stocks perform',
    nodes: [node],
  };
}








