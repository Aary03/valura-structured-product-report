/**
 * Premium Payoff Graph Component
 * Enhanced chart with gradients, zones, annotations, and current marker
 */

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
  Label,
} from 'recharts';
import type { CurvePoint } from '../../products/common/payoffTypes';
import { CardShell } from '../common/CardShell';
import { SectionHeader } from '../common/SectionHeader';
import { TrendingDown } from 'lucide-react';

interface PayoffGraphProps {
  curvePoints: CurvePoint[];
  barrierLevel: number;
  strikeLevel?: number;
  intrinsicValue: number | null;
  currentLevel: number;
  variant?: 'standard_barrier_rc' | 'low_strike_geared_put';
  breakEvenPct?: number; // Break-even worst-of final level (as percentage, e.g., 90 for 90%)
  pdfMode?: boolean;
}

export function PayoffGraph({
  curvePoints,
  barrierLevel,
  strikeLevel,
  intrinsicValue,
  currentLevel,
  variant: _variant = 'standard_barrier_rc',
  breakEvenPct,
  pdfMode = false,
}: PayoffGraphProps) {
  void _variant;
  const [showCoupons, setShowCoupons] = useState(false);
  const [showBreakEven, setShowBreakEven] = useState(false);

  // Transform curve points for chart
  const chartData = curvePoints.map((point) => ({
    x: point.x * 100, // Convert to percentage
    payoff: point.redemptionPct * 100, // Convert to percentage
    total: point.totalPct * 100,
  }));

  // Find intrinsic value point
  const intrinsicPoint = intrinsicValue !== null
    ? {
        x: currentLevel * 100,
        payoff: intrinsicValue * 100,
        total: intrinsicValue * 100 + (showCoupons ? (intrinsicValue * 100 * 0.1) : 0), // Approximate
        label: 'Current Value',
      }
    : null;

  const barrierX = barrierLevel * 100;
  const strikeX = strikeLevel ? strikeLevel * 100 : null;

  // Calculate gearing for low strike variant
  const gearing = strikeLevel ? (1 / strikeLevel).toFixed(2) : null;

  // Determine scenario based on final level
  const getScenario = (finalLevel: number) => {
    if (finalLevel >= barrierX) {
      return 'Cash Redemption';
    }
    return 'Share Conversion';
  };

  // Custom tooltip - FIXED to show correct data
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const finalLevel = label;
      const scenario = getScenario(finalLevel);
      const payoffEntry = payload.find((p: any) => p.dataKey === 'payoff');
      const totalEntry = payload.find((p: any) => p.dataKey === 'total');
      
      return (
        <div className="bg-white border border-border rounded-lg shadow-strong p-4 min-w-[200px]">
          <p className="text-valura-ink font-semibold mb-3 text-base">
            Final Level: {finalLevel.toFixed(1)}%
          </p>
          
          {payoffEntry && (
            <div className="mb-2">
              <p className="text-sm text-muted mb-1">
                <span className="font-semibold text-valura-ink">Redemption:</span>{' '}
                <span className="font-bold text-primary-blue">{payoffEntry.value.toFixed(2)}%</span>
              </p>
              {showCoupons && totalEntry && (
                <p className="text-sm text-muted">
                  <span className="font-semibold text-valura-ink">Total (incl. coupons):</span>{' '}
                  <span className="font-bold text-success">{totalEntry.value.toFixed(2)}%</span>
                </p>
              )}
            </div>
          )}
          
          <div className={`mt-3 pt-3 border-t border-border`}>
            <p className={`text-sm font-semibold ${
              scenario === 'Cash Redemption' ? 'text-success' : 'text-danger'
            }`}>
              {scenario}
            </p>
            {scenario === 'Share Conversion' && (
              <p className="text-xs text-muted mt-1">
                Shares delivered at conversion ratio
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom dot for current marker with better styling
  const CurrentDot = (props: any) => {
    const { cx, cy } = props;
    return (
      <g>
        {/* Outer shadow ring */}
        <circle
          cx={cx}
          cy={cy}
          r={10}
          fill="rgba(16, 185, 129, 0.2)"
        />
        {/* Outer ring */}
        <circle
          cx={cx}
          cy={cy}
          r={8}
          fill="white"
          stroke="#10B981"
          strokeWidth={3}
        />
        {/* Inner fill */}
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill="#10B981"
        />
      </g>
    );
  };

  // Legend chips
  const LegendChips = () => (
    <div className="flex flex-wrap gap-2 mt-4">
      <div className="flex items-center space-x-2 px-3 py-1 bg-valura-mint-100 rounded-full">
        <div className="w-3 h-3 rounded-full bg-primary-blue"></div>
        <span className="text-xs text-muted">Payoff</span>
      </div>
      <div className="flex items-center space-x-2 px-3 py-1 bg-surface-2 rounded-full">
        <div className="w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: 'var(--chart-barrier)' }}></div>
        <span className="text-xs text-muted">Barrier</span>
      </div>
      {strikeX && (
        <div className="flex items-center space-x-2 px-3 py-1 bg-warning-bg rounded-full">
          <div className="w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: 'var(--chart-strike)' }}></div>
          <span className="text-xs text-muted">Strike</span>
        </div>
      )}
      {intrinsicPoint && (
        <div className="flex items-center space-x-2 px-3 py-1 bg-success-light rounded-full">
          <div className="w-3 h-3 rounded-full border-2 border-success bg-white"></div>
          <span className="text-xs text-muted">Current</span>
        </div>
      )}
    </div>
  );

  return (
    <CardShell className={pdfMode ? 'p-3' : 'p-6'} hover={!pdfMode}>
      <div className="flex justify-between items-start mb-4">
        {pdfMode ? (
          <div className="text-sm font-extrabold text-text-primary">Payoff at Maturity</div>
        ) : (
          <SectionHeader
            title="Payoff at Maturity"
            subtitle="Redemption amount based on final underlying level"
          />
        )}
        {!pdfMode && (
          <div className="flex items-center space-x-4">
            {gearing && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-warning-light rounded-full border border-warning">
                <TrendingDown className="w-4 h-4 text-warning" />
                <span className="text-xs font-semibold text-valura-ink">
                  Downside Gearing: {gearing}x
                </span>
              </div>
            )}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCoupons}
                onChange={(e) => setShowCoupons(e.target.checked)}
                className="w-4 h-4 text-valura-ink border-2 border-border rounded focus:ring-2 focus:ring-valura-ink focus:ring-offset-1"
                style={{
                  accentColor: 'var(--valura-ink)',
                }}
              />
              <span className="text-sm text-muted font-medium">Show coupons</span>
            </label>
            {breakEvenPct !== undefined && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBreakEven}
                  onChange={(e) => setShowBreakEven(e.target.checked)}
                  className="w-4 h-4 text-warning-fg border-2 border-border rounded focus:ring-2 focus:ring-warning-fg focus:ring-offset-1"
                  style={{
                    accentColor: 'var(--warning-fg)',
                  }}
                />
                <span className="text-sm text-muted font-medium">Show break-even</span>
              </label>
            )}
          </div>
        )}
      </div>
      
      {/* Annotation text boxes */}
      {!pdfMode && (
      <div className="mt-4 space-y-2 text-sm text-muted">
        <div className="flex items-start space-x-2">
          <div className="w-3 h-3 rounded-full bg-success-fg mt-1 flex-shrink-0" />
          <p>
            <span className="font-semibold text-text-primary">Above barrier:</span> Principal back (upside capped; you don't participate in stock gains beyond coupons)
          </p>
        </div>
        <div className="flex items-start space-x-2">
          <div className="w-3 h-3 rounded-full bg-danger-fg mt-1 flex-shrink-0" />
          <p>
            <span className="font-semibold text-text-primary">Below barrier:</span> Value moves with worst stock (like owning it from reference price), coupons help reduce loss
          </p>
        </div>
      </div>
      )}
      
      <ResponsiveContainer width="100%" height={pdfMode ? 220 : 450}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            {/* Gradient for payoff line */}
            <linearGradient id="payoffGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity={1} />
              <stop offset="100%" stopColor="#6366F1" stopOpacity={0.9} />
            </linearGradient>
            {/* Gradient for total line */}
            <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity={1} />
              <stop offset="100%" stopColor="#5EEAD4" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 150]}
            label={pdfMode ? undefined : { value: 'Final Level (%)', position: 'insideBottom', offset: -10 }}
            stroke="var(--text-secondary)"
            tick={{ fill: 'var(--text-secondary)', fontSize: pdfMode ? 10 : 12 }}
            ticks={[0, 25, 50, 75, 100, 125, 150]}
          />
          <YAxis
            domain={[0, 125]}
            label={pdfMode ? undefined : { value: 'Payoff (%)', angle: -90, position: 'insideLeft' }}
            stroke="var(--text-secondary)"
            tick={{ fill: 'var(--text-secondary)', fontSize: pdfMode ? 10 : 12 }}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
          />
          
          {!pdfMode && <Tooltip content={<CustomTooltip />} />}
          
          {/* Cash Redemption Zone (green) */}
          <ReferenceArea
            x1={barrierX}
            x2={150}
            fill="var(--chart-safe-zone)"
            stroke="none"
          />
          
          {/* Conversion Zone (red) */}
          <ReferenceArea
            x1={0}
            x2={barrierX}
            fill="var(--chart-risk-zone)"
            stroke="none"
          />
          
          {/* Geared Put Zone (darker red below strike) */}
          {strikeX && strikeX < barrierX && (
            <ReferenceArea
              x1={0}
              x2={strikeX}
              fill="rgba(178, 59, 59, 0.2)"
              stroke="none"
            />
          )}
          
          {/* Barrier reference line */}
          <ReferenceLine
            x={barrierX}
            stroke="var(--chart-barrier)"
            strokeDasharray="8 4"
            strokeWidth={2}
            label={pdfMode ? undefined : {
              value: `Barrier ${barrierX.toFixed(0)}%`,
              position: 'top',
              fill: 'var(--text-secondary)',
              fontSize: 11,
            }}
          />
          
          {/* Strike reference line (if geared put) */}
          {strikeX && (
            <ReferenceLine
              x={strikeX}
              stroke="var(--chart-strike)"
              strokeDasharray="6 3"
              strokeWidth={2}
              label={pdfMode ? undefined : {
                value: `Strike ${strikeX.toFixed(0)}%`,
                position: 'bottom',
                fill: 'var(--text-secondary)',
                fontSize: 11,
              }}
            />
          )}
          
          {/* Break-even reference line */}
          {showBreakEven && breakEvenPct !== undefined && (
            <ReferenceLine
              x={breakEvenPct}
              stroke="var(--warning-fg)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={pdfMode ? undefined : {
                value: `Break-even ${breakEvenPct.toFixed(0)}%`,
                position: 'bottom',
                fill: 'var(--warning-fg)',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            />
          )}
          
          {/* Payoff curve */}
          <Line
            type="monotone"
            dataKey="payoff"
            stroke="url(#payoffGradient)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#4F46E5' }}
            name="Redemption"
            isAnimationActive={!pdfMode}
          />
          
          {/* Total curve (if coupons shown) */}
          {showCoupons && (
            <Line
              type="monotone"
              dataKey="total"
              stroke="url(#totalGradient)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 5, fill: '#10B981' }}
              name="Total (incl. coupons)"
              isAnimationActive={!pdfMode}
            />
          )}
          
          {/* Current marker */}
          {intrinsicPoint && (
            <>
              <Line
                type="monotone"
                dataKey="payoff"
                stroke="none"
                dot={<CurrentDot />}
                activeDot={false}
                data={[intrinsicPoint]}
                name="Current"
                isAnimationActive={false}
              />
              <Label
                value={`Current (${intrinsicPoint.x.toFixed(1)}%)`}
                position="right"
                offset={15}
                style={{
                  fill: '#10B981',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
                content={({ x, y }: any) => {
                  if (!x || !y) return null;
                  return (
                    <g>
                      <text
                        x={x}
                        y={y - 15}
                        fill="#10B981"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="start"
                      >
                        Current ({intrinsicPoint.x.toFixed(1)}%)
                      </text>
                    </g>
                  );
                }}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
      
      {!pdfMode && <LegendChips />}
      
      {!pdfMode && (
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-success/20 border border-success"></div>
          <span className="text-text-secondary">Cash Redemption Zone</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-danger/20 border border-danger"></div>
          <span className="text-text-secondary">Conversion Zone</span>
        </div>
        {strikeX && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-danger/30 border border-danger"></div>
            <span className="text-text-secondary">Geared Loss Zone</span>
          </div>
        )}
      </div>
      )}
      
      {!pdfMode && (
      <p className="text-sm text-text-secondary mt-4 leading-relaxed">
        This chart shows the redemption amount at maturity (payoff) depending on the
        final level of the underlying (reference value). The <span className="font-semibold text-success">green zone</span> indicates
        safe redemption (above barrier), while the <span className="font-semibold text-danger">red zone</span> shows the risk of
        share conversion. The <span className="font-semibold text-success">green circle</span> marks your current position.
      </p>
      )}
    </CardShell>
  );
}
