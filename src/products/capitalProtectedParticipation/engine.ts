/**
 * Capital Protected Participation Note (CPPN) Payoff Engine
 *
 * Notation:
 * - X: Final basket level (%) vs initial fixing (e.g., 92 means -8%)
 * - P: Capital protection floor (%)
 * - K: Participation start (%)
 * - α: Participation rate (%) => a = α/100
 * - C: Cap level (%) (optional)
 * - KI: Knock-in barrier (%) (optional, European)
 * - S: Downside strike (%) (geared-put strike) used only when KI triggers
 */

import type { CapitalProtectedParticipationTerms } from './terms';
import type { PayoffResult, PayoffTimeline, CashflowEvent } from '../common/payoffTypes';
import type { ISODateString } from '../../core/types/dates';
import { round, safeDivide } from '../../core/utils/math';
import { calcLevels, worstOf, bestOf, averageOf } from '../common/basket';
import { addMonths, getCurrentISODate } from '../../core/types/dates';
import { enforceStrikeForContinuity } from './guards';

export interface CapitalProtectedParticipationMarketData {
  initialFixings: number[]; // S0_i
  spotPrices: number[]; // current spot (used for intrinsic)
  finalPrices?: number[]; // ST_i (scenario)
}

export interface CapitalProtectedParticipationPayoffDetails {
  redemptionPct: number; // as fraction of notional
  totalPct: number; // as fraction of notional (no coupons in v1; equals redemptionPct)
  couponPct: number; // 0 in v1
  basketLevelPct: number; // X (%)
  knockInTriggered: boolean;
  basketType: CapitalProtectedParticipationTerms['basketType'];
  worstUnderlyingIndex?: number;
  bestUnderlyingIndex?: number;
}

export function computeBasketLevelPct(
  terms: CapitalProtectedParticipationTerms,
  market: CapitalProtectedParticipationMarketData
): {
  basketLevelPct: number;
  worstUnderlyingIndex?: number;
  bestUnderlyingIndex?: number;
} {
  const spots = market.finalPrices ?? market.spotPrices;
  const levels = calcLevels(spots, market.initialFixings);

  if (terms.basketType === 'single') {
    return { basketLevelPct: round(levels[0] * 100, 4) };
  }
  if (terms.basketType === 'worst_of') {
    const { worstLevel, worstIndex } = worstOf(levels);
    return { basketLevelPct: round(worstLevel * 100, 4), worstUnderlyingIndex: worstIndex };
  }
  if (terms.basketType === 'best_of') {
    const { bestLevel, bestIndex } = bestOf(levels);
    return { basketLevelPct: round(bestLevel * 100, 4), bestUnderlyingIndex: bestIndex };
  }
  // average
  const avg = averageOf(levels);
  return { basketLevelPct: round(avg * 100, 4) };
}

export function computeCppnPayoffPct(
  terms: CapitalProtectedParticipationTerms,
  basketLevelPct: number,
  barrierNeverBreached?: boolean // For bonus feature: true if path never touched bonus barrier
): {
  redemptionPct: number; // fraction of notional
  knockInTriggered: boolean;
  bonusPaid: boolean;
} {
  const X = basketLevelPct; // %
  const P = terms.capitalProtectionPct;
  const K = terms.participationStartPct;
  const a = terms.participationRatePct / 100;

  // Check bonus FIRST (only if capital protection is OFF)
  if (terms.bonusEnabled && terms.bonusLevelPct && terms.bonusBarrierPct) {
    // Bonus pays if barrier never breached
    // If barrierNeverBreached is not provided, we check European-style: X >= bonusBarrier
    const bonusConditionMet = barrierNeverBreached ?? (X >= terms.bonusBarrierPct);
    if (bonusConditionMet) {
      return {
        redemptionPct: terms.bonusLevelPct / 100,
        knockInTriggered: false,
        bonusPaid: true,
      };
    }
  }

  const capEnabled = terms.capType === 'capped' && typeof terms.capLevelPct === 'number';
  const C = terms.capLevelPct ?? undefined;

  const kiEnabled = terms.knockInEnabled;
  const KI = terms.knockInLevelPct ?? undefined;
  const S = terms.downsideStrikePct ?? KI;

  // Guardrail: enforce S >= S_min so payoff at KI is continuous and KI breach can't be beneficial.
  // c (conversion ratio) is 1.0 in v1.
  const protectedParams = {
    capitalProtectionPct: terms.capitalProtectionPct,
    participationDirection: terms.participationDirection,
    participationStartPct: terms.participationStartPct,
    participationRatePct: terms.participationRatePct,
    capType: terms.capType,
    capLevelPct: terms.capLevelPct,
  } as const;
  const sEnforced =
    kiEnabled && KI != null
      ? enforceStrikeForContinuity({ params: protectedParams, KI, strikeS: S, c: 1 }).sEnforced
      : (S ?? KI ?? 100);

  const knockInTriggered = !!(kiEnabled && KI != null && X < KI);
  if (knockInTriggered) {
    // Conditional regime: no floor P, geared-put style via strike S
    const payoffPct = safeDivide(100 * X, sEnforced); // percent of notional
    return { redemptionPct: round(payoffPct / 100, 6), knockInTriggered: true, bonusPaid: false };
  }

  // Protected participation regime
  const delta = terms.participationDirection === 'up' ? Math.max(0, X - K) : Math.max(0, K - X);
  const cappedDelta = capEnabled && C != null ? Math.min(delta, Math.max(0, C - K)) : delta;
  const payoffPct = Math.max(P, P + a * cappedDelta);
  return { redemptionPct: round(payoffPct / 100, 6), knockInTriggered: false, bonusPaid: false };
}

export function calculateCapitalProtectedParticipationPayoff(
  terms: CapitalProtectedParticipationTerms,
  market: CapitalProtectedParticipationMarketData
): PayoffResult & {
  basketLevelPct: number;
  knockInTriggered: boolean;
  bonusPaid: boolean;
  worstUnderlyingIndex?: number;
  bestUnderlyingIndex?: number;
} {
  const { basketLevelPct, worstUnderlyingIndex, bestUnderlyingIndex } = computeBasketLevelPct(terms, market);
  const { redemptionPct, knockInTriggered, bonusPaid } = computeCppnPayoffPct(terms, basketLevelPct);

  // Timeline (v1: no coupons)
  let maturityDate: ISODateString;
  try {
    maturityDate = addMonths(getCurrentISODate(), terms.tenorMonths);
  } catch {
    const d = new Date();
    d.setMonth(d.getMonth() + terms.tenorMonths);
    maturityDate = d.toISOString().split('T')[0] as ISODateString;
  }

  const events: CashflowEvent[] = [
    {
      date: maturityDate,
      type: 'maturity',
      amount: redemptionPct * terms.notional,
      details: {
        basketLevelPct,
        knockInTriggered,
      },
    },
  ];

  const timeline: PayoffTimeline = {
    events,
    endedEarly: false,
    endDate: maturityDate,
  };

  return {
    redemptionPct,
    totalPct: redemptionPct, // no coupons in v1
    couponPct: 0,
    timeline,
    basketLevelPct,
    knockInTriggered,
    bonusPaid,
    ...(worstUnderlyingIndex != null ? { worstUnderlyingIndex } : {}),
    ...(bestUnderlyingIndex != null ? { bestUnderlyingIndex } : {}),
  };
}


