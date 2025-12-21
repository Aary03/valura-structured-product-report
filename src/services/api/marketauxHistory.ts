/**
 * Marketaux Historical Data Service
 * Fetches time-series sentiment and volume data
 */

import { fetchMarketStats, getDateDaysAgo, getTodayDate } from './marketaux';
import type { MarketStatsEntity } from './marketaux';

export interface SentimentDataPoint {
  date: string; // YYYY-MM-DD
  sentimentAvg: number;
  mentions: number;
  sentimentPositive: number;
  sentimentNegative: number;
  sentimentNeutral: number;
}

export interface HistoricalSentimentData {
  symbol: string;
  dataPoints: SentimentDataPoint[];
}

/**
 * Fetch sentiment timeline for a symbol over N days
 * Note: Free tier may not have access to stats endpoints (403 error)
 */
export async function fetchSentimentTimeline(
  symbol: string,
  days: number = 7
): Promise<HistoricalSentimentData> {
  const dataPoints: SentimentDataPoint[] = [];
  
  // Fetch data day by day
  // Note: This endpoint may not be available on free tier
  for (let i = days - 1; i >= 0; i--) {
    const date = getDateDaysAgo(i);
    
    try {
      const response = await fetchMarketStats({
        groupBy: 'symbol',
        symbols: [symbol],
        publishedOn: date,
        limit: 1,
      });

      if (response.data.length > 0) {
        const stat = response.data[0];
        dataPoints.push({
          date,
          sentimentAvg: stat.sentiment_avg,
          mentions: stat.mentions,
          sentimentPositive: stat.sentiment_positive,
          sentimentNegative: stat.sentiment_negative,
          sentimentNeutral: stat.sentiment_neutral,
        });
      } else {
        // No data for this day
        dataPoints.push({
          date,
          sentimentAvg: 0,
          mentions: 0,
          sentimentPositive: 0,
          sentimentNegative: 0,
          sentimentNeutral: 0,
        });
      }
    } catch (error) {
      console.warn(`Failed to fetch sentiment for ${symbol} on ${date}:`, error);
      // Add placeholder
      dataPoints.push({
        date,
        sentimentAvg: 0,
        mentions: 0,
        sentimentPositive: 0,
        sentimentNegative: 0,
        sentimentNeutral: 0,
      });
    }
  }

  return {
    symbol,
    dataPoints,
  };
}

/**
 * Fetch sentiment timelines for multiple symbols
 */
export async function fetchMultiSymbolSentimentTimeline(
  symbols: string[],
  days: number = 7
): Promise<HistoricalSentimentData[]> {
  const promises = symbols.map(symbol => fetchSentimentTimeline(symbol, days));
  return Promise.all(promises);
}

/**
 * Calculate sentiment trend (improving/declining)
 */
export function analyzeSentimentTrend(dataPoints: SentimentDataPoint[]): {
  trend: 'improving' | 'declining' | 'stable';
  changePercent: number;
} {
  if (dataPoints.length < 2) {
    return { trend: 'stable', changePercent: 0 };
  }

  // Compare first half vs second half
  const midpoint = Math.floor(dataPoints.length / 2);
  const firstHalf = dataPoints.slice(0, midpoint);
  const secondHalf = dataPoints.slice(midpoint);

  const avgFirst = firstHalf.reduce((sum, d) => sum + d.sentimentAvg, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, d) => sum + d.sentimentAvg, 0) / secondHalf.length;

  const changePercent = avgFirst !== 0 ? ((avgSecond - avgFirst) / Math.abs(avgFirst)) * 100 : 0;

  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (changePercent > 10) trend = 'improving';
  else if (changePercent < -10) trend = 'declining';

  return { trend, changePercent };
}

