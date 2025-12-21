/**
 * Sentiment Timeline Card
 * Shows 7-day sentiment trend with line chart
 */

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchMultiSymbolSentimentTimeline, analyzeSentimentTrend } from '../../services/api/marketauxHistory';
import type { HistoricalSentimentData } from '../../services/api/marketauxHistory';
import { CardShell } from '../common/CardShell';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SentimentTimelineCardProps {
  symbols: string[];
  companyNames?: Record<string, string>;
  days?: number;
  compact?: boolean;
}

export function SentimentTimelineCard({
  symbols,
  companyNames = {},
  days = 7,
  compact = false,
}: SentimentTimelineCardProps) {
  const [data, setData] = useState<HistoricalSentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSentimentData();
  }, [symbols.join(',')]);

  const loadSentimentData = async () => {
    setLoading(true);
    setError(null);

    try {
      const historicalData = await fetchMultiSymbolSentimentTimeline(symbols, days);
      setData(historicalData);
    } catch (err) {
      console.error('Failed to load sentiment timeline:', err);
      // Check if it's a 403 error (premium feature)
      if (err instanceof Error && err.message.includes('subscription plan')) {
        setError('Sentiment timeline requires a premium Marketaux plan');
      } else {
        setError('Failed to load sentiment data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Transform data for recharts
  const chartData = data.length > 0 && data[0].dataPoints.length > 0
    ? data[0].dataPoints.map((_, index) => {
        const point: any = {
          date: data[0].dataPoints[index].date.substring(5), // MM-DD
        };
        
        data.forEach((symbolData) => {
          if (symbolData.dataPoints[index]) {
            point[symbolData.symbol] = (symbolData.dataPoints[index].sentimentAvg * 100).toFixed(1);
          }
        });
        
        return point;
      })
    : [];

  // Colors for different stocks
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <CardShell className={compact ? 'p-4' : 'p-6'}>
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-2 border-valura-ink border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted mt-2">Loading sentiment timeline...</p>
        </div>
      </CardShell>
    );
  }

  if (error) {
    return (
      <CardShell className={compact ? 'p-4' : 'p-6'}>
        <div className="text-center py-8">
          <p className="text-sm text-danger-fg mb-2">{error}</p>
          <button
            onClick={loadSentimentData}
            className="text-sm text-valura-ink hover:underline"
          >
            Try again
          </button>
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell className={compact ? 'p-4' : 'p-6'} hover>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-text-primary mb-1">
          📊 Sentiment Timeline ({days} Days)
        </h3>
        <p className="text-sm text-muted">
          Track how market sentiment has evolved for your underlyings
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={compact ? 200 : 300}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            tickLine={{ stroke: 'var(--border)' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            tickLine={{ stroke: 'var(--border)' }}
            label={{ value: 'Sentiment (%)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'var(--text-secondary)' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: any) => [`${value}%`, 'Sentiment']}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          
          {data.map((symbolData, index) => (
            <Line
              key={symbolData.symbol}
              type="monotone"
              dataKey={symbolData.symbol}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name={companyNames[symbolData.symbol] || symbolData.symbol}
            />
          ))}
          
          {/* Zero line */}
          <Line
            type="monotone"
            dataKey={() => 0}
            stroke="rgba(148,163,184,0.4)"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            legendType="none"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Trend Analysis */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.map((symbolData) => {
            const trend = analyzeSentimentTrend(symbolData.dataPoints);
            const TrendIcon = trend.trend === 'improving' ? TrendingUp : trend.trend === 'declining' ? TrendingDown : Minus;
            const trendColor = trend.trend === 'improving' ? 'text-success-fg' : trend.trend === 'declining' ? 'text-danger-fg' : 'text-muted';
            const trendBg = trend.trend === 'improving' ? 'bg-success-bg' : trend.trend === 'declining' ? 'bg-danger-bg' : 'bg-muted-bg';
            
            return (
              <div
                key={symbolData.symbol}
                className={`p-3 rounded-lg ${trendBg} border border-border`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-sm text-text-primary">
                    {symbolData.symbol}
                  </span>
                  <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                </div>
                <div className="text-xs text-muted">
                  {trend.trend === 'improving' && 'Sentiment improving ↗'}
                  {trend.trend === 'declining' && 'Turning negative ↘'}
                  {trend.trend === 'stable' && 'Sentiment stable →'}
                </div>
                {Math.abs(trend.changePercent) > 0 && (
                  <div className={`text-xs font-semibold mt-1 ${trendColor}`}>
                    {trend.changePercent > 0 ? '+' : ''}
                    {trend.changePercent.toFixed(0)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </CardShell>
  );
}

