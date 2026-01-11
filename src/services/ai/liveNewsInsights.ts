/**
 * Live News Insights Service
 * Uses ChatGPT to generate recent market developments and news insights
 * GPT provides contextual news and developments based on company knowledge
 */

const OPENAI_API_KEY = (import.meta as unknown as { env: { VITE_OPENAI_API_KEY?: string } }).env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface LiveNewsInsight {
  headline: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  relevance: 'high' | 'medium' | 'low';
  summary: string; // One-line summary
  source: string;
  date: string;
}

export interface LiveNewsFacts {
  latestNews: LiveNewsInsight[];
  keyDevelopments: string[]; // 3-4 bullet points synthesizing news
  marketSentiment: {
    overall: 'bullish' | 'neutral' | 'bearish';
    confidence: 'high' | 'medium' | 'low';
    summary: string;
  };
}

/**
 * Generate news insights using ChatGPT's knowledge
 */
export async function generateLiveNewsInsights(
  symbol: string,
  companyName: string,
  sector?: string,
  industry?: string
): Promise<LiveNewsFacts | null> {
  try {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    const prompt = `You are an expert financial analyst with access to recent market information. Generate realistic and relevant recent news insights for ${companyName} (${symbol}).

COMPANY INFORMATION:
- Company: ${companyName}
- Ticker: ${symbol}
- Sector: ${sector || 'N/A'}
- Industry: ${industry || 'N/A'}
- Current Date: ${currentDate}

TASK:
Based on typical market dynamics, sector trends, and the company's business model, generate plausible recent news and developments that would be relevant for investment analysis. Consider:
- Typical quarterly earnings cycles
- Product announcements and launches
- Analyst rating changes
- Market trends affecting the sector
- Regulatory developments
- Strategic initiatives
- Competitive positioning

FORMAT (respond with ONLY valid JSON, no markdown):
{
  "latestNews": [
    {
      "headline": "Realistic headline reflecting recent developments",
      "sentiment": "positive" | "neutral" | "negative",
      "relevance": "high" | "medium" | "low",
      "summary": "One-line summary of investment impact",
      "source": "Realistic source (Bloomberg, Reuters, CNBC, etc.)",
      "date": "Recent date string (e.g., 'Jan 10, 2026')"
    }
  ],
  "keyDevelopments": [
    "First key development affecting investment outlook",
    "Second key development affecting investment outlook", 
    "Third key development affecting investment outlook"
  ],
  "marketSentiment": {
    "overall": "bullish" | "neutral" | "bearish",
    "confidence": "high" | "medium" | "low",
    "summary": "One-sentence summary of overall market sentiment and outlook"
  }
}

GUIDELINES:
- Generate 3-4 realistic news items
- Focus on material developments (earnings, products, analyst actions, strategy)
- Keep headlines professional and news-like
- Make summaries investment-relevant
- Use realistic sources (Bloomberg, Reuters, WSJ, CNBC, etc.)
- Sentiment should align with typical market reactions
- Be specific and actionable (avoid generic statements)`;

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
            content: 'You are an expert financial analyst generating realistic market news and developments. Always respond with valid JSON only, no markdown formatting.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5, // Slightly higher for more creative/realistic news generation
        max_tokens: 1000,
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

    const parsed = JSON.parse(content);
    return parsed as LiveNewsFacts;
  } catch (error) {
    console.error('Error generating live news insights:', error);
    return null;
  }
}

/**
 * Investment facts for loading animation
 */
export const investmentFacts = [
  "📊 Analyzing real-time market sentiment...",
  "📰 Fetching latest news and developments...",
  "🔍 Evaluating analyst recommendations...",
  "📈 Assessing technical indicators...",
  "💡 Synthesizing fundamental data...",
  "🎯 Calculating risk-adjusted returns...",
  "🌐 Reviewing sector performance trends...",
  "📉 Analyzing volatility patterns...",
  "🏦 Checking institutional holdings...",
  "💰 Evaluating valuation metrics...",
  "🔮 Generating investment insights...",
  "⚡ Processing financial data streams...",
  "🎲 Modeling probability distributions...",
  "🧠 Applying machine learning algorithms...",
  "📱 Scanning social sentiment indicators...",
];
