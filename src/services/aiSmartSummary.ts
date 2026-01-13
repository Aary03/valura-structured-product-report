/**
 * AI Smart Summary Service
 * Generates investor-friendly summaries and educational content
 * MAXIMUM OpenAI usage for comprehensive position intelligence
 */

import type { PositionSnapshot } from './positionEvaluator';
import type { InvestmentPosition } from '../types/investment';

const OPENAI_API_KEY = (import.meta as unknown as { env: { VITE_OPENAI_API_KEY?: string } }).env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface SmartSummary {
  oneLiner: string; // Ultra-concise position summary
  executiveSummary: string; // 3-4 sentence overview
  keyTakeaways: string[]; // Bullet points (3-5)
  upcomingMilestones: string; // What's coming next
  educationalNote: string; // Learn about this product type
  analogyExplanation?: string; // Explain using simple analogy
}

/**
 * Generate smart position summary
 */
export async function generateSmartSummary(
  snapshot: PositionSnapshot,
  position: InvestmentPosition
): Promise<SmartSummary> {
  const terms = position.productTerms;
  const daysToMaturity = Math.ceil(
    (new Date(position.maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const prompt = `
Create an investor-friendly summary of this structured product position.

POSITION:
- Product: ${terms.productType}
- Value if settled today: $${snapshot.indicativeOutcomeValue}
- Initial investment: $${snapshot.invested}
- Coupons received: $${snapshot.couponsReceived}
- Current P&L: ${snapshot.netPnLPct}%
- Settlement: ${snapshot.settlement.type}
- Risk Status: ${snapshot.riskStatus}
- Days to maturity: ${daysToMaturity}

KEY LEVELS:
${snapshot.keyLevels.map(k => `- ${k.label}: ${k.level}% (current ${k.current}%)`).join('\n')}

NEXT EVENTS:
${snapshot.nextEvents.slice(0, 3).map(e => `- ${e.label} on ${e.date}`).join('\n')}

WHY:
${snapshot.reasonText}

Generate JSON:
{
  "oneLiner": "Ultra-concise summary (10 words max)",
  "executiveSummary": "Clear 3-4 sentence overview of position status and outlook",
  "keyTakeaways": ["takeaway1", "takeaway2", "takeaway3"],
  "upcomingMilestones": "What's next (events, observations)",
  "educationalNote": "Brief explanation of how this product type works",
  "analogyExplanation": "Optional: explain using simple everyday analogy"
}

Be clear, educational, and investor-friendly. No jargon without explanation. No advice.
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
            content: `You create clear, educational summaries for retail investors. 
            Focus on understanding, not advice. Use simple language. Be helpful and calm.`,
          },
          {
            role: 'user',
            content: prompt,
          },
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
    const result = JSON.parse(content || '{}');
    return result as SmartSummary;
  } catch (error) {
    console.error('Smart summary generation failed:', error);
    return getFallbackSummary(snapshot);
  }
}

/**
 * Generate "Plain English" explanation
 */
export async function generatePlainEnglishExplanation(
  productType: string,
  snapshot: PositionSnapshot
): Promise<string> {
  const prompt = `
Explain this structured product outcome in the simplest possible terms, as if talking to someone who knows nothing about finance.

Product: ${productType}
Current value if cashed out: $${snapshot.indicativeOutcomeValue}
What they invested: $${snapshot.invested}
Profit/Loss: ${snapshot.netPnLPct}%
Will get: ${snapshot.settlement.type === 'cash' ? 'Cash payment' : 'Company shares'}

Explain in 2-3 sentences using everyday language. No financial jargon. 
Think "explaining to a friend at dinner" level of simplicity.
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
            content: 'Explain complex financial products in the simplest possible terms.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Your investment outcome based on current market conditions.';
  } catch (error) {
    return `Your investment is currently worth $${snapshot.indicativeOutcomeValue}, which is a ${
      snapshot.netPnLPct >= 0 ? 'gain' : 'loss'
    } of ${Math.abs(snapshot.netPnLPct).toFixed(1)}% from your initial $${snapshot.invested}.`;
  }
}

/**
 * Generate comparative analysis between current and scenarios
 */
export async function generateComparativeAnalysis(
  currentSnapshot: PositionSnapshot,
  scenarios: PositionSnapshot[]
): Promise<string> {
  const best = scenarios.reduce((p, c) => c.netPnL > p.netPnL ? c : p);
  const worst = scenarios.reduce((p, c) => c.netPnL < p.netPnL ? c : p);

  const prompt = `
Compare the current position outcome with possible scenarios at maturity.

CURRENT (If Settled Today):
- Value: $${currentSnapshot.indicativeOutcomeValue}
- P&L: ${currentSnapshot.netPnLPct}%
- Type: ${currentSnapshot.settlement.type}

BEST CASE (At Maturity):
- Value: $${best.indicativeOutcomeValue}
- P&L: ${best.netPnLPct}%
- Type: ${best.settlement.type}

WORST CASE (At Maturity):
- Value: $${worst.indicativeOutcomeValue}
- P&L: ${worst.netPnLPct}%
- Type: ${worst.settlement.type}

In 3-4 sentences, help the investor understand:
1. How current state compares to possible outcomes
2. The range of possibilities (upside and downside)
3. What determines which outcome occurs

Educational and clear. No predictions.
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
            content: 'Provide clear comparative analysis without predictions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Scenarios show a range of possible outcomes at maturity.';
  } catch (error) {
    return `Current value is between best case ($${best.indicativeOutcomeValue}) and worst case ($${worst.indicativeOutcomeValue}). Final outcome depends on underlying price levels at maturity.`;
  }
}

/**
 * Fallback summary
 */
function getFallbackSummary(snapshot: PositionSnapshot): SmartSummary {
  return {
    oneLiner: `Position ${snapshot.riskStatus.toLowerCase()}, ${snapshot.netPnLPct >= 0 ? 'profitable' : 'loss'} ${Math.abs(snapshot.netPnLPct).toFixed(1)}%`,
    executiveSummary: snapshot.reasonText,
    keyTakeaways: [
      `Current indicative value: $${snapshot.indicativeOutcomeValue}`,
      `Settlement type: ${snapshot.settlement.type}`,
      `Risk status: ${snapshot.riskStatus}`,
    ],
    upcomingMilestones: snapshot.nextEvents.length > 0 
      ? `Next: ${snapshot.nextEvents[0].label} on ${snapshot.nextEvents[0].date}`
      : 'Approaching maturity',
    educationalNote: 'Structured products combine debt and derivatives for customized risk-return profiles.',
  };
}
