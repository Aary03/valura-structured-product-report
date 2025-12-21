/**
 * Marketaux API Service
 * Financial news and market data API integration
 * Docs: https://www.marketaux.com/documentation
 */

const MARKETAUX_API_BASE = 'https://api.marketaux.com/v1';
const API_TOKEN = import.meta.env.VITE_MARKETAUX_API_KEY || 'k7LY5yCGckNsSdiRx82arczbsphXf8p9dqDKUeQF';

// ========================================
// Type Definitions
// ========================================

export interface MarketauxEntity {
  symbol: string;
  name: string;
  exchange: string | null;
  exchange_long: string | null;
  country: string | null;
  type: string | null;
  industry: string | null;
  match_score: number;
  sentiment_score: number; // -1 to +1
  highlights: Array<{
    highlight: string;
    sentiment: number;
    highlighted_in: string;
  }>;
}

export interface MarketauxNewsArticle {
  uuid: string;
  title: string;
  description: string;
  keywords: string | null;
  snippet: string;
  url: string;
  image_url: string | null;
  language: string;
  published_at: string; // ISO date
  source: string;
  relevance_score: number | null;
  entities: MarketauxEntity[];
  similar: any[];
}

export interface MarketauxNewsResponse {
  meta: {
    found: number;
    returned: number;
    limit: number;
    page: number;
  };
  data: MarketauxNewsArticle[];
}

export interface TrendingEntity {
  symbol: string;
  name: string;
  country: string;
  type: string;
  mentions: number;
  sentiment_avg: number;
  sentiment_positive: number;
  sentiment_negative: number;
  sentiment_neutral: number;
}

export interface TrendingEntitiesResponse {
  meta: {
    found: number;
    returned: number;
    limit: number;
    page: number;
  };
  data: TrendingEntity[];
}

export interface MarketStatsEntity {
  symbol: string;
  name: string;
  mentions: number;
  sentiment_avg: number;
  sentiment_positive: number;
  sentiment_negative: number;
  sentiment_neutral: number;
}

export interface MarketStatsResponse {
  meta: {
    found: number;
    returned: number;
    limit: number;
    page: number;
  };
  data: MarketStatsEntity[];
}

export interface MarketauxError {
  error: {
    code: string;
    message: string;
  };
}

// ========================================
// API Client
// ========================================

class MarketauxAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = 'MarketauxAPIError';
  }
}

