/**
 * Intelligent Ticker Search
 * Converts company names to ticker symbols using AI + FMP API
 */

import { fmpClient } from '../api/financialModelingPrep';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface TickerResult {
  ticker: string;
  name: string;
  exchange: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Search for ticker using FMP symbol search
 */
async function searchFMPTicker(query: string): Promise<TickerResult[]> {
  try {
    const searchUrl = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(query)}&limit=10&apikey=${import.meta.env.VITE_FMP_API_KEY}`;
    
    const response = await fetch(searchUrl);
    const results = await response.json();

    if (!Array.isArray(results)) return [];

    return results
      .filter((r: any) => r.symbol && r.name)
      .map((r: any) => ({
        ticker: r.symbol,
        name: r.name,
        exchange: r.exchangeShortName || r.stockExchange || 'NASDAQ',
        confidence: 'high' as const,
      }))
      .slice(0, 5);
  } catch (error) {
    console.error('FMP search failed:', error);
    return [];
  }
}

/**
 * Use AI to extract likely ticker from company name
 */
async function aiTickerGuess(companyName: string): Promise<string | null> {
  if (!OPENAI_API_KEY) return null;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a financial market expert. Given a company name, return ONLY the stock ticker symbol (e.g., "Apple" → "AAPL"). Return only the ticker, nothing else.',
          },
          {
            role: 'user',
            content: `What is the ticker symbol for: ${companyName}`,
          },
        ],
        max_tokens: 10,
        temperature: 0.3,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const ticker = data.choices[0]?.message?.content?.trim().toUpperCase();
    
    // Validate it looks like a ticker (1-5 uppercase letters)
    if (ticker && /^[A-Z]{1,5}$/.test(ticker)) {
      return ticker;
    }

    return null;
  } catch (error) {
    console.error('AI ticker guess failed:', error);
    return null;
  }
}

/**
 * Smart ticker resolution: company name → ticker symbol
 */
export async function resolveCompanyToTicker(input: string): Promise<TickerResult | null> {
  // If already a ticker format, return as-is
  if (/^[A-Z]{1,5}$/.test(input)) {
    return {
      ticker: input,
      name: input,
      exchange: 'NASDAQ',
      confidence: 'high',
    };
  }

  // Try FMP search first
  const fmpResults = await searchFMPTicker(input);
  if (fmpResults.length > 0) {
    return fmpResults[0]; // Return best match
  }

  // Fallback to AI guess
  const aiTicker = await aiTickerGuess(input);
  if (aiTicker) {
    // Validate with FMP
    const validation = await searchFMPTicker(aiTicker);
    if (validation.length > 0) {
      return {
        ...validation[0],
        confidence: 'medium',
      };
    }

    return {
      ticker: aiTicker,
      name: input,
      exchange: 'NASDAQ',
      confidence: 'low',
    };
  }

  return null;
}

/**
 * Resolve multiple company names/tickers
 */
export async function resolveMultipleCompanies(inputs: string[]): Promise<TickerResult[]> {
  const results = await Promise.all(
    inputs.map(input => resolveCompanyToTicker(input))
  );
  return results.filter((r): r is TickerResult => r !== null);
}

/**
 * Common company name mappings (for instant resolution)
 */
const COMMON_MAPPINGS: Record<string, string> = {
  'apple': 'AAPL',
  'microsoft': 'MSFT',
  'google': 'GOOGL',
  'alphabet': 'GOOGL',
  'amazon': 'AMZN',
  'tesla': 'TSLA',
  'meta': 'META',
  'facebook': 'META',
  'nvidia': 'NVDA',
  'netflix': 'NFLX',
  'disney': 'DIS',
  'coca cola': 'KO',
  'pepsi': 'PEP',
  'walmart': 'WMT',
  'jpmorgan': 'JPM',
  'jp morgan': 'JPM',
  'bank of america': 'BAC',
  'goldman sachs': 'GS',
  'morgan stanley': 'MS',
  'visa': 'V',
  'mastercard': 'MA',
  'intel': 'INTC',
  'amd': 'AMD',
  'boeing': 'BA',
  'airbus': 'AIR.PA',
  'exxon': 'XOM',
  'chevron': 'CVX',
  'pfizer': 'PFE',
  'johnson & johnson': 'JNJ',
  'johnson and johnson': 'JNJ',
};

export function quickTickerLookup(companyName: string): string | null {
  const normalized = companyName.toLowerCase().trim();
  return COMMON_MAPPINGS[normalized] || null;
}

