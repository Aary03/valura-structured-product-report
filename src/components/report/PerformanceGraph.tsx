/**
 * Premium Performance Graph Component
 * Area chart with gradient fill, reference lines, and stats
 */

import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Label,
} from 'recharts';
import type { HistoricalPricePoint } from '../../services/api/mappers';
import { formatDate } from '../../core/types/dates';
import { CardShell } from '../common/CardShell';
import { SectionHeader } from '../common/SectionHeader';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface PerformanceGraphProps {
  historicalData: HistoricalPricePoint[][];
  underlyingSymbols: string[];
  barrierLevel: number;
  strikeLevel?: number;
  initialFixings?: Record<string, number>;
  basketType?: 'single' | 'worst_of';
  worstUnderlyingIndex?: number | null;
  pdfMode?: boolean;
}

const COLORS = ['#4F46E5', '#14B8A6', '#F97316', '#8B5CF6']; // Indigo, Teal, Coral, Purple
const GRADIENT_IDS = ['gradient1', 'gradient2', 'gradient3', 'gradient4'];

export function PerformanceGraph({
  historicalData,
  underlyingSymbols,
  barrierLevel,
  strikeLevel,
  initialFixings = {},
  basketType = 'single',
  worstUnderlyingIndex = null,
  pdfMode = false,
}: PerformanceGraphProps) {
  void initialFixings;
  if (historicalData.length === 0) {
    return (
      <CardShell className="p-6">
        <SectionHeader title="Underlying price history (not product performance)" />
        <div className="text-center py-8 text-text-secondary">No historical data available</div>
      </CardShell>
    );
  }

  // Combine all historical data into one dataset
  const allDates = new Set<string>();
  historicalData.forEach((series) => {
    series.forEach((point) => allDates.add(point.date));
  });
  const sortedDates = Array.from(allDates).sort();

  // Create combined dataset - normalize to initial fixing = 100
  const chartData = sortedDates.map((date) => {
    const point: Record<string, any> = { date };
    const normalizedValues: number[] = [];
    
    historicalData.forEach((series, index) => {
      const pointForDate = series.find((p) => p.date === date);
      if (pointForDate) {
        // Normalized should already be relative to initial fixing = 100
        // But ensure it's correct
        const normalized = pointForDate.normalized;
        point[underlyingSymbols[index] || `Series${index}`] = normalized;
        normalizedValues.push(normalized);
      }
    });
    
    // Calculate worst-of index for baskets
    if (basketType === 'worst_of' && normalizedValues.length > 0) {
      point['Worst-of'] = Math.min(...normalizedValues);
    }
    
    return point;
  });

  // Calculate stats - use worst-of for baskets, first underlying for single
  const firstSeries = historicalData[0] || [];
  const values = basketType === 'worst_of' && chartData.length > 0
    ? chartData.map((p) => p['Worst-of'] || 100)
    : firstSeries.map((p) => p.normalized);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue;
  void range;
  const lastValue = values[values.length - 1] || 100;
  const firstValue = values[0] || 100;
  void firstValue;
  const drawdown = ((lastValue - maxValue) / maxValue) * 100;
  
  // Calculate worst-of current level if basket
  const worstOfCurrentLevel = basketType === 'worst_of' && chartData.length > 0
    ? chartData[chartData.length - 1]['Worst-of'] || 100
    : null;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-border rounded-lg shadow-strong p-3">
          <p className="text-text-primary font-semibold mb-2">
            {formatDate(label, 'long')}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-semibold">{entry.name}:</span>{' '}
              {entry.value.toFixed(2)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // End label component
  const EndLabel = ({ symbol, value, color }: { symbol: string; value: number; color: string }) => {
    if (!chartData.length) return null;
    const lastPoint = chartData[chartData.length - 1];
    void lastPoint;
    return (
      <Label
        value={`${symbol} ${value.toFixed(0)}%`}
        position="right"
        offset={10}
        style={{
          fill: color,
          fontSize: '11px',
          fontWeight: 'bold',
        }}
        content={({ x, y }: any) => {
          if (!x || !y) return null;
          return (
            <g>
              <rect
                x={x - 5}
                y={y - 8}
                width={60}
                height={16}
                fill="white"
                stroke={color}
                strokeWidth={1.5}
                rx={8}
              />
              <text
                x={x + 25}
                y={y + 4}
                fill={color}
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
              >
                {symbol} {value.toFixed(0)}%
              </text>
            </g>
          );
        }}
      />
    );
  };

  const barrierY = barrierLevel * 100;
  const strikeY = strikeLevel ? strikeLevel * 100 : null;
  const showBarrierLine =
    Number.isFinite(barrierLevel) &&
    barrierLevel > 0 &&
    Math.abs(barrierY - 100) > 0.5;

  const formatMonthYear = (value: string) => {
    // Keep labels short for PDF to avoid overlaps: "Dec 24"
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  return (
    <CardShell className={pdfMode ? "p-3" : "p-6"} hover={!pdfMode}>
      {pdfMode ? (
        <div className="mb-2">
          <div className="text-sm font-extrabold text-text-primary">
            Underlying price history (not product performance)
          </div>
          <div className="text-xs text-text-secondary">
            Normalized to initial fixing = 100
          </div>
        </div>
      ) : (
        <SectionHeader
          title="Underlying price history (not product performance)"
          subtitle="Historical price normalized to initial fixing = 100%"
        />
      )}
      
      <ResponsiveContainer width="100%" height={pdfMode ? 220 : 400}>
        <AreaChart data={chartData} margin={{ top: 14, right: pdfMode ? 8 : 30, left: pdfMode ? 6 : 20, bottom: pdfMode ? 28 : 60 }}>
          <defs>
            {COLORS.map((color, index) => (
              <linearGradient key={GRADIENT_IDS[index]} id={GRADIENT_IDS[index]} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          
          <XAxis
            dataKey="date"
            tickFormatter={(value) => (pdfMode ? formatMonthYear(String(value)) : formatDate(String(value), 'short'))}
            stroke="var(--text-secondary)"
            tick={{ fill: 'var(--text-secondary)', fontSize: pdfMode ? 9 : 11 }}
            angle={pdfMode ? 0 : -30}
            textAnchor={pdfMode ? 'middle' : 'end'}
            height={pdfMode ? 36 : 70}
            minTickGap={pdfMode ? 40 : 10}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={['auto', 'auto']}
            stroke="var(--text-secondary)"
            tick={{ fill: 'var(--text-secondary)', fontSize: pdfMode ? 9 : 12 }}
            width={pdfMode ? 36 : 48}
            tickFormatter={(v) => {
              // Ensure we're formatting as percentage, not raw numbers
              const num = typeof v === 'number' ? v : parseFloat(String(v));
              if (isNaN(num)) return '0%';
              return `${num.toFixed(0)}%`;
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          {!pdfMode && <Legend />}
          
          {/* 100% reference line */}
          <ReferenceLine
            y={100}
            stroke="var(--chart-barrier)"
            strokeDasharray="2 2"
            strokeWidth={1}
            label={pdfMode ? undefined : {
              value: 'Initial Fixing (100%)',
              position: 'right',
              fill: 'var(--text-tertiary)',
              fontSize: 10,
            }}
          />
          
          {/* Barrier reference line (hide when not meaningful, e.g., CPPN) */}
          {showBarrierLine && (
            <ReferenceLine
              y={barrierY}
              stroke="var(--chart-barrier)"
              strokeDasharray="8 4"
              strokeWidth={2}
              label={pdfMode ? undefined : {
                value: `Barrier ${barrierY.toFixed(0)}%`,
                position: 'right',
                fill: 'var(--text-secondary)',
                fontSize: 11,
              }}
            />
          )}
          
          {/* Strike reference line (if applicable) */}
          {strikeY && (
            <ReferenceLine
              y={strikeY}
              stroke="var(--chart-strike)"
              strokeDasharray="6 3"
              strokeWidth={2}
              label={pdfMode ? undefined : {
                value: `Strike ${strikeY.toFixed(0)}%`,
                position: 'right',
                fill: 'var(--text-secondary)',
                fontSize: 11,
              }}
            />
          )}
          
          {/* Area charts for each underlying */}
          {underlyingSymbols.map((symbol, index) => {
            const lastValue = chartData.length > 0 
              ? chartData[chartData.length - 1][symbol] 
              : 100;
            void lastValue;
            const isWorst = worstUnderlyingIndex !== null && index === worstUnderlyingIndex;
            return (
              <Area
                key={symbol}
                type="monotone"
                dataKey={symbol}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={isWorst ? 3.5 : 2.5}
                fill={`url(#${GRADIENT_IDS[index % GRADIENT_IDS.length]})`}
                name={symbol}
                dot={false}
                activeDot={{ r: 5, fill: COLORS[index % COLORS.length] }}
                isAnimationActive={!pdfMode}
              />
            );
          })}
          
          {/* Worst-of line (bold) */}
          {basketType === 'worst_of' && (
            <Line
              type="monotone"
              dataKey="Worst-of"
              stroke="var(--valura-mint-600)"
              strokeWidth={4}
              dot={false}
              activeDot={{ r: 6, fill: '#EF4444' }}
              name="Worst-of"
              isAnimationActive={!pdfMode}
            />
          )}
          
          {/* End labels (screen only, they overlap in PDF) */}
          {!pdfMode && underlyingSymbols.map((symbol, index) => {
            const lastValue = chartData.length > 0 
              ? chartData[chartData.length - 1][symbol] 
              : 100;
            void lastValue;
            return (
              <Line
                key={`label-${symbol}`}
                type="monotone"
                dataKey={symbol}
                stroke="none"
                dot={false}
                data={[chartData[chartData.length - 1]]}
                label={<EndLabel symbol={symbol} value={lastValue} color={COLORS[index % COLORS.length]} />}
                isAnimationActive={false}
              />
            );
          })}
          
          {/* Worst-of end label */}
          {!pdfMode && basketType === 'worst_of' && chartData.length > 0 && (
            <Line
              key="label-worst-of"
              type="monotone"
              dataKey="Worst-of"
              stroke="none"
              dot={false}
              data={[chartData[chartData.length - 1]]}
              label={<EndLabel symbol="Worst-of" value={chartData[chartData.length - 1]['Worst-of'] || 100} color="#EF4444" />}
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Mini stats row */}
      {!pdfMode && (
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="flex items-center space-x-2 px-3 py-2 bg-primary-light rounded-lg">
          <BarChart3 className="w-4 h-4 text-primary" />
          <div>
            <div className="text-xs text-text-secondary">1Y Range</div>
            <div className="text-sm font-semibold text-text-primary">
              {minValue.toFixed(0)}% - {maxValue.toFixed(0)}%
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-2 bg-danger-light rounded-lg">
          <TrendingDown className="w-4 h-4 text-danger" />
          <div>
            <div className="text-xs text-text-secondary">Max Drawdown</div>
            <div className="text-sm font-semibold text-text-primary">
              {drawdown.toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-2 bg-success-light rounded-lg">
          <TrendingUp className="w-4 h-4 text-success" />
          <div>
            <div className="text-xs text-text-secondary">
              {basketType === 'worst_of' ? 'Current Level (Worst-of)' : 'Current Level'}
            </div>
            <div className="text-sm font-semibold text-text-primary">
              {(worstOfCurrentLevel !== null ? worstOfCurrentLevel : lastValue).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
      )}
      
      {!pdfMode && (
      <p className="text-sm text-text-secondary mt-4 leading-relaxed">
        This graph shows the price history for the underlyings, normalized to initial fixing = 100%.
        The barrier and strike levels are shown as reference lines. Historical movements help assess
        the likelihood of barrier breach.
      </p>
      )}
    </CardShell>
  );
}
