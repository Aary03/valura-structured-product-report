/**
 * Financial Modeling Prep API Client
 * Comprehensive API service for all FMP endpoints
 */

const API_BASE_URL = 'https://financialmodelingprep.com/stable';
// Vite provides import.meta.env at runtime - type assertion needed until TS server picks up vite/client types
const API_KEY = (import.meta as unknown as { env: { VITE_FMP_API_KEY?: string } }).env.VITE_FMP_API_KEY || 'bEiVRux9rewQy16TXMPxDqBAQGIW8UBd';

// Helper function to build URL with API key
const buildUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  url.searchParams.set('apikey', API_KEY);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }
  
  return url.toString();
};

// ============================================================================
// SEARCH ENDPOINTS
// ============================================================================

export const searchEndpoints = {
  /**
   * Search by symbol
   */
  searchSymbol: (query: string) => 
    buildUrl('/search-symbol', { query }),

  /**
   * Search by company name
   */
  searchName: (query: string) => 
    buildUrl('/search-name', { query }),

  /**
   * Search by CIK
   */
  searchCik: (cik: string) => 
    buildUrl('/search-cik', { cik }),

  /**
   * Search by CUSIP
   */
  searchCusip: (cusip: string) => 
    buildUrl('/search-cusip', { cusip }),

  /**
   * Search by ISIN
   */
  searchIsin: (isin: string) => 
    buildUrl('/search-isin', { isin }),

  /**
   * Company screener
   */
  companyScreener: (params?: Record<string, string | number>) => 
    buildUrl('/company-screener', params),

  /**
   * Search exchange variants
   */
  searchExchangeVariants: (symbol: string) => 
    buildUrl('/search-exchange-variants', { symbol }),
};

// ============================================================================
// LIST ENDPOINTS
// ============================================================================

export const listEndpoints = {
  /**
   * Stock list
   */
  stockList: () => buildUrl('/stock-list'),

  /**
   * Financial statement symbol list
   */
  financialStatementSymbolList: () => buildUrl('/financial-statement-symbol-list'),

  /**
   * CIK list
   */
  cikList: (page = 0, limit = 1000) => 
    buildUrl('/cik-list', { page, limit }),

  /**
   * Symbol change
   */
  symbolChange: () => buildUrl('/symbol-change'),

  /**
   * ETF list
   */
  etfList: () => buildUrl('/etf-list'),

  /**
   * Actively trading list
   */
  activelyTradingList: () => buildUrl('/actively-trading-list'),

  /**
   * Earnings transcript list
   */
  earningsTranscriptList: () => buildUrl('/earnings-transcript-list'),

  /**
   * Available exchanges
   */
  availableExchanges: () => buildUrl('/available-exchanges'),

  /**
   * Available sectors
   */
  availableSectors: () => buildUrl('/available-sectors'),

  /**
   * Available industries
   */
  availableIndustries: () => buildUrl('/available-industries'),

  /**
   * Available countries
   */
  availableCountries: () => buildUrl('/available-countries'),
};

// ============================================================================
// COMPANY PROFILE ENDPOINTS
// ============================================================================

export const profileEndpoints = {
  /**
   * Company profile by symbol
   */
  profile: (symbol: string) => 
    buildUrl('/profile', { symbol }),

  /**
   * Company profile by CIK
   */
  profileCik: (cik: string) => 
    buildUrl('/profile-cik', { cik }),

  /**
   * Company notes
   */
  companyNotes: (symbol: string) => 
    buildUrl('/company-notes', { symbol }),

  /**
   * Stock peers
   */
  stockPeers: (symbol: string) => 
    buildUrl('/stock-peers', { symbol }),

  /**
   * Delisted companies
   */
  delistedCompanies: (page = 0, limit = 100) => 
    buildUrl('/delisted-companies', { page, limit }),

  /**
   * Employee count
   */
  employeeCount: (symbol: string) => 
    buildUrl('/employee-count', { symbol }),

  /**
   * Historical employee count
   */
  historicalEmployeeCount: (symbol: string) => 
    buildUrl('/historical-employee-count', { symbol }),

  /**
   * Market capitalization
   */
  marketCapitalization: (symbol: string) => 
    buildUrl('/market-capitalization', { symbol }),

  /**
   * Market capitalization batch
   */
  marketCapitalizationBatch: (symbols: string[]) => 
    buildUrl('/market-capitalization-batch', { symbols: symbols.join(',') }),

  /**
   * Historical market capitalization
   */
  historicalMarketCapitalization: (symbol: string) => 
    buildUrl('/historical-market-capitalization', { symbol }),

  /**
   * Shares float
   */
  sharesFloat: (symbol: string) => 
    buildUrl('/shares-float', { symbol }),

  /**
   * Shares float all
   */
  sharesFloatAll: (page = 0, limit = 1000) => 
    buildUrl('/shares-float-all', { page, limit }),
};

// ============================================================================
// MERGERS & ACQUISITIONS
// ============================================================================

export const mergersAcquisitionsEndpoints = {
  /**
   * Latest M&A
   */
  latest: (page = 0, limit = 100) => 
    buildUrl('/mergers-acquisitions-latest', { page, limit }),

  /**
   * Search M&A by name
   */
  search: (name: string) => 
    buildUrl('/mergers-acquisitions-search', { name }),
};

// ============================================================================
// EXECUTIVE & GOVERNANCE
// ============================================================================

