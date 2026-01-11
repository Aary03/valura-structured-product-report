/**
 * Why This Stock? AI Service
 * Generate comprehensive explanations for why a specific stock is suitable for a structured product
 * Covers product suitability, investment thesis, and risk/reward profile
 */

// Get API key from environment variable
const OPENAI_API_KEY = (import.meta as unknown as { env: { VITE_OPENAI_API_KEY?: string } }).env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface WhyThisStockRequest {
  // Company data
  symbol: string;
  companyName: string;
  description: string;
  sector: string;
  industry: string;
  
  // Market data
  spotPrice: number;
  performancePct: number;
  distanceToBarrier: number;
  volatility30d?: number;
  beta?: number;
  analystConsensus?: string;
  targetUpside?: number;
  momentum20d?: number;
  pe?: number;
  marketCap?: number;
  
  // Product structure
  productType: 'RC' | 'CPPN';
  productTerms: {
    barrierPct?: number; // RC
    couponRatePct?: number; // RC
    couponFreqPerYear?: number; // RC
    participationStartPct?: number; // CPPN
    participationRatePct?: number;
    capitalProtectionPct?: number;
    bonusLevelPct?: number; // Bonus cert
    bonusBarrierPct?: number; // Bonus cert
    capLevelPct?: number;
    knockInEnabled?: boolean;
    knockInLevelPct?: number;
  };
  
  // Basket context (if multiple underlyings)
  basketType?: 'single' | 'worst_of' | 'best_of' | 'average';
  basketPosition?: string; // e.g., "worst performer", "best performer"
}

export interface WhyThisStockResponse {
  productSuitability: {
    headline: string; // One-line summary
    points: string[]; // 3-4 bullet points
  };
  investmentThesis: {
    headline: string;
    points: string[];
  };
  riskReward: {
    headline: string;
    upsideScenario: string;
    downsideScenario: string;
    keyRisks: string[];
  };
  recentNews: Array<{
    headline: string;
    summary: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    source: string;
    date: string;
  }>;
  bottomLine: string; // 2-3 sentence conclusion
}

/**
 * Generate "Why This Stock?" explanation using GPT-4
 */
