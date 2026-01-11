/**
 * AI Content Generator Service
 * Generates various export formats using OpenAI GPT-4o-mini
 */

import type { ReverseConvertibleReportData } from '../../hooks/useReportGenerator';
import type { CapitalProtectedParticipationReportData } from '../../hooks/useReportGenerator';
import { formatNumber } from '../../core/utils/math';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export type ReportData = ReverseConvertibleReportData | CapitalProtectedParticipationReportData;
export type ProductType = 'RC' | 'CPPN' | 'Bonus Certificate';

export interface GeneratedContent {
  clientEmail: string;
  executiveSummary: string;
  investmentMemo: string;
  faqSheet: string;
  meetingPrep: string;
}

export interface GenerationOptions {
  clientName?: string;
  clientProfile?: 'conservative' | 'moderate' | 'aggressive';
  tone?: 'formal' | 'professional' | 'friendly';
  companyName?: string;
}

/**
 * Call OpenAI API with retry logic
 */
async function callOpenAI(prompt: string, maxTokens: number = 1500): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
  }

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
          content: 'You are an expert financial advisor and structured products specialist. Your writing is clear, professional, and tailored to the audience.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Extract key product information for AI context
 */
function extractProductContext(reportData: ReportData): {
  productType: ProductType;
  productName: string;
  keyFeatures: string[];
  risks: string[];
  scenarios: string[];
  underlyings: string[];
} {
  const terms = reportData.terms;
  const productType: ProductType = terms.productType === 'RC' 
    ? 'RC' 
    : (terms as any).bonusEnabled 
      ? 'Bonus Certificate' 
      : 'CPPN';

  let productName = '';
  let keyFeatures: string[] = [];
  let risks: string[] = [];
  let scenarios: string[] = [];

  if (terms.productType === 'RC') {
    productName = terms.variant === 'standard_barrier_rc' 
      ? 'Reverse Convertible Note'
      : 'Geared Put Reverse Convertible';
    
    keyFeatures = [
      `${formatNumber(terms.couponRatePA * 100, 1)}% annual coupon (${terms.couponFreqPerYear === 12 ? 'monthly' : terms.couponFreqPerYear === 4 ? 'quarterly' : 'semi-annual'})`,
      `${terms.tenorMonths} month tenor`,
      `Barrier: ${formatNumber((terms.barrierPct || terms.strikePct || 0) * 100, 0)}%`,
      terms.basketType === 'worst_of' ? 'Worst-of basket structure' : 'Single underlying',
    ];

    risks = [
      'Share conversion risk if barrier breached',
      'Issuer credit risk',
      'No upside participation (capped at 100%)',
      'Early redemption not available',
    ];

    scenarios = [
      'Above barrier: 100% principal + coupons',
      'Below barrier: Share delivery at reduced value',
    ];
  } else {
    const cppnTerms = terms as any;
    productName = cppnTerms.bonusEnabled 
      ? 'Bonus Certificate'
      : 'Capital Protected Participation Note';

    if (cppnTerms.bonusEnabled) {
      keyFeatures = [
        `Bonus level: ${formatNumber(cppnTerms.bonusLevelPct, 0)}% if barrier not breached`,
        `Barrier: ${formatNumber(cppnTerms.bonusBarrierPct, 0)}%`,
        `${formatNumber(cppnTerms.participationRatePct, 0)}% participation above ${formatNumber(cppnTerms.participationStartPct, 0)}%`,
        `${terms.tenorMonths} month tenor`,
      ];

      risks = [
        'Barrier breach eliminates bonus',
        'Full downside exposure if barrier touched',
        'Issuer credit risk',
      ];

      scenarios = [
        `Barrier not breached: Min ${formatNumber(cppnTerms.bonusLevelPct, 0)}% return`,
        'Barrier breached: 1:1 with underlying',
      ];
    } else {
      keyFeatures = [
        `${formatNumber(cppnTerms.capitalProtectionPct, 0)}% capital protection`,
        `${formatNumber(cppnTerms.participationRatePct, 0)}% upside participation`,
        `Participation starts at ${formatNumber(cppnTerms.participationStartPct, 0)}%`,
        `${terms.tenorMonths} month tenor`,
      ];

      if (cppnTerms.capType === 'capped') {
        keyFeatures.push(`Capped at ${formatNumber(cppnTerms.capLevelPct, 0)}%`);
      }

      risks = [
        cppnTerms.capitalProtectionPct < 100 ? 'Partial protection only' : 'Subject to issuer credit',
        'Limited upside if capped',
        'No interim liquidity',
      ];

      scenarios = [
        `Protected floor: ${formatNumber(cppnTerms.capitalProtectionPct, 0)}%`,
        `Upside: ${formatNumber(cppnTerms.participationRatePct, 0)}% participation`,
      ];
    }
  }

  const underlyings = reportData.underlyingData.map(u => u.name);

  return {
    productType,
    productName,
    keyFeatures,
    risks,
    scenarios,
    underlyings,
  };
}