export const executiveEndpoints = {
  /**
   * Key executives
   */
  keyExecutives: (symbol: string) => 
    buildUrl('/key-executives', { symbol }),

  /**
   * Governance executive compensation
   */
  governanceExecutiveCompensation: (symbol: string) => 
    buildUrl('/governance-executive-compensation', { symbol }),

  /**
   * Executive compensation benchmark
   */
  executiveCompensationBenchmark: () => 
    buildUrl('/executive-compensation-benchmark'),
};

// ============================================================================
// QUOTE & PRICE ENDPOINTS
// ============================================================================

export const quoteEndpoints = {
  /**
   * Quote by symbol
   */
  quote: (symbol: string) => 
    buildUrl('/quote', { symbol }),

  /**
   * Quote short
   */
  quoteShort: (symbol: string) => 
    buildUrl('/quote-short', { symbol }),

  /**
   * Aftermarket trade
   */
  aftermarketTrade: (symbol: string) => 
    buildUrl('/aftermarket-trade', { symbol }),

  /**
   * Aftermarket quote
   */
  aftermarketQuote: (symbol: string) => 
    buildUrl('/aftermarket-quote', { symbol }),

  /**
   * Stock price change
   */
  stockPriceChange: (symbol: string) => 
    buildUrl('/stock-price-change', { symbol }),

  /**
   * Batch quote
   */
  batchQuote: (symbols: string[]) => 
    buildUrl('/batch-quote', { symbols: symbols.join(',') }),

  /**
   * Batch quote short
   */
  batchQuoteShort: (symbols: string[]) => 
    buildUrl('/batch-quote-short', { symbols: symbols.join(',') }),

  /**
   * Batch aftermarket trade
   */
  batchAftermarketTrade: (symbols: string[]) => 
    buildUrl('/batch-aftermarket-trade', { symbols: symbols.join(',') }),

  /**
   * Batch aftermarket quote
   */
  batchAftermarketQuote: (symbols: string[]) => 
    buildUrl('/batch-aftermarket-quote', { symbols: symbols.join(',') }),

  /**
   * Batch exchange quote
   */
  batchExchangeQuote: (exchange: string) => 
    buildUrl('/batch-exchange-quote', { exchange }),

  /**
   * Batch mutual fund quotes
   */
  batchMutualFundQuotes: () => 
    buildUrl('/batch-mutualfund-quotes'),

  /**
   * Batch ETF quotes
   */
  batchEtfQuotes: () => 
    buildUrl('/batch-etf-quotes'),

  /**
   * Batch commodity quotes
   */
  batchCommodityQuotes: () => 
    buildUrl('/batch-commodity-quotes'),

  /**
   * Batch crypto quotes
   */
  batchCryptoQuotes: () => 
    buildUrl('/batch-crypto-quotes'),

  /**
   * Batch forex quotes
   */
  batchForexQuotes: () => 
    buildUrl('/batch-forex-quotes'),

  /**
   * Batch index quotes
   */
  batchIndexQuotes: () => 
    buildUrl('/batch-index-quotes'),
};

// ============================================================================
// FINANCIAL STATEMENTS
// ============================================================================

