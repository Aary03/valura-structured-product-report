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
- Extract ALL parameters from EVERY user message
- Ask ONE clear question at a time for missing info
- Validate inputs and suggest sensible defaults
- Be friendly, professional, and concise

CRITICAL: PARAMETER EXTRACTION
After EVERY user message, you MUST extract parameters in JSON format at the END of your response.

FORMAT YOUR RESPONSE LIKE THIS:
[Your conversational response here]

[PARAMS]
{
  "productType": "RC" | "CPPN" | "Bonus" | null,
  "underlyings": ["AAPL", "MSFT"] or null,
  "notional": 100000 (as number, not string),
  "tenorMonths": 12 (as number),
  "barrierPct": 0.70 (as decimal, 70% = 0.70),
  "couponRatePA": 0.10 (as decimal, 10% = 0.10),
  "couponFreqPerYear": 4 (1=annual, 2=semi, 4=quarterly, 12=monthly),
  "participationRatePct": 120 (as integer),
  "capitalProtectionPct": 100 (as integer),
  "bonusLevelPct": 108,
  "bonusBarrierPct": 60
}
[/PARAMS]

PARSING EXAMPLES:
User: "100k" → "notional": 100000
User: "100,000" → "notional": 100000
User: "$100k" → "notional": 100000
User: "70% barrier" → "barrierPct": 0.70
User: "10% coupon" → "couponRatePA": 0.10
User: "12 months" → "tenorMonths": 12
User: "1 year" → "tenorMonths": 12
User: "18 months" → "tenorMonths": 18
User: "quarterly" → "couponFreqPerYear": 4
User: "monthly" → "couponFreqPerYear": 12

PRODUCTS:
1. Reverse Convertible (RC) - needs: barrier, coupon, tenor
2. Capital Protected Note (CPPN) - needs: protection, participation, tenor
3. Bonus Certificate - needs: bonus level, barrier, tenor

VALIDATION RULES:
- RC: Barrier 50-90%, Coupon 5-20%, Tenor 6-36 months
- CPPN: Protection 0-100%, Participation 50-200%, Tenor 6-36 months
- Bonus: Bonus 105-120%, Barrier 50-80%, Tenor 6-36 months

TONE:
- Professional but friendly
- Celebrate progress (Great! Perfect! Excellent!)
- Ask for missing info clearly

