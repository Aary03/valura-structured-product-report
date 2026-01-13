/**
 * AI Risk Analyzer Service
 * Deep AI-powered risk analysis and monitoring
 * MAXIMIZES OpenAI for comprehensive insights
 */

import type { PositionSnapshot } from './positionEvaluator';
import type { InvestmentPosition } from '../types/investment';

const OPENAI_API_KEY = (import.meta as unknown as { env: { VITE_OPENAI_API_KEY?: string } }).env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface RiskAnalysisResult {
  overallAssessment: string; // Comprehensive risk summary
  keyRisks: string[]; // List of specific risks
  protectiveMeasures: string[]; // What's protecting the investor
  criticalLevels: Array<{
    level: string;
    importance: 'high' | 'medium' | 'low';
    explanation: string;
  }>;
  timeDecay: string; // How risk changes over time
  marketSensitivity: string; // How sensitive to price moves
  worstCaseAnalysis: string; // Deep dive on worst scenario
  bestPathForward: string; // Optimal conditions (NOT advice)
}

/**
 * Generate comprehensive AI risk analysis
 */
export async function generateRiskAnalysis(
  snapshot: PositionSnapshot,
  position: InvestmentPosition
): Promise<RiskAnalysisResult> {
  const daysToMaturity = Math.ceil(
    (new Date(position.maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const prompt = `
Deep risk analysis for a structured product position.

POSITION DETAILS:
- Product Type: ${position.productTerms.productType}
- Current Value: $${snapshot.indicativeOutcomeValue}
- Initial Investment: $${snapshot.invested}
- Net P&L: ${snapshot.netPnLPct}%
- Days to Maturity: ${daysToMaturity}
- Risk Status: ${snapshot.riskStatus}
- Settlement Type: ${snapshot.settlement.type}

KEY LEVELS:
${snapshot.keyLevels.map(k => `- ${k.label}: Target ${k.level}%, Current ${k.current}%, Distance ${k.distance.toFixed(1)}%, Status: ${k.status}`).join('\n')}

REASONING:
${snapshot.reasonText}

Generate a comprehensive risk analysis as JSON:
{
  "overallAssessment": "2-3 sentence summary of the risk profile",
  "keyRisks": ["risk1", "risk2", "risk3"],
  "protectiveMeasures": ["protection1", "protection2"],
  "criticalLevels": [
    {
      "level": "Barrier at 70%",
      "importance": "high",
      "explanation": "why this matters"
    }
  ],
  "timeDecay": "how risk changes as we approach maturity",
  "marketSensitivity": "how much value changes with price moves",
  "worstCaseAnalysis": "detailed analysis of worst scenario",
  "bestPathForward": "optimal conditions (NOT advice, just mechanics)"
}

Be thorough but clear. Educational focus. No advice or predictions.
`;

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
            content: `You are a structured products expert explaining risks to investors. 
            Be comprehensive and educational. Never give investment advice or make predictions.
            Focus on product mechanics and observable facts.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const result = JSON.parse(content || '{}');
    return result as RiskAnalysisResult;
  } catch (error) {
    console.error('Risk analysis failed:', error);
    return getFallbackRiskAnalysis(snapshot);
  }
}

/**
 * Generate AI-powered "What Could Go Wrong" analysis
 */
export async function generateWhatCouldGoWrong(
  snapshot: PositionSnapshot
): Promise<string[]> {
  const prompt = `
List the top 3-5 things that could negatively impact this investment.

Current State:
- Value: $${snapshot.indicativeOutcomeValue}
- Risk Status: ${snapshot.riskStatus}
- Settlement: ${snapshot.settlement.type}
- Key Levels: ${snapshot.keyLevels.map(k => `${k.label} at ${k.level}%`).join(', ')}

Return as JSON array of strings. Each item should be:
- Specific to this product
- Clear and concrete
- NOT predictions, just potential risks
- Educational tone

Example: ["Underlying price falling below 70% barrier triggers share conversion", "Missing coupon payments reduces total return"]
`;

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
          { role: 'system', content: 'List risks clearly without being alarmist.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const result = JSON.parse(content || '{"risks":[]}');
    return result.risks || [];
  } catch (error) {
    return ['Market volatility may impact final value', 'Barrier levels should be monitored'];
  }
}

/**
 * Fallback when AI unavailable
 */
function getFallbackRiskAnalysis(snapshot: PositionSnapshot): RiskAnalysisResult {
  return {
    overallAssessment: `Position is currently ${snapshot.riskStatus.toLowerCase()}. ${snapshot.reasonText}`,
    keyRisks: ['Market price volatility', 'Barrier breach risk'],
    protectiveMeasures: snapshot.keyLevels.filter(k => k.status === 'safe').map(k => `${k.label} protection`),
    criticalLevels: snapshot.keyLevels.map(k => ({
      level: `${k.label} at ${k.level}%`,
      importance: k.status === 'breached' ? 'high' : k.status === 'at_risk' ? 'high' : 'medium',
      explanation: `Current level ${k.current.toFixed(1)}%, distance ${k.distance.toFixed(1)}%`,
    })),
    timeDecay: `${snapshot.nextEvents.length} events remaining before maturity`,
    marketSensitivity: 'Value changes with underlying price movements',
    worstCaseAnalysis: 'In worst scenarios, physical delivery may occur with potential losses',
    bestPathForward: 'Favorable outcomes require levels to remain above protective barriers',
  };
}
