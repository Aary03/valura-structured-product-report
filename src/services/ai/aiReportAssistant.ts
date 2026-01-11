/**
 * AI Report Assistant - Conversational Report Builder
 * Uses GPT-5.2 Thinking for intelligent, context-aware report creation
 */

import type { ReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import type { CapitalProtectedParticipationTerms } from '../../products/capitalProtectedParticipation/terms';
import type { ConversationMode } from '../../types/conversationMode';
import { getModeConfig } from '../../types/conversationMode';
import { enrichMultipleUnderlyings, formatEnrichedDataForAI } from './aiDataEnricher';
import { resolveMultipleCompanies, quickTickerLookup } from './tickerSearch';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Use latest GPT-4o model for best quality and performance
const AI_MODEL = 'gpt-4o';
const FALLBACK_MODEL = 'gpt-4o';

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
  mode: ConversationMode;
  userProfile?: {
    sophistication: 'beginner' | 'intermediate' | 'expert';
    preferences?: Record<string, any>;
  };
}

/**
 * System prompt for AI Report Assistant
 */
function getSystemPrompt(mode: ConversationMode = 'professional'): string {
  const modeConfig = getModeConfig(mode);
  
  return `You are an expert financial advisor and structured products specialist helping users create professional investment reports through natural conversation.

${modeConfig.systemPromptSuffix}

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
User: "70% barrier" → "barrierPct": 0.70 (for RC) OR "bonusBarrierPct": 70 (for Bonus, as integer)
User: "10% coupon" → "couponRatePA": 0.10
User: "12 months" → "tenorMonths": 12
User: "1 year" → "tenorMonths": 12
User: "18 months" → "tenorMonths": 18
User: "quarterly" → "couponFreqPerYear": 4
User: "monthly" → "couponFreqPerYear": 12
User: "106% bonus" → "bonusLevelPct": 106
User: "120% participation" → "participationRatePct": 120

PRODUCTS & REQUIRED FIELDS:
1. Reverse Convertible (RC):
   - barrierPct (0.50-0.90, as decimal)
   - couponRatePA (0.05-0.20, as decimal)
   - couponFreqPerYear (1/2/4/12)
   - tenor (6-36 months)

2. Capital Protected Note (CPPN):
   - capitalProtectionPct (0-100, as integer)
   - participationRatePct (50-200, as integer)
   - participationStartPct (usually 100, as integer)
   - tenor (6-36 months)

3. Bonus Certificate:
   - bonusLevelPct (105-120, as integer %)
   - bonusBarrierPct (50-80, as integer %)
   - participationStartPct (usually 100, as integer %)
   - participationRatePct (usually 100, as integer %)
   - tenor (6-36 months)
   
IMPORTANT: Bonus Certificate needs participation fields! Don't forget them!

VALIDATION RULES & DEFAULTS:
- RC: Barrier 50-90%, Coupon 5-20%, Tenor 6-36 months
- CPPN: Protection 0-100%, Participation 50-200%, Start 100%, Tenor 6-36 months
- Bonus: Bonus 105-120%, Barrier 50-80%, Participation 100%, Start 100%, Tenor 6-36 months

SMART DEFAULTS (apply automatically):
For Bonus Certificate:
  - If bonusBarrierPct provided but not participationStartPct: set participationStartPct = 100
  - If bonusBarrierPct provided but not participationRatePct: set participationRatePct = 100
  - capitalProtectionPct must always = 0 for Bonus

For CPPN:
  - If participationRatePct provided but not participationStartPct: set participationStartPct = 100
  - If not specified, participationDirection = "up"

For RC:
  - If couponRatePA provided but not couponFreqPerYear: set couponFreqPerYear = 4 (quarterly)

TONE:
- Professional but friendly
- Celebrate progress (Great! Perfect! Excellent!)
- When product is Bonus Certificate, automatically add participation fields with defaults
- Don't make users specify obvious defaults

CRITICAL: ALWAYS include [PARAMS] JSON block with ALL fields, including smart defaults.`;
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
    { role: 'system', content: getSystemPrompt(context.mode) },
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
export async function extractParametersFromAI(aiParams: any): Promise<Partial<ReportDraft>> {
  if (!aiParams) return {};

  const extracted: Partial<ReportDraft> = {};

  // Product type
  if (aiParams.productType) {
    extracted.productType = aiParams.productType;
  }

  // Underlyings - Smart ticker resolution
  if (aiParams.underlyings && Array.isArray(aiParams.underlyings)) {
    // Resolve company names to tickers
    const resolved = await Promise.all(
      aiParams.underlyings.map(async (input: string) => {
        // Quick lookup first
        const quick = quickTickerLookup(input);
        if (quick) return { ticker: quick, name: input };

        // If already looks like ticker, use as-is
        if (/^[A-Z]{1,5}$/.test(input.toUpperCase())) {
          return { ticker: input.toUpperCase(), name: input.toUpperCase() };
        }

        // Try intelligent search
        const results = await resolveMultipleCompanies([input]);
        if (results.length > 0) {
          return { ticker: results[0].ticker, name: results[0].name };
        }

        // Fallback
        return { ticker: input.toUpperCase(), name: input };
      })
    );

    extracted.underlyings = resolved;
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
  
  // Apply smart defaults for Bonus Certificate
  if (aiParams.productType === 'Bonus') {
    params.capitalProtectionPct = 0; // Always 0 for bonus
    params.bonusEnabled = true;
    params.participationDirection = 'up';
    
    // Add participation fields with defaults if not provided
    if (!aiParams.participationRatePct) {
      params.participationRatePct = 100; // Default 1:1 participation
    }
    if (!aiParams.participationStartPct) {
      params.participationStartPct = 100; // Default start at 100%
    }
  }

  // Cap
  if (aiParams.capType) {
    params.capType = aiParams.capType;
  }
  if (aiParams.capLevelPct) {
    params.capLevelPct = Number(aiParams.capLevelPct);
  }

  // Smart defaults for other product types
  if (aiParams.productType === 'CPPN') {
    if (params.participationRatePct && !params.participationStartPct) {
      params.participationStartPct = 100;
    }
    if (!params.participationDirection) {
      params.participationDirection = 'up';
    }
  }

  if (aiParams.productType === 'RC') {
    if (params.couponRatePA && !params.couponFreqPerYear) {
      params.couponFreqPerYear = 4; // Default quarterly
    }
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
    productType: 15,
    underlyings: 15,
    notional: 10,
    tenor: 10,
    // Product-specific
    barrier: 12,
    coupon: 12,
    protection: 12,
    participation: 12,
    bonusLevel: 12,
    bonusBarrier: 12,
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
      if (params.couponFreqPerYear) score += weights.coupon;
    } else if (draft.productType === 'CPPN') {
      if (params.capitalProtectionPct !== undefined) score += weights.protection;
      if (params.participationRatePct) score += weights.participation;
      if (params.participationStartPct) score += weights.participation;
    } else if (draft.productType === 'Bonus') {
      // Bonus Certificate requirements
      if (params.bonusLevelPct) score += weights.bonusLevel;
      if (params.bonusBarrierPct) score += weights.bonusBarrier;
      if (params.participationRatePct) score += weights.participation;
      if (params.participationStartPct) score += weights.participation;
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
    if (!params || !params.couponFreqPerYear) missing.push('Coupon Frequency');
  } else if (draft.productType === 'CPPN') {
    if (!params || params.capitalProtectionPct === undefined) missing.push('Capital Protection');
    if (!params || !params.participationRatePct) missing.push('Participation Rate');
    if (!params || !params.participationStartPct) missing.push('Participation Start');
  } else if (draft.productType === 'Bonus') {
    if (!params || !params.bonusLevelPct) missing.push('Bonus Level');
    if (!params || !params.bonusBarrierPct) missing.push('Bonus Barrier');
    if (!params || !params.participationRatePct) missing.push('Participation Rate');
    if (!params || !params.participationStartPct) missing.push('Participation Start');
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

  // Extract parameters from AI's JSON response (now async for ticker search)
  const extracted = extractedParams ? await extractParametersFromAI(extractedParams) : {};

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
export function initializeConversation(mode: ConversationMode = 'professional'): ConversationContext {
  const modeConfig = getModeConfig(mode);
  
  const welcomeMessage: Message = {
    id: 'welcome',
    role: 'assistant',
    content: mode === 'wall-street' 
      ? `${modeConfig.emoji} Ready. What structure?`
      : mode === 'concise'
        ? `${modeConfig.emoji} Product type?`
        : mode === 'beginner-friendly'
          ? `${modeConfig.emoji} Hi! I'm your AI assistant and I'll help you create a structured product report step-by-step. Don't worry if you're new to this - I'll explain everything along the way.\n\nLet's start: What type of investment product would you like to create? I can help with Reverse Convertibles (high income with some risk), Capital Protected Notes (guaranteed principal), or Bonus Certificates (bonus return with barrier).`
          : `${modeConfig.emoji} Hi! I'm your AI Report Assistant.\n\nI'll help you create a professional structured product report through a simple conversation.\n\nWhat would you like to create today?`,
    timestamp: new Date(),
    suggestions: [
      'Reverse Convertible',
      'Capital Protected Note',
      'Bonus Certificate',
    ],
  };

  return {
    state: 'welcome',
    mode,
    draft: {
      completeness: 0,
      missingFields: [],
    },
    messages: [welcomeMessage],
  };
}

