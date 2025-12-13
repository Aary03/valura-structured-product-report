/**
 * Underlyings Table Component
 * Display underlying asset data with performance indicators
 * Now includes lookback returns and knock-in price
 */

import { useState } from 'react';
import type { UnderlyingData, HistoricalPricePoint } from '../../services/api/mappers';
import { formatNumber, formatPercent } from '../../core/utils/math';
import { getLogoWithFallback } from '../../utils/logo';
import { calculateLookbackReturn, type LookbackPeriod } from '../../services/lookbackReturns';
import type { ReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import { Info } from 'lucide-react';

interface UnderlyingsTableProps {
  underlyingData: UnderlyingData[];
  historicalData: HistoricalPricePoint[][]; // Historical data per underlying
  initialFixings?: Record<string, number>;
  terms: ReverseConvertibleTerms;
  referencePrices?: number[]; // Reference prices per underlying (defaults to current spot)
  loading?: boolean;
  worstUnderlyingIndex?: number | null;
}

export function UnderlyingsTable({
  underlyingData,
  historicalData,
  initialFixings = {},
  terms,
  referencePrices,
  loading = false,
  worstUnderlyingIndex = null,
}: UnderlyingsTableProps) {
  const [lookbackPeriod, setLookbackPeriod] = useState<LookbackPeriod>('1Y');
  
  // Use reference prices if provided, otherwise default to current spot
  const refPrices = referencePrices || underlyingData.map(d => d.currentPrice);
  if (loading) {
    return (
      <div className="section-card">
        <h2 className="text-2xl font-bold mb-4 text-valura-ink">
          More about the underlyings
        </h2>
        <div className="text-center py-8 text-muted">Loading data...</div>
      </div>
    );
  }

  if (underlyingData.length === 0) {
    return (
      <div className="section-card">
        <h2 className="text-2xl font-bold mb-4 text-valura-ink">
          More about the underlyings
        </h2>
        <div className="text-center py-8 text-muted">No data available</div>
      </div>
    );
  }


  const formatAnalystEstimates = (data: UnderlyingData) => {
    if (!data.numberOfAnalysts) return '—';
    return `${data.numberOfAnalysts} analysts`;
  };

  // Calculate lookback return and knock-in price for each underlying
  const getUnderlyingMetrics = (data: UnderlyingData, index: number) => {
    const hist = historicalData[index] || [];
    const lookbackReturn = calculateLookbackReturn(data.currentPrice, hist, lookbackPeriod);
    const referencePrice = refPrices[index] || data.currentPrice;
    
    // Calculate knock-in price
    // For low-strike: use knockInBarrierPct ?? strikePct
    // For standard barrier: use barrierPct
    let knockInPct: number;
    if (terms.variant === 'low_strike_geared_put') {
      knockInPct = terms.knockInBarrierPct ?? terms.strikePct ?? 0;
    } else {
      knockInPct = terms.barrierPct ?? 0;
    }
    
    const knockInPrice = referencePrice * knockInPct;
    
    return {
      lookbackReturn,
      referencePrice,
      knockInPrice,
    };
  };

  return (
    <div className="section-card pb-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-valura-ink">
          More about the underlyings
        </h2>
        {/* Lookback Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted">Lookback:</span>
          <div className="flex space-x-1 bg-surface-2 rounded-lg p-1">
            {(['1M', '3M', '6M', '1Y', '3Y'] as LookbackPeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setLookbackPeriod(period)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  lookbackPeriod === period
                    ? 'bg-valura-ink text-white'
                    : 'text-muted hover:bg-border'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col className="w-[140px]" />
            <col className="w-[130px]" />
            <col className="w-[90px]" />
            <col className="w-[120px]" />
            <col className="w-[140px]" />
            <col className="w-[130px]" />
            <col className="w-[140px]" />
            <col className="w-[110px]" />
          </colgroup>
          <thead>
            <tr className="bg-surface-2">
              <th className="text-left p-3 border-b-2 border-border font-semibold text-valura-ink text-sm">
                Underlyings
              </th>
              <th className="text-left p-3 border-b-2 border-border font-semibold text-valura-ink text-sm">
                <div className="flex items-center space-x-1">
                  <span>Reference Price</span>
                  <div className="group relative">
                    <Info className="w-3 h-3 text-text-secondary cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-valura-ink text-white text-xs rounded shadow-lg z-10">
                      For idea reports, reference price defaults to today's spot unless you set a custom reference date.
                    </div>
                  </div>
                  <span className="text-xs text-text-secondary font-normal">(indicative)</span>
                </div>
              </th>
              <th className="text-left p-3 border-b-2 border-border font-semibold text-valura-ink text-sm">
                Spot (today)
              </th>
              <th className="text-left p-3 border-b-2 border-border font-semibold text-valura-ink text-sm">
                Return ({lookbackPeriod})
              </th>
              <th className="text-left p-3 border-b-2 border-border font-semibold text-valura-ink text-sm">
                Knock-in Price
              </th>
              <th className="text-left p-3 border-b-2 border-border font-semibold text-valura-ink text-sm">
                Analysts Estimates
              </th>
              <th className="text-left p-3 border-b-2 border-border font-semibold text-valura-ink text-sm">
                Analyst Consensus
              </th>
              <th className="text-left p-3 border-b-2 border-border font-semibold text-valura-ink text-sm">
                Target Price
              </th>
            </tr>
          </thead>
          <tbody>
            {underlyingData.map((data, index) => {
              const metrics = getUnderlyingMetrics(data, index);
              const { logoUrl, fallback } = getLogoWithFallback(data.symbol, data.name);
              
              return (
                <tr key={index} className="border-b border-border hover:bg-valura-mint-100/30">
                  <td className="p-3">
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-border flex-shrink-0 shadow-sm relative">
                        <img
                          src={logoUrl}
                          alt={data.symbol}
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const existingFallback = parent.querySelector('.logo-fallback');
                              if (!existingFallback) {
                                const fallbackEl = document.createElement('div');
                                    fallbackEl.className = 'logo-fallback text-valura-ink font-bold text-[10px] absolute inset-0 flex items-center justify-center';
                                fallbackEl.textContent = fallback;
                                parent.appendChild(fallbackEl);
                              }
                            }
                          }}
                        />
                        <div className="logo-fallback text-valura-ink font-bold text-[10px] absolute inset-0 flex items-center justify-center hidden">
                          {fallback}
                        </div>
                      </div>
                      <span className="font-semibold text-grey-dark text-sm truncate">{data.symbol}</span>
                    </div>
                  </td>
                  <td className="p-3 text-grey-medium text-sm">
                    {formatNumber(metrics.referencePrice, 2)}
                  </td>
                  <td className="p-3 font-semibold text-grey-dark text-sm">
                    {formatNumber(data.currentPrice, 2)}
                  </td>
                  <td className="p-3 font-semibold text-sm">
                    {metrics.lookbackReturn !== null ? (
                      <span className={metrics.lookbackReturn >= 0 ? 'text-success' : 'text-danger'}>
                        {metrics.lookbackReturn >= 0 ? '▲' : '▼'} {formatPercent(metrics.lookbackReturn / 100, 1)}
                      </span>
                    ) : (
                      <span className="text-text-secondary">—</span>
                    )}
                  </td>
                  <td className="p-3 font-semibold text-grey-dark text-sm">
                    ${formatNumber(metrics.knockInPrice, 2)}
                  </td>
                  <td className="p-3 text-grey-medium text-sm">
                    {formatAnalystEstimates(data)}
                  </td>
                  <td className="p-3 text-grey-medium text-sm">
                    {data.analystConsensus || '—'}
                  </td>
                  <td className="p-3 font-semibold text-grey-dark text-sm">
                    {data.targetPrice ? formatNumber(data.targetPrice, 2) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

