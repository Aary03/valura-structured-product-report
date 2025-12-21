/**
 * CPPN Breakeven utilities
 * (At maturity; issuer risk ignored)
 */

import type { CapitalProtectedParticipationTerms } from './terms';

/**
 * Solve for breakeven basket level X where payoff = 100 (i.e., total return 0%).
 * Only applies in protected participation regime. If KI is enabled, breakeven is not meaningful globally
 * because payoff switches to geared-put below KI.
 */
export function calculateCppnBreakevenLevelPct(
  terms: CapitalProtectedParticipationTerms
): { kind: 'always' } | { kind: 'level'; levelPct: number } | { kind: 'impossible'; reason: string } {
  const P = terms.capitalProtectionPct;
  const K = terms.participationStartPct;
  const a = terms.participationRatePct / 100;

  if (P >= 100) return { kind: 'always' };
  if (a <= 0) return { kind: 'impossible', reason: 'Participation rate is zero' };

  // With cap, ensure max payoff reaches 100
  if (terms.capType === 'capped' && typeof terms.capLevelPct === 'number') {
    const maxDelta = Math.max(0, terms.capLevelPct - K);
    const maxPayoff = Math.max(P, P + a * maxDelta);
    if (maxPayoff < 100) {
      return { kind: 'impossible', reason: 'Even at cap, payoff does not reach 100%' };
    }
  }

  // Solve 100 = P + a * max(0, X - K) (up)  OR 100 = P + a * max(0, K - X) (down)
  if (terms.participationDirection === 'up') {
    const levelPct = K + (100 - P) / a;
    return { kind: 'level', levelPct };
  }
  // downside participation: breakeven happens when X is low enough (since payoff rises as X falls)
  const levelPct = K - (100 - P) / a;
  return { kind: 'level', levelPct };
}


