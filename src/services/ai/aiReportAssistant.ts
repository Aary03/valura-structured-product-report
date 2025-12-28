/**
 * AI Report Assistant - Conversational Report Builder
 * Uses GPT-5.2 Thinking for intelligent, context-aware report creation
 */

import type { ReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import type { CapitalProtectedParticipationTerms } from '../../products/capitalProtectedParticipation/terms';
import { enrichMultipleUnderlyings, formatEnrichedDataForAI } from './aiDataEnricher';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Use GPT-4 Turbo (GPT-5.2 not yet in API, will update when available)
const AI_MODEL = 'gpt-4-turbo-preview';
const FALLBACK_MODEL = 'gpt-4o-mini';

export type ProductType = 'RC' | 'CPPN' | 'Bonus';
export type ConversationState = 
  | 'welcome'
  | 'product_selection'
  | 'underlying_selection'
  | 'parameters_collection'
  | 'validation'
  | 'preview'
  | 'complete';

export interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  suggestions?: string[]; // Quick reply buttons
}

export interface ReportDraft {
  productType?: ProductType;
  underlyings?: Array<{ ticker: string; name: string }>;
  parameters?: Partial<ReverseConvertibleTerms | CapitalProtectedParticipationTerms>;
  completeness: number; // 0-100
  missingFields: string[];
}

export interface ConversationContext {
  state: ConversationState;
  draft: ReportDraft;
  messages: Message[];
  userProfile?: {
    sophistication: 'beginner' | 'intermediate' | 'expert';
    preferences?: Record<string, any>;
  };
}

/**
 * System prompt for AI Report Assistant
 */
function getSystemPrompt(): string {
  return `You are an expert financial advisor and structured products specialist helping users create professional investment reports through natural conversation.

YOUR ROLE:
- Guide users through creating structured product reports
- Ask ONE clear question at a time
- Extract parameters from natural language
- Validate inputs and suggest sensible defaults
- Explain financial concepts when needed
- Be friendly, professional, and concise

PRODUCTS YOU HELP CREATE:
1. Reverse Convertible (RC) - High coupon notes with downside risk
2. Capital Protected Participation Note (CPPN) - Protected floor with upside
3. Bonus Certificate - Bonus return if barrier not breached

CONVERSATION FLOW:
1. Welcome → Ask what product they want
2. Product selected → Ask for underlying stocks
3. Underlyings selected → Fetch live data, ask for parameters
4. Parameters collected → Validate and preview
5. Validated → Generate report

PARAMETER EXTRACTION:
When user provides info, extract:
- Tickers (AAPL, MSFT, etc.)
- Amounts ($100k, 100000, etc.)
- Percentages (10%, 70%, etc.)
- Time periods (12 months, 1 year, etc.)

VALIDATION RULES:
- RC: Barrier 50-90%, Coupon 5-20%, Tenor 6-36 months
- CPPN: Protection 0-100%, Participation 50-200%, Tenor 6-36 months
- Bonus: Bonus 105-120%, Barrier 50-80%, Tenor 6-36 months

RESPONSE FORMAT:
- Keep responses under 3 sentences
- Use bullet points for options
- Provide 2-3 quick reply suggestions
- Use emojis sparingly (✅ ⚠️ 💡)

TONE:
- Professional but friendly
- Patient and helpful
- Avoid jargon unless user shows expertise
- Celebrate progress (Great! Perfect! Excellent!)

Remember: You're building trust and making complex finance accessible.`;
}

/**
 * Call OpenAI API with conversation context
 */
async function callAI(
  messages: Array<{ role: string; content: string }>,
  context: ConversationContext
): Promise<{ response: string; suggestions?: string[] }> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  // Add system context about current state
  const systemContext = `
CURRENT STATE: ${context.state}
DRAFT COMPLETENESS: ${context.draft.completeness}%
PRODUCT TYPE: ${context.draft.productType || 'Not selected'}
UNDERLYINGS: ${context.draft.underlyings?.map(u => u.ticker).join(', ') || 'None'}
MISSING FIELDS: ${context.draft.missingFields.join(', ') || 'None'}
`;

  const fullMessages = [
    { role: 'system', content: getSystemPrompt() },
    { role: 'system', content: systemContext },
    ...messages,
  ];

  // Add market data context if available (from enrichment in processUserMessage)
  if ((context as any).marketDataContext) {
    fullMessages.splice(2, 0, {
      role: 'system',
      content: (context as any).marketDataContext,
    });
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: fullMessages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      }),
    });

    if (!response.ok) {
      // Try fallback model
      const fallbackResponse = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: FALLBACK_MODEL,
          messages: fullMessages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!fallbackResponse.ok) {
        throw new Error('AI service unavailable');
      }

      const data = await fallbackResponse.json();
      return parseAIResponse(data.choices[0]?.message?.content || '');
    }

    const data = await response.json();
    return parseAIResponse(data.choices[0]?.message?.content || '');
  } catch (error) {
    console.error('AI call failed:', error);
    throw error;
  }
}

