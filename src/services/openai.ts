/**
 * OpenAI API Service
 * Generate AI-powered summaries for company descriptions
 */

// Get API key from environment variable
const OPENAI_API_KEY = (import.meta as unknown as { env: { VITE_OPENAI_API_KEY?: string } }).env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface CompanySummaryRequest {
  companyName: string;
  symbol: string;
  description: string;
  maxWords?: number;
}

interface CompanySummaryResponse {
  summary: string;
  error?: string;
}

/**
 * Generate a concise company summary using GPT
 */
export async function generateCompanySummary({
  companyName,
  symbol,
  description,
  maxWords = 50,
}: CompanySummaryRequest): Promise<CompanySummaryResponse> {
  try {
    const prompt = `You are a financial analyst writing a brief company summary for an investment report. 

Company: ${companyName} (${symbol})

Full Description:
${description}

Task: Create a concise, professional summary of this company in ${maxWords} words or less. Focus on:
- What the company does (core business)
- Key products/services
- Market position

Write in a clear, professional tone suitable for an investor report. Do not include any preamble or meta-commentary.`;

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
            content: 'You are a professional financial analyst writing concise company summaries for investment reports.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      
      // Fallback to truncation if API fails
      return {
        summary: description.substring(0, 280).trim() + '...',
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error('No summary generated');
    }

    return {
      summary,
    };
  } catch (error) {
    console.error('Error generating company summary:', error);
    
    // Fallback to truncation
    return {
      summary: description.substring(0, 280).trim() + '...',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate summaries for multiple companies in parallel
 */
export async function generateCompanySummaries(
  companies: CompanySummaryRequest[]
): Promise<Record<string, string>> {
  const summaries: Record<string, string> = {};

  // Generate summaries in parallel with a limit to avoid rate limiting
  const batchSize = 3;
  for (let i = 0; i < companies.length; i += batchSize) {
    const batch = companies.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(company => generateCompanySummary(company))
    );

    batch.forEach((company, idx) => {
      summaries[company.symbol] = results[idx].summary;
    });
  }

  return summaries;
}