export const financialStatementsEndpoints = {
  /**
   * Income statement
   */
  incomeStatement: (symbol: string, period: 'annual' | 'quarter' = 'annual') => 
    buildUrl('/income-statement', { symbol, period }),

  /**
   * Balance sheet statement
   */
  balanceSheetStatement: (symbol: string, period: 'annual' | 'quarter' = 'annual') => 
    buildUrl('/balance-sheet-statement', { symbol, period }),

  /**
   * Cash flow statement
   */
  cashFlowStatement: (symbol: string, period: 'annual' | 'quarter' = 'annual') => 
    buildUrl('/cash-flow-statement', { symbol, period }),

  /**
   * Latest financial statements
   */
  latestFinancialStatements: (page = 0, limit = 250) => 
    buildUrl('/latest-financial-statements', { page, limit }),

  /**
   * Income statement TTM
   */
  incomeStatementTtm: (symbol: string) => 
    buildUrl('/income-statement-ttm', { symbol }),

  /**
   * Balance sheet statement TTM
   */
  balanceSheetStatementTtm: (symbol: string) => 
    buildUrl('/balance-sheet-statement-ttm', { symbol }),

  /**
   * Cash flow statement TTM
   */
  cashFlowStatementTtm: (symbol: string) => 
    buildUrl('/cash-flow-statement-ttm', { symbol }),

  /**
   * Key metrics
   */
  keyMetrics: (symbol: string, period: 'annual' | 'quarter' = 'annual') => 
    buildUrl('/key-metrics', { symbol, period }),

  /**
   * Ratios
   */
  ratios: (symbol: string, period: 'annual' | 'quarter' = 'annual') => 
    buildUrl('/ratios', { symbol, period }),

  /**
   * Key metrics TTM
   */
  keyMetricsTtm: (symbol: string) => 
    buildUrl('/key-metrics-ttm', { symbol }),

  /**
   * Ratios TTM
   */
  ratiosTtm: (symbol: string) => 
    buildUrl('/ratios-ttm', { symbol }),

  /**
   * Financial scores
   */
  financialScores: (symbol: string) => 
    buildUrl('/financial-scores', { symbol }),

  /**
   * Owner earnings
   */
  ownerEarnings: (symbol: string) => 
    buildUrl('/owner-earnings', { symbol }),

  /**
   * Enterprise values
   */
  enterpriseValues: (symbol: string, period: 'annual' | 'quarter' = 'annual') => 
    buildUrl('/enterprise-values', { symbol, period }),

  /**
   * Income statement growth
   */
  incomeStatementGrowth: (symbol: string, period: 'annual' | 'quarter' = 'annual') => 
    buildUrl('/income-statement-growth', { symbol, period }),

  /**
   * Balance sheet statement growth
   */
  balanceSheetStatementGrowth: (symbol: string, period: 'annual' | 'quarter' = 'annual') => 
    buildUrl('/balance-sheet-statement-growth', { symbol, period }),

  /**
   * Cash flow statement growth
   */
  cashFlowStatementGrowth: (symbol: string, period: 'annual' | 'quarter' = 'annual') => 
    buildUrl('/cash-flow-statement-growth', { symbol, period }),

  /**
   * Financial growth
   */
  financialGrowth: (symbol: string, period: 'annual' | 'quarter' = 'annual') => 
    buildUrl('/financial-growth', { symbol, period }),

  /**
   * Financial reports dates
   */
  financialReportsDates: (symbol: string) => 
    buildUrl('/financial-reports-dates', { symbol }),

  /**
   * Financial reports JSON
   */
  financialReportsJson: (symbol: string, year: number, period: 'FY' | 'Q1' | 'Q2' | 'Q3' | 'Q4') => 
    buildUrl('/financial-reports-json', { symbol, year: String(year), period }),

  /**
   * Financial reports XLSX
   */
  financialReportsXlsx: (symbol: string, year: number, period: 'FY' | 'Q1' | 'Q2' | 'Q3' | 'Q4') => 
    buildUrl('/financial-reports-xlsx', { symbol, year: String(year), period }),

  /**
   * Revenue product segmentation
   */
  revenueProductSegmentation: (symbol: string) => 
    buildUrl('/revenue-product-segmentation', { symbol }),

  /**
   * Revenue geographic segmentation
   */
  revenueGeographicSegmentation: (symbol: string) => 
    buildUrl('/revenue-geographic-segmentation', { symbol }),

  /**
   * Income statement as reported
   */
  incomeStatementAsReported: (symbol: string) => 
    buildUrl('/income-statement-as-reported', { symbol }),

  /**
   * Balance sheet statement as reported
   */
  balanceSheetStatementAsReported: (symbol: string) => 
    buildUrl('/balance-sheet-statement-as-reported', { symbol }),

  /**
   * Cash flow statement as reported
   */
  cashFlowStatementAsReported: (symbol: string) => 
    buildUrl('/cash-flow-statement-as-reported', { symbol }),

  /**
   * Financial statement full as reported
   */
  financialStatementFullAsReported: (symbol: string) => 
    buildUrl('/financial-statement-full-as-reported', { symbol }),
};

// ============================================================================
// HISTORICAL PRICES
// ============================================================================

export const historicalPriceEndpoints = {
  /**
   * Historical price EOD (light)
   */
  historicalPriceEodLight: (symbol: string, from?: string, to?: string) => {
    const params: Record<string, string> = { symbol };
    if (from) params.from = from;
    if (to) params.to = to;
    return buildUrl('/historical-price-eod/light', params);
  },

  /**
   * Historical price EOD (full)
   */
  historicalPriceEodFull: (symbol: string, from?: string, to?: string) => {
    const params: Record<string, string> = { symbol };
    if (from) params.from = from;
    if (to) params.to = to;
    return buildUrl('/historical-price-eod/full', params);
  },

  /**
   * Historical price EOD (non-split-adjusted)
   */
  historicalPriceEodNonSplitAdjusted: (symbol: string, from?: string, to?: string) => {
    const params: Record<string, string> = { symbol };
    if (from) params.from = from;
    if (to) params.to = to;
    return buildUrl('/historical-price-eod/non-split-adjusted', params);
  },

  /**
   * Historical price EOD (dividend-adjusted)
   */
  historicalPriceEodDividendAdjusted: (symbol: string, from?: string, to?: string) => {
    const params: Record<string, string> = { symbol };
    if (from) params.from = from;
    if (to) params.to = to;
    return buildUrl('/historical-price-eod/dividend-adjusted', params);
  },

  /**
   * Historical chart (1min, 5min, 15min, 30min, 1hour, 4hour)
   */
  historicalChart: (
    symbol: string, 
    interval: '1min' | '5min' | '15min' | '30min' | '1hour' | '4hour',
    from?: string,
    to?: string
  ) => {
    const params: Record<string, string> = { symbol };
    if (from) params.from = from;
    if (to) params.to = to;
    return buildUrl(`/historical-chart/${interval}`, params);
  },
};

// ============================================================================
// ECONOMIC DATA
// ============================================================================

export const economicEndpoints = {
  /**
   * Treasury rates
   */
  treasuryRates: () => buildUrl('/treasury-rates'),

  /**
   * Economic indicators
   */
  economicIndicators: (name: string) => 
    buildUrl('/economic-indicators', { name }),

  /**
   * Economic calendar
   */
  economicCalendar: () => buildUrl('/economic-calendar'),

  /**
   * Market risk premium
   */
  marketRiskPremium: () => buildUrl('/market-risk-premium'),
};

