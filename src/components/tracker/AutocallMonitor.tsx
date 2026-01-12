/**
 * Autocall Monitor Component
 * Shows autocall status and potential early redemption
 */

import { Zap, CheckCircle } from 'lucide-react';
import type { ReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import { formatCurrency } from '../../services/positionValuation';

interface AutocallMonitorProps {
  terms: ReverseConvertibleTerms;
  currentLevel: number; // Current worst-of level as decimal (e.g., 1.05 for 105%)
  couponsReceivedToDate: number;
  currency: string;
}

export function AutocallMonitor({ 
  terms, 
  currentLevel, 
  couponsReceivedToDate,
  currency
}: AutocallMonitorProps) {
  if (!terms.autocallEnabled || !terms.autocallLevelPct) {
    return null;
  }

  const autocallLevel = terms.autocallLevelPct;
  const currentLevelPct = currentLevel * 100;
  const autocallTriggered = currentLevelPct >= (autocallLevel * 100);
  const distanceToAutocall = currentLevelPct - (autocallLevel * 100);

  const autocallPayment = terms.notional + couponsReceivedToDate;

  return (
    <div className={`section-card ${
      autocallTriggered 
        ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-400'
        : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-xl ${
          autocallTriggered 
            ? 'bg-purple-500 animate-pulse' 
            : 'bg-blue-500'
        }`}>
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-valura-ink">Autocall Monitor</h3>
          <p className="text-sm text-muted">Early redemption feature</p>
        </div>
      </div>

      {autocallTriggered ? (
        <div className="space-y-4">
          {/* Triggered State */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8" />
              <div>
                <div className="text-2xl font-bold">🎊 AUTOCALL TRIGGERED!</div>
                <div className="text-sm opacity-90">Early redemption activated</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-xs opacity-80 mb-1">You Receive</div>
                <div className="text-3xl font-bold">
                  {formatCurrency(autocallPayment, currency)}
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-xs opacity-80 mb-1">Total Return</div>
                <div className="text-3xl font-bold">
                  +{((autocallPayment / terms.notional - 1) * 100).toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm opacity-90">
              ✓ Investment redeemed early - you get principal + all coupons paid to date
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
              <div className="text-xs text-muted mb-1">Principal</div>
              <div className="text-xl font-bold text-valura-ink">
                {formatCurrency(terms.notional, currency)}
              </div>
            </div>
            <div className="bg-green-100 rounded-lg p-4 border-2 border-green-400">
              <div className="text-xs text-muted mb-1">+ Coupons</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(couponsReceivedToDate, currency)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Not Triggered State */}
          <div className="bg-white rounded-lg p-5 border border-blue-300">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-sm text-muted">Autocall Level</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(autocallLevel * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted">Current Level</div>
                <div className="text-2xl font-bold text-valura-ink">
                  {currentLevelPct.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Progress to Autocall */}
            <div className="relative">
              <div className="w-full bg-grey-light rounded-full h-8 relative overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    distanceToAutocall >= -5 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                      : 'bg-gradient-to-r from-blue-400 to-cyan-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, currentLevelPct))}%`
                  }}
                />
                {/* Autocall trigger line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-purple-600 z-10"
                  style={{
                    left: `${autocallLevel * 100}%`
                  }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-purple-600 whitespace-nowrap">
                    Autocall ⚡
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 text-sm text-center">
              {distanceToAutocall >= 0 ? (
                <span className="text-green-600 font-semibold">
                  ✓ Above autocall level by {distanceToAutocall.toFixed(1)}%
                </span>
              ) : (
                <span className="text-muted">
                  {Math.abs(distanceToAutocall).toFixed(1)}% below autocall level
                </span>
              )}
            </div>
          </div>

          {/* Potential Payout */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-sm text-muted mb-2">Potential Autocall Payout:</div>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(autocallPayment, currency)}
            </div>
            <div className="text-xs text-muted mt-1">
              If autocall triggers (principal + coupons to date)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
