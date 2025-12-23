/**
 * Market Intelligence Service
 * Fetches comprehensive real-time market data for AI-powered insights
 */

import { fmpClient } from './api/financialModelingPrep';

export interface MarketIntelligence {
  // Real-time pricing
  livePrice: number;
  priceChange: number;
  priceChangePct: number;
  volume: number;
  avgVolume: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  
  // Technical indicators
  rsi14: number | null; // Oversold/overbought
  sma50: number | null; // 50-day moving average
  sma200: number | null; // 200-day moving average
  ema20: number | null; // 20-day exponential MA
  priceVsSma50Pct: number | null; // Distance from 50-day MA
  priceVsSma200Pct: number | null; // Distance from 200-day MA
  
  // Market sentiment
  insiderTransactions: {
    recentBuys: number;
    recentSells: number;
    netSentiment: 'Bullish' | 'Bearish' | 'Neutral';
  } | null;
  
  institutionalOwnership: {
    percentHeld: number | null;
    totalPositions: number | null;
    increasedPositions: number | null;
    decreasedPositions: number | null;
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  } | null;
  
  // Sector context
  sectorPerformance: {
    sectorName: string;
    sectorChangePct: number | null;
    sectorRank: string; // Outperforming/Underperforming/In-line
  } | null;
  
  // News & events
  recentNews: {
    hasEarnings: boolean;
    hasDividend: boolean;
    hasInsiderActivity: boolean;
    hasUpgradeDowngrade: boolean;
    newsCount: number;
  };
  
  // Financial health (quick view)
  financialHealth: {
    debtToEquity: number | null;
    currentRatio: number | null;
    quickRatio: number | null;
    roe: number | null;
    roic: number | null;
    grossMargin: number | null;
    operatingMargin: number | null;
    profitMargin: number | null;
  } | null;
  
  // Valuation metrics
  valuation: {
    peRatio: number | null;
    pegRatio: number | null;
    priceToBook: number | null;
    priceToSales: number | null;
    evToEbitda: number | null;
    marketCap: number | null;
  } | null;
  
  // Growth metrics
  growth: {
    revenueGrowthYoy: number | null;
    earningsGrowthYoy: number | null;
    epsGrowthYoy: number | null;
  } | null;
}

/**
 * Fetch comprehensive market intelligence for a symbol
 */
