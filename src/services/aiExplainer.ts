/**
 * AI Position Explainer Service
 * Uses OpenAI GPT-4 to generate rich, investor-friendly explanations
 * 
 * MAXIMIZING AI USAGE:
 * - Position summaries
 * - Scenario insights
 * - Risk analysis
 * - What changed explanations
 * - What to watch guidance
 * - Settlement explanations
 * - Coupon eligibility reasoning
 * 
 * SAFETY CONSTRAINTS:
 * - No investment advice
 * - No buy/sell/hold recommendations
 * - No price predictions
 * - Only mechanics and current state
 */

import type { PositionSnapshot } from './positionEvaluator';
import type { InvestmentPosition } from '../types/investment';

// Use same pattern as existing openai.ts service
const OPENAI_API_KEY = (import.meta as unknown as { env: { VITE_OPENAI_API_KEY?: string } }).env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface AIExplanation {
  headline: string; // One-line summary of current state
  whatChanged?: string; // Recent changes (if historical data available)
  whatToWatch: string; // Key metrics and levels to monitor
  scenarioInsights?: string; // Analysis of scenario outcomes
  riskAnalysis: string; // Risk status explanation
  settlementExplanation: string; // Why cash or physical
  nextSteps?: string; // What investor should consider (NO ADVICE)
  glossaryLinks?: string[]; // Terms to explain
}

/**
 * Generate comprehensive AI explanation for a position
 */
export async function generateAIExplanation(context: {
  productType: string;
  currentSnapshot: PositionSnapshot;
  scenarios?: PositionSnapshot[];
  position: InvestmentPosition;
}): Promise<AIExplanation> {
  const { productType, currentSnapshot, scenarios, position } = context;

  // Build comprehensive prompt
  const prompt = buildPositionExplanationPrompt(context);

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
            content: SYSTEM_PROMPT,
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

    return {
      headline: result.headline || 'Position analysis complete',
      whatChanged: result.whatChanged,
      whatToWatch: result.whatToWatch || 'Monitor key levels and upcoming events',
      scenarioInsights: result.scenarioInsights,
      riskAnalysis: result.riskAnalysis || currentSnapshot.reasonText,
      settlementExplanation: result.settlementExplanation || 'Settlement based on current levels',
      nextSteps: result.nextSteps,
      glossaryLinks: result.glossaryLinks || [],
    };
  } catch (error) {
    console.error('AI explanation failed:', error);
    return getFallbackExplanation(currentSnapshot);
  }
}

/**
 * Generate AI insights for individual scenarios
 */
export async function generateScenarioInsights(
  scenarios: Array<{ name: string; snapshot: PositionSnapshot }>
): Promise<{ [scenarioName: string]: string }> {
  const prompt = `
Analyze these investment scenarios and provide brief, clear explanations for each.

Scenarios:
${scenarios.map(s => `
- ${s.name}: Value ${s.snapshot.indicativeOutcomeValue}, P&L ${s.snapshot.netPnLPct}%, 
  Settlement: ${s.snapshot.settlement.type}, Status: ${s.snapshot.riskStatus}
`).join('\n')}

For each scenario, explain in 1-2 sentences:
- What happens in this scenario
- Why the settlement type is what it is
- Key risk or opportunity

Return as JSON: { "scenarioName": "explanation" }

Remember:
- No investment advice
- No predictions
- Only explain mechanics
- Investor-friendly language
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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return JSON.parse(content || '{}');
  } catch (error) {
    console.error('Scenario insights failed:', error);
    return {};
  }
}

/**
 * Generate AI-powered "What to Watch" insights
 */
export async function generateWhatToWatch(
  snapshot: PositionSnapshot,
  position: InvestmentPosition
): Promise<string> {
  const daysToMaturity = Math.ceil(
    (new Date(position.maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const prompt = `
Investment Position Summary:
- Product: ${position.productTerms.productType}
- Current Value: $${snapshot.indicativeOutcomeValue}
- P&L: ${snapshot.netPnLPct}%
- Risk Status: ${snapshot.riskStatus}
- Days to Maturity: ${daysToMaturity}
- Settlement Type: ${snapshot.settlement.type}
- Key Levels: ${snapshot.keyLevels.map(k => `${k.label} at ${k.level}% (current ${k.current}%)`).join(', ')}

Generate a concise "What to Watch" guidance (2-3 sentences) that tells the investor:
1. The most important levels or events to monitor
2. What could change the outcome
3. Timeline considerations

Be specific about numbers but avoid predictions or advice.
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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Monitor key levels and upcoming events.';
  } catch (error) {
    console.error('What to watch generation failed:', error);
    return 'Monitor your position regularly and watch for barrier levels and coupon dates.';
  }
}

