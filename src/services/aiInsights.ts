/**
 * AI Investment Insights Service
 * Generate intelligent, actionable insights for investors using GPT-4
 * Now enhanced with real-time market data and comprehensive analysis
 */

import { fetchMarketIntelligence, formatMarketIntelligenceForAI } from './marketIntelligence';

// Get API key from environment variable
const OPENAI_API_KEY = (import.meta as unknown as { env: { VITE_OPENAI_API_KEY?: string } }).env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface InvestmentInsights {
  strengths: string[]; // 3 key strengths
  considerations: string[]; // 3 key considerations/risks
  suitedFor: string; // Who this investment suits
  quickTake: string; // One-line summary
}

interface GenerateInsightsRequest {
  symbol: string;
  companyName: string;
  description: string;
  sector: string;
  industry: string;
  performancePct: number;
  distanceToBarrier: number;
  analystConsensus?: string;
  targetUpside?: number;
  volatility?: number;
  pe?: number;
  beta?: number;
  productType: 'RC' | 'CPPN';
  barrierPct: number;
}

/**
 * Generate AI-powered investment insights (ENHANCED with real-time data)
 */
export async function generateInvestmentInsights(
  request: GenerateInsightsRequest
): Promise<InvestmentInsights | null> {
  try {
    const {
      symbol,
      companyName,
      description,
      sector,
      industry,
      performancePct,
      distanceToBarrier,
      analystConsensus,
      targetUpside,
      volatility,
      beta,
      productType,
      barrierPct,
    } = request;

    // Fetch real-time market intelligence
    const marketIntel = await fetchMarketIntelligence(symbol);
    const marketContext = formatMarketIntelligenceForAI(marketIntel);

    const productName = productType === 'RC' ? 'Reverse Convertible' : 'Capital Protected Participation Note';
    const barrierText = productType === 'RC' ? `${(barrierPct * 100).toFixed(0)}% barrier` : `${(barrierPct * 100).toFixed(0)}% participation start`;

    // Calculate key risk metrics
    const bufferToBarrier = distanceToBarrier;
    const priceFromHigh = ((marketIntel.livePrice - marketIntel.fiftyTwoWeekHigh) / marketIntel.fiftyTwoWeekHigh) * 100;
    const priceFromLow = ((marketIntel.livePrice - marketIntel.fiftyTwoWeekLow) / marketIntel.fiftyTwoWeekLow) * 100;

    const prompt = `You are an expert investment analyst with access to REAL-TIME market data. Provide insights for a structured product.

====================================
COMPANY OVERVIEW
====================================
Company: ${companyName} (${symbol})
Sector: ${sector} - ${industry}
Description: ${description.substring(0, 400)}

====================================
REAL-TIME MARKET INTELLIGENCE
====================================
${marketContext}

====================================
PRODUCT STRUCTURE
====================================
Product Type: ${productName}
Barrier/Protection Level: ${barrierText}
Current Distance to Barrier: ${distanceToBarrier >= 0 ? '+' : ''}${distanceToBarrier.toFixed(1)} percentage points
Buffer Zone: ${bufferToBarrier > 0 ? `${bufferToBarrier.toFixed(1)}% cushion` : 'AT RISK - Below barrier'}

Performance vs Reference Price: ${performancePct >= 0 ? '+' : ''}${performancePct.toFixed(1)}%
Position in 52-Week Range: ${priceFromLow.toFixed(0)}% from low, ${Math.abs(priceFromHigh).toFixed(0)}% from high
${analystConsensus ? `Analyst Consensus: ${analystConsensus}` : ''}
${targetUpside ? `Price Target Upside: ${targetUpside.toFixed(1)}%` : ''}
${volatility ? `30-Day Volatility: ${(volatility * 100).toFixed(1)}%` : ''}
${beta ? `Beta (Market Sensitivity): ${beta.toFixed(2)}` : ''}

====================================
ANALYST INSTRUCTIONS
====================================

Provide investment insights in this EXACT JSON format (no markdown, no code blocks):
{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "considerations": ["consideration 1", "consideration 2", "consideration 3"],
  "suitedFor": "one sentence describing ideal investor profile",
  "quickTake": "one sentence overall assessment"
}

ANALYSIS GUIDELINES:
- Use REAL-TIME price data and market conditions in your analysis
- Consider insider/institutional sentiment when assessing conviction
- Reference technical position (distance from moving averages, 52-week range)
- Factor in valuation metrics (P/E, PEG, growth rates)
- Assess financial health (margins, ratios) for downside protection
- Evaluate barrier risk based on volatility and current buffer
- Consider sector performance and recent events

STRENGTHS - Focus on:
• Positive growth trends and financial strength
• Favorable market sentiment (insider/institutional)
• Adequate buffer to barrier/protection level
• Strong technical position or momentum
• Attractive valuation or margin of safety

CONSIDERATIONS - Focus on:
• Volatility risks relative to barrier proximity
• Valuation concerns or negative growth trends
• Weak insider/institutional sentiment
• Technical weakness or overbought conditions
• Sector headwinds or company-specific risks

SUITED FOR:
• Define risk tolerance based on barrier proximity and volatility
• Match investment goals to product structure
• Consider time horizon and income needs

QUICK TAKE:
• One balanced sentence capturing risk/reward profile
• Reference current market conditions
• Be specific to THIS investment right now

FORMAT REQUIREMENTS:
- Keep each point under 15 words
- Use professional but accessible language
- Be specific and actionable (no generic advice)
- Reference specific data points when relevant`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert investment analyst. Always respond with valid JSON only, no markdown formatting.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return null;
    }

    const insights = JSON.parse(content);
    return insights as InvestmentInsights;
  } catch (error) {
    console.error('Error generating investment insights:', error);
    return null;
  }
}

/**
 * Ask a custom question about the investment (ENHANCED with real-time data)
 */
export async function askAIQuestion(
  question: string,
  context: {
    symbol: string;
    companyName: string;
    description: string;
    productType: string;
    currentMetrics: string;
  }
): Promise<string> {
  try {
    // Fetch fresh market intelligence for the question
    const marketIntel = await fetchMarketIntelligence(context.symbol);
    const marketContext = formatMarketIntelligenceForAI(marketIntel);

    const prompt = `You are an expert investment analyst with REAL-TIME market data. Answer the investor's question about this structured product.

====================================
COMPANY: ${context.companyName} (${context.symbol})
PRODUCT: ${context.productType}
====================================

COMPANY CONTEXT:
${context.description.substring(0, 300)}

PRODUCT METRICS:
${context.currentMetrics}

REAL-TIME MARKET DATA:
${marketContext}

====================================
INVESTOR QUESTION:
${question}
====================================

Provide a clear, professional answer in 2-4 sentences. Use the REAL-TIME market data in your response. Be specific, actionable, and reference actual numbers when relevant.`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert investment analyst providing clear, actionable answers.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      return 'Unable to generate answer at this time.';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Unable to generate answer.';
  } catch (error) {
    console.error('Error asking AI question:', error);
    return 'Unable to generate answer at this time.';
  }
}

