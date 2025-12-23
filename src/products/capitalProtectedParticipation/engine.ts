/**
 * Capital Protected Participation Note (CPPN) Payoff Engine
 * 
 * Implements two product types:
 * 1. Capital-Protected Participation Note (CPPN) - principal protection + leveraged participation
 * 2. Bonus Certificate - barrier + bonus floor + participation
 *
 * Notation:
 * - R: Final performance ratio (ST/S0) - e.g., 1.10 = +10%, 0.75 = -25%
 * - X: Final basket level (%) = R * 100 (e.g., 110% or 75%)
 * - CP: Capital protection floor (%)
 * - PS: Participation start (%)
 * - PR: Participation rate (%)
 * - CAP: Cap redemption (%) - applied at the END
 * - KI: Knock-in level (%) - makes protection conditional
 * - B: Bonus barrier (%)
 * - BL: Bonus level (%)
 * 
 * Key Rules:
 * 1. Apply cap AFTER computing participation, before applying floors
 * 2. Knock-in removes capital protection (conditional protection)
 * 3. Bonus pays if barrier never breached, otherwise standard participation
 * 4. Never let redemption go negative
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
  // X = basket level in % (e.g., 110 means +10%, 75 means -25%)
  // R = performance ratio (X/100)
  const X = basketLevelPct;
  const R = X / 100;
  
  // Extract parameters
  const CP = terms.capitalProtectionPct;
  const PS = terms.participationStartPct;
  const PR = terms.participationRatePct;
  const CAP = terms.capLevelPct;
  const capEnabled = terms.capType === 'capped' && typeof CAP === 'number';
  
  // Helper function: apply cap to redemption
  const applyCap = (red: number): number => {
    if (!capEnabled || !CAP) return red;
    return Math.min(red, CAP);
  };

  // ==========================================
  // BONUS CERTIFICATE LOGIC (when bonusEnabled)
  // ==========================================
  if (terms.bonusEnabled && terms.bonusLevelPct && terms.bonusBarrierPct) {
    const B = terms.bonusBarrierPct;
    const BL = terms.bonusLevelPct;
    
    // Check if barrier breached (European-style: use final level)
    const barrierBreached = barrierNeverBreached === false || (barrierNeverBreached === undefined && X < B);
    
    if (!barrierBreached) {
      // BONUS: Barrier NOT breached
      // Participation payoff: P = 100 + 100*part*max(R - start, 0)
      const start = PS / 100;
      const part = PR / 100;
      const P = 100 + 100 * part * Math.max(R - start, 0);
      
      // Apply cap
      const P_capped = applyCap(P);
      
      // Apply bonus floor: RED = max(BL, P_capped)
      const RED = Math.max(BL, P_capped);
      
      return {
        redemptionPct: Math.max(0, RED) / 100, // Never negative
        knockInTriggered: false,
        bonusPaid: true,
      };
    } else {
      // BONUS: Barrier breached → downside participation (1:1 with underlying)
      const RED = 100 * R;
      
      return {
        redemptionPct: Math.max(0, RED) / 100, // Never negative
        knockInTriggered: false,
        bonusPaid: false,
      };
    }
  }

  // ==========================================
  // KNOCK-IN LOGIC (conditional capital protection)
  // ==========================================
  const kiEnabled = terms.knockInEnabled;
  const KI = terms.knockInLevelPct;
  
  if (kiEnabled && KI != null) {
    const knockInTriggered = X < KI;
    
    if (knockInTriggered) {
      // KNOCK-IN BREACHED: Capital protection removed
      // Downside participation: RED = 100 * X / S (geared-put style)
      const S = terms.downsideStrikePct ?? KI;
      
      // Enforce continuity: use enforceStrikeForContinuity if needed
      const protectedParams = {
        capitalProtectionPct: terms.capitalProtectionPct,
        participationDirection: terms.participationDirection,
        participationStartPct: terms.participationStartPct,
        participationRatePct: terms.participationRatePct,
        capType: terms.capType,
        capLevelPct: terms.capLevelPct,
      } as const;
      
      const sEnforced = enforceStrikeForContinuity({ 
        params: protectedParams, 
        KI, 
        strikeS: S, 
        c: 1 
      }).sEnforced;
      
      const RED = safeDivide(100 * X, sEnforced);
      
      return {
        redemptionPct: Math.max(0, RED) / 100, // Never negative
        knockInTriggered: true,
        bonusPaid: false,
      };
    }
    // If KI not breached, fall through to standard CPPN logic below
  }

  // ==========================================
  // STANDARD CPPN LOGIC (capital protection + participation)
  // ==========================================
  // Upside participation component
  const start = PS / 100;
  const part = PR / 100;
  
  let UP: number;
  if (terms.participationDirection === 'up') {
    // Upside participation: UP = 100 * part * max(R - start, 0)
    UP = 100 * part * Math.max(R - start, 0);
  } else {
    // Downside participation: UP = 100 * part * max(start - R, 0)
    UP = 100 * part * Math.max(start - R, 0);
  }
  
  // Redemption before cap: RED_raw = CP + UP
  const RED_raw = CP + UP;
  
  // Apply cap: RED = min(RED_raw, CAP) or RED_raw if no cap
  const RED = applyCap(RED_raw);
  
  return {
    redemptionPct: Math.max(0, RED) / 100, // Never negative, convert to fraction
    knockInTriggered: false,
    bonusPaid: false,
  };
}

/**
 * Calculate full CPPN payoff with timeline
 * 
 * TEST CASES (for validation):
 * 
 * CPPN Base (CP=100, PS=100, PR=120, No Cap):
 * - R=0.60 (-40%) => UP=0 => RED=100 ✓
 * - R=0.95 (-5%)  => UP=0 => RED=100 ✓
 * - R=1.00 (flat) => UP=0 => RED=100 ✓
 * - R=1.10 (+10%) => UP=12 => RED=112 ✓
 * - R=1.30 (+30%) => UP=36 => RED=136 ✓
 * 
 * CPPN with Cap (CP=100, PS=100, PR=120, CAP=125):
 * - R=1.30 (+30%) => RED_raw=136 => RED=125 ✓
 * 
 * Bonus Certificate (B=70, BL=108, K=100, UR=100, CAP=125):
 * - R=1.20 (no breach) => P=120 => P_capped=120 => RED=max(108,120)=120 ✓
 * - R=1.05 (no breach) => P=105 => P_capped=105 => RED=max(108,105)=108 ✓
 * - R=0.90 (no breach) => P=100 => P_capped=100 => RED=max(108,100)=108 ✓
 * - R=0.72 (no breach) => P=100 => P_capped=100 => RED=108 ✓
 * - R=0.68 (breached)  => RED=68 ✓
 */
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