export async function fetchMarketIntelligence(
  symbol: string
): Promise<MarketIntelligence> {
  try {
    // Fetch data in parallel for speed
    const [
      quoteData,
      keyMetricsData,
      ratiosData,
      insiderData,
      institutionalData,
      priceChangeData,
      financialGrowthData,
      newsData,
    ] = await Promise.allSettled([
      fmpClient.get(fmpClient.quote.quote(symbol)),
      fmpClient.get(fmpClient.financialStatements.keyMetricsTtm(symbol)),
      fmpClient.get(fmpClient.financialStatements.ratiosTtm(symbol)),
      fmpClient.get(fmpClient.insiderTrading.statistics(symbol)),
      fmpClient.get(fmpClient.institutionalOwnership.symbolPositionsSummary(
        symbol, 
        new Date().getFullYear(), 
        Math.ceil((new Date().getMonth() + 1) / 3)
      )),
      fmpClient.get(fmpClient.quote.stockPriceChange(symbol)),
      fmpClient.get(fmpClient.financialStatements.financialGrowth(symbol, 'quarter')),
      fmpClient.get(fmpClient.news.stockNews([symbol])),
    ]);

    // Extract quote data
    const quote = quoteData.status === 'fulfilled' && Array.isArray(quoteData.value) 
      ? quoteData.value[0] 
      : null;

    const keyMetrics = keyMetricsData.status === 'fulfilled' && Array.isArray(keyMetricsData.value)
      ? keyMetricsData.value[0]
      : null;

    const ratios = ratiosData.status === 'fulfilled' && Array.isArray(ratiosData.value)
      ? ratiosData.value[0]
      : null;

    const insider = insiderData.status === 'fulfilled' ? insiderData.value : null;
    
    const institutional = institutionalData.status === 'fulfilled' 
      ? institutionalData.value 
      : null;

    const priceChange = priceChangeData.status === 'fulfilled' && Array.isArray(priceChangeData.value)
      ? priceChangeData.value[0]
      : null;

    const financialGrowth = financialGrowthData.status === 'fulfilled' && Array.isArray(financialGrowthData.value)
      ? financialGrowthData.value[0]
      : null;

    const news = newsData.status === 'fulfilled' && Array.isArray(newsData.value)
      ? newsData.value
      : [];

    // Calculate insider sentiment
    let insiderTransactions = null;
    if (insider && typeof insider === 'object') {
      const recentBuys = (insider as any).acquisitions || 0;
      const recentSells = (insider as any).disposals || 0;
      const netBuySell = recentBuys - recentSells;
      
      insiderTransactions = {
        recentBuys,
        recentSells,
        netSentiment: netBuySell > 3 ? 'Bullish' as const : netBuySell < -3 ? 'Bearish' as const : 'Neutral' as const,
      };
    }

    // Calculate institutional sentiment
    let institutionalOwnership = null;
    if (institutional && typeof institutional === 'object' && (institutional as any).holders) {
      const holders = (institutional as any).holders;
      const increased = holders.filter((h: any) => h.change > 0).length;
      const decreased = holders.filter((h: any) => h.change < 0).length;
      const totalPercent = (institutional as any).totalInvested 
        ? ((institutional as any).totalInvested / ((institutional as any).marketCap || 1)) * 100
        : null;
      
      institutionalOwnership = {
        percentHeld: totalPercent,
        totalPositions: holders.length,
        increasedPositions: increased,
        decreasedPositions: decreased,
        sentiment: increased > decreased * 1.5 ? 'Bullish' as const : 
                   decreased > increased * 1.5 ? 'Bearish' as const : 'Neutral' as const,
      };
    }

    // Calculate technical indicators (approximate from price change data)
    const sma50 = quote && priceChange ? quote.price / (1 + (priceChange['10Y'] || 0) / 100) : null;
    const sma200 = quote && priceChange ? quote.price / (1 + (priceChange['10Y'] || 0) / 100) : null;
    const priceVsSma50Pct = sma50 && quote ? ((quote.price - sma50) / sma50) * 100 : null;
    const priceVsSma200Pct = sma200 && quote ? ((quote.price - sma200) / sma200) * 100 : null;

    // Build market intelligence object
    const intelligence: MarketIntelligence = {
      // Real-time pricing
      livePrice: quote?.price || 0,
      priceChange: quote?.change || 0,
      priceChangePct: quote?.changesPercentage || 0,
      volume: quote?.volume || 0,
      avgVolume: quote?.avgVolume || 0,
      dayHigh: quote?.dayHigh || 0,
      dayLow: quote?.dayLow || 0,
      fiftyTwoWeekHigh: quote?.yearHigh || 0,
      fiftyTwoWeekLow: quote?.yearLow || 0,
      
      // Technical indicators (simplified - in production you'd fetch actual indicators)
      rsi14: null, // Would need historical chart data
      sma50: sma50,
      sma200: sma200,
      ema20: null,
      priceVsSma50Pct: priceVsSma50Pct,
      priceVsSma200Pct: priceVsSma200Pct,
      
      // Market sentiment
      insiderTransactions,
      institutionalOwnership,
      
      // Sector context
      sectorPerformance: {
        sectorName: quote?.sector || 'Unknown',
        sectorChangePct: null, // Would need sector performance API
        sectorRank: priceChange && priceChange['1D'] > 0 ? 'Outperforming' : 'Underperforming',
      },
      
      // News & events
      recentNews: {
        hasEarnings: news.some((n: any) => n.title?.toLowerCase().includes('earnings')),
        hasDividend: news.some((n: any) => n.title?.toLowerCase().includes('dividend')),
        hasInsiderActivity: insiderTransactions !== null,
        hasUpgradeDowngrade: news.some((n: any) => 
          n.title?.toLowerCase().includes('upgrade') || 
          n.title?.toLowerCase().includes('downgrade')
        ),
        newsCount: news.length,
      },
      
      // Financial health
      financialHealth: {
        debtToEquity: ratios?.debtEquityRatio || null,
        currentRatio: ratios?.currentRatio || null,
        quickRatio: ratios?.quickRatio || null,
        roe: ratios?.returnOnEquity || null,
        roic: ratios?.returnOnCapitalEmployed || null,
        grossMargin: ratios?.grossProfitMargin || null,
        operatingMargin: ratios?.operatingProfitMargin || null,
        profitMargin: ratios?.netProfitMargin || null,
      },
      
      // Valuation metrics
      valuation: {
        peRatio: quote?.pe || keyMetrics?.peRatioTTM || null,
        pegRatio: keyMetrics?.pegRatioTTM || null,
        priceToBook: keyMetrics?.priceToBookRatioTTM || null,
        priceToSales: keyMetrics?.priceToSalesRatioTTM || null,
        evToEbitda: keyMetrics?.enterpriseValueOverEBITDATTM || null,
        marketCap: quote?.marketCap || keyMetrics?.marketCapTTM || null,
      },
      
      // Growth metrics
      growth: {
        revenueGrowthYoy: financialGrowth?.revenueGrowth ? financialGrowth.revenueGrowth * 100 : null,
        earningsGrowthYoy: financialGrowth?.netIncomeGrowth ? financialGrowth.netIncomeGrowth * 100 : null,
        epsGrowthYoy: financialGrowth?.epsgrowth ? financialGrowth.epsgrowth * 100 : null,
      },
    };

    return intelligence;
  } catch (error) {
    console.error('Error fetching market intelligence:', error);
    
    // Return minimal data structure on error
    return {
      livePrice: 0,
      priceChange: 0,
      priceChangePct: 0,
      volume: 0,
      avgVolume: 0,
      dayHigh: 0,
      dayLow: 0,
      fiftyTwoWeekHigh: 0,
      fiftyTwoWeekLow: 0,
      rsi14: null,
      sma50: null,
      sma200: null,
      ema20: null,
      priceVsSma50Pct: null,
      priceVsSma200Pct: null,
      insiderTransactions: null,
      institutionalOwnership: null,
      sectorPerformance: null,
      recentNews: {
        hasEarnings: false,
        hasDividend: false,
        hasInsiderActivity: false,
        hasUpgradeDowngrade: false,
        newsCount: 0,
      },
      financialHealth: null,
      valuation: null,
      growth: null,
    };
  }
}

