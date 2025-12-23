/**
 * Capital Protected Participation Note (CPPN) Terms
 * Investor-friendly structure with optional Knock-In (European) that switches to a geared-put regime.
 */

import type { Currency } from '../../core/types/money';
import type { Underlying, BasketType } from '../common/productTypes';
import { computeSMinForContinuity, computeProtectedPayoffPctAtX } from './guards';

export type ParticipationDirection = 'up' | 'down';
export type CapType = 'none' | 'capped';
export type KnockInMode = 'EUROPEAN';

export interface CapitalProtectedParticipationTerms {
  // Discriminator
  productType: 'CPPN';

  // Core
  notional: number;
  currency: Currency;
  tenorMonths: number;
  underlyings: Underlying[]; // 1-3
  initialFixings: number[]; // same order as underlyings
  basketType: BasketType; // single / worst_of / best_of / average

  // Protected participation parameters (percent levels are expressed as % of initial, e.g. 100)
  capitalProtectionPct: number; // P (e.g., 100 or 90)
  participationDirection: ParticipationDirection; // up | down
  participationStartPct: number; // K (e.g., 100)
  participationRatePct: number; // α (e.g., 120 => 1.2x)

  // Cap (optional)
  capType: CapType; // none | capped
  capLevelPct?: number; // C (required if capType=capped)

  // Knock-in (optional)
  knockInEnabled: boolean;
  knockInMode: KnockInMode; // v1: EUROPEAN only
  knockInLevelPct?: number; // KI (required if knockInEnabled)

  // Downside strike (geared-put strike) used only when knock-in triggers
  downsideStrikePct?: number; // S (default: KI)

  // Bonus feature (only available when capital protection is OFF, i.e., capitalProtectionPct = 0)
  bonusEnabled: boolean;
  bonusLevelPct?: number; // Bonus return if barrier never breached (e.g., 108 = 108%)
  bonusBarrierPct?: number; // Barrier level that shouldn't be touched for bonus (e.g., 60)
}

export function validateCapitalProtectedParticipationTerms(
  terms: CapitalProtectedParticipationTerms
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (terms.notional <= 0) errors.push('Notional must be greater than 0');
  if (terms.tenorMonths <= 0) errors.push('Tenor must be greater than 0 months');

  // Underlyings + basket
  if (!terms.underlyings || terms.underlyings.length === 0) {
    errors.push('At least one underlying must be specified');
  }
  if (terms.basketType === 'single' && terms.underlyings.length !== 1) {
    errors.push('Single basket type requires exactly 1 underlying');
  }
  if (terms.basketType !== 'single') {
    if (terms.underlyings.length < 2 || terms.underlyings.length > 3) {
      errors.push('Basket requires 2 or 3 underlyings');
    }
    const symbols = terms.underlyings.map((u) => u.ticker);
    const uniqueSymbols = new Set(symbols);
    if (uniqueSymbols.size !== symbols.length) errors.push('Underlying symbols must be unique');
  }

  if (!terms.initialFixings || terms.initialFixings.length !== terms.underlyings.length) {
    errors.push('Initial fixings array must match underlyings array length');
  } else if (terms.initialFixings.some((f) => f <= 0)) {
    errors.push('All initial fixings must be greater than 0');
  }

  // Payoff params
  if (terms.capitalProtectionPct < 0 || terms.capitalProtectionPct > 200) {
    errors.push('Capital protection (%) must be 0 or between 1 and 200');
  }
  if (terms.participationStartPct <= 0 || terms.participationStartPct > 300) {
    errors.push('Participation start (%) must be between 0 and 300');
  }
  if (terms.participationRatePct < 0 || terms.participationRatePct > 500) {
    errors.push('Participation rate (%) must be between 0 and 500');
  }

  if (terms.capType === 'capped') {
    if (terms.capLevelPct == null || terms.capLevelPct <= terms.participationStartPct) {
      errors.push('Cap level (%) must be greater than Participation start (%) when capped');
    }
  }

  if (terms.knockInEnabled) {
    if (terms.knockInLevelPct == null || terms.knockInLevelPct <= 0 || terms.knockInLevelPct > 300) {
      errors.push('Knock-in level (%) must be between 0 and 300 when enabled');
    }
    const ki = terms.knockInLevelPct ?? 0;
    const s = terms.downsideStrikePct ?? ki;
    if (s <= 0 || s > 300) errors.push('Downside strike (%) must be between 0 and 300');

    // Continuity / monotonic guardrail near KI when P < 100:
    // Enforce S >= S_min so payoff below KI does not exceed protected payoff at KI.
    if (terms.capitalProtectionPct < 100 && terms.knockInLevelPct != null) {
      const params = {
        capitalProtectionPct: terms.capitalProtectionPct,
        participationDirection: terms.participationDirection,
        participationStartPct: terms.participationStartPct,
        participationRatePct: terms.participationRatePct,
        capType: terms.capType,
        capLevelPct: terms.capLevelPct,
      } as const;
      const protectedAtKI = computeProtectedPayoffPctAtX(params, terms.knockInLevelPct);
      const sMin = computeSMinForContinuity(params, terms.knockInLevelPct, 1);
      const tol = 1e-6;
      if (Number.isFinite(sMin) && s + tol < sMin) {
        errors.push(
          `Invalid downside strike: would create a discontinuity at KI. Set S ≥ ${sMin.toFixed(2)}% (computed from P=${protectedAtKI.toFixed(2)}%, KI=${terms.knockInLevelPct}%).`
        );
      }
    }
  }

  // Bonus validation
  if (terms.bonusEnabled) {
    // Bonus only available when capital protection is OFF
    if (terms.capitalProtectionPct !== 0) {
      errors.push('Bonus feature is only available when Capital Protection is 0%');
    }
    if (terms.bonusLevelPct == null || terms.bonusLevelPct <= 100 || terms.bonusLevelPct > 200) {
      errors.push('Bonus level must be between 100% and 200%');
    }
    if (terms.bonusBarrierPct == null || terms.bonusBarrierPct <= 0 || terms.bonusBarrierPct >= 100) {
      errors.push('Bonus barrier must be between 0% and 100%');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function getDefaultCapitalProtectedParticipationTerms(): CapitalProtectedParticipationTerms {
  return {
    productType: 'CPPN',
    notional: 100000,
    currency: 'USD',
    tenorMonths: 12,
    underlyings: [{ ticker: 'AAPL', name: 'Apple Inc.' }],
    initialFixings: [100],
    basketType: 'single',
    capitalProtectionPct: 100,
    participationDirection: 'up',
    participationStartPct: 100,
    participationRatePct: 120,
    capType: 'none',
    knockInEnabled: false,
    knockInMode: 'EUROPEAN',
    bonusEnabled: false,
  };
}


