/**
 * Lifecycle Data Service
 * Fetches real market data and generates AI insights for lifecycle products
 */

import { fmpClient } from './api/financialModelingPrep';

// ============================================================================
// FMP DATA FETCHING
// ============================================================================

export interface HistoricalPrice {
  date: string;
  close: number;
  [symbol: string]: number | string;
}

/**
 * Fetch historical prices for multiple symbols from FMP
 */
export async function fetchHistoricalPrices(
  symbols: string[],
  fromDate: string,
  toDate?: string
): Promise<HistoricalPrice[]> {
  try {
    // Fetch historical data for each symbol
    const promises = symbols.map(async (symbol) => {
      const url = fmpClient.historicalPrice.historicalPriceEodLight(symbol, fromDate, toDate);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Failed to fetch data for ${symbol}:`, response.status);
        return { symbol, data: [] };
      }
      
      const data = await response.json();
      return { symbol, data: data.historical || [] };
    });
    
    const results = await Promise.all(promises);
    
    // Merge data by date
    const pricesByDate = new Map<string, Record<string, number | string>>();
    
    results.forEach(({ symbol, data }) => {
      data.forEach((item: any) => {
        if (!pricesByDate.has(item.date)) {
          pricesByDate.set(item.date, { date: item.date });
        }
        const entry = pricesByDate.get(item.date)!;
        entry[symbol] = item.close;
      });
    });
    
    // Convert to array and sort by date
    const historicalData = Array.from(pricesByDate.values())
      .sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());
    
    return historicalData as HistoricalPrice[];
  } catch (error) {
    console.error('Error fetching historical prices:', error);
    return [];
  }
}

/**
 * Fetch current quotes for multiple symbols
 */
export async function fetchCurrentQuotes(symbols: string[]): Promise<Record<string, number>> {
  try {
    const quotes: Record<string, number> = {};
    
    // Fetch quotes in parallel
    const promises = symbols.map(async (symbol) => {
      const url = fmpClient.quoteEndpoints.quote([symbol]);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Failed to fetch quote for ${symbol}:`, response.status);
        return { symbol, price: null };
      }
      
      const data = await response.json();
      const price = data[0]?.price;
      return { symbol, price };
    });
    
    const results = await Promise.all(promises);
    
    results.forEach(({ symbol, price }) => {
      if (price !== null) {
        quotes[symbol] = price;
      }
    });
    
    return quotes;
  } catch (error) {
    console.error('Error fetching current quotes:', error);
    return {};
  }
}

/**
 * Get price at specific date from historical data
 */
export function getPriceAtDate(
  historicalData: HistoricalPrice[],
  symbol: string,
  targetDate: string
): number | null {
  const entry = historicalData.find(item => item.date === targetDate);
  return entry ? (entry[symbol] as number) : null;
}

// ============================================================================
// AI INSIGHTS GENERATION
// ============================================================================

const OPENAI_API_KEY = (import.meta as unknown as { env: { VITE_OPENAI_API_KEY?: string } }).env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface LifecycleInsight {
  riskAssessment: string;
  whatToWatch: string;
  smartSummary: string;
  probabilityAnalysis?: string;
}

/**
 * Generate AI-powered insights for lifecycle product using GPT
 */
export async function generateLifecycleInsights(context: {
  productType: string;
  underlyings: Array<{
    symbol: string;
    name: string;
    initialPrice: number;
    currentPrice: number;
    performancePct: number;
  }>;
  terms: {
    couponRate?: number;
    protectionLevel?: number;
    autocallLevel?: number;
    participationRate?: number;
    bonusLevel?: number;
    barrierLevel?: number;
  };
  daysToMaturity: number;
  progressPct: number;
}): Promise<LifecycleInsight> {
  try {
    const { productType, underlyings, terms, daysToMaturity, progressPct } = context;
    
    const prompt = `You are a structured products analyst evaluating a ${productType} investment.

PRODUCT DETAILS:
- Type: ${productType}
- Days to Maturity: ${daysToMaturity}
- Progress: ${progressPct.toFixed(1)}% elapsed

UNDERLYINGS:
${underlyings.map(u => `
  ${u.symbol} (${u.name}):
  - Initial: $${u.initialPrice.toFixed(2)}
  - Current: $${u.currentPrice.toFixed(2)}
  - Performance: ${u.performancePct.toFixed(2)}%
`).join('')}

PRODUCT TERMS:
${terms.couponRate ? `- Coupon: ${terms.couponRate}% p.a.` : ''}
${terms.protectionLevel ? `- Protection Level: ${terms.protectionLevel}%` : ''}
${terms.autocallLevel ? `- Autocall Trigger: ${terms.autocallLevel}%` : ''}
${terms.participationRate ? `- Participation Rate: ${terms.participationRate}%` : ''}
${terms.bonusLevel ? `- Bonus Level: ${terms.bonusLevel}%` : ''}
${terms.barrierLevel ? `- Barrier: ${terms.barrierLevel}%` : ''}

TASK: Provide a professional analysis in JSON format with exactly these fields:
{
  "riskAssessment": "2-sentence assessment of current risk status and key concerns",
  "whatToWatch": "3 specific metrics or events to monitor closely",
  "smartSummary": "1-sentence plain English summary of where we stand",
  "probabilityAnalysis": "Estimated likelihood of best/worst case scenarios"
}

Keep it concise, actionable, and investor-focused. Use exact field names.`;

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
            content: 'You are a structured products analyst providing concise, actionable insights for investors. Always return valid JSON with the exact field names requested.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    const insights = JSON.parse(content);
    
    return {
      riskAssessment: insights.riskAssessment || 'Analysis in progress',
      whatToWatch: insights.whatToWatch || 'Monitor underlying performance',
      smartSummary: insights.smartSummary || 'Product lifecycle tracking active',
      probabilityAnalysis: insights.probabilityAnalysis,
    };
  } catch (error) {
    console.error('Error generating lifecycle insights:', error);
    
    // Fallback insights
    return {
      riskAssessment: 'Unable to generate AI insights at this time. Monitor underlying performance and key trigger levels.',
      whatToWatch: 'Track price movements relative to protection levels, barrier status, and time to next observation date.',
      smartSummary: 'Product is being monitored. Review terms and current positions regularly.',
      probabilityAnalysis: 'Analysis temporarily unavailable',
    };
  }
}

/**
 * Cache for AI insights (session-based)
 */
const insightsCache = new Map<string, { insights: LifecycleInsight; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedLifecycleInsights(
  cacheKey: string,
  context: Parameters<typeof generateLifecycleInsights>[0]
): Promise<LifecycleInsight> {
  const cached = insightsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.insights;
  }
  
  const insights = await generateLifecycleInsights(context);
  insightsCache.set(cacheKey, { insights, timestamp: Date.now() });
  
  return insights;
}

export function clearInsightsCache(cacheKey?: string) {
  if (cacheKey) {
    insightsCache.delete(cacheKey);
  } else {
    insightsCache.clear();
  }
}
