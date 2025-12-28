/**
 * AI Data Enricher
 * Fetches live market data to enrich AI conversations
 */

import { fmpClient } from '../api/financialModelingPrep';
import type { FMPQuote } from '../api/mappers';

const FMP_API_KEY = import.meta.env.VITE_FMP_API_KEY;

export interface EnrichedUnderlyingData {
  ticker: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  sector?: string;
  industry?: string;
  marketCap?: number;
  volatility?: number;
  suggestedBarrier?: number;
}

/**
 * Fetch and enrich underlying data with live market info
 */
export async function enrichUnderlyingData(ticker: string): Promise<EnrichedUnderlyingData | null> {
  if (!FMP_API_KEY) {
    console.warn('FMP API key not configured');
    return null;
  }

  try {
    // Fetch quote and profile in parallel
    const [quoteResponse, profileResponse] = await Promise.allSettled([
      fmpClient.get<FMPQuote[]>(fmpClient.quote.quote(ticker)),
      fmpClient.get<any>(fmpClient.profile.profile(ticker)),
    ]);

    // Extract quote
    let quote: FMPQuote | null = null;
    if (quoteResponse.status === 'fulfilled') {
      const quoteData = quoteResponse.value;
      quote = Array.isArray(quoteData) ? quoteData[0] : quoteData;
    }

    if (!quote) {
      return null;
    }

    // Extract profile
    let profile: any = null;
    if (profileResponse.status === 'fulfilled') {
      const profileData = profileResponse.value;
      profile = Array.isArray(profileData) ? profileData[0] : profileData;
    }

    // Calculate suggested barrier based on volatility (if available)
    // Conservative: 70-75%, Moderate: 65-70%, Aggressive: 55-65%
    const volatility = quote.priceAvg50 && quote.price 
      ? Math.abs((quote.price - quote.priceAvg50) / quote.priceAvg50) * 100
      : undefined;

    let suggestedBarrier = 70; // Default
    if (volatility) {
      if (volatility < 15) suggestedBarrier = 75; // Low vol → higher barrier
      else if (volatility < 25) suggestedBarrier = 70; // Medium vol
      else suggestedBarrier = 65; // High vol → lower barrier
    }

    return {
      ticker: quote.symbol,
      name: (profile?.companyName || quote.name || ticker) as string,
      currentPrice: quote.price,
      change: quote.change || 0,
      changePercent: quote.changesPercentage || 0,
      sector: profile?.sector,
      industry: profile?.industry,
      marketCap: profile?.mktCap,
      volatility,
      suggestedBarrier,
    };
  } catch (error) {
    console.error(`Failed to enrich ${ticker}:`, error);
    return null;
  }
}

/**
 * Enrich multiple underlyings in parallel
 */
export async function enrichMultipleUnderlyings(tickers: string[]): Promise<EnrichedUnderlyingData[]> {
  const results = await Promise.all(
    tickers.map(ticker => enrichUnderlyingData(ticker))
  );
  return results.filter((r): r is EnrichedUnderlyingData => r !== null);
}

/**
 * Generate AI context string from enriched data
 */
export function formatEnrichedDataForAI(data: EnrichedUnderlyingData[]): string {
  if (data.length === 0) return '';

  return `
LIVE MARKET DATA (just fetched):
${data.map(d => `
${d.ticker} - ${d.name}
  Current Price: $${d.currentPrice.toFixed(2)} (${d.changePercent >= 0 ? '+' : ''}${d.changePercent.toFixed(2)}%)
  Sector: ${d.sector || 'N/A'}
  Market Cap: $${d.marketCap ? (d.marketCap / 1e9).toFixed(1) + 'B' : 'N/A'}
  ${d.volatility ? `Volatility: ${d.volatility.toFixed(1)}%` : ''}
  ${d.suggestedBarrier ? `Suggested Barrier: ${d.suggestedBarrier}% (based on volatility)` : ''}
`).join('\n')}
`.trim();
}

