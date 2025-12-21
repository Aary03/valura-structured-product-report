/**
 * News Aggregator Service
 * Sophisticated financial news digest generation for Valura Breakfast
 */

import type {
  MarketauxNewsArticle,
  MarketauxEntity,
  TrendingEntity,
  MarketStatsEntity,
} from './api/marketaux';
import {
  fetchMarketNews,
  fetchEntityNews,
  fetchTrendingEntities,
  fetchMarketStats,
  getTodayDate,
  getDateDaysAgo,
} from './api/marketaux';

// ========================================
// Type Definitions
// ========================================

export type SentimentCategory = 'bullish' | 'bearish' | 'neutral';

export interface ProcessedNewsArticle extends MarketauxNewsArticle {
  sentimentCategory: SentimentCategory;
  sophisticatedHeadline?: string;
  relevanceScore: number;
  primaryEntity?: MarketauxEntity;
}

export interface ValuraBreakfastDigest {
  timestamp: string;
  overallSentiment: SentimentCategory;
  sentimentScore: number;
  underlyingNews: ProcessedNewsArticle[];
  marketNews: ProcessedNewsArticle[];
  trendingEntities: TrendingEntity[];
  marketPulse: {
    vibe: string;
    description: string;
    topMovers: Array<{
      symbol: string;
      name: string;
      sentiment: number;
      mentions: number;
      direction: 'up' | 'down' | 'flat';
    }>;
  };
}

// ========================================
// Sophisticated Language Constants
// ========================================

const BREAKFAST_PHRASES = {
  bullish: [
    'Bulls are feasting',
    'Green shoots sprouting',
    'Upside brewing',
    'Rally vibes',
    'Momentum building',
    'Bulls caffeinated',
  ],
  bearish: [
    'Bears prowling',
    'Red flags waving',
    'Headwinds gathering',
    'Pressure mounting',
    'Caution brewing',
    'Bears stirring',
  ],
  neutral: [
    'Markets digesting',
    'Sideways shuffle',
    'Wait-and-see mode',
    'Flat white markets',
    'Temperate blend',
    'Steady as she goes',
  ],
};

const VIBE_DESCRIPTIONS = {
  bullish: [
    'Optimism in the air, investors leaning forward',
    'Confidence percolating through the tape',
    'Risk appetite is back on the menu',
    'Green dominates the landscape',
  ],
  bearish: [
    'Caution signals flashing across desks',
    'Defensive positioning underway',
    'Uncertainty weighing on sentiment',
    'Sellers finding their voice',
  ],
  neutral: [
    'Markets in contemplative mode',
    'Sideways action as traders reassess',
    'Balanced forces at play',
    'Consolidation phase continues',
  ],
};

const ENTITY_DESCRIPTORS = {
  positive: ['surging', 'climbing', 'rallying', 'advancing', 'gaining ground'],
  negative: ['sliding', 'retreating', 'under pressure', 'facing headwinds', 'losing altitude'],
  neutral: ['trading sideways', 'consolidating', 'hovering', 'in limbo', 'digesting'],
};

// ========================================
// Sentiment Categorization
// ========================================

export function categorizeSentiment(score: number): SentimentCategory {
  if (score > 0.1) return 'bullish';
  if (score < -0.1) return 'bearish';
  return 'neutral';
}

export function getAverageSentiment(articles: MarketauxNewsArticle[]): number {
  if (articles.length === 0) return 0;

  const allEntities = articles.flatMap((a) => a.entities);
  if (allEntities.length === 0) return 0;

  const totalSentiment = allEntities.reduce((sum, e) => sum + e.sentiment_score, 0);
  return totalSentiment / allEntities.length;
}

// ========================================
// Relevance Scoring
// ========================================

export function calculateRelevanceScore(article: MarketauxNewsArticle, targetSymbols?: string[]): number {
  let score = 0;

  // Base score from relevance_score if available
  if (article.relevance_score !== null) {
    score += article.relevance_score * 50;
  } else {
    score += 50; // Default mid-score
  }

  // Boost for recent articles (decay over 7 days)
  const publishedAt = new Date(article.published_at);
  const hoursAgo = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
  const recencyBoost = Math.max(0, 20 * (1 - hoursAgo / (24 * 7)));
  score += recencyBoost;

  // Boost if entity matches target symbols
  if (targetSymbols && targetSymbols.length > 0) {
    const hasTargetEntity = article.entities.some((e) => targetSymbols.includes(e.symbol));
    if (hasTargetEntity) {
      score += 30;
    }
  }

  // Boost for high match score entities
  const maxMatchScore = Math.max(...article.entities.map((e) => e.match_score), 0);
  score += maxMatchScore * 10;

  // Penalty for missing image
  if (!article.image_url) {
    score -= 5;
  }

  return Math.min(100, Math.max(0, score));
}

// ========================================
// Sophisticated Headline Generation
// ========================================

export function generateSophisticatedHeadline(
  article: MarketauxNewsArticle,
  primaryEntity?: MarketauxEntity
): string {
  if (!primaryEntity) return article.title;

  const sentiment = categorizeSentiment(primaryEntity.sentiment_score);
  const descriptor =
    ENTITY_DESCRIPTORS[sentiment === 'bearish' ? 'negative' : sentiment === 'bullish' ? 'positive' : 'neutral'][
      Math.floor(Math.random() * 5)
    ];

  // Check if title already mentions the symbol
  if (article.title.includes(primaryEntity.symbol) || article.title.includes(primaryEntity.name)) {
    return article.title;
  }

  // Prepend sophisticated context
  return `${primaryEntity.symbol} ${descriptor}: ${article.title}`;
}

// ========================================
// Process Articles
// ========================================