async function fetchMarketaux<T>(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {}
): Promise<T> {
  const queryParams = new URLSearchParams();
  queryParams.append('api_token', API_TOKEN);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const url = `${MARKETAUX_API_BASE}${endpoint}?${queryParams.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData: MarketauxError = await response.json();
      throw new MarketauxAPIError(
        errorData.error.message || 'API request failed',
        errorData.error.code,
        response.status
      );
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    if (error instanceof MarketauxAPIError) {
      throw error;
    }
    throw new MarketauxAPIError(
      error instanceof Error ? error.message : 'Unknown error',
      'network_error'
    );
  }
}

// ========================================
// News Endpoints
// ========================================

export interface FetchNewsOptions {
  symbols?: string[]; // e.g., ['AAPL', 'TSLA']
  entityTypes?: string[]; // e.g., ['equity', 'index']
  industries?: string[]; // e.g., ['Technology', 'Industrials']
  countries?: string[]; // e.g., ['us', 'ca']
  sentimentGte?: number; // >= x (e.g., 0 for neutral+)
  sentimentLte?: number; // <= x (e.g., 0 for neutral-)
  language?: string; // e.g., 'en'
  limit?: number; // max 100
  page?: number;
  publishedAfter?: string; // ISO date
  publishedBefore?: string; // ISO date
  filterEntities?: boolean; // only return relevant entities
  mustHaveEntities?: boolean; // only articles with entities
}

/**
 * Fetch market news with optional filters
 */
export async function fetchMarketNews(
  options: FetchNewsOptions = {}
): Promise<MarketauxNewsResponse> {
  const params: Record<string, string | number | boolean | undefined> = {
    language: options.language || 'en',
    limit: options.limit || 10,
    page: options.page,
    filter_entities: options.filterEntities,
    must_have_entities: options.mustHaveEntities,
    sentiment_gte: options.sentimentGte,
    sentiment_lte: options.sentimentLte,
    published_after: options.publishedAfter,
    published_before: options.publishedBefore,
  };

  if (options.symbols && options.symbols.length > 0) {
    params.symbols = options.symbols.join(',');
  }

  if (options.entityTypes && options.entityTypes.length > 0) {
    params.entity_types = options.entityTypes.join(',');
  }

  if (options.industries && options.industries.length > 0) {
    params.industries = options.industries.join(',');
  }

  if (options.countries && options.countries.length > 0) {
    params.countries = options.countries.join(',');
  }

  return fetchMarketaux<MarketauxNewsResponse>('/news/all', params);
}

/**
 * Fetch news for specific entities (underlyings)
 */
export async function fetchEntityNews(
  symbols: string[],
  options: Omit<FetchNewsOptions, 'symbols'> = {}
): Promise<MarketauxNewsResponse> {
  return fetchMarketNews({
    ...options,
    symbols,
    filterEntities: true,
    mustHaveEntities: true,
  });
}

/**
 * Fetch general market news (no entity filter)
 */
export async function fetchGeneralMarketNews(
  options: FetchNewsOptions = {}
): Promise<MarketauxNewsResponse> {
  return fetchMarketNews({
    ...options,
    mustHaveEntities: true,
    countries: ['us'], // Focus on US markets
  });
}

// ========================================
// Trending Entities Endpoint
// ========================================

export interface FetchTrendingOptions {
  limit?: number;
  page?: number;
  countries?: string[];
  entityTypes?: string[];
  publishedOn?: string; // YYYY-MM-DD
  publishedAfter?: string; // ISO date
  publishedBefore?: string; // ISO date
}

/**
 * Fetch trending entities by mentions
 */
export async function fetchTrendingEntities(
  options: FetchTrendingOptions = {}
): Promise<TrendingEntitiesResponse> {
  const params: Record<string, string | number | undefined> = {
    limit: options.limit || 10,
    page: options.page,
    published_on: options.publishedOn,
    published_after: options.publishedAfter,
    published_before: options.publishedBefore,
  };

  if (options.countries && options.countries.length > 0) {
    params.countries = options.countries.join(',');
  }

  if (options.entityTypes && options.entityTypes.length > 0) {
    params.entity_types = options.entityTypes.join(',');
  }

  return fetchMarketaux<TrendingEntitiesResponse>('/entity/trending', params);
}

// ========================================
// Market Stats Endpoint
// ========================================

export interface FetchMarketStatsOptions {
  groupBy?: 'symbol' | 'entity_type' | 'industry' | 'country';
  sort?: 'mentions' | 'sentiment_avg' | 'sentiment_positive' | 'sentiment_negative';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  page?: number;
  symbols?: string[];
  countries?: string[];
  publishedOn?: string; // YYYY-MM-DD
  publishedAfter?: string;
  publishedBefore?: string;
}

/**
 * Fetch aggregated market statistics
 */
export async function fetchMarketStats(
  options: FetchMarketStatsOptions = {}
): Promise<MarketStatsResponse> {
  const params: Record<string, string | number | undefined> = {
    group_by: options.groupBy || 'symbol',
    sort: options.sort || 'mentions',
    sort_order: options.sortOrder || 'desc',
    limit: options.limit || 20,
    page: options.page,
    published_on: options.publishedOn,
    published_after: options.publishedAfter,
    published_before: options.publishedBefore,
  };

  if (options.symbols && options.symbols.length > 0) {
    params.symbols = options.symbols.join(',');
  }

  if (options.countries && options.countries.length > 0) {
    params.countries = options.countries.join(',');
  }

  return fetchMarketaux<MarketStatsResponse>('/entity/stats/intraday', params);
}

// ========================================
// Utility Functions
// ========================================

/**
 * Get today's date in YYYY-MM-DD format (UTC)
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get date N days ago in YYYY-MM-DD format
 */
export function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * Check if API key is configured
 */
export function isMarketauxConfigured(): boolean {
  return !!API_TOKEN && API_TOKEN !== '';
}

export { MarketauxAPIError };