// ============================================================================
// DIVIDENDS, EARNINGS, SPLITS
// ============================================================================

export const corporateActionsEndpoints = {
  /**
   * Dividends
   */
  dividends: (symbol: string) => 
    buildUrl('/dividends', { symbol }),

  /**
   * Dividends calendar
   */
  dividendsCalendar: () => buildUrl('/dividends-calendar'),

  /**
   * Earnings
   */
  earnings: (symbol: string) => 
    buildUrl('/earnings', { symbol }),

  /**
   * Earnings calendar
   */
  earningsCalendar: () => buildUrl('/earnings-calendar'),

  /**
   * IPOs calendar
   */
  iposCalendar: () => buildUrl('/ipos-calendar'),

  /**
   * IPOs disclosure
   */
  iposDisclosure: () => buildUrl('/ipos-disclosure'),

  /**
   * IPOs prospectus
   */
  iposProspectus: () => buildUrl('/ipos-prospectus'),

  /**
   * Splits
   */
  splits: (symbol: string) => 
    buildUrl('/splits', { symbol }),

  /**
   * Splits calendar
   */
  splitsCalendar: () => buildUrl('/splits-calendar'),
};

// ============================================================================
// EARNINGS CALL TRANSCRIPTS
// ============================================================================

export const transcriptEndpoints = {
  /**
   * Latest earnings call transcript
   */
  latest: () => buildUrl('/earning-call-transcript-latest'),

  /**
   * Earnings call transcript
   */
  transcript: (symbol: string, year: number, quarter: number) => 
    buildUrl('/earning-call-transcript', { symbol, year: String(year), quarter: String(quarter) }),

  /**
   * Earnings call transcript dates
   */
  transcriptDates: (symbol: string) => 
    buildUrl('/earning-call-transcript-dates', { symbol }),
};

// ============================================================================
// NEWS
// ============================================================================

export const newsEndpoints = {
  /**
   * FMP articles
   */
  fmpArticles: (page = 0, limit = 20) => 
    buildUrl('/fmp-articles', { page, limit }),

  /**
   * General latest news
   */
  generalLatest: (page = 0, limit = 20) => 
    buildUrl('/news/general-latest', { page, limit }),

  /**
   * Press releases latest
   */
  pressReleasesLatest: (page = 0, limit = 20) => 
    buildUrl('/news/press-releases-latest', { page, limit }),

  /**
   * Stock latest news
   */
  stockLatest: (page = 0, limit = 20) => 
    buildUrl('/news/stock-latest', { page, limit }),

  /**
   * Crypto latest news
   */
  cryptoLatest: (page = 0, limit = 20) => 
    buildUrl('/news/crypto-latest', { page, limit }),

  /**
   * Forex latest news
   */
  forexLatest: (page = 0, limit = 20) => 
    buildUrl('/news/forex-latest', { page, limit }),

  /**
   * Press releases by symbols
   */
  pressReleases: (symbols: string[]) => 
    buildUrl('/news/press-releases', { symbols: symbols.join(',') }),

  /**
   * Stock news by symbols
   */
  stockNews: (symbols: string[]) => 
    buildUrl('/news/stock', { symbols: symbols.join(',') }),

  /**
   * Crypto news by symbols
   */
  cryptoNews: (symbols: string[]) => 
    buildUrl('/news/crypto', { symbols: symbols.join(',') }),

  /**
   * Forex news by symbols
   */
  forexNews: (symbols: string[]) => 
    buildUrl('/news/forex', { symbols: symbols.join(',') }),
};

// ============================================================================
// INSTITUTIONAL OWNERSHIP
// ============================================================================

export const institutionalOwnershipEndpoints = {
  /**
   * Latest institutional ownership
   */
  latest: (page = 0, limit = 100) => 
    buildUrl('/institutional-ownership/latest', { page, limit }),

  /**
   * Extract institutional ownership
   */
  extract: (cik: string, year: number, quarter: number) => 
    buildUrl('/institutional-ownership/extract', { cik, year: String(year), quarter: String(quarter) }),

  /**
   * Institutional ownership dates
   */
  dates: (cik: string) => 
    buildUrl('/institutional-ownership/dates', { cik }),

  /**
   * Holder analytics
   */
  holderAnalytics: (symbol: string, year: number, quarter: number, page = 0, limit = 10) => 
    buildUrl('/institutional-ownership/extract-analytics/holder', { 
      symbol, 
      year: String(year), 
      quarter: String(quarter), 
      page, 
      limit 
    }),

  /**
   * Holder performance summary
   */
  holderPerformanceSummary: (cik: string, page = 0) => 
    buildUrl('/institutional-ownership/holder-performance-summary', { cik, page }),

  /**
   * Holder industry breakdown
   */
  holderIndustryBreakdown: (cik: string, year: number, quarter: number) => 
    buildUrl('/institutional-ownership/holder-industry-breakdown', { 
      cik, 
      year: String(year), 
      quarter: String(quarter) 
    }),

  /**
   * Symbol positions summary
   */
  symbolPositionsSummary: (symbol: string, year: number, quarter: number) => 
    buildUrl('/institutional-ownership/symbol-positions-summary', { 
      symbol, 
      year: String(year), 
      quarter: String(quarter) 
    }),

  /**
   * Industry summary
   */
  industrySummary: (year: number, quarter: number) => 
    buildUrl('/institutional-ownership/industry-summary', { 
      year: String(year), 
      quarter: String(quarter) 
    }),
};

