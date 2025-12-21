/**
 * CPPN Curve Generator
 * Generates payoff curve points (x-axis in normalized ratio ST/S0, y in redemption/total % of notional).
 */

import type { CapitalProtectedParticipationTerms } from './terms';
import type { CurvePoint } from '../common/payoffTypes';
import type { CapitalProtectedParticipationMarketData } from './engine';
import { calculateCapitalProtectedParticipationPayoff, computeCppnPayoffPct } from './engine';

export function generateCapitalProtectedParticipationCurve(
  terms: CapitalProtectedParticipationTerms
): CurvePoint[] {
  const points: CurvePoint[] = [];

  // 0% to 160% on X-axis (in % of initial), represented as normalized ratio 0..1.6
  const minX = 0;
  const maxX = 1.6;
  const step = 0.01;

  for (let x = minX; x <= maxX + 1e-9; x += step) {
    const Xpct = x * 100;
    const { redemptionPct } = computeCppnPayoffPct(terms, Xpct);
    points.push({
      x,
      redemptionPct,
      totalPct: redemptionPct,
      couponPct: 0,
      note:
        terms.knockInEnabled && terms.knockInLevelPct != null && Math.abs(Xpct - terms.knockInLevelPct) < 0.51
          ? 'KI'
          : Math.abs(Xpct - terms.participationStartPct) < 0.51
            ? 'K'
            : undefined,
    });
  }

  return points;
}

/**
 * Convenience helper for "intrinsic" at current spot (treat as final).
 */
export function calculateCapitalProtectedParticipationIntrinsic(
  terms: CapitalProtectedParticipationTerms,
  market: CapitalProtectedParticipationMarketData
) {
  return calculateCapitalProtectedParticipationPayoff(terms, { ...market, finalPrices: market.spotPrices });
}