/**
 * Format market intelligence into readable text for AI context
 */
export function formatMarketIntelligenceForAI(intel: MarketIntelligence): string {
  const parts: string[] = [];

  // Live pricing
  parts.push(`LIVE MARKET DATA:
- Current Price: $${intel.livePrice.toFixed(2)}
- Change Today: ${intel.priceChange >= 0 ? '+' : ''}${intel.priceChange.toFixed(2)} (${intel.priceChangePct >= 0 ? '+' : ''}${intel.priceChangePct.toFixed(2)}%)
- Day Range: $${intel.dayLow.toFixed(2)} - $${intel.dayHigh.toFixed(2)}
- 52-Week Range: $${intel.fiftyTwoWeekLow.toFixed(2)} - $${intel.fiftyTwoWeekHigh.toFixed(2)}
- Volume: ${(intel.volume / 1_000_000).toFixed(1)}M (Avg: ${(intel.avgVolume / 1_000_000).toFixed(1)}M)`);

  // Technical position
  if (intel.sma50 && intel.priceVsSma50Pct !== null) {
    parts.push(`\nTECHNICAL POSITION:
- Price vs 50-day MA: ${intel.priceVsSma50Pct >= 0 ? '+' : ''}${intel.priceVsSma50Pct.toFixed(1)}%
- Distance from 52-week high: ${(((intel.livePrice - intel.fiftyTwoWeekHigh) / intel.fiftyTwoWeekHigh) * 100).toFixed(1)}%
- Distance from 52-week low: ${(((intel.livePrice - intel.fiftyTwoWeekLow) / intel.fiftyTwoWeekLow) * 100).toFixed(1)}%`);
  }

  // Market sentiment
  if (intel.insiderTransactions) {
    parts.push(`\nINSIDER ACTIVITY:
- Recent Buys: ${intel.insiderTransactions.recentBuys}
- Recent Sells: ${intel.insiderTransactions.recentSells}
- Sentiment: ${intel.insiderTransactions.netSentiment}`);
  }

  if (intel.institutionalOwnership) {
    parts.push(`\nINSTITUTIONAL OWNERSHIP:
- Total Positions: ${intel.institutionalOwnership.totalPositions}
- Increased Positions: ${intel.institutionalOwnership.increasedPositions}
- Decreased Positions: ${intel.institutionalOwnership.decreasedPositions}
- Sentiment: ${intel.institutionalOwnership.sentiment}`);
  }

  // Valuation
  if (intel.valuation && intel.valuation.peRatio) {
    parts.push(`\nVALUATION METRICS:
- P/E Ratio: ${intel.valuation.peRatio.toFixed(1)}
${intel.valuation.pegRatio ? `- PEG Ratio: ${intel.valuation.pegRatio.toFixed(2)}` : ''}
${intel.valuation.priceToBook ? `- Price/Book: ${intel.valuation.priceToBook.toFixed(2)}` : ''}
${intel.valuation.evToEbitda ? `- EV/EBITDA: ${intel.valuation.evToEbitda.toFixed(1)}` : ''}
${intel.valuation.marketCap ? `- Market Cap: $${(intel.valuation.marketCap / 1_000_000_000).toFixed(1)}B` : ''}`);
  }

  // Growth
  if (intel.growth && intel.growth.revenueGrowthYoy !== null) {
    parts.push(`\nGROWTH METRICS:
- Revenue Growth (YoY): ${intel.growth.revenueGrowthYoy >= 0 ? '+' : ''}${intel.growth.revenueGrowthYoy.toFixed(1)}%
${intel.growth.earningsGrowthYoy !== null ? `- Earnings Growth (YoY): ${intel.growth.earningsGrowthYoy >= 0 ? '+' : ''}${intel.growth.earningsGrowthYoy.toFixed(1)}%` : ''}
${intel.growth.epsGrowthYoy !== null ? `- EPS Growth (YoY): ${intel.growth.epsGrowthYoy >= 0 ? '+' : ''}${intel.growth.epsGrowthYoy.toFixed(1)}%` : ''}`);
  }

  // Financial health
  if (intel.financialHealth) {
    const health = intel.financialHealth;
    parts.push(`\nFINANCIAL HEALTH:
${health.debtToEquity ? `- Debt/Equity: ${health.debtToEquity.toFixed(2)}` : ''}
${health.currentRatio ? `- Current Ratio: ${health.currentRatio.toFixed(2)}` : ''}
${health.roe ? `- ROE: ${(health.roe * 100).toFixed(1)}%` : ''}
${health.grossMargin ? `- Gross Margin: ${(health.grossMargin * 100).toFixed(1)}%` : ''}
${health.operatingMargin ? `- Operating Margin: ${(health.operatingMargin * 100).toFixed(1)}%` : ''}`);
  }

  // Recent news
  if (intel.recentNews.newsCount > 0) {
    const events: string[] = [];
    if (intel.recentNews.hasEarnings) events.push('earnings report');
    if (intel.recentNews.hasDividend) events.push('dividend announcement');
    if (intel.recentNews.hasUpgradeDowngrade) events.push('analyst rating change');
    if (intel.recentNews.hasInsiderActivity) events.push('insider trading');
    
    parts.push(`\nRECENT EVENTS: ${events.join(', ') || 'None significant'}`);
  }

  return parts.join('\n');
}

