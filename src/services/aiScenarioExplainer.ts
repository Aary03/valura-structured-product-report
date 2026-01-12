/**
 * AI Scenario Explainer Service
 * Generates detailed AI explanations for each scenario
 * MAXIMIZES OpenAI usage for investor education
 */

import OpenAI from 'openai';
import type { PositionSnapshot } from './positionEvaluator';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

/**
 * Generate AI explanation for a specific scenario
 */
export async function generateScenarioExplanation(context: {
  scenarioName: string;
  level: number;
  snapshot: PositionSnapshot;
}): Promise<string> {
  const { scenarioName, level, snapshot } = context;

  const prompt = `
Explain this investment scenario outcome to a retail investor.

SCENARIO: ${scenarioName}
- Basket Level at Maturity: ${(level * 100).toFixed(0)}%
- Outcome Value: $${snapshot.indicativeOutcomeValue}
- Net P&L: ${snapshot.netPnLPct >= 0 ? '+' : ''}${snapshot.netPnLPct}%
- Settlement: ${snapshot.settlement.type === 'cash' ? 'Cash redemption' : 'Physical share delivery'}
- Risk Status: ${snapshot.riskStatus}
- Reason: ${snapshot.reasonText}

Generate a clear, 2-3 sentence explanation that:
1. Explains what happens in this scenario
2. Why they get cash vs shares
3. What this means for their return

Use simple language. No jargon unless explained. Focus on helping them understand.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You explain structured products to investors. Be clear and educational. 
          Never give investment advice. Only explain mechanics and outcomes based on product rules.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0].message.content || 'Analysis unavailable';
  } catch (error) {
    console.error('AI scenario explanation failed:', error);
    return snapshot.reasonText;
  }
}

/**
 * Generate comparative AI analysis across scenarios
 */
export async function generateScenarioComparison(
  scenarios: Array<{ name: string; snapshot: PositionSnapshot }>
): Promise<string> {
  const best = scenarios.reduce((prev, curr) => 
    curr.snapshot.netPnL > prev.snapshot.netPnL ? curr : prev
  );
  
  const worst = scenarios.reduce((prev, curr) => 
    curr.snapshot.netPnL < prev.snapshot.netPnL ? curr : prev
  );

  const prompt = `
Compare these investment scenarios and provide key insights.

BEST CASE: ${best.name}
- Value: $${best.snapshot.indicativeOutcomeValue}
- P&L: ${best.snapshot.netPnLPct}%
- Settlement: ${best.snapshot.settlement.type}

WORST CASE: ${worst.name}
- Value: $${worst.snapshot.indicativeOutcomeValue}
- P&L: ${worst.snapshot.netPnLPct}%
- Settlement: ${worst.snapshot.settlement.type}

ALL SCENARIOS:
${scenarios.map(s => `- ${s.name}: $${s.snapshot.indicativeOutcomeValue} (${s.snapshot.netPnLPct}%) ${s.snapshot.settlement.type}`).join('\n')}

Generate a 3-4 sentence analysis that:
1. Highlights the range of outcomes (best to worst)
2. Explains what determines cash vs shares
3. Notes any critical threshold levels
4. Helps investor understand the risk/reward profile

Be educational and clear. No predictions or advice.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You explain investment scenarios clearly without giving advice.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    return completion.choices[0].message.content || 'Scenario comparison unavailable';
  } catch (error) {
    console.error('Scenario comparison failed:', error);
    return `Best case: ${best.name} with ${best.snapshot.netPnLPct.toFixed(1)}% return. Worst case: ${worst.name} with ${worst.snapshot.netPnLPct.toFixed(1)}% return.`;
  }
}

/**
 * Generate AI explanation for risk transitions
 */
export async function explainRiskTransition(
  fromStatus: 'SAFE' | 'WATCH' | 'TRIGGERED',
  toStatus: 'SAFE' | 'WATCH' | 'TRIGGERED',
  currentLevel: number,
  barrierLevel: number
): Promise<string> {
  const prompt = `
Explain this risk status change to an investor.

TRANSITION: ${fromStatus} → ${toStatus}
Current Level: ${(currentLevel * 100).toFixed(1)}%
Barrier Level: ${(barrierLevel * 100).toFixed(1)}%

In 2 sentences, explain:
1. What this status change means
2. What they should be aware of

Be clear and calm. No alarmist language. Educational only.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Explain risk changes clearly and calmly. Educational tone.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 200,
    });

    return completion.choices[0].message.content || 'Risk status updated.';
  } catch (error) {
    return `Status changed from ${fromStatus} to ${toStatus}. Current level at ${(currentLevel * 100).toFixed(1)}%.`;
  }
}