/**
 * Parse AI response and extract suggestions
 */
function parseAIResponse(content: string): { response: string; suggestions?: string[] } {
  // Check if response contains suggestions (format: [SUGGEST: option1, option2, option3])
  const suggestionMatch = content.match(/\[SUGGEST:\s*([^\]]+)\]/);
  
  if (suggestionMatch) {
    const suggestions = suggestionMatch[1]
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    const response = content.replace(/\[SUGGEST:[^\]]+\]/, '').trim();
    return { response, suggestions };
  }

  return { response: content };
}

/**
 * Extract parameters from user message
 */
export async function extractParameters(
  userMessage: string,
  context: ConversationContext
): Promise<Partial<ReportDraft>> {
  const extracted: Partial<ReportDraft> = {};

  // Extract tickers (AAPL, MSFT, GOOGL, etc.)
  const tickerRegex = /\b[A-Z]{1,5}\b/g;
  const tickers = userMessage.match(tickerRegex);
  if (tickers) {
    extracted.underlyings = tickers.map(ticker => ({
      ticker,
      name: ticker, // Will be enriched with real name later
    }));
  }

  // Extract amounts
  const amountRegex = /\$?([\d,]+)k?/gi;
  const amounts = userMessage.match(amountRegex);
  if (amounts) {
    const notional = parseFloat(amounts[0].replace(/[$,k]/gi, '')) * 
      (amounts[0].toLowerCase().includes('k') ? 1000 : 1);
    if (!extracted.parameters) extracted.parameters = {};
    (extracted.parameters as any).notional = notional;
  }

  // Extract percentages
  const percentRegex = /(\d+(?:\.\d+)?)\s*%/g;
  const percents = [...userMessage.matchAll(percentRegex)];
  
  // Extract time periods
  const tenorRegex = /(\d+)\s*(month|year|mo|yr)s?/i;
  const tenorMatch = userMessage.match(tenorRegex);
  if (tenorMatch) {
    const value = parseInt(tenorMatch[1]);
    const unit = tenorMatch[2].toLowerCase();
    const months = unit.startsWith('y') ? value * 12 : value;
    if (!extracted.parameters) extracted.parameters = {};
    (extracted.parameters as any).tenorMonths = months;
  }

  // Detect product type from keywords
  const lowerMessage = userMessage.toLowerCase();
  if (lowerMessage.includes('reverse convertible') || lowerMessage.includes('rc')) {
    extracted.productType = 'RC';
  } else if (lowerMessage.includes('bonus')) {
    extracted.productType = 'Bonus';
  } else if (lowerMessage.includes('capital protected') || lowerMessage.includes('cppn') || lowerMessage.includes('protected')) {
    extracted.productType = 'CPPN';
  }

  return extracted;
}

/**
 * Calculate draft completeness
 */
export function calculateCompleteness(draft: ReportDraft): number {
  let score = 0;
  const weights = {
    productType: 20,
    underlyings: 20,
    notional: 10,
    tenor: 10,
    // Product-specific
    barrier: 15,
    coupon: 15,
    protection: 15,
    participation: 15,
  };

  if (draft.productType) score += weights.productType;
  if (draft.underlyings && draft.underlyings.length > 0) score += weights.underlyings;
  
  const params = draft.parameters as any;
  if (params) {
    if (params.notional) score += weights.notional;
    if (params.tenorMonths) score += weights.tenor;
    
    if (draft.productType === 'RC') {
      if (params.barrierPct || params.strikePct) score += weights.barrier;
      if (params.couponRatePA) score += weights.coupon;
    } else if (draft.productType === 'CPPN' || draft.productType === 'Bonus') {
      if (params.capitalProtectionPct !== undefined) score += weights.protection;
      if (params.participationRatePct) score += weights.participation;
    }
  }

  return Math.min(100, score);
}

