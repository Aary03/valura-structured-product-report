/**
 * Trigger Chart Component
 * Price chart with conditional trigger lines based on product type
 */

import type { ProductLifecycleData } from '../../types/lifecycle';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatNumber, formatPercent } from '../../core/utils/math';

interface TriggerChartProps {
  data: ProductLifecycleData;
  historicalData?: Array<{
    date: string;
    [symbol: string]: number | string;
  }>;
}

export function TriggerChart({ data, historicalData = [] }: TriggerChartProps) {
  const [viewMode, setViewMode] = useState<'all' | 'worst'>('all');
  
  const { bucket, underlyings, worstPerformerIndex, regularIncomeTerms, capitalProtectionTerms, boostedGrowthTerms } = data;
  
  // Colors for underlyings
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  
  // Get worst performer if basket
  const worstUnderlying = worstPerformerIndex !== undefined ? underlyings[worstPerformerIndex] : underlyings[0];
  
  // Determine which underlyings to show
  const displayUnderlyings = viewMode === 'worst' ? [worstUnderlying] : underlyings;
  
  // Build chart data - filter to only show relevant symbols
  const chartData = historicalData.length > 0 
    ? historicalData.map(item => {
        const filtered: any = { date: item.date };
        displayUnderlyings.forEach(u => {
          if (item[u.symbol] !== undefined) {
            filtered[u.symbol] = item[u.symbol];
          }
        });
        return filtered;
      })
    : [
        {
          date: 'Initial',
          ...Object.fromEntries(displayUnderlyings.map(u => [u.symbol, u.initialPrice])),
        },
        {
          date: 'Current',
          ...Object.fromEntries(displayUnderlyings.map(u => [u.symbol, u.currentPrice])),
        },
      ];
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    if (dateStr === 'Initial' || dateStr === 'Current') return dateStr;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };
  
  // Calculate Y-axis domain
  const allPrices = displayUnderlyings.flatMap(u => [u.initialPrice, u.currentPrice]);
  const triggerPrices = [
    ...displayUnderlyings.filter(u => u.protectionLevel).map(u => u.protectionLevel!),
    ...displayUnderlyings.filter(u => u.autocallLevel).map(u => u.autocallLevel!),
    ...displayUnderlyings.filter(u => u.participationStart).map(u => u.participationStart!),
    ...displayUnderlyings.filter(u => u.capLevel).map(u => u.capLevel!),
    ...displayUnderlyings.filter(u => u.barrierLevel).map(u => u.barrierLevel!),
  ];
  const allValues = [...allPrices, ...triggerPrices].filter(v => v && !isNaN(v));
  const minValue = Math.min(...allValues) * 0.95;
  const maxValue = Math.max(...allValues) * 1.05;
  
  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-base text-text-primary uppercase tracking-wide">
            Performance Chart
          </h3>
          <p className="text-xs text-text-tertiary mt-1">
            {historicalData.length > 0 
              ? `${historicalData.length} days of real market data from FMP`
              : 'Sample data (initial vs current)'}
          </p>
        </div>
        
        {/* View toggle (if basket) */}
        {underlyings.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
              }`}
            >
              All Underlyings
            </button>
            <button
              onClick={() => setViewMode('worst')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'worst'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
              }`}
            >
              Worst Performer
            </button>
          </div>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280" 
            style={{ fontSize: '12px' }}
            tickFormatter={formatDate}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#6b7280" 
            style={{ fontSize: '12px' }}
            domain={[minValue, maxValue]}
            tickFormatter={(value) => `$${formatNumber(value, 0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            formatter={(value: any) => [`$${formatNumber(value, 2)}`, 'Price']}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          
          {/* Price lines for each underlying */}
          {displayUnderlyings.map((u, idx) => (
            <Line
              key={u.symbol}
              type="monotone"
              dataKey={u.symbol}
              stroke={colors[idx % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name={u.symbol}
            />
          ))}
          
          {/* Trigger lines based on bucket */}
          {bucket === 'REGULAR_INCOME' && displayUnderlyings[0].autocallLevel && (
            <ReferenceLine
              y={displayUnderlyings[0].autocallLevel}
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Autocall: $${formatNumber(displayUnderlyings[0].autocallLevel, 2)}`,
                position: 'right',
                fill: '#10b981',
                fontSize: 11,
                fontWeight: 'bold',
              }}
            />
          )}
          
          {bucket === 'REGULAR_INCOME' && displayUnderlyings[0].protectionLevel && (
            <ReferenceLine
              y={displayUnderlyings[0].protectionLevel}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Protection: $${formatNumber(displayUnderlyings[0].protectionLevel, 2)}`,
                position: 'right',
                fill: '#f59e0b',
                fontSize: 11,
                fontWeight: 'bold',
              }}
            />
          )}
          
          {bucket === 'CAPITAL_PROTECTION' && displayUnderlyings[0].participationStart && (
            <ReferenceLine
              y={displayUnderlyings[0].participationStart}
              stroke="#3b82f6"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Participation Start: $${formatNumber(displayUnderlyings[0].participationStart, 2)}`,
                position: 'right',
                fill: '#3b82f6',
                fontSize: 11,
                fontWeight: 'bold',
              }}
            />
          )}
          
          {bucket === 'CAPITAL_PROTECTION' && displayUnderlyings[0].capLevel && (
            <ReferenceLine
              y={displayUnderlyings[0].capLevel}
              stroke="#8b5cf6"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Cap: $${formatNumber(displayUnderlyings[0].capLevel, 2)}`,
                position: 'right',
                fill: '#8b5cf6',
                fontSize: 11,
                fontWeight: 'bold',
              }}
            />
          )}
          
          {bucket === 'BOOSTED_GROWTH' && displayUnderlyings[0].barrierLevel && (
            <ReferenceLine
              y={displayUnderlyings[0].barrierLevel}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Barrier: $${formatNumber(displayUnderlyings[0].barrierLevel, 2)}`,
                position: 'right',
                fill: '#ef4444',
                fontSize: 11,
                fontWeight: 'bold',
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      
      {/* Legend for trigger lines */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        {bucket === 'REGULAR_INCOME' && (
          <>
            {displayUnderlyings[0].autocallLevel && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-green-500 rounded-full" style={{ borderTop: '2px dashed #10b981' }} />
                <span className="text-text-secondary">Autocall trigger</span>
              </div>
            )}
            {displayUnderlyings[0].protectionLevel && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-amber-500 rounded-full" style={{ borderTop: '2px dashed #f59e0b' }} />
                <span className="text-text-secondary">Protection level</span>
              </div>
            )}
          </>
        )}
        
        {bucket === 'CAPITAL_PROTECTION' && (
          <>
            {displayUnderlyings[0].participationStart && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-blue-500 rounded-full" style={{ borderTop: '2px dashed #3b82f6' }} />
                <span className="text-text-secondary">Participation start</span>
              </div>
            )}
            {displayUnderlyings[0].capLevel && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-purple-500 rounded-full" style={{ borderTop: '2px dashed #8b5cf6' }} />
                <span className="text-text-secondary">Cap level</span>
              </div>
            )}
          </>
        )}
        
        {bucket === 'BOOSTED_GROWTH' && displayUnderlyings[0].barrierLevel && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-red-500 rounded-full" style={{ borderTop: '2px dashed #ef4444' }} />
            <span className="text-text-secondary">Barrier (must not breach)</span>
          </div>
        )}
      </div>
    </div>
  );
}
