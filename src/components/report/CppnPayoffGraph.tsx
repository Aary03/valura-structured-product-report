/**
 * CPPN Payoff Graph
 * Shows protected participation regime + optional knock-in (airbag) regime.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
} from 'recharts';
import type { CurvePoint } from '../../products/common/payoffTypes';
import { CardShell } from '../common/CardShell';
import { SectionHeader } from '../common/SectionHeader';

interface CppnPayoffGraphProps {
  curvePoints: CurvePoint[];
  capitalProtectionPct: number; // P (%)
  participationStartPct: number; // K (%)
  capType: 'none' | 'capped';
  capLevelPct?: number; // C (%)
  knockInEnabled: boolean;
  knockInLevelPct?: number; // KI (%)
  downsideStrikePct?: number; // S (%)
  currentLevelPct?: number | null; // X_today (%), optional
  pdfMode?: boolean;
}

export function CppnPayoffGraph({
  curvePoints,
  capitalProtectionPct,
  participationStartPct,
  capType,
  capLevelPct,
  knockInEnabled,
  knockInLevelPct,
  downsideStrikePct,
  currentLevelPct,
  pdfMode = false,
}: CppnPayoffGraphProps) {
  const chartData = curvePoints.map((p) => ({
    x: p.x * 100,
    payoff: p.redemptionPct * 100,
  }));

  const showCap = capType === 'capped' && typeof capLevelPct === 'number';
  const showKI = knockInEnabled && typeof knockInLevelPct === 'number';

  return (
    <CardShell className={pdfMode ? 'p-3' : 'p-6'} hover={!pdfMode}>
      <div className="flex justify-between items-start mb-4">
        {pdfMode ? (
          <div className="text-sm font-extrabold text-text-primary">Payoff at Maturity</div>
        ) : (
          <SectionHeader
            title="Payoff at Maturity"
            subtitle="Redemption amount based on final basket level"
          />
        )}
      </div>

      <ResponsiveContainer width="100%" height={pdfMode ? 220 : 420}>
        <LineChart data={chartData} margin={{ top: 18, right: 24, left: 12, bottom: 18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 160]}
            tick={{ fontSize: pdfMode ? 10 : 12, fill: 'var(--text-secondary)' }}
            tickFormatter={(v) => `${Math.round(v)}%`}
          />
          <YAxis
            tick={{ fontSize: pdfMode ? 10 : 12, fill: 'var(--text-secondary)' }}
            tickFormatter={(v) => `${Math.round(v)}%`}
          />
          {!pdfMode && (
            <Tooltip
              formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Payoff']}
              labelFormatter={(label: any) => `Final Basket Level: ${Number(label).toFixed(1)}%`}
              contentStyle={{ borderRadius: 12, borderColor: 'var(--border)', boxShadow: 'var(--shadow-strong)' }}
            />
          )}

          {/* Floor P */}
          <ReferenceLine
            y={capitalProtectionPct}
            stroke="rgba(16,185,129,0.75)"
            strokeDasharray="6 4"
            ifOverflow="extendDomain"
            label={
              pdfMode
                ? undefined
                : {
                    value: 'Floor',
                    position: 'insideTopRight',
                    fill: 'var(--text-tertiary)',
                    fontSize: 11,
                  }
            }
          />

          {/* Participation start K */}
          <ReferenceLine
            x={participationStartPct}
            stroke="rgba(79,70,229,0.65)"
            strokeDasharray="6 4"
            ifOverflow="extendDomain"
            label={
              pdfMode
                ? undefined
                : {
                    value: 'Participation starts',
                    position: 'insideTopLeft',
                    fill: 'var(--text-tertiary)',
                    fontSize: 11,
                  }
            }
          />

          {/* Knock-in KI */}
          {showKI && (
            <ReferenceLine
              x={knockInLevelPct!}
              stroke="rgba(239,68,68,0.55)"
              strokeDasharray="6 4"
              ifOverflow="extendDomain"
              label={
                pdfMode
                  ? undefined
                  : {
                      value: 'Knock-In',
                      position: 'insideTopLeft',
                      fill: 'var(--text-tertiary)',
                      fontSize: 11,
                    }
              }
            />
          )}

          {/* Cap C */}
          {showCap && (
            <ReferenceLine
              x={capLevelPct!}
              stroke="rgba(100,116,139,0.6)"
              strokeDasharray="6 4"
              ifOverflow="extendDomain"
            />
          )}

          {/* Current marker */}
          {typeof currentLevelPct === 'number' && Number.isFinite(currentLevelPct) && (
            <ReferenceDot
              x={currentLevelPct}
              y={chartData.find((d) => Math.abs(d.x - currentLevelPct) < 0.6)?.payoff ?? capitalProtectionPct}
              r={pdfMode ? 4 : 6}
              fill="#10B981"
              stroke="#ffffff"
              strokeWidth={2}
              ifOverflow="extendDomain"
            />
          )}

          <Line
            type="monotone"
            dataKey="payoff"
            stroke="#4F46E5"
            strokeWidth={pdfMode ? 2.6 : 3.2}
            dot={false}
            isAnimationActive={!pdfMode}
          />
        </LineChart>
      </ResponsiveContainer>

      {!pdfMode && (
        <div className="mt-4 text-sm text-muted">
          <div>
            <span className="font-semibold text-text-primary">Floor:</span> {capitalProtectionPct}% (issuer dependent)
          </div>
          <div>
            <span className="font-semibold text-text-primary">Starts at:</span> {participationStartPct}%
            {showCap && <> • <span className="font-semibold text-text-primary">Cap:</span> {capLevelPct}%</>}
          </div>
          {showKI && (
            <div>
              <span className="font-semibold text-text-primary">Knock-in:</span> {knockInLevelPct}% → payoff switches to{' '}
              <span className="font-mono">100×(X/S)</span>
              {typeof downsideStrikePct === 'number' && <> (S={downsideStrikePct}%)</>}
            </div>
          )}
        </div>
      )}
    </CardShell>
  );
}