// ============================================================================
// ANALYST ESTIMATES & RATINGS
// ============================================================================

export const analystEndpoints = {
  /**
   * Analyst estimates
   */
  analystEstimates: (symbol: string, period: 'annual' | 'quarter' = 'annual', page = 0, limit = 10) => 
    buildUrl('/analyst-estimates', { symbol, period, page, limit }),

  /**
   * Ratings snapshot
   */
  ratingsSnapshot: (symbol: string) => 
    buildUrl('/ratings-snapshot', { symbol }),

  /**
   * Ratings historical
   */
  ratingsHistorical: (symbol: string) => 
    buildUrl('/ratings-historical', { symbol }),

  /**
   * Price target summary
   */
  priceTargetSummary: (symbol: string) => 
    buildUrl('/price-target-summary', { symbol }),

  /**
   * Price target consensus
   */
  priceTargetConsensus: (symbol: string) => 
    buildUrl('/price-target-consensus', { symbol }),

  /**
   * Grades
   */
  grades: (symbol: string) => 
    buildUrl('/grades', { symbol }),

  /**
   * Grades historical
   */
  gradesHistorical: (symbol: string) => 
    buildUrl('/grades-historical', { symbol }),

  /**
   * Grades consensus
   */
  gradesConsensus: (symbol: string) => 
    buildUrl('/grades-consensus', { symbol }),
};

// ============================================================================
// SECTOR & INDUSTRY PERFORMANCE
// ============================================================================

export const sectorIndustryEndpoints = {
  /**
   * Sector performance snapshot
   */
  sectorPerformanceSnapshot: (date: string) => 
    buildUrl('/sector-performance-snapshot', { date }),

  /**
   * Industry performance snapshot
   */
  industryPerformanceSnapshot: (date: string) => 
    buildUrl('/industry-performance-snapshot', { date }),

  /**
   * Historical sector performance
   */
  historicalSectorPerformance: (sector: string) => 
    buildUrl('/historical-sector-performance', { sector }),

  /**
   * Historical industry performance
   */
  historicalIndustryPerformance: (industry: string) => 
    buildUrl('/historical-industry-performance', { industry }),

  /**
   * Sector PE snapshot
   */
  sectorPeSnapshot: (date: string) => 
    buildUrl('/sector-pe-snapshot', { date }),

  /**
   * Industry PE snapshot
   */
  industryPeSnapshot: (date: string) => 
    buildUrl('/industry-pe-snapshot', { date }),

  /**
   * Historical sector PE
   */
  historicalSectorPe: (sector: string) => 
    buildUrl('/historical-sector-pe', { sector }),

  /**
   * Historical industry PE
   */
  historicalIndustryPe: (industry: string) => 
    buildUrl('/historical-industry-pe', { industry }),

  /**
   * Biggest gainers
   */
  biggestGainers: () => buildUrl('/biggest-gainers'),

  /**
   * Biggest losers
   */
  biggestLosers: () => buildUrl('/biggest-losers'),

  /**
   * Most actives
   */
  mostActives: () => buildUrl('/most-actives'),
};

// ============================================================================
// TECHNICAL INDICATORS
// ============================================================================

export const technicalIndicatorsEndpoints = {
  /**
   * SMA (Simple Moving Average)
   */
  sma: (symbol: string, periodLength: number, timeframe: string) => 
    buildUrl('/technical-indicators/sma', { symbol, periodLength: String(periodLength), timeframe }),

  /**
   * EMA (Exponential Moving Average)
   */
  ema: (symbol: string, periodLength: number, timeframe: string) => 
    buildUrl('/technical-indicators/ema', { symbol, periodLength: String(periodLength), timeframe }),

  /**
   * WMA (Weighted Moving Average)
   */
  wma: (symbol: string, periodLength: number, timeframe: string) => 
    buildUrl('/technical-indicators/wma', { symbol, periodLength: String(periodLength), timeframe }),

  /**
   * DEMA (Double Exponential Moving Average)
   */
  dema: (symbol: string, periodLength: number, timeframe: string) => 
    buildUrl('/technical-indicators/dema', { symbol, periodLength: String(periodLength), timeframe }),

  /**
   * TEMA (Triple Exponential Moving Average)
   */
  tema: (symbol: string, periodLength: number, timeframe: string) => 
    buildUrl('/technical-indicators/tema', { symbol, periodLength: String(periodLength), timeframe }),

  /**
   * RSI (Relative Strength Index)
   */
  rsi: (symbol: string, periodLength: number, timeframe: string) => 
    buildUrl('/technical-indicators/rsi', { symbol, periodLength: String(periodLength), timeframe }),

  /**
   * Standard deviation
   */
  standardDeviation: (symbol: string, periodLength: number, timeframe: string) => 
    buildUrl('/technical-indicators/standarddeviation', { symbol, periodLength: String(periodLength), timeframe }),

  /**
   * Williams %R
   */
  williams: (symbol: string, periodLength: number, timeframe: string) => 
    buildUrl('/technical-indicators/williams', { symbol, periodLength: String(periodLength), timeframe }),

  /**
   * ADX (Average Directional Index)
   */
  adx: (symbol: string, periodLength: number, timeframe: string) => 
    buildUrl('/technical-indicators/adx', { symbol, periodLength: String(periodLength), timeframe }),
};

