/**
 * Autocall Step-Down Schedule Card
 * Visual display of descending autocall levels over time
 */

import { TrendingDown, Calendar, CheckCircle, Circle, Zap } from 'lucide-react';
import type { ReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import { generateAutocallSchedule, type AutocallObservation } from '../../products/reverseConvertible/autocall';
import { getCurrentISODate } from '../../core/types/dates';
import { formatCurrency } from '../../services/positionValuation';

interface AutocallStepDownCardProps {
  terms: ReverseConvertibleTerms;
  currentBasketLevel: number; // Current level as decimal (e.g., 1.05 for 105%)
  inceptionDate: string;
  couponsToDate: number;
  currency: string;
}

export function AutocallStepDownCard({ 
  terms, 
  currentBasketLevel,
  inceptionDate,
  couponsToDate,
  currency 
}: AutocallStepDownCardProps) {
  if (!terms.autocallStepDown || !terms.autocallStepDownLevels) {
    return null;
  }

  const observations = generateAutocallSchedule(
    inceptionDate,
    terms.tenorMonths,
    terms.autocallFrequency || terms.couponFreqPerYear,
    true,
    terms.autocallStepDownLevels
  );

  const today = new Date();
  const currentLevelPct = currentBasketLevel * 100;

  // Check which observations have passed and if any triggered
  const observationStatuses = observations.map(obs => {
    const obsDate = new Date(obs.date);
    const hasPassed = obsDate <= today;
    const triggered = currentLevelPct >= (obs.autocallLevel * 100);
    
    return {
      ...obs,
      hasPassed,
      triggered,
      wouldTrigger: !hasPassed && triggered,
    };
  });

  const anyTriggered = observationStatuses.some(o => o.hasPassed && o.triggered);
  const firstTrigger = observationStatuses.find(o => o.hasPassed && o.triggered);

  return (
    <div className="section-card">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-xl ${
          anyTriggered 
            ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg animate-pulse' 
            : 'bg-gradient-to-br from-blue-500 to-cyan-600'
        }`}>
          <TrendingDown className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-valura-ink">
            {anyTriggered ? '🎊 Autocall Triggered!' : '⚡ Step-Down Autocall Schedule'}
          </h3>
          <p className="text-sm text-muted">
            {anyTriggered 
              ? `Early redemption at observation #${firstTrigger?.observationNumber}`
              : 'Decreasing autocall levels at each observation'}
          </p>
        </div>
      </div>

      {anyTriggered && firstTrigger && (
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white shadow-xl">
          <div className="text-2xl font-bold mb-3">Investment Called Early!</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-lg p-4">
              <div className="text-xs opacity-80 mb-1">Observation #{firstTrigger.observationNumber}</div>
              <div className="text-sm opacity-90">{new Date(firstTrigger.date).toLocaleDateString()}</div>
              <div className="text-lg font-bold mt-1">Level: {(firstTrigger.autocallLevel * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="text-xs opacity-80 mb-1">Total Payout</div>
              <div className="text-3xl font-bold">
                {formatCurrency(terms.notional + couponsToDate, currency)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Table */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
          Autocall Observation Schedule
        </div>

        {observationStatuses.map((obs, index) => {
          const triggered = obs.hasPassed && obs.triggered;
          const wouldTrigger = !obs.hasPassed && currentLevelPct >= (obs.autocallLevel * 100);
          
          return (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                triggered
                  ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-300'
                  : wouldTrigger
                  ? 'bg-green-50 border-green-400'
                  : obs.hasPassed
                  ? 'bg-grey-light border-border'
                  : 'bg-white border-border'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 ${
                  triggered ? 'text-purple-600' : wouldTrigger ? 'text-green-600' : 'text-grey-medium'
                }`}>
                  {triggered || wouldTrigger ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </div>

                {/* Details */}
                <div>
                  <div className="font-semibold text-valura-ink flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted" />
                    Observation #{obs.observationNumber}
                    {triggered && (
                      <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded font-bold">
                        TRIGGERED ⚡
                      </span>
                    )}
                    {wouldTrigger && !obs.hasPassed && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded font-bold">
                        WILL TRIGGER ✓
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted mt-1">
                    {new Date(obs.date).toLocaleDateString()} • Day {obs.daysSinceInception}
                  </div>
                </div>
              </div>

              {/* Level */}
              <div className="text-right">
                <div className="text-xs text-muted mb-1">Autocall Level</div>
                <div className={`text-2xl font-bold ${
                  triggered ? 'text-purple-600' : 
                  wouldTrigger ? 'text-green-600' : 
                  'text-valura-ink'
                }`}>
                  {(obs.autocallLevel * 100).toFixed(0)}%
                </div>
                {index > 0 && (
                  <div className="text-xs text-red-500 font-medium">
                    ↓ -{((observations[index-1].autocallLevel - obs.autocallLevel) * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Level Indicator */}
      <div className={`mt-6 p-4 rounded-xl ${
        anyTriggered 
          ? 'bg-purple-50 border-2 border-purple-300' 
          : 'bg-blue-50 border-2 border-blue-300'
      }`}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-valura-ink">Current Basket Level:</span>
          <span className="text-3xl font-bold text-blue-600">
            {currentLevelPct.toFixed(1)}%
          </span>
        </div>
        
        {!anyTriggered && (
          <div className="mt-3 text-sm text-muted">
            {currentLevelPct >= (observations[0].autocallLevel * 100) ? (
              <span className="text-green-600 font-semibold">
                ✓ Above next autocall level ({(observations[0].autocallLevel * 100).toFixed(0)}%)
              </span>
            ) : (
              <span>
                Next observation: {new Date(observations.find(o => !o.hasPassed)?.date || observations[0].date).toLocaleDateString()} 
                at {(observations.find(o => !o.hasPassed)?.autocallLevel || observations[0].autocallLevel) * 100}%
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