/**
 * Get missing fields for current draft
 */
export function getMissingFields(draft: ReportDraft): string[] {
  const missing: string[] = [];

  if (!draft.productType) missing.push('Product Type');
  if (!draft.underlyings || draft.underlyings.length === 0) missing.push('Underlying(s)');

  const params = draft.parameters as any;
  if (!params || !params.notional) missing.push('Notional Amount');
  if (!params || !params.tenorMonths) missing.push('Tenor');

  if (draft.productType === 'RC') {
    if (!params || (!params.barrierPct && !params.strikePct)) missing.push('Barrier/Strike');
    if (!params || !params.couponRatePA) missing.push('Coupon Rate');
  } else if (draft.productType === 'CPPN') {
    if (!params || params.capitalProtectionPct === undefined) missing.push('Capital Protection');
    if (!params || !params.participationRatePct) missing.push('Participation Rate');
    if (!params || !params.participationStartPct) missing.push('Participation Start');
  } else if (draft.productType === 'Bonus') {
    if (!params || !params.bonusLevelPct) missing.push('Bonus Level');
    if (!params || !params.bonusBarrierPct) missing.push('Bonus Barrier');
  }

  return missing;
}

/**
 * Main conversation handler
 */
export async function processUserMessage(
  userMessage: string,
  context: ConversationContext
): Promise<{
  aiResponse: Message;
  updatedContext: ConversationContext;
}> {
  // Extract parameters from user message
  const extracted = await extractParameters(userMessage, context);

  // If new underlyings detected, enrich with live data
  let marketDataContext = '';
  if (extracted.underlyings && extracted.underlyings.length > 0) {
    const tickers = extracted.underlyings.map(u => u.ticker);
    const enrichedData = await enrichMultipleUnderlyings(tickers);
    
    if (enrichedData.length > 0) {
      // Update underlying names with real company names
      extracted.underlyings = enrichedData.map(d => ({
        ticker: d.ticker,
        name: d.name,
      }));
      
      // Format for AI context
      marketDataContext = formatEnrichedDataForAI(enrichedData);
    }
  }

  // Merge extracted parameters with draft
  const updatedDraft: ReportDraft = {
    ...context.draft,
    ...extracted,
    parameters: {
      ...context.draft.parameters,
      ...extracted.parameters,
    },
  };

  // Calculate completeness
  updatedDraft.completeness = calculateCompleteness(updatedDraft);
  updatedDraft.missingFields = getMissingFields(updatedDraft);

  // Determine next state
  let nextState = context.state;
  if (updatedDraft.productType && context.state === 'welcome') {
    nextState = 'product_selection';
  }
  if (updatedDraft.underlyings && updatedDraft.underlyings.length > 0 && context.state === 'product_selection') {
    nextState = 'underlying_selection';
  }
  if (updatedDraft.completeness >= 80) {
    nextState = 'validation';
  }
  if (updatedDraft.completeness === 100) {
    nextState = 'preview';
  }

  // Build conversation history for AI
  const conversationHistory = context.messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
  conversationHistory.push({ role: 'user', content: userMessage });

  // Get AI response
  const updatedContext: ConversationContext = {
    state: nextState,
    draft: updatedDraft,
    messages: context.messages,
    userProfile: context.userProfile,
    ...(marketDataContext ? { marketDataContext } : {}),
  } as ConversationContext;

  const { response, suggestions } = await callAI(conversationHistory, updatedContext);

  const aiMessage: Message = {
    id: `ai-${Date.now()}`,
    role: 'assistant',
    content: response,
    timestamp: new Date(),
    suggestions,
  };

  updatedContext.messages = [...context.messages, aiMessage];

  return {
    aiResponse: aiMessage,
    updatedContext,
  };
}

/**
 * Initialize conversation
 */
export function initializeConversation(): ConversationContext {
  const welcomeMessage: Message = {
    id: 'welcome',
    role: 'assistant',
    content: `Hi! I'm your AI Report Assistant 🤖

I'll help you create a professional structured product report in minutes through a simple conversation.

What would you like to create today?`,
    timestamp: new Date(),
    suggestions: [
      'Reverse Convertible',
      'Capital Protected Note',
      'Bonus Certificate',
    ],
  };

  return {
    state: 'welcome',
    draft: {
      completeness: 0,
      missingFields: [],
    },
    messages: [welcomeMessage],
  };
}