// ============================================================================
// ETF & FUNDS
// ============================================================================

export const etfFundsEndpoints = {
  /**
   * ETF holdings
   */
  etfHoldings: (symbol: string) => 
    buildUrl('/etf/holdings', { symbol }),

  /**
   * ETF info
   */
  etfInfo: (symbol: string) => 
    buildUrl('/etf/info', { symbol }),

  /**
   * ETF country weightings
   */
  etfCountryWeightings: (symbol: string) => 
    buildUrl('/etf/country-weightings', { symbol }),

  /**
   * ETF asset exposure
   */
  etfAssetExposure: (symbol: string) => 
    buildUrl('/etf/asset-exposure', { symbol }),

  /**
   * ETF sector weightings
   */
  etfSectorWeightings: (symbol: string) => 
    buildUrl('/etf/sector-weightings', { symbol }),

  /**
   * Funds disclosure holders latest
   */
  fundsDisclosureHoldersLatest: (symbol: string) => 
    buildUrl('/funds/disclosure-holders-latest', { symbol }),

  /**
   * Funds disclosure
   */
  fundsDisclosure: (symbol: string, year: number, quarter: number) => 
    buildUrl('/funds/disclosure', { symbol, year: String(year), quarter: String(quarter) }),

  /**
   * Funds disclosure holders search
   */
  fundsDisclosureHoldersSearch: (name: string) => 
    buildUrl('/funds/disclosure-holders-search', { name }),

  /**
   * Funds disclosure dates
   */
  fundsDisclosureDates: (symbol: string) => 
    buildUrl('/funds/disclosure-dates', { symbol }),
};

// ============================================================================
// SEC FILINGS
// ============================================================================

export const secFilingsEndpoints = {
  /**
   * SEC filings 8-K
   */
  filings8k: (from: string, to: string, page = 0, limit = 100) => 
    buildUrl('/sec-filings-8k', { from, to, page, limit }),

  /**
   * SEC filings financials
   */
  filingsFinancials: (from: string, to: string, page = 0, limit = 100) => 
    buildUrl('/sec-filings-financials', { from, to, page, limit }),

  /**
   * SEC filings search by form type
   */
  searchFormType: (formType: string, from: string, to: string, page = 0, limit = 100) => 
    buildUrl('/sec-filings-search/form-type', { formType, from, to, page, limit }),

  /**
   * SEC filings search by symbol
   */
  searchSymbol: (symbol: string, from: string, to: string, page = 0, limit = 100) => 
    buildUrl('/sec-filings-search/symbol', { symbol, from, to, page, limit }),

  /**
   * SEC filings search by CIK
   */
  searchCik: (cik: string, from: string, to: string, page = 0, limit = 100) => 
    buildUrl('/sec-filings-search/cik', { cik, from, to, page, limit }),

  /**
   * SEC filings company search by name
   */
  companySearchName: (company: string) => 
    buildUrl('/sec-filings-company-search/name', { company }),

  /**
   * SEC filings company search by symbol
   */
  companySearchSymbol: (symbol: string) => 
    buildUrl('/sec-filings-company-search/symbol', { symbol }),

  /**
   * SEC filings company search by CIK
   */
  companySearchCik: (cik: string) => 
    buildUrl('/sec-filings-company-search/cik', { cik }),

  /**
   * SEC profile
   */
  secProfile: (symbol: string) => 
    buildUrl('/sec-profile', { symbol }),

  /**
   * Standard industrial classification list
   */
  sicList: () => buildUrl('/standard-industrial-classification-list'),

  /**
   * Industry classification search
   */
  industryClassificationSearch: () => buildUrl('/industry-classification-search'),

  /**
   * All industry classification
   */
  allIndustryClassification: () => buildUrl('/all-industry-classification'),
};

// ============================================================================
// INSIDER TRADING
// ============================================================================

export const insiderTradingEndpoints = {
  /**
   * Latest insider trading
   */
  latest: (page = 0, limit = 100) => 
    buildUrl('/insider-trading/latest', { page, limit }),

  /**
   * Search insider trading
   */
  search: (page = 0, limit = 100) => 
    buildUrl('/insider-trading/search', { page, limit }),

  /**
   * Insider trading by reporting name
   */
  reportingName: (name: string) => 
    buildUrl('/insider-trading/reporting-name', { name }),

  /**
   * Insider trading transaction type
   */
  transactionType: () => buildUrl('/insider-trading-transaction-type'),

  /**
   * Insider trading statistics
   */
  statistics: (symbol: string) => 
    buildUrl('/insider-trading/statistics', { symbol }),

  /**
   * Acquisition of beneficial ownership
   */
  acquisitionOfBeneficialOwnership: (symbol: string) => 
    buildUrl('/acquisition-of-beneficial-ownership', { symbol }),
};

// ============================================================================
// INDEX DATA
// ============================================================================

export const indexEndpoints = {
  /**
   * Index list
   */
  indexList: () => buildUrl('/index-list'),

  /**
   * S&P 500 constituent
   */
  sp500Constituent: () => buildUrl('/sp500-constituent'),

  /**
   * NASDAQ constituent
   */
  nasdaqConstituent: () => buildUrl('/nasdaq-constituent'),

  /**
   * Dow Jones constituent
   */
  dowjonesConstituent: () => buildUrl('/dowjones-constituent'),

  /**
   * Historical S&P 500 constituent
   */
  historicalSp500Constituent: () => buildUrl('/historical-sp500-constituent'),

  /**
   * Historical NASDAQ constituent
   */
  historicalNasdaqConstituent: () => buildUrl('/historical-nasdaq-constituent'),

  /**
   * Historical Dow Jones constituent
   */
  historicalDowjonesConstituent: () => buildUrl('/historical-dowjones-constituent'),
};

