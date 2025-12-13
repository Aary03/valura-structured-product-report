/**
 * API Response Mappers
 * Transform Financial Modeling Prep API responses to our internal types
 */

import type { Underlying } from '../../products/common/productTypes';

/**
 * FMP Quote response structure
 */
export interface FMPQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  exchange: string;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement?: string;
  sharesOutstanding: number;
  timestamp: number;
}

/**
 * FMP Historical Price point
 */
export interface FMPHistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
  unadjustedVolume: number;
  change: number;
  changePercent: number;
  vwap: number;
  label: string;
  changeOverTime: number;
}

/**
 * FMP Historical Price response
 */
export interface FMPHistoricalResponse {
  symbol: string;
  historical: FMPHistoricalPrice[];
}

/**
 * FMP Analyst Estimates
 */
export interface FMPAnalystEstimate {
  symbol: string;
  date: string;
  estimatedRevenueLow?: number;
  estimatedRevenueHigh?: number;
  estimatedRevenueAvg?: number;
  estimatedEbitdaLow?: number;
  estimatedEbitdaHigh?: number;
  estimatedEbitdaAvg?: number;
  estimatedEbitLow?: number;
  estimatedEbitHigh?: number;
  estimatedEbitAvg?: number;
  estimatedNetIncomeLow?: number;
  estimatedNetIncomeHigh?: number;
  estimatedNetIncomeAvg?: number;
  estimatedSgaExpenseLow?: number;
  estimatedSgaExpenseHigh?: number;
  estimatedSgaExpenseAvg?: number;
  estimatedEpsAvg?: number;
  estimatedEpsHigh?: number;
  estimatedEpsLow?: number;
  numberAnalystEstimatedRevenue?: number;
  numberAnalystsEstimatedEps?: number;
}

/**
 * FMP Price Target Consensus
 */
export interface FMPPriceTarget {
  symbol: string;
  targetHigh: number;
  targetLow: number;
  targetConsensus: number; // Also called targetMean in some docs
  targetMedian: number;
  numberOfAnalysts?: number; // May not always be present
}

/**
 * FMP Ratings Snapshot
 */
export interface FMPRatings {
  symbol: string;
  date?: string;
  rating: string;
  ratingScore?: number;
  overallScore?: number;
  ratingRecommendation?: string;
  discountedCashFlowScore?: number;
  returnOnEquityScore?: number;
  returnOnAssetsScore?: number;
  debtToEquityScore?: number;
  priceToEarningsScore?: number;
  priceToBookScore?: number;
  ratingDetailsDCFScore?: number;
  ratingDetailsDCFRecommendation?: string;
  ratingDetailsROEScore?: number;
  ratingDetailsROERecommendation?: string;
  ratingDetailsROAScore?: number;
  ratingDetailsROARecommendation?: string;
  ratingDetailsDEScore?: number;
  ratingDetailsDERecommendation?: string;
  ratingDetailsPEScore?: number;
  ratingDetailsPERecommendation?: string;
  ratingDetailsPBScore?: number;
  ratingDetailsPBRecommendation?: string;
}

/**
 * Our internal underlying data structure
 */
export interface UnderlyingData {
  symbol: string;
  name: string;
  currentPrice: number;
  initialFixing?: number;
  performance: number; // Percentage change
  marketCap: number;
  volume: number;
  analystConsensus?: string;
  targetPrice?: number;
  numberOfAnalysts?: number;
  rating?: string;
}

/**
 * Historical price point for charts
 */
export interface HistoricalPricePoint {
  date: string;
  price: number;
  normalized: number; // Normalized to current spot (for chart)
}

/**
 * Map FMP quote to our UnderlyingData
 */
export function mapQuoteToUnderlyingData(
  quote: FMPQuote,
  initialFixing?: number
): UnderlyingData {
  const performance = initialFixing
    ? ((quote.price - initialFixing) / initialFixing) * 100
    : 0;

  return {
    symbol: quote.symbol,
    name: quote.name,
    currentPrice: quote.price,
    initialFixing: initialFixing ?? quote.price,
    performance: performance,
    marketCap: quote.marketCap,
    volume: quote.volume,
  };
}

/**
 * Map FMP historical prices for performance chart
 * Handles both array format and object with historical property
 */
export function mapHistoricalPrices(
  response: FMPHistoricalResponse | FMPHistoricalPrice[],
  currentPrice: number
): HistoricalPricePoint[] {
  // Check if response is an array directly
  let historical: FMPHistoricalPrice[];
  
  if (Array.isArray(response)) {
    historical = response;
  } else if (response && 'historical' in response && Array.isArray(response.historical)) {
    historical = response.historical;
  } else {
    return [];
  }

  if (historical.length === 0) {
    return [];
  }

  // Normalize all prices to current spot
  return historical
    .filter((point) => point.date && point.close != null && !isNaN(point.close))
    .map((point) => ({
      date: point.date,
      price: point.close,
      normalized: (point.close / currentPrice) * 100, // Percentage relative to current
    }));
}

/**
 * Map FMP analyst estimates
 */
export function mapAnalystEstimates(
  estimates: FMPAnalystEstimate[]
): {
  epsEstimate?: number;
  revenueEstimate?: number;
  numberOfAnalysts?: number;
} {
  if (!estimates || estimates.length === 0) {
    return {};
  }

  const latest = estimates[0]; // Most recent estimate

  return {
    epsEstimate: latest.estimatedEpsAvg,
    revenueEstimate: latest.estimatedRevenueAvg,
    numberOfAnalysts: latest.numberAnalystsEstimatedEps,
  };
}

/**
 * Map FMP price target to our format
 */
export function mapPriceTarget(target: FMPPriceTarget): {
  targetPrice: number;
  targetHigh: number;
  targetLow: number;
  numberOfAnalysts?: number;
} {
  return {
    targetPrice: target.targetConsensus || (target as any).targetMean || 0,
    targetHigh: target.targetHigh,
    targetLow: target.targetLow,
    numberOfAnalysts: target.numberOfAnalysts,
  };
}

/**
 * Map FMP ratings to consensus string
 */
export function mapRatingsToConsensus(ratings: FMPRatings): string {
  if (!ratings || !ratings.rating) {
    return 'N/A';
  }

  // Map rating letter to readable format
  const ratingMap: Record<string, string> = {
    'A+': 'Strong Buy',
    'A': 'Strong Buy',
    'A-': 'Buy',
    'B+': 'Buy',
    'B': 'Buy',
    'B-': 'Hold',
    'C+': 'Hold',
    'C': 'Hold',
    'C-': 'Hold',
    'D': 'Sell',
    'F': 'Strong Sell',
    'Strong Buy': 'Strong Buy',
    'Buy': 'Buy',
    'Hold': 'Hold',
    'Sell': 'Sell',
    'Strong Sell': 'Strong Sell',
  };

  return ratingMap[ratings.rating] || ratings.rating;
}

/**
 * Combine all data into complete UnderlyingData
 */
export function combineUnderlyingData(
  base: UnderlyingData,
  priceTarget?: FMPPriceTarget,
  ratings?: FMPRatings
): UnderlyingData {
  const result = { ...base };

  if (priceTarget) {
    const target = mapPriceTarget(priceTarget);
    result.targetPrice = target.targetPrice;
    result.numberOfAnalysts = target.numberOfAnalysts;
  }

  if (ratings) {
    result.analystConsensus = mapRatingsToConsensus(ratings);
    result.rating = ratings.rating;
  }

  return result;
}