/**
 * System prompt with strict safety constraints
 */
const SYSTEM_PROMPT = `You are an AI assistant explaining structured product positions to retail investors.

STRICT RULES:
1. NO investment advice, recommendations, or predictions
2. NO "buy", "sell", "hold" language
3. NO forecasts about future prices
4. NO promises or guarantees
5. ONLY explain product mechanics, current state, and observable facts

Your role:
- Explain why the current value is what it is
- Clarify product rules and mechanics
- Highlight what levels matter and why
- Use clear, calm, professional language
- Be educational, not prescriptive

Output JSON format:
{
  "headline": "One-line summary of current state",
  "whatChanged": "Recent changes (if applicable)",
  "whatToWatch": "Key levels and events to monitor",
  "scenarioInsights": "Brief analysis of scenario outcomes",
  "riskAnalysis": "Risk status explanation",
  "settlementExplanation": "Why cash or physical delivery",
  "nextSteps": "Neutral considerations (NOT advice)",
  "glossaryLinks": ["term1", "term2"]
}`;

/**
 * Build comprehensive prompt for position explanation
 */
function buildPositionExplanationPrompt(context: {
  productType: string;
  currentSnapshot: PositionSnapshot;
  scenarios?: PositionSnapshot[];
  position: InvestmentPosition;
}): string {
  const { productType, currentSnapshot, scenarios, position } = context;

  return `
Explain this structured product position to an investor.

PRODUCT TYPE: ${productType}

CURRENT STATE:
- Indicative Value (if settled today): $${currentSnapshot.indicativeOutcomeValue}
- Initial Investment: $${currentSnapshot.invested}
- Coupons Received: $${currentSnapshot.couponsReceived}
- Net P&L: $${currentSnapshot.netPnL} (${currentSnapshot.netPnLPct}%)
- Settlement Type: ${currentSnapshot.settlement.type}
- Risk Status: ${currentSnapshot.riskStatus}

KEY LEVELS:
${currentSnapshot.keyLevels.map(k => `- ${k.label}: Target ${k.level}%, Current ${k.current}%, Distance ${k.distance}%, Status: ${k.status}`).join('\n')}

NEXT EVENTS:
${currentSnapshot.nextEvents.slice(0, 3).map(e => `- ${e.label} on ${e.date}${e.amount ? ' ($' + e.amount + ')' : ''}`).join('\n')}

CURRENT REASONING:
${currentSnapshot.reasonText}

${scenarios ? `
MATURITY SCENARIOS:
${scenarios.slice(0, 6).map((s, i) => {
  const names = ['Strong Rally (130%)', 'Moderate Gain (115%)', 'Flat (100%)', 'Moderate Loss (85%)', 'Near Barrier (72%)', 'Deep Loss (50%)'];
  return `- ${names[i]}: Value $${s.indicativeOutcomeValue}, P&L ${s.netPnLPct}%, ${s.settlement.type} settlement, ${s.riskStatus}`;
}).join('\n')}
` : ''}

TASK:
Generate a comprehensive yet concise explanation that helps the investor understand:
1. Current state headline (one sentence)
2. Why the current value is what it is
3. What to monitor going forward
4. How different scenarios play out
5. What the risk status means
6. Why they'd get cash or shares

Use simple language. Focus on mechanics, not predictions. Be helpful but never give advice.

Return as JSON with the specified format.
`;
}

/**
 * Fallback explanation when AI fails
 */
function getFallbackExplanation(snapshot: PositionSnapshot): AIExplanation {
  return {
    headline: `Position currently ${snapshot.riskStatus.toLowerCase()} with ${
      snapshot.netPnLPct >= 0 ? 'profit' : 'loss'
    } of ${snapshot.netPnLPct.toFixed(1)}%`,
    whatToWatch: snapshot.keyLevels.length > 0 
      ? `Monitor ${snapshot.keyLevels[0].label} at ${snapshot.keyLevels[0].level}%`
      : 'Monitor upcoming events and maturity date',
    riskAnalysis: snapshot.reasonText,
    settlementExplanation: snapshot.settlement.type === 'cash' 
      ? 'Cash settlement based on current levels being above protective barriers'
      : 'Physical share delivery triggered by barrier breach',
  };
}

// Cache for AI responses (reduce API costs)
const aiCache = new Map<string, AIExplanation>();

/**
 * Get cache key for a position snapshot
 */
function getCacheKey(snapshot: PositionSnapshot): string {
  return `${snapshot.indicativeOutcomeValue}_${snapshot.riskStatus}_${snapshot.settlement.type}`;
}
