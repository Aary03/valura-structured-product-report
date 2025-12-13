/**
 * Underlying Spotlight Card Component
 * Individual card showing comprehensive metrics for each underlying
 */

import type { UnderlyingSummary } from '../../services/underlyingSummary';
import { formatNumber, formatPercent } from '../../core/utils/math';
import { CardShell } from '../common/CardShell';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import { getLogoWithFallback } from '../../utils/logo';

interface UnderlyingCardProps {
  summary: UnderlyingSummary;
  isWorstOf?: boolean;
}

export function UnderlyingCard({ summary, isWorstOf = false }: UnderlyingCardProps) {
  const { logoUrl, fallback } = getLogoWithFallback(summary.symbol, summary.name);
  
  const performanceColor = summary.performancePct >= 0 ? 'text-success' : 'text-danger';
  const distanceColor = summary.distanceToBarrierPctPts >= 0 ? 'text-success' : 'text-danger';
  
  const momentumIcon = summary.momentumBadge === 'Uptrend' 
    ? <TrendingUp className="w-4 h-4" />
    : summary.momentumBadge === 'Downtrend'
    ? <TrendingDown className="w-4 h-4" />
    : <Minus className="w-4 h-4" />;
  
  const momentumColor = summary.momentumBadge === 'Uptrend'
    ? 'text-success'
    : summary.momentumBadge === 'Downtrend'
    ? 'text-danger'
    : 'text-text-secondary';

  const riskColor = summary.riskBadge === 'Low'
    ? 'bg-success-light text-success border-success'
    : summary.riskBadge === 'High'
    ? 'bg-danger-light text-danger border-danger'
    : 'bg-warning-light text-warning border-warning';

  return (
    <CardShell className="p-6 relative">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden border-2 border-primary shadow-sm relative flex-shrink-0">
            <img
              src={logoUrl}
              alt={summary.symbol}
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const existingFallback = parent.querySelector('.logo-fallback');
                  if (!existingFallback) {
                    const fallbackEl = document.createElement('div');
                    fallbackEl.className = 'logo-fallback text-primary font-bold text-sm absolute inset-0 flex items-center justify-center';
                    fallbackEl.textContent = fallback;
                    parent.appendChild(fallbackEl);
                  }
                }
              }}
            />
            <div className="logo-fallback text-primary font-bold text-sm absolute inset-0 flex items-center justify-center hidden">
              {fallback}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xl font-bold text-text-primary">{summary.symbol}</div>
            <div className="text-sm text-text-secondary truncate">{summary.name}</div>
          </div>
        </div>
        
        {/* Badges */}
        <div className="flex flex-col items-end space-y-2 ml-4">
          {summary.analystConsensus && (
            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
              summary.analystConsensus.toLowerCase().includes('buy')
                ? 'bg-success-light text-success border border-success'
                : summary.analystConsensus.toLowerCase().includes('hold')
                ? 'bg-warning-light text-warning border border-warning'
                : 'bg-danger-light text-danger border border-danger'
            }`}>
              {summary.analystConsensus}
            </div>
          )}
          {summary.riskBadge && (
            <div className={`px-2 py-1 rounded-full text-xs font-semibold border ${riskColor}`}>
              Risk: {summary.riskBadge}
            </div>
          )}
        </div>
      </div>

      {/* Body - Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Spot Price */}
        <div>
          <div className="text-xs text-text-secondary mb-1">Spot Price</div>
          <div className="text-2xl font-bold text-text-primary">
            {formatNumber(summary.spotPrice, 2)}
          </div>
        </div>

        {/* Performance vs Initial */}
        <div>
          <div className="text-xs text-text-secondary mb-1">Performance</div>
          <div className={`text-xl font-bold ${performanceColor} flex items-center space-x-1`}>
            {summary.performancePct >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{formatPercent(summary.performancePct / 100, 1)}</span>
          </div>
        </div>

        {/* Distance to Barrier */}
        <div>
          <div className="text-xs text-text-secondary mb-1">Distance to Barrier</div>
          <div className={`text-lg font-semibold ${distanceColor} flex items-center space-x-1`}>
            {summary.distanceToBarrierPctPts >= 0 ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>
              {summary.distanceToBarrierPctPts >= 0 ? '+' : ''}
              {formatNumber(summary.distanceToBarrierPctPts, 1)} pp
            </span>
          </div>
        </div>

        {/* 52W Range */}
        {summary.range52w && (
          <div>
            <div className="text-xs text-text-secondary mb-1">52W Range</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-text-secondary">
                <span>{formatNumber(summary.range52w.low, 2)}</span>
                <span>{formatNumber(summary.range52w.high, 2)}</span>
              </div>
              <div className="h-2 bg-grey-background rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${summary.range52w.position * 100}%` }}
                />
                <div
                  className="absolute top-0 h-full w-1 bg-text-primary"
                  style={{ left: `${summary.range52w.position * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Market Cap */}
        {summary.marketCap && (
          <div>
            <div className="text-xs text-text-secondary mb-1">Market Cap</div>
            <div className="text-sm font-semibold text-text-primary">
              {summary.marketCap >= 1e12
                ? `${formatNumber(summary.marketCap / 1e12, 2)}T`
                : summary.marketCap >= 1e9
                ? `${formatNumber(summary.marketCap / 1e9, 2)}B`
                : summary.marketCap >= 1e6
                ? `${formatNumber(summary.marketCap / 1e6, 2)}M`
                : formatNumber(summary.marketCap, 0)}
            </div>
          </div>
        )}

        {/* Volume */}
        {summary.avgVolume && (
          <div>
            <div className="text-xs text-text-secondary mb-1">Avg Volume</div>
            <div className="text-sm font-semibold text-text-primary">
              {summary.avgVolume >= 1e9
                ? `${formatNumber(summary.avgVolume / 1e9, 2)}B`
                : summary.avgVolume >= 1e6
                ? `${formatNumber(summary.avgVolume / 1e6, 2)}M`
                : formatNumber(summary.avgVolume, 0)}
            </div>
          </div>
        )}

        {/* 30D Volatility */}
        {summary.vol30dAnn !== undefined && (
          <div>
            <div className="text-xs text-text-secondary mb-1">30D Volatility</div>
            <div className="text-sm font-semibold text-text-primary">
              {formatPercent(summary.vol30dAnn, 1)}
            </div>
          </div>
        )}

        {/* Momentum */}
        {summary.momentum20d !== undefined && (
          <div>
            <div className="text-xs text-text-secondary mb-1">20D Momentum</div>
            <div className={`text-sm font-semibold flex items-center space-x-1 ${momentumColor}`}>
              {momentumIcon}
              <span>{formatPercent(summary.momentum20d / 100, 1)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Target Price (if available) */}
      {summary.targetPrice && (
        <div className="mb-4 p-3 bg-primary-light rounded-lg border border-primary">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-text-secondary">Target Price</div>
              <div className="text-lg font-bold text-primary">{formatNumber(summary.targetPrice, 2)}</div>
            </div>
            {summary.targetUpside !== undefined && (
              <div className="text-right">
                <div className="text-xs text-text-secondary">Upside</div>
                <div className={`text-lg font-bold ${summary.targetUpside >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatPercent(summary.targetUpside / 100, 1)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer - Insight */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-text-secondary italic">{summary.insight}</p>
      </div>
    </CardShell>
  );
}

