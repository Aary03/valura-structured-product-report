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
    const API_KEY = (import.meta as unknown as { env: { VITE_FMP_API_KEY?: string } }).env.VITE_FMP_API_KEY || 'bEiVRux9rewQy16TXMPxDqBAQGIW8UBd';
    
    // Fetch historical data for each symbol
    const promises = symbols.map(async (symbol) => {
      // Use correct FMP endpoint format: /api/v3/historical-price-full/{symbol}
      const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${fromDate}${toDate ? `&to=${toDate}` : ''}&apikey=${API_KEY}`;
      
      console.log(`Fetching historical data for ${symbol}:`, url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Failed to fetch data for ${symbol}:`, response.status, response.statusText);
        return { symbol, data: [] };
      }
      
      const data = await response.json();
      console.log(`Data for ${symbol}:`, { 
        hasHistorical: !!data.historical, 
        count: data.historical?.length 
      });
      return { symbol, data: data.historical || [] };
    });
    
    const results = await Promise.all(promises);
    
    console.log('FMP Historical Data Results:', results.map(r => ({ 
      symbol: r.symbol, 
      dataPoints: r.data.length 
    })));
    
    // Merge data by date
    const pricesByDate = new Map<string, Record<string, number | string>>();
    
    results.forEach(({ symbol, data }) => {
      if (data && Array.isArray(data)) {
        data.forEach((item: any) => {
          if (item.date) {
            if (!pricesByDate.has(item.date)) {
              pricesByDate.set(item.date, { date: item.date });
            }
            const entry = pricesByDate.get(item.date)!;
            entry[symbol] = item.close || item.price || 0;
          }
        });
      }
    });
    
    // Convert to array and sort by date
    let historicalData = Array.from(pricesByDate.values())
      .sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());
    
    // Limit to reasonable number of points for chart performance (sample every N days if too many)
    const MAX_POINTS = 100;
    if (historicalData.length > MAX_POINTS) {
      const step = Math.ceil(historicalData.length / MAX_POINTS);
      historicalData = historicalData.filter((_, idx) => idx % step === 0 || idx === historicalData.length - 1);
    }
    
    console.log('Merged Historical Data:', {
      totalDays: historicalData.length,
      firstDate: historicalData[0]?.date,
      lastDate: historicalData[historicalData.length - 1]?.date,
      symbols: Object.keys(historicalData[0] || {}).filter(k => k !== 'date'),
      sample: historicalData.slice(0, 3)
    });
    
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
    const API_KEY = (import.meta as unknown as { env: { VITE_FMP_API_KEY?: string } }).env.VITE_FMP_API_KEY || 'bEiVRux9rewQy16TXMPxDqBAQGIW8UBd';
    const quotes: Record<string, number> = {};
    
    // Fetch quotes in parallel using correct FMP endpoint
    const promises = symbols.map(async (symbol) => {
      // Correct FMP quote endpoint: /api/v3/quote/{symbol}
      const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${API_KEY}`;
      
      console.log(`Fetching current quote for ${symbol}:`, url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Failed to fetch quote for ${symbol}:`, response.status, response.statusText);
        return { symbol, price: null };
      }
      
      const data = await response.json();
      console.log(`Quote data for ${symbol}:`, data);
      
      const price = data[0]?.price;
      return { symbol, price };
    });
    
    const results = await Promise.all(promises);
    
    results.forEach(({ symbol, price }) => {
      if (price !== null && !isNaN(price)) {
        quotes[symbol] = price;
      }
    });
    
    console.log('All fetched quotes:', quotes);
    
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
