/**
 * usePayoffCalculation Hook
 * Calculate payoff for Reverse Convertible products
 * Supports single and worst-of basket
 */

import { useMemo } from 'react';
import type { ReverseConvertibleTerms } from '../products/reverseConvertible/terms';
import { calculateReverseConvertiblePayoff } from '../products/reverseConvertible/engine';
import { generateReverseConvertibleCurve } from '../products/reverseConvertible/curve';
import type { CurvePoint } from '../products/common/payoffTypes';
import { calcLevels, worstOf } from '../products/common/basket';

interface UsePayoffCalculationResult {
  payoffResult: any;
  curvePoints: CurvePoint[];
  intrinsicValue: number | null;
  barrierLevel: number;
  strikeLevel: number | undefined;
  worstOfLevel: number | null;
  worstUnderlyingIndex: number | null;
}

/**
 * Calculate payoff for Reverse Convertible
 */
export function usePayoffCalculation(
  terms: ReverseConvertibleTerms | null,
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
      };
    }

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
    // Pass all initial fixings so curve can properly simulate basket scenarios
    const curvePoints = generateReverseConvertibleCurve(
      terms,
      worstLevel, // Current worst-of level (for reference, not used in calculation)
      initialFixings[worstIndex] || 100 // Worst underlying's initial fixing (fallback)
    );

    // Calculate intrinsic value (current worst-of level payoff)
    const intrinsicMarket = {
      initialFixings,
      spotPrices,
      finalPrices: spotPrices, // Use current spot as final for intrinsic
    };
    const intrinsicResult = calculateReverseConvertiblePayoff(terms, intrinsicMarket);
    const intrinsicValue = intrinsicResult.redemptionPct;

    // Barrier and strike levels
    const barrierLevel = terms.barrierPct || 0;
    const strikeLevel = terms.strikePct;

    return {
      payoffResult,
      curvePoints,
      intrinsicValue,
      barrierLevel,
      strikeLevel,
      worstOfLevel: worstLevel,
      worstUnderlyingIndex: worstIndex,
    };
  }, [terms, spotPrices, initialFixings]);
}
