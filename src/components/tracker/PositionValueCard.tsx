/**
 * Position Value Card Component
 * Displays current investment value and breakdown
 */

import { TrendingUp, TrendingDown, Clock, DollarSign, Gift } from 'lucide-react';
import type { PositionValue } from '../../types/investment';
import { formatCurrency, formatPercentage, getReturnColor } from '../../services/positionValuation';

interface PositionValueCardProps {
  value: PositionValue;
  currency: string;
}

export function PositionValueCard({ value, currency }: PositionValueCardProps) {
  const isPositive = value.percentageReturn >= 0;
  const returnColorClass = getReturnColor(value.percentageReturn);

  return (
    <div className={`section-card overflow-hidden relative ${
      isPositive 
        ? 'bg-gradient-to-br from-green-50/50 via-white to-emerald-50/50' 
        : 'bg-gradient-to-br from-red-50/50 via-white to-rose-50/50'
    }`}>
      {/* Animated background pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
        <TrendingUp className="w-full h-full text-green-500" />
      </div>

      {/* Hero Section */}
      <div className="relative border-b border-border pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">
              📊 Live Position Value
            </h2>
            <div className={`text-5xl font-black mb-2 ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(value.currentMarketValue, currency)}
            </div>
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg ${
                isPositive 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-red-500 to-rose-600'
              } text-white`}>
                {isPositive ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <span className="font-bold text-lg">
                  {formatPercentage(value.percentageReturn)}
                </span>
              </div>
              <div className={`text-xl font-bold ${returnColorClass}`}>
                {isPositive ? '+' : ''}{formatCurrency(value.absoluteReturn, currency)}
              </div>
            </div>
          </div>

          {/* Settlement Type Badge */}
          <div className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg ${
            value.settlementType === 'cash'
              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
              : 'bg-gradient-to-br from-orange-500 to-red-600'
          }`}>
            <div className="text-xs opacity-90 mb-1">Settlement</div>
            <div className="text-2xl">
              {value.settlementType === 'cash' ? '💵 Cash' : '📊 Shares'}
            </div>
          </div>
        </div>
      </div>

      {/* Investment Breakdown */}
      <div className="relative pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-valura-ink uppercase tracking-wide flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Value Breakdown
        </h3>
        
        <div className="space-y-3">
          {/* Initial Investment */}
          <div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg border border-blue-200">
            <span className="font-medium text-valura-ink">Initial Investment</span>
            <span className="font-bold text-blue-600 text-lg">
              {formatCurrency(value.initialInvestment, currency)}
            </span>
          </div>

          {/* Coupons (if any) */}
          {value.couponsReceivedToDate > 0 && (
            <div className="flex items-center justify-between py-3 px-4 bg-green-50 rounded-lg border-2 border-green-300">
              <span className="font-medium text-valura-ink flex items-center gap-2">
                <Gift className="w-4 h-4 text-green-500" />
                Coupons Received
              </span>
              <span className="font-bold text-green-600 text-lg">
                + {formatCurrency(value.couponsReceivedToDate, currency)}
              </span>
            </div>
          )}

          {/* Market Gain/Loss */}
          <div className={`flex items-center justify-between py-3 px-4 rounded-lg border-2 ${
            isPositive 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <span className="font-medium text-valura-ink">Market Position</span>
            <span className={`font-bold text-lg ${returnColorClass}`}>
              {formatCurrency(value.projectedSettlementValue, currency)}
            </span>
          </div>

          {/* Total */}
          <div className={`flex items-center justify-between py-4 px-4 rounded-xl shadow-lg ${
            isPositive
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          } text-white`}>
            <span className="font-bold text-lg">Total Current Value</span>
            <span className="text-3xl font-black">
              {formatCurrency(value.currentMarketValue, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Time Progress */}
      <div className="pt-6 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-muted" />
          <span className="text-sm font-medium text-muted">Time to Maturity</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">{value.daysToMaturity} days remaining</span>
            <span className="text-valura-ink font-medium">
              {Math.round((1 - value.daysToMaturity / 365) * 100)}% elapsed
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-grey-light rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-primary to-blue-secondary h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, (1 - value.daysToMaturity / 365) * 100))}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