export function processArticles(
  articles: MarketauxNewsArticle[],
  targetSymbols?: string[]
): ProcessedNewsArticle[] {
  return articles
    .map((article) => {
      const relevanceScore = calculateRelevanceScore(article, targetSymbols);

      // Find primary entity (highest match score or first target symbol)
      let primaryEntity: MarketauxEntity | undefined;
      if (targetSymbols && targetSymbols.length > 0) {
        primaryEntity = article.entities.find((e) => targetSymbols.includes(e.symbol));
      }
      if (!primaryEntity && article.entities.length > 0) {
        primaryEntity = article.entities.reduce((best, current) =>
          current.match_score > best.match_score ? current : best
        );
      }

      const avgSentiment = primaryEntity
        ? primaryEntity.sentiment_score
        : article.entities.length > 0
          ? article.entities.reduce((sum, e) => sum + e.sentiment_score, 0) / article.entities.length
          : 0;

      const sentimentCategory = categorizeSentiment(avgSentiment);
      const sophisticatedHeadline = generateSophisticatedHeadline(article, primaryEntity);

      return {
        ...article,
        sentimentCategory,
        sophisticatedHeadline,
        relevanceScore,
        primaryEntity,
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// ========================================
// Market Pulse Generation
// ========================================

export function generateMarketPulse(
  trendingEntities: TrendingEntity[],
  overallSentiment: SentimentCategory
): ValuraBreakfastDigest['marketPulse'] {
  const vibePhrase = BREAKFAST_PHRASES[overallSentiment][Math.floor(Math.random() * BREAKFAST_PHRASES[overallSentiment].length)];
  const vibeDescription = VIBE_DESCRIPTIONS[overallSentiment][Math.floor(Math.random() * VIBE_DESCRIPTIONS[overallSentiment].length)];

  const topMovers = trendingEntities.slice(0, 3).map((entity) => ({
    symbol: entity.symbol,
    name: entity.name,
    sentiment: entity.sentiment_avg,
    mentions: entity.mentions,
    direction: (entity.sentiment_avg > 0.1 ? 'up' : entity.sentiment_avg < -0.1 ? 'down' : 'flat') as 'up' | 'down' | 'flat',
  }));

  return {
    vibe: vibePhrase,
    description: vibeDescription,
    topMovers,
  };
}

// ========================================
// Main Digest Builder
// ========================================

export async function buildValuraBreakfast(symbols?: string[]): Promise<ValuraBreakfastDigest> {
  const today = getTodayDate(); // YYYY-MM-DD format
  const twoDaysAgo = getDateDaysAgo(2);

  try {
    // Fetch underlying-specific news if symbols provided
    let underlyingNews: ProcessedNewsArticle[] = [];
    if (symbols && symbols.length > 0) {
      const entityNewsResponse = await fetchEntityNews(symbols, {
        limit: 15,
        publishedAfter: twoDaysAgo,
        language: 'en',
      });
      underlyingNews = processArticles(entityNewsResponse.data, symbols);
    }

    // Fetch general market news
    const marketNewsResponse = await fetchMarketNews({
      limit: 20,
      publishedAfter: twoDaysAgo,
      mustHaveEntities: true,
      countries: ['us'],
      language: 'en',
    });
    const marketNews = processArticles(marketNewsResponse.data);

    // Extract trending entities from news articles (free tier workaround)
    const entityCount: Record<string, { name: string; mentions: number; sentimentSum: number; sentimentCount: number }> = {};
    
    [...underlyingNews, ...marketNews].forEach(article => {
      article.entities.forEach(entity => {
        if (!entityCount[entity.symbol]) {
          entityCount[entity.symbol] = {
            name: entity.name,
            mentions: 0,
            sentimentSum: 0,
            sentimentCount: 0,
          };
        }
        entityCount[entity.symbol].mentions++;
        entityCount[entity.symbol].sentimentSum += entity.sentiment_score;
        entityCount[entity.symbol].sentimentCount++;
      });
    });
    
    // Convert to trending format and sort by mentions
    const trendingResponse = {
      meta: { found: Object.keys(entityCount).length, returned: 0, limit: 10, page: 1 },
      data: Object.entries(entityCount)
        .map(([symbol, data]) => ({
          symbol,
          name: data.name,
          country: 'us',
          type: 'equity',
          mentions: data.mentions,
          sentiment_avg: data.sentimentSum / data.sentimentCount,
          sentiment_positive: 0,
          sentiment_negative: 0,
          sentiment_neutral: 0,
        }))
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 10),
    };
    trendingResponse.meta.returned = trendingResponse.data.length;

    // Calculate overall sentiment
    const allArticles = [...underlyingNews, ...marketNews];
    const sentimentScore = getAverageSentiment(allArticles);
    const overallSentiment = categorizeSentiment(sentimentScore);

    // Generate market pulse
    const marketPulse = generateMarketPulse(trendingResponse.data, overallSentiment);

    return {
      timestamp: new Date().toISOString(),
      overallSentiment,
      sentimentScore,
      underlyingNews: underlyingNews.slice(0, 8), // Top 8
      marketNews: marketNews.slice(0, 12), // Top 12
      trendingEntities: trendingResponse.data,
      marketPulse,
    };
  } catch (error) {
    console.error('Error building Valura Breakfast:', error);
    throw error;
  }
}

// ========================================
// Utility Exports
// ========================================

export function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getSentimentLabel(category: SentimentCategory): string {
  const labels = {
    bullish: 'Brewing Upside ↗',
    bearish: 'Bears Stirring ↘',
    neutral: 'Flat White Markets',
  };
  return labels[category];
}

export function getSentimentColor(category: SentimentCategory): string {
  return category === 'bullish' ? 'success' : category === 'bearish' ? 'danger' : 'muted';
}

