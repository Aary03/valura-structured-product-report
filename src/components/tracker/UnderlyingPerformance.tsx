/**
 * Underlying Performance Component
 * Shows performance of each underlying asset
 */

import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import type { PositionValue } from '../../types/investment';
import type { Underlying } from '../../products/common/productTypes';
import { formatCurrency } from '../../services/positionValuation';

interface UnderlyingPerformanceProps {
  value: PositionValue;
  underlyings: Underlying[];
  initialPrices: number[];
  currentPrices: number[];
  currency: string;
}

export function UnderlyingPerformance({ 
  value, 
  underlyings, 
  initialPrices, 
  currentPrices,
  currency 
}: UnderlyingPerformanceProps) {
  return (
    <div className="section-card">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-muted mb-1">Underlying Performance</h3>
        <p className="text-lg font-semibold text-valura-ink">
          {underlyings.length} Asset{underlyings.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-3">
        {underlyings.map((underlying, index) => {
          const level = value.underlyingLevels[index];
          const performancePct = (level - 1) * 100;
          const isPositive = performancePct >= 0;
          const isFlat = Math.abs(performancePct) < 0.01;
          const isWorst = value.worstPerformer?.index === index;
          const isBest = value.bestPerformer?.index === index;

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                isWorst ? 'bg-red-negative/5 border-red-negative/20' :
                isBest ? 'bg-green-positive/5 border-green-positive/20' :
                'bg-grey-light border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-valura-ink text-lg">
                      {underlying.ticker}
                    </span>
                    {isWorst && (
                      <span className="text-xs bg-red-negative text-white px-2 py-0.5 rounded font-medium">
                        WORST
                      </span>
                    )}
                    {isBest && (
                      <span className="text-xs bg-green-positive text-white px-2 py-0.5 rounded font-medium">
                        BEST
                      </span>
                    )}
                  </div>
                  {underlying.name && (
                    <div className="text-sm text-muted mt-0.5">{underlying.name}</div>
                  )}
                </div>

                {/* Performance Badge */}
                <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                  isPositive ? 'bg-green-positive/10' :
                  isFlat ? 'bg-grey-medium/10' :
                  'bg-red-negative/10'
                }`}>
                  {isFlat ? (
                    <Minus className={`w-4 h-4 text-grey-medium`} />
                  ) : isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-positive" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-negative" />
                  )}
                  <span className={`font-semibold text-sm ${
                    isPositive ? 'text-green-positive' :
                    isFlat ? 'text-grey-medium' :
                    'text-red-negative'
                  }`}>
                    {performancePct >= 0 ? '+' : ''}{performancePct.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Price Details */}
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                <div>
                  <div className="text-xs text-muted mb-1">Initial</div>
                  <div className="font-semibold text-valura-ink">
                    {formatCurrency(initialPrices[index], currency)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-1">Current</div>
                  <div className={`font-semibold ${
                    isPositive ? 'text-green-positive' : 
                    isFlat ? 'text-valura-ink' : 
                    'text-red-negative'
                  }`}>
                    {formatCurrency(currentPrices[index], currency)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-1">Level</div>
                  <div className="font-semibold text-valura-ink">
                    {(level * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Worst Performer Alert */}
      {value.worstPerformer && value.barrierStatus !== 'safe' && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-semibold text-valura-ink">
                {value.worstPerformer.ticker}
              </span>
              <span className="text-muted">
                {' '}is the worst performer and determines your final payoff in this product.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
