/**
 * Underlying Summary Service
 * Fetch and calculate comprehensive metrics for each underlying
 */

import { fmpClient } from './api/financialModelingPrep';
import type { FMPQuote, FMPPriceTarget, FMPRatings } from './api/mappers';
import { mapHistoricalPrices } from './api/mappers';
import type { HistoricalPricePoint } from './api/mappers';

export interface UnderlyingSummary {
  symbol: string;
  name: string;
  logoUrl: string;
  spotPrice: number;
  initialFixing: number;
  performancePct: number; // % vs initial fixing
  distanceToBarrierPctPts: number; // Percentage points above/below barrier
  thresholdLabel?: string; // e.g. "Barrier" | "Participation Start"
  sector?: string;
  industry?: string;
  exchange?: string;
  pe?: number;
  eps?: number;
  dividendYieldPct?: number; // Dividend yield (%)
  nextEarningsDate?: string; // ISO string
  marketCap?: number;
  avgVolume?: number;
  vol30dAnn?: number; // 30-day annualized volatility
  range52w?: {
    low: number;
    high: number;
    position: number; // 0-1, where current price sits in range
  };
  analystConsensus?: string;
  targetPrice?: number;
  targetUpside?: number; // % upside to target
  beta?: number;
  momentum20d?: number; // 20-day return %
  momentumBadge?: 'Uptrend' | 'Sideways' | 'Downtrend';
  riskBadge?: 'Low' | 'Medium' | 'High';
  insight: string; // Auto-generated one-liner
}

type FMPRatiosTTM = {
  dividendYieldTTM?: number;
  dividendYield?: number;
  peRatioTTM?: number;
  priceEarningsRatioTTM?: number;
};

function toPctMaybe(x?: number): number | undefined {
  if (x == null || !Number.isFinite(x)) return undefined;
  // Heuristic: if already looks like percent (e.g. 3.2), keep; if decimal (0.032), convert.
  if (x > 1.5) return x;
  return x * 100;
}

