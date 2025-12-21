/**
 * usePayoffCalculation Hook
 * Calculate payoff for structured products (RC + CPPN)
 * Supports basket methods depending on product.
 */

import { useMemo } from 'react';
import type { ReverseConvertibleTerms } from '../products/reverseConvertible/terms';
import { calculateReverseConvertiblePayoff } from '../products/reverseConvertible/engine';
import { generateReverseConvertibleCurve } from '../products/reverseConvertible/curve';
import type { CurvePoint } from '../products/common/payoffTypes';
import { calcLevels, worstOf } from '../products/common/basket';
import type { CapitalProtectedParticipationTerms } from '../products/capitalProtectedParticipation/terms';
import {
  calculateCapitalProtectedParticipationPayoff,
  type CapitalProtectedParticipationMarketData,
  computeBasketLevelPct,
} from '../products/capitalProtectedParticipation/engine';
import {
  generateCapitalProtectedParticipationCurve,
  calculateCapitalProtectedParticipationIntrinsic,
} from '../products/capitalProtectedParticipation/curve';

interface UsePayoffCalculationResult {
  payoffResult: any;
  curvePoints: CurvePoint[];
  intrinsicValue: number | null;
  barrierLevel: number; // RC only (0..1), else 0
  strikeLevel: number | undefined; // RC only (0..1)
  worstOfLevel: number | null;
  worstUnderlyingIndex: number | null;
  // CPPN extras
  basketLevelPct: number | null; // X (%)
  knockInTriggered: boolean | null;
}

/**
 * Calculate payoff for the selected product type.
 */
export function usePayoffCalculation(
  terms: (ReverseConvertibleTerms | CapitalProtectedParticipationTerms) | null,
  spotPrices: number[] | null, // Array of spot prices (1 for single, 2-3 for basket)
  initialFixings: number[] | null // Array of initial fixings (1 for single, 2-3 for basket)
): UsePayoffCalculationResult {
  return useMemo(() => {
    if (!terms || !spotPrices || !initialFixings || spotPrices.length === 0 || initialFixings.length === 0) {
      return {
        payoffResult: null,
        curvePoints: [],
        intrinsicValue: null,
        barrierLevel: 0,
        strikeLevel: undefined,
        worstOfLevel: null,
        worstUnderlyingIndex: null,
        basketLevelPct: null,
        knockInTriggered: null,
      };
    }

    // Ensure arrays match underlyings length
    if (spotPrices.length !== terms.underlyings.length || initialFixings.length !== terms.underlyings.length) {
      return {
        payoffResult: null,
        curvePoints: [],
        intrinsicValue: null,
        barrierLevel: 0,
        strikeLevel: undefined,
        worstOfLevel: null,
        worstUnderlyingIndex: null,
        basketLevelPct: null,
        knockInTriggered: null,
      };
    }

    // RC
    if (terms.productType === 'RC') {
      // Calculate normalized levels
      const levels = calcLevels(spotPrices, initialFixings);

      // Get worst-of level and index (works for single too)
      const { worstLevel, worstIndex } = worstOf(levels);

      // Prepare market data
      const market = {
        initialFixings,
        spotPrices,
      };

      // Calculate payoff
      const payoffResult = calculateReverseConvertiblePayoff(terms, market);

      // Generate curve (uses worst-of level for basket)
      const curvePoints = generateReverseConvertibleCurve(
        terms,
        worstLevel,
        initialFixings[worstIndex] || 100
      );

      // Intrinsic: treat current spot as final
      const intrinsicMarket = {
        initialFixings,
        spotPrices,
        finalPrices: spotPrices,
      };
      const intrinsicResult = calculateReverseConvertiblePayoff(terms, intrinsicMarket);

      return {
        payoffResult,
        curvePoints,
        intrinsicValue: intrinsicResult.redemptionPct,
        barrierLevel: terms.barrierPct || 0,
        strikeLevel: terms.strikePct,
        worstOfLevel: worstLevel,
        worstUnderlyingIndex: worstIndex,
        basketLevelPct: null,
        knockInTriggered: null,
      };
    }

    // CPPN
    const cppnTerms = terms as CapitalProtectedParticipationTerms;
    const market: CapitalProtectedParticipationMarketData = {
      initialFixings,
      spotPrices,
      finalPrices: spotPrices,
    };

    const basket = computeBasketLevelPct(cppnTerms, market);
    const payoffResult = calculateCapitalProtectedParticipationPayoff(cppnTerms, market);
    const curvePoints = generateCapitalProtectedParticipationCurve(cppnTerms);
    const intrinsic = calculateCapitalProtectedParticipationIntrinsic(cppnTerms, {
      initialFixings,
      spotPrices,
    });

    // For UI parity, expose worstUnderlyingIndex when basket is worst_of.
    const levels = calcLevels(spotPrices, initialFixings);
    const { worstLevel, worstIndex } = worstOf(levels);

    return {
      payoffResult,
      curvePoints,
      intrinsicValue: intrinsic.redemptionPct,
      barrierLevel: 0,
      strikeLevel: undefined,
      worstOfLevel: worstLevel,
      worstUnderlyingIndex: worstIndex,
      basketLevelPct: basket.basketLevelPct,
      knockInTriggered: payoffResult.knockInTriggered,
    };
  }, [terms, spotPrices, initialFixings]);
}
