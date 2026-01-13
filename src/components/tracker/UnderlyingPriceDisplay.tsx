/**
 * Underlying Price Display Component
 * Shows actual current vs initial prices clearly
 */

import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface UnderlyingPriceDisplayProps {
  underlyings: Array<{ ticker: string; name?: string }>;
  initialPrices: number[];
  currentPrices: number[];
  currency: string;
}

export function UnderlyingPriceDisplay({
  underlyings,
  initialPrices,
  currentPrices,
  currency,
}: UnderlyingPriceDisplayProps) {
  return (
    <div className="section-card">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-valura-ink flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Current Prices
        </h3>
        <p className="text-sm text-muted">Live market prices vs initial fixing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {underlyings.map((underlying, idx) => {
          const initial = initialPrices[idx];
          const current = currentPrices[idx];
          const change = ((current - initial) / initial) * 100;
          const isUp = change >= 0;

          return (
            <div
              key={idx}
              className={`p-5 rounded-xl border-2 ${
                isUp 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-lg font-bold text-valura-ink">{underlying.ticker}</div>
                  {underlying.name && (
                    <div className="text-xs text-muted">{underlying.name}</div>
                  )}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                  isUp ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {isUp ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-bold ${
                    isUp ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="text-xs text-muted mb-1">Initial Price</div>
                  <div className="text-xl font-bold text-valura-ink">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency,
                      minimumFractionDigits: 2,
                    }).format(initial)}
                  </div>
                  <div className="text-xs text-muted mt-1">At inception</div>
                </div>

                <div className="bg-white/60 rounded-lg p-3">
                  <div className="text-xs text-muted mb-1">Current Price</div>
                  <div className={`text-xl font-bold ${
                    isUp ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency,
                      minimumFractionDigits: 2,
                    }).format(current)}
                  </div>
                  <div className="text-xs text-muted mt-1">Live market</div>
                </div>
              </div>

              <div className="mt-3 text-sm text-center">
                <span className="text-muted">Level: </span>
                <span className="font-bold text-valura-ink">
                  {((current / initial) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
        <strong>Note:</strong> Prices update when you refresh the page. Initial prices are locked at inception.
        Current prices fetched from market data API.
      </div>
    </div>
  );
}