function parseMaybeDate(x?: string): string | undefined {
  if (!x) return undefined;
  const d = new Date(x);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/**
 * Calculate 30-day annualized volatility from historical prices
 */
function calculateVolatility30d(historical: HistoricalPricePoint[]): number | undefined {
  if (historical.length < 2) return undefined;
  
  // Get last ~31 days
  const recent = historical.slice(0, Math.min(31, historical.length));
  if (recent.length < 2) return undefined;
  
  // Calculate daily log returns
  const returns: number[] = [];
  for (let i = 1; i < recent.length; i++) {
    const prevPrice = recent[i].price;
    const currPrice = recent[i - 1].price; // Most recent first
    if (prevPrice > 0 && currPrice > 0) {
      returns.push(Math.log(currPrice / prevPrice));
    }
  }
  
  if (returns.length < 2) return undefined;
  
  // Calculate standard deviation
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  // Annualize (252 trading days)
  return stdDev * Math.sqrt(252);
}

/**
 * Calculate 52-week range from historical prices
 */
function calculate52WeekRange(historical: HistoricalPricePoint[]): { low: number; high: number; position: number } | undefined {
  if (historical.length === 0) return undefined;
  
  // Get last ~252 trading days (52 weeks)
  const lastYear = historical.slice(0, Math.min(252, historical.length));
  if (lastYear.length === 0) return undefined;
  
  const prices = lastYear.map(p => p.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const current = historical[0].price; // Most recent
  
  const position = high > low ? (current - low) / (high - low) : 0.5;
  
  return {
    low,
    high,
    position: Math.max(0, Math.min(1, position)), // Clamp to [0, 1]
  };
}

/**
 * Calculate 20-day momentum
 */
function calculateMomentum20d(historical: HistoricalPricePoint[]): number | undefined {
  if (historical.length < 20) return undefined;
  
  const current = historical[0].price;
  const price20dAgo = historical[19].price;
  
  if (price20dAgo > 0) {
    return ((current / price20dAgo) - 1) * 100;
  }
  
  return undefined;
}

/**
 * Get momentum badge based on 20-day return
 */
function getMomentumBadge(momentum20d?: number): 'Uptrend' | 'Sideways' | 'Downtrend' | undefined {
  if (momentum20d === undefined) return undefined;
  
  if (momentum20d > 5) return 'Uptrend';
  if (momentum20d < -5) return 'Downtrend';
  return 'Sideways';
}

/**
 * Get risk badge based on volatility
 */
function getRiskBadge(vol30dAnn?: number): 'Low' | 'Medium' | 'High' | undefined {
  if (vol30dAnn === undefined) return undefined;
  
  const volPct = vol30dAnn * 100;
  if (volPct < 25) return 'Low';
  if (volPct <= 45) return 'Medium';
  return 'High';
}

/**
 * Generate insight text
 */
function generateInsight(
  distanceToBarrierPctPts: number,
  vol30dAnn?: number,
  analystConsensus?: string,
  targetUpside?: number,
  thresholdLabel: string = 'barrier'
): string {
  const absDistance = Math.abs(distanceToBarrierPctPts);
  
  if (absDistance < 5) {
    return `Close to ${thresholdLabel} — this name drives payoff sensitivity.`;
  }
  
  if (vol30dAnn && vol30dAnn * 100 > 40) {
    return `Higher volatility — larger chance of moving through the ${thresholdLabel}.`;
  }
  
  if (analystConsensus && analystConsensus.toLowerCase().includes('buy') && targetUpside && targetUpside > 10) {
    return 'Analysts constructive; target implies upside from spot.';
  }
  
  return `Stable profile; monitor trend and buffer to ${thresholdLabel}.`;
}

/**
 * Build comprehensive summary for an underlying
 */
export async function buildUnderlyingSummary(
  symbol: string,
  initialFixing: number,
  barrierPct: number,
  historicalData?: HistoricalPricePoint[],
  options?: { thresholdLabel?: string }
): Promise<UnderlyingSummary> {
  try {
    // Fetch quote, profile, price target, ratings (+ ratios TTM) in parallel
    const [quoteResponse, profileResponse, priceTargetResponse, ratingsResponse, ratiosTtmResponse] = await Promise.allSettled([
      fmpClient.get<any>(fmpClient.quote.quote(symbol)),
      fmpClient.get<any>(fmpClient.profile.profile(symbol)),
      fmpClient.get<any>(fmpClient.analyst.priceTargetConsensus(symbol)),
      fmpClient.get<any>(fmpClient.analyst.ratingsSnapshot(symbol)),
      fmpClient.get<any>(fmpClient.financialStatements.ratiosTtm(symbol)),
    ]);

    // Extract quote
    let quote: FMPQuote | null = null;
    if (quoteResponse.status === 'fulfilled') {
      const quoteData = quoteResponse.value;
      quote = Array.isArray(quoteData) ? quoteData[0] : quoteData;
    }

    if (!quote) {
      throw new Error(`Failed to fetch quote for ${symbol}`);
    }

    // Extract profile
    let profile: any = null;
    if (profileResponse.status === 'fulfilled') {
      const profileData = profileResponse.value;
      profile = Array.isArray(profileData) ? profileData[0] : profileData;
    }

    // Extract price target
    let priceTarget: FMPPriceTarget | undefined;
    if (priceTargetResponse.status === 'fulfilled') {
      const value = priceTargetResponse.value;
      priceTarget = Array.isArray(value) && value.length > 0 ? value[0] : value;
    }

    // Extract ratings
    let ratings: FMPRatings | undefined;
    if (ratingsResponse.status === 'fulfilled') {
      const value = ratingsResponse.value;
      ratings = Array.isArray(value) && value.length > 0 ? value[0] : value;
    }

    // Extract ratios TTM
    let ratiosTtm: FMPRatiosTTM | undefined;
    if (ratiosTtmResponse.status === 'fulfilled') {
      const value = ratiosTtmResponse.value;
      ratiosTtm = Array.isArray(value) && value.length > 0 ? value[0] : value;
    }

    const spotPrice = quote.price;
    const performancePct = ((spotPrice / initialFixing) - 1) * 100;
    const distanceToBarrierPctPts = ((spotPrice / initialFixing) - barrierPct) * 100;

    // Get historical data if not provided
    let historical: HistoricalPricePoint[] = historicalData || [];
    if (historical.length === 0) {
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const historicalResponse = await fmpClient.get<any>(
          fmpClient.historicalPrice.historicalPriceEodFull(symbol, startDate, endDate)
        );
        
        if (historicalResponse) {
          historical = mapHistoricalPrices(historicalResponse as any, spotPrice);
        }
      } catch (err) {
        console.warn(`Failed to fetch historical data for ${symbol}:`, err);
      }
    }

    // Calculate metrics
    const vol30dAnn = calculateVolatility30d(historical);
    const range52w = calculate52WeekRange(historical);
    const momentum20d = calculateMomentum20d(historical);
    const momentumBadge = getMomentumBadge(momentum20d);
    const riskBadge = getRiskBadge(vol30dAnn);

    // Analyst info
    const analystConsensus = ratings?.ratingRecommendation || 
      (ratings?.rating ? ratings.rating : undefined);
    const targetPrice = priceTarget?.targetConsensus || priceTarget?.targetMedian;
    const targetUpside = targetPrice && spotPrice > 0 
      ? ((targetPrice / spotPrice) - 1) * 100 
      : undefined;

    // Fundamental/descriptor info (best-effort)
    const sector: string | undefined = profile?.sector;
    const industry: string | undefined = profile?.industry;
    const exchange: string | undefined = quote.exchange || profile?.exchange;
    const beta: number | undefined = profile?.beta;
    const pe: number | undefined =
      (Number.isFinite(quote.pe) ? quote.pe : undefined) ??
      ratiosTtm?.peRatioTTM ??
      ratiosTtm?.priceEarningsRatioTTM;
    const eps: number | undefined = Number.isFinite(quote.eps) ? quote.eps : undefined;
    const dividendYieldPct =
      toPctMaybe(ratiosTtm?.dividendYieldTTM ?? ratiosTtm?.dividendYield) ??
      toPctMaybe(profile?.lastDiv && spotPrice ? (profile.lastDiv / spotPrice) : undefined);
    const nextEarningsDate = parseMaybeDate(quote.earningsAnnouncement);

    // Generate insight
    const insight = generateInsight(
      distanceToBarrierPctPts,
      vol30dAnn,
      analystConsensus,
      targetUpside,
      options?.thresholdLabel || 'barrier'
    );

    // Logo URL
    const logoUrl = profile?.image 
      ? profile.image 
      : `https://financialmodelingprep.com/image-stock/${symbol}.png`;

    return {
      symbol,
      name: profile?.companyName || quote.name || symbol,
      logoUrl,
      spotPrice,
      initialFixing,
      performancePct,
      distanceToBarrierPctPts,
      thresholdLabel: options?.thresholdLabel,
      sector,
      industry,
      exchange,
      pe,
      eps,
      dividendYieldPct,
      nextEarningsDate,
      marketCap: quote.marketCap || profile?.mktCap,
      avgVolume: quote.avgVolume || quote.volume,
      vol30dAnn,
      range52w,
      analystConsensus,
      targetPrice,
      targetUpside,
      beta,
      momentum20d,
      momentumBadge,
      riskBadge,
      insight,
    };
  } catch (error) {
    console.error(`Error building summary for ${symbol}:`, error);
    throw error;
  }
}

