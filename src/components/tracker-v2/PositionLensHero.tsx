/**
 * Position Lens Hero Component
 * Shows indicative outcome with clear disclaimers (NOT secondary market pricing)
 */

import { TrendingUp, TrendingDown, Info, AlertCircle } from 'lucide-react';
import type { PositionSnapshot } from '../../services/positionEvaluator';
import { formatSnapshotCurrency } from '../../services/positionEvaluator';

interface PositionLensHeroProps {
  snapshot: PositionSnapshot;
  currency: string;
  productName: string;
}

export function PositionLensHero({ snapshot, currency, productName }: PositionLensHeroProps) {
  const isProfit = snapshot.netPnL >= 0;

  return (
    <div className={`relative overflow-hidden rounded-2xl p-8 ${
      isProfit 
        ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50' 
        : 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50'
    } border-2 ${isProfit ? 'border-green-300' : 'border-red-300'} shadow-xl`}>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
        {isProfit ? (
          <TrendingUp className="w-full h-full text-green-600" />
        ) : (
          <TrendingDown className="w-full h-full text-red-600" />
        )}
      </div>

      <div className="relative z-10">
        {/* Disclaimer Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 border border-blue-300 rounded-lg mb-4">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-blue-700">
            Indicative Outcome (Rule-Based Valuation)
          </span>
        </div>

        {/* Main Value */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">
            If Settled Today
          </h2>
          <div className={`text-6xl font-black mb-3 ${
            isProfit ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatSnapshotCurrency(snapshot.indicativeOutcomeValue, currency)}
          </div>
          
          {/* Return Badge */}
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg ${
              isProfit 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-gradient-to-r from-red-500 to-rose-600'
            } text-white`}>
              {isProfit ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              <span className="text-xl font-bold">
                {snapshot.netPnLPct >= 0 ? '+' : ''}{snapshot.netPnLPct.toFixed(2)}%
              </span>
            </div>
            <div className={`text-2xl font-bold ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
              {snapshot.netPnL >= 0 ? '+' : ''}{formatSnapshotCurrency(snapshot.netPnL, currency)}
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-border">
            <div className="text-xs text-muted mb-1">Invested</div>
            <div className="text-2xl font-bold text-valura-ink">
              {formatSnapshotCurrency(snapshot.invested, currency)}
            </div>
          </div>
          
          {snapshot.couponsReceived > 0 && (
            <div className="bg-green-100/60 backdrop-blur-sm rounded-xl p-4 border border-green-300">
              <div className="text-xs text-muted mb-1">Coupons Received</div>
              <div className="text-2xl font-bold text-green-600">
                +{formatSnapshotCurrency(snapshot.couponsReceived, currency)}
              </div>
            </div>
          )}
          
          <div className={`backdrop-blur-sm rounded-xl p-4 border-2 ${
            isProfit 
              ? 'bg-green-100/60 border-green-400' 
              : 'bg-red-100/60 border-red-400'
          }`}>
            <div className="text-xs text-muted mb-1">Net P&L</div>
            <div className={`text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {snapshot.netPnL >= 0 ? '+' : ''}{formatSnapshotCurrency(snapshot.netPnL, currency)}
            </div>
          </div>
        </div>

        {/* Explainability */}
        <div className={`p-4 rounded-xl ${
          snapshot.riskStatus === 'TRIGGERED' 
            ? 'bg-red-100 border-2 border-red-300' 
            : snapshot.riskStatus === 'WATCH'
            ? 'bg-yellow-100 border-2 border-yellow-300'
            : 'bg-blue-100 border-2 border-blue-300'
        }`}>
          <div className="flex items-start gap-3">
            {snapshot.riskStatus === 'TRIGGERED' ? (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <div className={`text-sm font-semibold mb-1 ${
                snapshot.riskStatus === 'TRIGGERED' ? 'text-red-700' : 
                snapshot.riskStatus === 'WATCH' ? 'text-yellow-700' : 
                'text-blue-700'
              }`}>
                Why This Value?
              </div>
              <div className="text-sm text-muted">
                {snapshot.reasonText}
              </div>
            </div>
          </div>
        </div>

        {/* Methodology Disclosure */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-start gap-2">
            <div className="text-xs text-muted flex-1">
              <strong className="font-semibold">Methodology:</strong> {snapshot.methodologyDisclosure}
              <span className="block mt-1">
                <strong>Not a market price:</strong> This is a rule-based calculation showing the outcome 
                if the product were settled today under its terms. It does not reflect secondary market liquidity or trading value.
              </span>
            </div>
            {snapshot.dataFreshness.stalePrices && (
              <div className="px-2 py-1 bg-yellow-100 border border-yellow-300 rounded text-xs font-semibold text-yellow-700">
                ⚠ Stale Data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
