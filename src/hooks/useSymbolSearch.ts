/**
 * useSymbolSearch Hook
 * Search for symbols using FMP API with autocomplete
 */

import { useState, useCallback, useEffect } from 'react';
import { fmpClient } from '../services/api/financialModelingPrep';

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  exchange?: string;
  exchangeShortName?: string;
}

interface UseSymbolSearchResult {
  results: SymbolSearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

/**
 * Search for symbols
 */
export function useSymbolSearch(): UseSymbolSearchResult {
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = fmpClient.search.searchSymbol(query.trim());
      const data = await fmpClient.get<any[]>(url);
      
      // Map to our format
      const mapped: SymbolSearchResult[] = (Array.isArray(data) ? data : []).slice(0, 10).map((item: any) => ({
        symbol: item.symbol || item.ticker || '',
        name: item.name || item.companyName || '',
        exchange: item.exchange,
        exchangeShortName: item.exchangeShortName,
      })).filter((item: SymbolSearchResult) => item.symbol && item.name);

      setResults(mapped);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search symbols';
      setError(errorMessage);
      setResults([]);
      console.error('Symbol search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
}