// ============================================================================
// EXCHANGE DATA
// ============================================================================

export const exchangeEndpoints = {
  /**
   * Exchange market hours
   */
  exchangeMarketHours: (exchange: string) => 
    buildUrl('/exchange-market-hours', { exchange }),

  /**
   * Holidays by exchange
   */
  holidaysByExchange: (exchange: string) => 
    buildUrl('/holidays-by-exchange', { exchange }),

  /**
   * All exchange market hours
   */
  allExchangeMarketHours: () => buildUrl('/all-exchange-market-hours'),
};

// ============================================================================
// COMMODITIES
// ============================================================================

export const commoditiesEndpoints = {
  /**
   * Commodities list
   */
  commoditiesList: () => buildUrl('/commodities-list'),
};

// ============================================================================
// DISCOUNTED CASH FLOW
// ============================================================================

export const dcfEndpoints = {
  /**
   * Discounted cash flow
   */
  discountedCashFlow: (symbol: string) => 
    buildUrl('/discounted-cash-flow', { symbol }),

  /**
   * Levered discounted cash flow
   */
  leveredDiscountedCashFlow: (symbol: string) => 
    buildUrl('/levered-discounted-cash-flow', { symbol }),

  /**
   * Custom discounted cash flow
   */
  customDiscountedCashFlow: (symbol: string) => 
    buildUrl('/custom-discounted-cash-flow', { symbol }),

  /**
   * Custom levered discounted cash flow
   */
  customLeveredDiscountedCashFlow: (symbol: string) => 
    buildUrl('/custom-levered-discounted-cash-flow', { symbol }),
};

// ============================================================================
// FOREX
// ============================================================================

export const forexEndpoints = {
  /**
   * Forex list
   */
  forexList: () => buildUrl('/forex-list'),
};

// ============================================================================
// CRYPTO
// ============================================================================

export const cryptoEndpoints = {
  /**
   * Cryptocurrency list
   */
  cryptocurrencyList: () => buildUrl('/cryptocurrency-list'),
};

// ============================================================================
// CONGRESS TRADING
// ============================================================================

export const congressTradingEndpoints = {
  /**
   * Senate latest
   */
  senateLatest: (page = 0, limit = 100) => 
    buildUrl('/senate-latest', { page, limit }),

  /**
   * House latest
   */
  houseLatest: (page = 0, limit = 100) => 
    buildUrl('/house-latest', { page, limit }),

  /**
   * Senate trades by symbol
   */
  senateTrades: (symbol: string) => 
    buildUrl('/senate-trades', { symbol }),

  /**
   * Senate trades by name
   */
  senateTradesByName: (name: string) => 
    buildUrl('/senate-trades-by-name', { name }),

  /**
   * House trades by symbol
   */
  houseTrades: (symbol: string) => 
    buildUrl('/house-trades', { symbol }),

  /**
   * House trades by name
   */
  houseTradesByName: (name: string) => 
    buildUrl('/house-trades-by-name', { name }),
};

// ============================================================================
// ESG
// ============================================================================

export const esgEndpoints = {
  /**
   * ESG disclosures
   */
  esgDisclosures: (symbol: string) => 
    buildUrl('/esg-disclosures', { symbol }),

  /**
   * ESG ratings
   */
  esgRatings: (symbol: string) => 
    buildUrl('/esg-ratings', { symbol }),

  /**
   * ESG benchmark
   */
  esgBenchmark: () => buildUrl('/esg-benchmark'),
};

// ============================================================================
// COMMITMENT OF TRADERS
// ============================================================================

export const cotEndpoints = {
  /**
   * Commitment of traders report
   */
  commitmentOfTradersReport: () => buildUrl('/commitment-of-traders-report'),

  /**
   * Commitment of traders analysis
   */
  commitmentOfTradersAnalysis: () => buildUrl('/commitment-of-traders-analysis'),

  /**
   * Commitment of traders list
   */
  commitmentOfTradersList: () => buildUrl('/commitment-of-traders-list'),
};

// ============================================================================
// CROWDFUNDING & FUNDRAISING
// ============================================================================

export const fundraisingEndpoints = {
  /**
   * Crowdfunding offerings latest
   */
  crowdfundingOfferingsLatest: (page = 0, limit = 100) => 
    buildUrl('/crowdfunding-offerings-latest', { page, limit }),

  /**
   * Crowdfunding offerings search
   */
  crowdfundingOfferingsSearch: (name: string) => 
    buildUrl('/crowdfunding-offerings-search', { name }),

  /**
   * Crowdfunding offerings by CIK
   */
  crowdfundingOfferings: (cik: string) => 
    buildUrl('/crowdfunding-offerings', { cik }),

  /**
   * Fundraising latest
   */
  fundraisingLatest: (page = 0, limit = 10) => 
    buildUrl('/fundraising-latest', { page, limit }),

  /**
   * Fundraising search
   */
  fundraisingSearch: (name: string) => 
    buildUrl('/fundraising-search', { name }),

  /**
   * Fundraising by CIK
   */
  fundraising: (cik: string) => 
    buildUrl('/fundraising', { cik }),
};