/**
 * Generate client-ready email template
 */
export async function generateClientEmail(
  reportData: ReportData,
  options: GenerationOptions = {}
): Promise<string> {
  const context = extractProductContext(reportData);
  const clientName = options.clientName || '[Client Name]';
  const clientProfile = options.clientProfile || 'moderate';
  const tone = options.tone || 'professional';

  const prompt = `Generate a professional email to a client about this structured product.

CLIENT CONTEXT:
- Name: ${clientName}
- Risk Profile: ${clientProfile}
- Tone: ${tone}

PRODUCT:
- Type: ${context.productName}
- Underlyings: ${context.underlyings.join(', ')}

KEY FEATURES:
${context.keyFeatures.map(f => `- ${f}`).join('\n')}

RISKS:
${context.risks.map(r => `- ${r}`).join('\n')}

INSTRUCTIONS:
1. Write a warm, professional email (3 paragraphs)
2. Start with a clear introduction of the product
3. Highlight the main benefit (choose based on risk profile)
4. State the key risk honestly but not alarmingly
5. Suggest next steps (call, meeting, questions)
6. Keep it 200-300 words
7. Use plain English, avoid jargon
8. Include a compelling subject line

FORMAT:
Subject: [subject]

Dear ${clientName},

[Body]

Best regards,
[Your name]`;

  return await callOpenAI(prompt, 800);
}

/**
 * Generate executive summary (1-page)
 */
export async function generateExecutiveSummary(
  reportData: ReportData,
  options: GenerationOptions = {}
): Promise<string> {
  const context = extractProductContext(reportData);
  const companyName = options.companyName || 'Your Firm';

  const prompt = `Create a concise 1-page executive summary for an investment committee.

PRODUCT:
- Type: ${context.productName}
- Underlyings: ${context.underlyings.join(', ')}
- Notional: $${formatNumber(reportData.terms.notional, 0)}

KEY FEATURES:
${context.keyFeatures.map(f => `- ${f}`).join('\n')}

RISKS:
${context.risks.map(r => `- ${r}`).join('\n')}

SCENARIOS:
${context.scenarios.map(s => `- ${s}`).join('\n')}

STRUCTURE (use exactly this):

═══════════════════════════════════════
${context.productName.toUpperCase()} - EXECUTIVE SUMMARY
${companyName}
Generated: ${new Date().toLocaleDateString()}
═══════════════════════════════════════

THE OPPORTUNITY
[2-3 sentences: What is this product and why now?]

KEY FEATURES
[4 bullet points of main features]

RISK ASSESSMENT
[1 paragraph: Primary risks and mitigation]

IDEAL INVESTOR PROFILE
[2-3 sentences: Who should invest and why]

SCENARIOS AT MATURITY
[3 scenarios with outcomes]

RECOMMENDATION
[1 sentence: Overall assessment]

Keep it professional, data-driven, and under 400 words total.`;

  return await callOpenAI(prompt, 1200);
}

/**
 * Generate investment committee memo
 */
