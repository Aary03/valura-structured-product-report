/**
 * useUnderlyingData Hook
 * Fetch underlying asset data from Financial Modeling Prep API
 */

import { useState, useEffect } from 'react';
import { fmpClient } from '../services/api/financialModelingPrep';
import type {
  UnderlyingData,
  HistoricalPricePoint,
} from '../services/api/mappers';
import {
  mapQuoteToUnderlyingData,
  mapHistoricalPrices,
  combineUnderlyingData,
  type FMPQuote,
  type FMPPriceTarget,
  type FMPRatings,
  type FMPHistoricalResponse,
  type FMPHistoricalPrice,
} from '../services/api/mappers';
import type { Underlying } from '../products/common/productTypes';

interface UseUnderlyingDataResult {
  data: UnderlyingData[];
  historicalData: HistoricalPricePoint[][];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch underlying data for one or more symbols
 */
export function useUnderlyingData(
  underlyings: Underlying[],
  enabled: boolean = true
): UseUnderlyingDataResult {
  const [data, setData] = useState<UnderlyingData[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalPricePoint[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!enabled || underlyings.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const promises = underlyings.map(async (underlying) => {
        const symbol = underlying.ticker;

        // Fetch quote, price target, and ratings in parallel
        const [quoteResponse, priceTargetResponse, ratingsResponse] = await Promise.allSettled([
          fmpClient.get<FMPQuote[]>(fmpClient.quote.quote(symbol)),
          fmpClient.get<FMPPriceTarget>(fmpClient.analyst.priceTargetConsensus(symbol)),
          fmpClient.get<FMPRatings>(fmpClient.analyst.ratingsSnapshot(symbol)),
        ]);

        // Extract quote (first element if array)
        let quote: FMPQuote | null = null;
        if (quoteResponse.status === 'fulfilled') {
          const quoteData = quoteResponse.value;
          quote = Array.isArray(quoteData) ? quoteData[0] : quoteData;
        }

        if (!quote) {
          throw new Error(`Failed to fetch quote for ${symbol}`);
        }

        // Extract price target (may be array)
        let priceTarget: FMPPriceTarget | undefined;
        if (priceTargetResponse.status === 'fulfilled') {
          const value = priceTargetResponse.value;
          priceTarget = Array.isArray(value) && value.length > 0 ? value[0] : value;
        }

        // Extract ratings (may be array)
        let ratings: FMPRatings | undefined;
        if (ratingsResponse.status === 'fulfilled') {
          const value = ratingsResponse.value;
          ratings = Array.isArray(value) && value.length > 0 ? value[0] : value;
        }

        // Map to our format
        const baseData = mapQuoteToUnderlyingData(quote, underlying.initialFixing);
        const completeData = combineUnderlyingData(baseData, priceTarget, ratings);

        // Fetch historical data (1 year)
        let historical: HistoricalPricePoint[] = [];
        try {
          const endDate = new Date().toISOString().split('T')[0];
          const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];

          const historicalResponse = await fmpClient.get<FMPHistoricalResponse | FMPHistoricalPrice[]>(
            fmpClient.historicalPrice.historicalPriceEodFull(symbol, startDate, endDate)
          );

          // Historical prices can be array or object with historical property
          if (historicalResponse) {
            historical = mapHistoricalPrices(
              historicalResponse as any,
              quote.price
            );
          }
        } catch (histError) {
          console.warn(`Failed to fetch historical data for ${symbol}:`, histError);
          // Continue without historical data
        }

        return { data: completeData, historical };
      });

      const results = await Promise.all(promises);
      const allData = results.map((r) => r.data);
      const allHistorical = results.map((r) => r.historical);

      setData(allData);
      setHistoricalData(allHistorical);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch underlying data';
      setError(errorMessage);
      console.error('Error fetching underlying data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(underlyings.map((u) => u.ticker)), enabled]);

  return {
    data,
    historicalData,
    loading,
    error,
    refetch: fetchData,
  };
}

