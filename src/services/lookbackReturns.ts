/**
 * Lookback Return Utilities
 * Calculate returns over different lookback periods
 */

import type { HistoricalPricePoint } from './api/mappers';

export type LookbackPeriod = '1M' | '3M' | '6M' | '1Y' | '3Y';

/**
 * Get number of days for a lookback period
 */
export function getLookbackDays(period: LookbackPeriod): number {
  switch (period) {
    case '1M':
      return 30;
    case '3M':
      return 90;
    case '6M':
      return 180;
    case '1Y':
      return 365;
    case '3Y':
      return 1095;
    default:
      return 365;
  }
}

/**
 * Calculate lookback return from historical data
 * Returns the return percentage over the lookback period
 */
export function calculateLookbackReturn(
  currentPrice: number,
  historicalData: HistoricalPricePoint[],
  lookbackPeriod: LookbackPeriod = '1Y'
): number | null {
  if (!historicalData || historicalData.length === 0) {
    return null;
  }

  const lookbackDays = getLookbackDays(lookbackPeriod);
  
  // Sort by date (oldest first)
  const sorted = [...historicalData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Find the price at the lookback start date
  // We'll use the oldest available price that's within the lookback window
  const today = new Date();
  const lookbackDate = new Date(today);
  lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);

  // Find the closest historical price to the lookback start date
  let startPrice: number | null = null;
  
  for (const point of sorted) {
    const pointDate = new Date(point.date);
    if (pointDate <= lookbackDate || !startPrice) {
      startPrice = point.price;
    } else {
      break;
    }
  }

  // If we don't have enough history, use the oldest available price
  if (!startPrice && sorted.length > 0) {
    startPrice = sorted[0].price;
  }

  if (!startPrice || startPrice === 0) {
    return null;
  }

  // Calculate return: (current / start - 1) * 100
  return ((currentPrice / startPrice) - 1) * 100;
}

/**
 * Calculate max drawdown from historical data
 */
export function calculateMaxDrawdown(
  historicalData: HistoricalPricePoint[]
): number | null {
  if (!historicalData || historicalData.length === 0) {
    return null;
  }

  const sorted = [...historicalData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let maxPrice = sorted[0].price;
  let maxDrawdown = 0;

  for (const point of sorted) {
    if (point.price > maxPrice) {
      maxPrice = point.price;
    } else {
      const drawdown = ((maxPrice - point.price) / maxPrice) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
  }

  return maxDrawdown;
}

/**
 * Calculate lookback range (high - low) from historical data
 */
export function calculateLookbackRange(
  historicalData: HistoricalPricePoint[],
  lookbackPeriod: LookbackPeriod = '1Y'
): { high: number; low: number; range: number } | null {
  if (!historicalData || historicalData.length === 0) {
    return null;
  }

  const lookbackDays = getLookbackDays(lookbackPeriod);
  const today = new Date();
  const lookbackDate = new Date(today);
  lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);

  // Filter to lookback period
  const inPeriod = historicalData.filter(point => {
    const pointDate = new Date(point.date);
    return pointDate >= lookbackDate;
  });

  if (inPeriod.length === 0) {
    // Use all available data if lookback period is longer than available history
    const sorted = [...historicalData].sort((a, b) => a.price - b.price);
    const low = sorted[0].price;
    const high = sorted[sorted.length - 1].price;
    return { high, low, range: high - low };
  }

  const prices = inPeriod.map(p => p.price);
  const high = Math.max(...prices);
  const low = Math.min(...prices);

  return { high, low, range: high - low };
}