// ============================================================================
// BULK ENDPOINTS
// ============================================================================

export const bulkEndpoints = {
  /**
   * Profile bulk
   */
  profileBulk: (part: number) => 
    buildUrl('/profile-bulk', { part: String(part) }),

  /**
   * Rating bulk
   */
  ratingBulk: () => buildUrl('/rating-bulk'),

  /**
   * DCF bulk
   */
  dcfBulk: () => buildUrl('/dcf-bulk'),

  /**
   * Scores bulk
   */
  scoresBulk: () => buildUrl('/scores-bulk'),

  /**
   * Price target summary bulk
   */
  priceTargetSummaryBulk: () => buildUrl('/price-target-summary-bulk'),

  /**
   * ETF holder bulk
   */
  etfHolderBulk: (part: number) => 
    buildUrl('/etf-holder-bulk', { part: String(part) }),

  /**
   * Upgrades downgrades consensus bulk
   */
  upgradesDowngradesConsensusBulk: () => buildUrl('/upgrades-downgrades-consensus-bulk'),

  /**
   * Key metrics TTM bulk
   */
  keyMetricsTtmBulk: () => buildUrl('/key-metrics-ttm-bulk'),

  /**
   * Ratios TTM bulk
   */
  ratiosTtmBulk: () => buildUrl('/ratios-ttm-bulk'),

  /**
   * Peers bulk
   */
  peersBulk: () => buildUrl('/peers-bulk'),

  /**
   * Earnings surprises bulk
   */
  earningsSurprisesBulk: (year: number) => 
    buildUrl('/earnings-surprises-bulk', { year: String(year) }),

  /**
   * Income statement bulk
   */
  incomeStatementBulk: (year: number, period: 'Q1' | 'Q2' | 'Q3' | 'Q4') => 
    buildUrl('/income-statement-bulk', { year: String(year), period }),

  /**
   * Income statement growth bulk
   */
  incomeStatementGrowthBulk: (year: number, period: 'Q1' | 'Q2' | 'Q3' | 'Q4') => 
    buildUrl('/income-statement-growth-bulk', { year: String(year), period }),

  /**
   * Balance sheet statement bulk
   */
  balanceSheetStatementBulk: (year: number, period: 'Q1' | 'Q2' | 'Q3' | 'Q4') => 
    buildUrl('/balance-sheet-statement-bulk', { year: String(year), period }),

  /**
   * Balance sheet statement growth bulk
   */
  balanceSheetStatementGrowthBulk: (year: number, period: 'Q1' | 'Q2' | 'Q3' | 'Q4') => 
    buildUrl('/balance-sheet-statement-growth-bulk', { year: String(year), period }),

  /**
   * Cash flow statement bulk
   */
  cashFlowStatementBulk: (year: number, period: 'Q1' | 'Q2' | 'Q3' | 'Q4') => 
    buildUrl('/cash-flow-statement-bulk', { year: String(year), period }),

  /**
   * Cash flow statement growth bulk
   */
  cashFlowStatementGrowthBulk: (year: number, period: 'Q1' | 'Q2' | 'Q3' | 'Q4') => 
    buildUrl('/cash-flow-statement-growth-bulk', { year: String(year), period }),

  /**
   * EOD bulk
   */
  eodBulk: (date: string) => 
    buildUrl('/eod-bulk', { date }),
};

// ============================================================================
// MAIN API CLIENT
// ============================================================================

import axios, { AxiosInstance } from 'axios';

class FinancialModelingPrepClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add API key to all requests
    this.client.interceptors.request.use((config) => {
      // Extract URL from config (buildUrl returns full URL)
      const url = new URL(config.url!);
      url.searchParams.set('apikey', API_KEY);
      config.url = url.toString();
      return config;
    });
  }

  // Export all endpoint builders
  search = searchEndpoints;
  list = listEndpoints;
  profile = profileEndpoints;
  mergersAcquisitions = mergersAcquisitionsEndpoints;
  executive = executiveEndpoints;
  quote = quoteEndpoints;
  financialStatements = financialStatementsEndpoints;
  historicalPrice = historicalPriceEndpoints;
  economic = economicEndpoints;
  corporateActions = corporateActionsEndpoints;
  transcript = transcriptEndpoints;
  news = newsEndpoints;
  institutionalOwnership = institutionalOwnershipEndpoints;
  analyst = analystEndpoints;
  sectorIndustry = sectorIndustryEndpoints;
  technicalIndicators = technicalIndicatorsEndpoints;
  etfFunds = etfFundsEndpoints;
  secFilings = secFilingsEndpoints;
  insiderTrading = insiderTradingEndpoints;
  index = indexEndpoints;
  exchange = exchangeEndpoints;
  commodities = commoditiesEndpoints;
  dcf = dcfEndpoints;
  forex = forexEndpoints;
  crypto = cryptoEndpoints;
  congressTrading = congressTradingEndpoints;
  esg = esgEndpoints;
  cot = cotEndpoints;
  fundraising = fundraisingEndpoints;
  bulk = bulkEndpoints;

  /**
   * Generic GET request helper
   */
  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }
}

// Export singleton instance
export const fmpClient = new FinancialModelingPrepClient();

// Export default
export default fmpClient;

