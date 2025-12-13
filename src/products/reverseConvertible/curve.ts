/**
 * Reverse Convertible Curve Generator
 * Generate payoff curve points for charting
 * Works with worst-of level for basket products
 */

import type { ReverseConvertibleTerms } from './terms';
import type { CurvePoint } from '../common/payoffTypes';
import { calculateStandardBarrierRC, calculateLowStrikeGearedPut } from './engine';
import type { ReverseConvertibleMarketData } from './engine';

/**
 * Generate payoff curve for Reverse Convertible
 * @param terms Product terms
 * @param worstOfLevel Current worst-of level (for single, this is just the level)
 * @param worstInitialFixing Initial fixing of worst underlying (for single, this is the initial)
 */
export function generateReverseConvertibleCurve(
  terms: ReverseConvertibleTerms,
  worstOfLevel: number = 1.0, // Default to 100% for curve generation
  worstInitialFixing: number = 100 // Default initial for curve generation
): CurvePoint[] {
  const points: CurvePoint[] = [];
  const notional = terms.notional;
  
  // Generate points from 0% to 150% of initial (normalized)
  const minX = 0;
  const maxX = 1.5;
  const step = 0.01; // 1% steps
  
  for (let x = minX; x <= maxX; x += step) {
    // For curve generation, we need to simulate market data where worst-of level = x
    // For baskets: set all underlyings to level x (so worst-of = x)
    // For single: just use x directly
    
    let market: ReverseConvertibleMarketData;
    
    if (terms.basketType === 'worst_of' && terms.underlyings.length > 1) {
      // Basket: create market data where all underlyings are at normalized level x
      // This ensures worst-of = x
      const initialFixings = terms.initialFixings || [];
      const spotPrices = initialFixings.map(initial => initial * x); // All at level x
      const finalPrices = spotPrices; // Final = spot for curve
      
      market = {
        initialFixings,
        spotPrices,
        finalPrices,
      };
    } else {
      // Single underlying: use worst underlying's initial fixing
      const initialFixing = terms.initialFixings?.[0] || worstInitialFixing;
      const finalPrice = initialFixing * x;
      
      market = {
        initialFixings: [initialFixing],
        spotPrices: [initialFixing * x],
        finalPrices: [finalPrice],
      };
    }
    
    let result: any;
    
    if (terms.variant === 'standard_barrier_rc') {
      result = calculateStandardBarrierRC(terms, market);
    } else {
      result = calculateLowStrikeGearedPut(terms, market);
    }
    
    points.push({
      x,
      redemptionPct: result.redemptionPct,
      totalPct: result.totalPct,
      couponPct: result.couponPct,
      note: x === (terms.barrierPct || terms.strikePct || 0) ? 'Barrier' : undefined,
    });
  }
  
  return points;
}
