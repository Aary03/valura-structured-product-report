/**
 * Reference Price Utilities
 * Calculate reference prices for pre-trade reports
 */

import type { ISODateString } from '../core/types/dates';
import { fmpClient } from './api/financialModelingPrep';
import type { FMPHistoricalPrice } from './api/mappers';
import { getCurrentISODate } from '../core/types/dates';

/**
 * Get reference price for an underlying
 * If referenceMode is 'today', returns current spot price
 * If referenceMode is 'custom', fetches historical price for referenceDate
 */
export async function getReferencePrice(
  symbol: string,
  currentSpot: number,
  referenceMode: 'today' | 'custom' = 'today',
  referenceDate?: ISODateString
): Promise<number> {
  if (referenceMode === 'today' || !referenceDate) {
    return currentSpot;
  }

  try {
    // Fetch historical price for the reference date
    const response = await fmpClient.get<FMPHistoricalPrice[]>(
      fmpClient.historical.historicalPriceEODFull(symbol, {
        from: referenceDate,
        to: referenceDate,
      })
    );

    const historical = Array.isArray(response) ? response : [];
    
    if (historical.length > 0 && historical[0].close) {
      return historical[0].close;
    }

    // Fallback to current spot if historical data not available
    console.warn(`Historical price not found for ${symbol} on ${referenceDate}, using current spot`);
    return currentSpot;
  } catch (error) {
    console.error(`Error fetching reference price for ${symbol}:`, error);
    return currentSpot;
  }
}

/**
 * Calculate barrier price from reference price
 */
export function calculateBarrierPrice(
  referencePrice: number,
  barrierPct: number
): number {
  return referencePrice * barrierPct;
}

/**
 * Calculate distance to barrier (in percentage points)
 */
export function calculateDistanceToBarrier(
  spotPrice: number,
  barrierPrice: number
): number {
  return ((spotPrice / barrierPrice) - 1) * 100;
}








