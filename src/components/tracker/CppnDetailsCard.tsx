/**
 * CPPN Details Card
 * Explains CPPN/Participation Note logic and current status
 */

import { Shield, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import type { CapitalProtectedParticipationTerms } from '../../products/capitalProtectedParticipation/terms';
import type { PositionValue } from '../../types/investment';

interface CppnDetailsCardProps {
  terms: CapitalProtectedParticipationTerms;
  value: PositionValue;
  basketLevel: number; // Current basket level as percentage
}

export function CppnDetailsCard({ terms, value, basketLevel }: CppnDetailsCardProps) {
  const hasKnockIn = terms.knockInEnabled && terms.knockInLevelPct;
  const knockInLevel = terms.knockInLevelPct || 0;
  const knockInTriggered = hasKnockIn && basketLevel < knockInLevel;
  const capitalProtection = terms.capitalProtectionPct;
  const participationStart = terms.participationStartPct;
  const participationRate = terms.participationRatePct;

  return (
    <div className="section-card">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-lg ${
          knockInTriggered 
            ? 'bg-red-500' 
            : 'bg-blue-500'
        }`}>
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-valura-ink">
            {terms.bonusEnabled ? 'Bonus Certificate' : 'Participation Note'} Details
          </h3>
          <p className="text-sm text-muted">Product structure & current status</p>
        </div>
      </div>

      {/* Product Structure */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-xs text-muted mb-1">Capital Protection</div>
          <div className="text-2xl font-bold text-blue-600">{capitalProtection}%</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-xs text-muted mb-1">Participation Rate</div>
          <div className="text-2xl font-bold text-purple-600">{participationRate}%</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-xs text-muted mb-1">Starts At</div>
          <div className="text-2xl font-bold text-green-600">{participationStart}%</div>
        </div>
        {hasKnockIn && (
          <div className={`rounded-lg p-4 border-2 ${
            knockInTriggered 
              ? 'bg-red-100 border-red-400' 
              : 'bg-yellow-50 border-yellow-300'
          }`}>
            <div className="text-xs text-muted mb-1">Knock-In Level</div>
            <div className={`text-2xl font-bold ${
              knockInTriggered ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {knockInLevel}%
            </div>
          </div>
        )}
      </div>

      {/* Current Status */}
      <div className="space-y-4">
        <div className={`p-5 rounded-xl border-2 ${
          knockInTriggered 
            ? 'bg-red-50 border-red-400' 
            : 'bg-green-50 border-green-400'
        }`}>
          <div className="flex items-start gap-3 mb-3">
            {knockInTriggered ? (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            ) : (
              <Shield className="w-6 h-6 text-green-600" />
            )}
            <div className="flex-1">
              <h4 className={`font-bold text-lg mb-1 ${
                knockInTriggered ? 'text-red-700' : 'text-green-700'
              }`}>
                {knockInTriggered ? '⚠️ Knock-In Triggered!' : '✓ Capital Protection Active'}
              </h4>
              <p className="text-sm text-muted">
                {knockInTriggered 
                  ? 'Basket level fell below knock-in barrier - protection removed'
                  : 'Basket level above knock-in - capital is protected'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted mb-1">Current Basket Level</div>
              <div className={`text-3xl font-bold ${
                knockInTriggered ? 'text-red-600' : 'text-green-600'
              }`}>
                {basketLevel.toFixed(1)}%
              </div>
            </div>
            {hasKnockIn && (
              <div>
                <div className="text-xs text-muted mb-1">Knock-In Barrier</div>
                <div className="text-3xl font-bold text-valura-ink">
                  {knockInLevel}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Explanation */}
        {knockInTriggered ? (
          <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-900">
                <strong>Why you're seeing shares:</strong> Your basket level ({basketLevel.toFixed(1)}%) 
                fell below the knock-in barrier ({knockInLevel}%). When knock-in triggers, the capital 
                protection is removed and you get a geared payoff based on the downside strike. 
                This is calculated as: <strong>Basket Level ÷ Strike × Notional</strong>, 
                which may result in physical delivery of shares.
              </div>
            </div>
          </div>
        ) : capitalProtection > 0 ? (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <strong>Your protection:</strong> You have {capitalProtection}% capital protection. 
                As long as the basket stays above {knockInLevel}% (knock-in level), you're protected. 
                Your worst case is getting back {capitalProtection}% of your investment 
                ({capitalProtection}% × ${terms.notional.toLocaleString()} = ${(capitalProtection / 100 * terms.notional).toLocaleString()}).
                {basketLevel > participationStart && (
                  <> You're also earning upside participation at {participationRate}% rate!</>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-purple-900">
                <strong>Bonus Certificate:</strong> This product has NO capital protection but offers 
                {terms.bonusEnabled && terms.bonusLevelPct && (
                  <> a guaranteed {terms.bonusLevelPct}% return if the barrier ({terms.bonusBarrierPct}%) 
                  is never touched</>
                )}. You participate 1:1 in the underlying performance.
              </div>
            </div>
          </div>
        )}

        {/* Payoff Formula */}
        <div className="bg-grey-light rounded-lg p-4">
          <div className="text-sm font-semibold text-valura-ink mb-2">Current Payoff Calculation:</div>
          <div className="font-mono text-sm text-muted">
            {knockInTriggered ? (
              <>
                <div className="text-red-600 font-semibold mb-1">⚠️ Knock-In Mode (Geared Put):</div>
                <div>Payoff = (Basket Level ÷ Strike) × Notional</div>
                <div className="mt-1">
                  = ({basketLevel.toFixed(1)}% ÷ {terms.downsideStrikePct || knockInLevel}%) × ${terms.notional.toLocaleString()}
                </div>
                <div className="mt-1 text-valura-ink font-bold">
                  = ${value.projectedSettlementValue.toLocaleString()}
                </div>
              </>
            ) : (
              <>
                <div className="text-green-600 font-semibold mb-1">✓ Protected Mode:</div>
                <div>Payoff = {capitalProtection}% + {participationRate}% × max(0, Basket - {participationStart}%)</div>
                <div className="mt-1">
                  = {capitalProtection}% + {participationRate}% × max(0, {basketLevel.toFixed(1)}% - {participationStart}%)
                </div>
                {basketLevel > participationStart ? (
                  <div className="mt-1">
                    = {capitalProtection}% + {participationRate}% × {(basketLevel - participationStart).toFixed(1)}%
                  </div>
                ) : (
                  <div className="mt-1 text-muted">
                    = {capitalProtection}% (basket below participation start)
                  </div>
                )}
                <div className="mt-1 text-valura-ink font-bold">
                  = ${value.projectedSettlementValue.toLocaleString()}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