CRITICAL: ALWAYS include [PARAMS] JSON block, even if no new params extracted (use null for unchanged values).`;
}

/**
 * Call OpenAI API with conversation context
 */
async function callAI(
  messages: Array<{ role: string; content: string }>,
  context: ConversationContext
): Promise<{ response: string; suggestions?: string[]; extractedParams?: any }> {
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
    const aiMessage = data.choices[0]?.message?.content || '';
    return parseAIResponse(aiMessage);
  } catch (error) {
    console.error('AI call failed:', error);
    throw error;
  }
}

/**
 * Parse AI response and extract suggestions + parameters
 */
function parseAIResponse(content: string): { 
  response: string; 
  suggestions?: string[];
  extractedParams?: any;
} {
  let response = content;
  let suggestions: string[] | undefined;
  let extractedParams: any | undefined;

  // Extract [PARAMS] JSON block
  const paramsMatch = content.match(/\[PARAMS\]([\s\S]*?)\[\/PARAMS\]/);
  if (paramsMatch) {
    try {
      const jsonStr = paramsMatch[1].trim();
      extractedParams = JSON.parse(jsonStr);
      response = content.replace(/\[PARAMS\][\s\S]*?\[\/PARAMS\]/, '').trim();
    } catch (err) {
      console.error('Failed to parse AI parameters:', err);
    }
  }

  // Check if response contains suggestions (format: [SUGGEST: option1, option2, option3])
  const suggestionMatch = response.match(/\[SUGGEST:\s*([^\]]+)\]/);
  if (suggestionMatch) {
    suggestions = suggestionMatch[1]
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    response = response.replace(/\[SUGGEST:[^\]]+\]/, '').trim();
  }

  return { response, suggestions, extractedParams };
}

/**
 * Extract parameters from AI's structured JSON response
 */
export function extractParametersFromAI(aiParams: any): Partial<ReportDraft> {
  if (!aiParams) return {};

  const extracted: Partial<ReportDraft> = {};

  // Product type
  if (aiParams.productType) {
    extracted.productType = aiParams.productType;
  }

  // Underlyings
  if (aiParams.underlyings && Array.isArray(aiParams.underlyings)) {
    extracted.underlyings = aiParams.underlyings.map((ticker: string) => ({
      ticker: ticker.toUpperCase(),
      name: ticker.toUpperCase(), // Will be enriched later
    }));
  }

  // Parameters object
  const params: any = {};
  
  if (aiParams.notional) params.notional = Number(aiParams.notional);
  if (aiParams.tenorMonths) params.tenorMonths = Number(aiParams.tenorMonths);
  
  // RC-specific
  if (aiParams.barrierPct !== undefined && aiParams.barrierPct !== null) {
    params.barrierPct = Number(aiParams.barrierPct);
  }
  if (aiParams.strikePct !== undefined && aiParams.strikePct !== null) {
    params.strikePct = Number(aiParams.strikePct);
  }
  if (aiParams.couponRatePA !== undefined && aiParams.couponRatePA !== null) {
    params.couponRatePA = Number(aiParams.couponRatePA);
  }
  if (aiParams.couponFreqPerYear) {
    params.couponFreqPerYear = Number(aiParams.couponFreqPerYear);
  }
  
  // CPPN-specific
  if (aiParams.capitalProtectionPct !== undefined && aiParams.capitalProtectionPct !== null) {
    params.capitalProtectionPct = Number(aiParams.capitalProtectionPct);
  }
  if (aiParams.participationRatePct) {
    params.participationRatePct = Number(aiParams.participationRatePct);
  }
  if (aiParams.participationStartPct) {
    params.participationStartPct = Number(aiParams.participationStartPct);
  }
  if (aiParams.participationDirection) {
    params.participationDirection = aiParams.participationDirection;
  }
  
  // Bonus-specific
  if (aiParams.bonusLevelPct) {
    params.bonusLevelPct = Number(aiParams.bonusLevelPct);
  }
  if (aiParams.bonusBarrierPct) {
    params.bonusBarrierPct = Number(aiParams.bonusBarrierPct);
  }

  // Cap
  if (aiParams.capType) {
    params.capType = aiParams.capType;
  }
  if (aiParams.capLevelPct) {
    params.capLevelPct = Number(aiParams.capLevelPct);
  }

  if (Object.keys(params).length > 0) {
    extracted.parameters = params;
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
  // Build conversation history for AI
  const conversationHistory = context.messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
  conversationHistory.push({ role: 'user', content: userMessage });

  // Call AI to get response AND structured parameter extraction
  const tempContext: ConversationContext = {
    ...context,
  };

  const { response, suggestions, extractedParams } = await callAI(conversationHistory, tempContext);

  // Extract parameters from AI's JSON response
  const extracted = extractedParams ? extractParametersFromAI(extractedParams) : {};

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

  // Merge extracted parameters with existing draft
  const updatedDraft: ReportDraft = {
    ...context.draft,
    productType: extracted.productType || context.draft.productType,
    underlyings: extracted.underlyings || context.draft.underlyings,
    parameters: {
      ...context.draft.parameters,
      ...extracted.parameters,
    },
    completeness: 0,
    missingFields: [],
  };

  // Calculate completeness
  updatedDraft.completeness = calculateCompleteness(updatedDraft);
  updatedDraft.missingFields = getMissingFields(updatedDraft);

  // Determine next state
  let nextState = context.state;
  if (updatedDraft.productType && context.state === 'welcome') {
    nextState = 'product_selection';
  }
  if (updatedDraft.underlyings && updatedDraft.underlyings.length > 0 && (context.state === 'welcome' || context.state === 'product_selection')) {
    nextState = 'underlying_selection';
  }
  if (updatedDraft.completeness >= 50 && updatedDraft.completeness < 80) {
    nextState = 'parameters_collection';
  }
  if (updatedDraft.completeness >= 80) {
    nextState = 'validation';
  }
  if (updatedDraft.completeness === 100) {
    nextState = 'preview';
  }

  // Create user and AI messages
  const userMsg: Message = {
    id: `user-${Date.now()}`,
    role: 'user',
    content: userMessage,
    timestamp: new Date(),
  };

  const aiMessage: Message = {
    id: `ai-${Date.now() + 1}`,
    role: 'assistant',
    content: response,
    timestamp: new Date(),
    suggestions,
  };

  // Create updated context
  const updatedContext: ConversationContext = {
    state: nextState,
    draft: updatedDraft,
    messages: [...context.messages, userMsg, aiMessage],
    userProfile: context.userProfile,
    ...(marketDataContext ? { marketDataContext } : {}),
  } as ConversationContext;

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

