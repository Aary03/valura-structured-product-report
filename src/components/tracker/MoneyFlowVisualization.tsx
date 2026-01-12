/**
 * Money Flow Visualization
 * Beautiful visual representation of cash flows and settlement outcomes
 */

import { ArrowRight, TrendingUp, TrendingDown, Gift, ArrowDownCircle } from 'lucide-react';
import type { PositionValue } from '../../types/investment';
import { formatCurrency } from '../../services/positionValuation';

interface MoneyFlowVisualizationProps {
  value: PositionValue;
  currency: string;
  initialInvestment: number;
}

export function MoneyFlowVisualization({ value, currency, initialInvestment }: MoneyFlowVisualizationProps) {
  const isPhysicalDelivery = value.settlementType === 'physical_shares';
  const profit = value.currentMarketValue - initialInvestment;
  const isProfit = profit >= 0;

  return (
    <div className="section-card bg-gradient-to-br from-slate-50 to-blue-50">
      <h3 className="text-lg font-bold text-valura-ink mb-6 flex items-center gap-2">
        <ArrowDownCircle className="w-5 h-5 text-blue-primary" />
        Money Flow Timeline
      </h3>

      <div className="relative">
        {/* Flow Chart */}
        <div className="flex items-center justify-between gap-4">
          {/* Step 1: Initial Investment */}
          <div className="flex-1">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
              <div className="text-xs opacity-80 mb-2">💰 You Invested</div>
              <div className="text-3xl font-bold mb-1">
                {formatCurrency(initialInvestment, currency)}
              </div>
              <div className="text-xs opacity-90">Initial Capital</div>
            </div>
          </div>

          {/* Arrow */}
          <ArrowRight className="w-8 h-8 text-blue-primary flex-shrink-0" />

          {/* Step 2: Coupons (if any) */}
          {value.couponsReceivedToDate > 0 && (
            <>
              <div className="flex-1">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
                  <div className="text-xs opacity-80 mb-2 flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    Coupons Received
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    +{formatCurrency(value.couponsReceivedToDate, currency)}
                  </div>
                  <div className="text-xs opacity-90">Income Payments</div>
                </div>
              </div>
              <ArrowRight className="w-8 h-8 text-green-500 flex-shrink-0" />
            </>
          )}

          {/* Step 3: Settlement */}
          <div className="flex-1">
            {isPhysicalDelivery ? (
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all border-4 border-red-300">
                <div className="text-xs opacity-80 mb-2">📊 Physical Delivery</div>
                <div className="text-2xl font-bold mb-1">
                  {value.sharesReceived?.toLocaleString()} shares
                </div>
                <div className="text-lg font-semibold">
                  ≈ {formatCurrency(value.sharesMarketValue || 0, currency)}
                </div>
                <div className="text-xs opacity-90 mt-2">
                  {value.worstPerformer?.ticker} @ {formatCurrency(value.worstPerformer?.currentPrice || 0, currency)}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
                <div className="text-xs opacity-80 mb-2">✅ Cash Return</div>
                <div className="text-3xl font-bold mb-1">
                  {formatCurrency(value.cashAmount || initialInvestment, currency)}
                </div>
                <div className="text-xs opacity-90">Principal Redeemed</div>
              </div>
            )}
          </div>

          {/* Arrow */}
          <ArrowRight className={`w-8 h-8 flex-shrink-0 ${
            isPhysicalDelivery ? 'text-orange-500' : 'text-green-500'
          }`} />

          {/* Step 4: Final Total */}
          <div className="flex-1">
            <div className={`rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all border-4 ${
              isProfit
                ? 'bg-gradient-to-br from-green-600 to-emerald-700 border-green-400'
                : 'bg-gradient-to-br from-red-600 to-rose-700 border-red-400'
            }`}>
              <div className="text-xs opacity-80 mb-2 flex items-center gap-1">
                {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                Final Value
              </div>
              <div className="text-4xl font-bold mb-1">
                {formatCurrency(value.currentMarketValue, currency)}
              </div>
              <div className={`text-lg font-semibold ${
                isProfit ? 'text-green-100' : 'text-red-100'
              }`}>
                {profit >= 0 ? '+' : ''}{formatCurrency(profit, currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div className={`mt-6 p-5 rounded-2xl text-center ${
          isProfit
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
            : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
        }`}>
          <div className="text-sm opacity-90 mb-2">Net Result</div>
          <div className="text-3xl font-bold">
            {isProfit ? '🎉' : '📉'} {profit >= 0 ? '+' : ''}{formatCurrency(profit, currency)} 
            <span className="text-xl ml-3">
              ({value.percentageReturn >= 0 ? '+' : ''}{value.percentageReturn.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