export async function generateWhyThisStock(
  request: WhyThisStockRequest
): Promise<WhyThisStockResponse | null> {
  try {
    const {
      symbol,
      companyName,
      description,
      sector,
      industry,
      spotPrice,
      performancePct,
      distanceToBarrier,
      volatility30d,
      beta,
      analystConsensus,
      targetUpside,
      momentum20d,
      pe,
      marketCap,
      productType,
      productTerms,
      basketType,
      basketPosition,
    } = request;

    // Build product context string
    const productName = productType === 'RC' ? 'Reverse Convertible' : 
      productTerms.bonusLevelPct ? 'Bonus Certificate' : 'Capital Protected Participation Note';
    
    let productContext = '';
    
    if (productType === 'RC') {
      const barrier = productTerms.barrierPct ? (productTerms.barrierPct * 100).toFixed(0) : 'N/A';
      const coupon = productTerms.couponRatePct?.toFixed(2) || 'N/A';
      const freq = productTerms.couponFreqPerYear || 1;
      productContext = `
PRODUCT STRUCTURE (Reverse Convertible):
- Barrier Level: ${barrier}% (protection level - if breached, convert to shares)
- Coupon Rate: ${coupon}% paid ${freq}x per year
- Current Distance to Barrier: ${distanceToBarrier >= 0 ? '+' : ''}${distanceToBarrier.toFixed(1)} percentage points
- Risk Profile: High income, conditional downside protection
`;
    } else {
      // CPPN or Bonus Certificate
      const isBonusCert = productTerms.bonusLevelPct != null;
      
      if (isBonusCert) {
        const bonusLevel = productTerms.bonusLevelPct?.toFixed(0) || 'N/A';
        const bonusBarrier = productTerms.bonusBarrierPct ? (productTerms.bonusBarrierPct * 100).toFixed(0) : 'N/A';
        const partRate = productTerms.participationRatePct?.toFixed(0) || '100';
        const partStart = productTerms.participationStartPct?.toFixed(0) || '100';
        
        productContext = `
PRODUCT STRUCTURE (Bonus Certificate):
- Bonus Level: ${bonusLevel}% (guaranteed if barrier never breached)
- Bonus Barrier: ${bonusBarrier}% (must NOT touch during product life)
- Participation: ${partRate}% above ${partStart}%
- Current Distance to Barrier: ${distanceToBarrier >= 0 ? '+' : ''}${distanceToBarrier.toFixed(1)} percentage points
- Risk Profile: High reward if barrier not breached, 1:1 downside if breached
`;
      } else {
        const capProt = productTerms.capitalProtectionPct?.toFixed(0) || '0';
        const partRate = productTerms.participationRatePct?.toFixed(0) || '100';
        const partStart = productTerms.participationStartPct?.toFixed(0) || '100';
        const knockIn = productTerms.knockInEnabled ? `${(productTerms.knockInLevelPct! * 100).toFixed(0)}%` : 'None';
        
        productContext = `
PRODUCT STRUCTURE (Capital Protected Participation Note):
- Capital Protection: ${capProt}% (minimum return)
- Participation: ${partRate}% above ${partStart}%
- Knock-In Level: ${knockIn}
${productTerms.capLevelPct ? `- Cap Level: ${productTerms.capLevelPct.toFixed(0)}%` : '- No Cap (unlimited upside)'}
- Current Distance to Participation Start: ${distanceToBarrier >= 0 ? '+' : ''}${distanceToBarrier.toFixed(1)} percentage points
- Risk Profile: Protected downside, leveraged upside
`;
      }
    }

    // Build market context
    const marketContext = `
CURRENT MARKET POSITION:
- Spot Price: $${spotPrice.toFixed(2)}
- Performance vs Initial: ${performancePct >= 0 ? '+' : ''}${performancePct.toFixed(1)}%
${volatility30d ? `- 30-Day Volatility: ${(volatility30d * 100).toFixed(1)}% annualized` : ''}
${beta ? `- Beta (Market Sensitivity): ${beta.toFixed(2)}` : ''}
${momentum20d ? `- 20-Day Momentum: ${momentum20d >= 0 ? '+' : ''}${momentum20d.toFixed(1)}%` : ''}
${analystConsensus ? `- Analyst Consensus: ${analystConsensus}` : ''}
${targetUpside ? `- Target Upside to Consensus: ${targetUpside >= 0 ? '+' : ''}${targetUpside.toFixed(1)}%` : ''}
${pe ? `- P/E Ratio: ${pe.toFixed(1)}` : ''}
${marketCap ? `- Market Cap: $${(marketCap / 1e9).toFixed(1)}B` : ''}
`;

    // Build basket context
    let basketContext = '';
    if (basketType && basketType !== 'single') {
      basketContext = `
BASKET CONTEXT:
- Basket Type: ${basketType.replace('_', ' ').toUpperCase()}
${basketPosition ? `- Position in Basket: ${basketPosition}` : ''}
- Note: Payoff is determined by the ${basketType === 'worst_of' ? 'worst' : basketType === 'best_of' ? 'best' : 'average'} performer
`;
    }

    const systemPrompt = `You are an expert structured products analyst with deep knowledge of equity-linked instruments.
Your role is to explain why specific stocks are suitable for structured products in a clear,
professional manner that helps investors make informed decisions.

Focus on:
1. Product-specific factors (barrier distance, volatility alignment, participation potential)
2. Investment fundamentals (growth, valuation, analyst views)
3. Risk-reward balance specific to this product structure

Be concise, factual, and investor-friendly. Avoid jargon. Use bullet points.
Format your response as valid JSON matching the required structure.`;

    const userPrompt = `Analyze why ${companyName} (${symbol}) is suitable for this ${productName}:

COMPANY PROFILE:
- Sector: ${sector} | Industry: ${industry}
- Description: ${description.substring(0, 500)}${description.length > 500 ? '...' : ''}

${marketContext}

${productContext}

${basketContext}

TASK:
Generate a comprehensive but concise analysis explaining why this stock fits this product.
Focus on how the stock's characteristics align with the product's structure and objectives.
Also include recent relevant news/developments that provide investment context.

FORMAT (respond with ONLY valid JSON, no markdown):
{
  "productSuitability": {
    "headline": "One-line summary of why this stock fits the product",
    "points": [
      "First key point about product fit",
      "Second key point about product fit",
      "Third key point about product fit"
    ]
  },
  "investmentThesis": {
    "headline": "One-line investment thesis",
    "points": [
      "First fundamental strength or opportunity",
      "Second fundamental strength or opportunity",
      "Third fundamental strength or opportunity"
    ]
  },
  "riskReward": {
    "headline": "One-line risk/reward summary",
    "upsideScenario": "What happens in best case scenario (1-2 sentences)",
    "downsideScenario": "What happens in worst case scenario (1-2 sentences)",
    "keyRisks": [
      "First key risk to monitor",
      "Second key risk to monitor"
    ]
  },
  "recentNews": [
    {
      "headline": "Recent relevant news headline",
      "summary": "Brief summary of the news and its investment impact",
      "sentiment": "positive" | "neutral" | "negative",
      "source": "Realistic source (Bloomberg, Reuters, CNBC, WSJ, etc.)",
      "date": "Recent date (e.g., 'Jan 11, 2026')"
    }
  ],
  "bottomLine": "2-3 sentence conclusion summarizing why this stock makes sense for this product"
}

IMPORTANT:
- Include 2-3 recent news items that are investment-relevant
- News should be realistic and contextual to the company/sector
- Focus on material developments (earnings, products, analyst actions, regulatory)
- Keep all points concise and actionable`;

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
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No content generated');
    }

    // Parse JSON response
    const parsed = JSON.parse(content);
    
    // Validate structure
    if (!parsed.productSuitability || !parsed.investmentThesis || !parsed.riskReward || !parsed.bottomLine) {
      throw new Error('Invalid response structure');
    }

    return parsed as WhyThisStockResponse;
  } catch (error) {
    console.error('Error generating Why This Stock explanation:', error);
    return null;
  }
}

/**
 * Generate a cache key for storing/retrieving Why This Stock responses
 */
export function getWhyThisStockCacheKey(symbol: string, productTerms: WhyThisStockRequest['productTerms']): string {
  // Create a hash of product terms for cache key
  const termsStr = JSON.stringify(productTerms);
  return `why_${symbol}_${btoa(termsStr).substring(0, 20)}`;
}

/**
 * Get cached Why This Stock response (session storage)
 */
export function getCachedWhyThisStock(symbol: string, productTerms: WhyThisStockRequest['productTerms']): WhyThisStockResponse | null {
  try {
    const key = getWhyThisStockCacheKey(symbol, productTerms);
    const cached = sessionStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Failed to get cached Why This Stock:', error);
  }
  return null;
}

/**
 * Cache Why This Stock response (session storage)
 */
export function cacheWhyThisStock(symbol: string, productTerms: WhyThisStockRequest['productTerms'], response: WhyThisStockResponse): void {
  try {
    const key = getWhyThisStockCacheKey(symbol, productTerms);
    sessionStorage.setItem(key, JSON.stringify(response));
  } catch (error) {
    console.warn('Failed to cache Why This Stock:', error);
  }
}
