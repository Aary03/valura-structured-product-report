/**
 * CPPN Breakeven utilities
 * (At maturity; issuer risk ignored)
 * 
 * Handles all product configurations:
 * - Standard CPPN (full/partial protection)
 * - Bonus Certificates (conditional break-even)
 * - Knock-in products (conditional protection)
 * - Capped products
 * - Downside participation
 */

import type { CapitalProtectedParticipationTerms } from './terms';

export type BreakEvenResult = 
  | { kind: 'always'; reason: string; minReturnPct: number }
  | { kind: 'level'; levelPct: number; floorPct: number }
  | { kind: 'impossible'; reason: string; maxReturnPct?: number }
  | { kind: 'bonus_conditional'; bonusFloorPct: number; barrierPct: number }
  | { kind: 'knock_in_conditional'; protectedBreakevenPct: number | null; knockInLevelPct: number; capitalProtectionPct: number };

/**
 * Solve for breakeven basket level X where payoff = 100 (i.e., total return 0%).
 * Handles all structured product scenarios comprehensively.
 */
export function calculateCppnBreakevenLevelPct(
  terms: CapitalProtectedParticipationTerms
): BreakEvenResult {
  const P = terms.capitalProtectionPct;
  const K = terms.participationStartPct;
  const a = terms.participationRatePct / 100;

  // ==========================================
  // BONUS CERTIFICATE BREAK-EVEN LOGIC
  // ==========================================
  if (terms.bonusEnabled && terms.bonusLevelPct != null && terms.bonusBarrierPct != null) {
    const BL = terms.bonusLevelPct;
    const B = terms.bonusBarrierPct;
    
    // If bonus floor >= 100%, you're always profitable (if barrier not breached)
    if (BL >= 100) {
      return { 
        kind: 'bonus_conditional', 
        bonusFloorPct: BL, 
        barrierPct: B 
      };
    }
    
    // If bonus floor < 100%, need to find where participation reaches 100%
    // Payoff in participating regime: P = 100 + a * (X - K)
    // Set P = 100 and solve: 100 = 100 + a * (X - K) => X = K
    // So break-even is at participation start (K)
    
    // With cap, check if we can reach 100%
    if (terms.capType === 'capped' && terms.capLevelPct != null) {
      // At K: payoff = max(BL, 100) = 100
      // But cap might prevent reaching 100
      if (terms.capLevelPct < 100) {
        return { 
          kind: 'impossible', 
          reason: 'Bonus floor below 100% and cap prevents reaching break-even',
          maxReturnPct: Math.max(BL, terms.capLevelPct)
        };
      }
    }
    
    return { kind: 'level', levelPct: K, floorPct: BL };
  }

  // ==========================================
  // KNOCK-IN CONDITIONAL BREAK-EVEN
  // ==========================================
  if (terms.knockInEnabled && terms.knockInLevelPct != null) {
    // For knock-in products, break-even has two regimes:
    // 1. If X >= KI: Standard protected payoff applies
    // 2. If X < KI: Geared-put payoff applies
    
    // Calculate break-even in protected regime
    let protectedBreakeven: number | null = null;
    
    if (P >= 100) {
      // Full protection: always profitable in protected regime
      return { 
        kind: 'knock_in_conditional',
        protectedBreakevenPct: null, // Always profitable
        knockInLevelPct: terms.knockInLevelPct,
        capitalProtectionPct: P
      };
    }
    
    if (a > 0) {
      // Calculate where protected payoff reaches 100%
      if (terms.participationDirection === 'up') {
        protectedBreakeven = K + (100 - P) / a;
      } else {
        protectedBreakeven = K - (100 - P) / a;
      }
      
      // Check if break-even is reachable (not capped below 100%)
      if (terms.capType === 'capped' && terms.capLevelPct != null) {
        const maxDelta = Math.max(0, terms.capLevelPct - K);
        const maxPayoff = Math.max(P, P + a * maxDelta);
        if (maxPayoff < 100) {
          protectedBreakeven = null; // Impossible in protected regime
        }
      }
    }
    
    return {
      kind: 'knock_in_conditional',
      protectedBreakevenPct: protectedBreakeven,
      knockInLevelPct: terms.knockInLevelPct,
      capitalProtectionPct: P
    };
  }

  // ==========================================
  // STANDARD CPPN BREAK-EVEN LOGIC
  // ==========================================
  
  // Full protection: always profitable
  if (P >= 100) {
    return { 
      kind: 'always', 
      reason: 'Capital protection at or above 100%',
      minReturnPct: P
    };
  }
  
  // No participation: only get floor
  if (a <= 0) {
    return { 
      kind: 'impossible', 
      reason: 'Participation rate is zero - only receive capital protection floor',
      maxReturnPct: P
    };
  }

  // With cap, ensure max payoff reaches 100%
  if (terms.capType === 'capped' && typeof terms.capLevelPct === 'number') {
    const maxDelta = Math.max(0, terms.capLevelPct - K);
    const maxPayoff = Math.max(P, P + a * maxDelta);
    if (maxPayoff < 100) {
      return { 
        kind: 'impossible', 
        reason: 'Cap prevents payoff from reaching 100%',
        maxReturnPct: maxPayoff
      };
    }
  }

  // Solve for break-even level
  // Up participation: 100 = P + a * (X - K)  =>  X = K + (100 - P) / a
  // Down participation: 100 = P + a * (K - X)  =>  X = K - (100 - P) / a
  let levelPct: number;
  if (terms.participationDirection === 'up') {
    levelPct = K + (100 - P) / a;
  } else {
    // Downside participation: payoff rises as X falls
    levelPct = K - (100 - P) / a;
  }
  
  return { kind: 'level', levelPct, floorPct: P };
}