export async function generateInvestmentMemo(
  reportData: ReportData,
  options: GenerationOptions = {}
): Promise<string> {
  const context = extractProductContext(reportData);
  const companyName = options.companyName || 'Your Firm';

  const prompt = `Create a formal investment committee memo for internal approval.

PRODUCT:
- Type: ${context.productName}
- Underlyings: ${context.underlyings.join(', ')}
- Notional: $${formatNumber(reportData.terms.notional, 0)}
- Tenor: ${reportData.terms.tenorMonths} months

KEY FEATURES:
${context.keyFeatures.map(f => `- ${f}`).join('\n')}

RISKS:
${context.risks.map(r => `- ${r}`).join('\n')}

STRUCTURE (formal memo format):

═══════════════════════════════════════
INVESTMENT COMMITTEE MEMORANDUM
${companyName}
═══════════════════════════════════════

TO: Investment Committee
FROM: [Advisor Name]
DATE: ${new Date().toLocaleDateString()}
RE: ${context.productName} - Approval Request

EXECUTIVE SUMMARY
[3 sentences]

PRODUCT DESCRIPTION
[Detailed explanation of structure]

UNDERLYING ANALYSIS
[Brief analysis of ${context.underlyings.join(' and ')}]

RISK ANALYSIS
[Comprehensive risk breakdown]

REGULATORY & COMPLIANCE
[Suitability considerations]

RECOMMENDATION
[Approve/conditional approval with reasoning]

Use formal, precise language. 400-500 words.`;

  return await callOpenAI(prompt, 1500);
}

/**
 * Generate FAQ sheet
 */
export async function generateFAQSheet(
  reportData: ReportData,
  options: GenerationOptions = {}
): Promise<string> {
  const context = extractProductContext(reportData);

  const prompt = `Create a comprehensive FAQ sheet for this structured product.

PRODUCT:
- Type: ${context.productName}
- Underlyings: ${context.underlyings.join(', ')}

KEY FEATURES:
${context.keyFeatures.map(f => `- ${f}`).join('\n')}

RISKS:
${context.risks.map(r => `- ${r}`).join('\n')}

Generate 8-10 frequently asked questions with clear, honest answers.

CATEGORIES TO COVER:
1. How it works (2-3 questions)
2. Risk & protection (2-3 questions)
3. Payoff scenarios (2 questions)
4. Practical considerations (2 questions)

FORMAT:
═══════════════════════════════════════
${context.productName.toUpperCase()} - FAQ
═══════════════════════════════════════

Q1: [Most common question]
A: [Clear 2-3 sentence answer]

Q2: [Second question]
A: [Clear answer]

[Continue...]

Keep answers concise (2-3 sentences each).
Use plain English.
Be honest about risks and limitations.`;

  return await callOpenAI(prompt, 1500);
}

/**
 * Generate meeting prep pack
 */
export async function generateMeetingPrep(
  reportData: ReportData,
  options: GenerationOptions = {}
): Promise<string> {
  const context = extractProductContext(reportData);
  const clientProfile = options.clientProfile || 'moderate';

  const prompt = `Create a meeting preparation guide for presenting this product to a ${clientProfile} investor.

PRODUCT:
- Type: ${context.productName}
- Underlyings: ${context.underlyings.join(', ')}

KEY FEATURES:
${context.keyFeatures.map(f => `- ${f}`).join('\n')}

RISKS:
${context.risks.map(r => `- ${r}`).join('\n')}

FORMAT:

═══════════════════════════════════════
MEETING PREP - ${context.productName.toUpperCase()}
Client Profile: ${clientProfile}
═══════════════════════════════════════

OPENING PITCH (30 seconds)
[Compelling 2-sentence opener]

KEY TALKING POINTS
1. [Most important benefit]
2. [Secondary benefit]
3. [Risk mitigation]

SCENARIOS TO EMPHASIZE
- [Best case scenario with numbers]
- [Most likely scenario]
- [Downside protection]

OBJECTION HANDLERS
Q: "What if the market crashes?"
A: [Response]

Q: "Can I get out early?"
A: [Response]

Q: "Why this over [alternative]?"
A: [Response]

KEY STATS TO MEMORIZE
- [3-4 crucial numbers]

NEXT STEPS
[Clear call to action]

Be persuasive but honest. Keep it under 400 words.`;

  return await callOpenAI(prompt, 1200);
}

/**
 * Generate all content formats in parallel
 */
export async function generateAllContent(
  reportData: ReportData,
  options: GenerationOptions = {}
): Promise<GeneratedContent> {
  try {
    const [clientEmail, executiveSummary, investmentMemo, faqSheet, meetingPrep] = await Promise.all([
      generateClientEmail(reportData, options),
      generateExecutiveSummary(reportData, options),
      generateInvestmentMemo(reportData, options),
      generateFAQSheet(reportData, options),
      generateMeetingPrep(reportData, options),
    ]);

    return {
      clientEmail,
      executiveSummary,
      investmentMemo,
      faqSheet,
      meetingPrep,
    };
  } catch (error) {
    console.error('Error generating AI content:', error);
    throw error;
  }
}

