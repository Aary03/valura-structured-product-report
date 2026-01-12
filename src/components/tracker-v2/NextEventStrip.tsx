/**
 * Next Event Strip Component
 * Shows upcoming events, eligibility, and distances to key levels
 */

import { Calendar, Gift, Zap, Flag, TrendingDown } from 'lucide-react';
import type { PositionSnapshot } from '../../services/positionEvaluator';

interface NextEventStripProps {
  snapshot: PositionSnapshot;
  currency: string;
}

export function NextEventStrip({ snapshot, currency }: NextEventStripProps) {
  const upcomingEvents = snapshot.nextEvents.filter(e => e.status === 'upcoming').slice(0, 2);
  const hasUpcoming = upcomingEvents.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-md border-2 border-blue-200 p-5">
      <div className="flex items-center justify-between">
        {/* Next Events */}
        <div className="flex-1">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            Next Events
          </h3>
          {hasUpcoming ? (
            <div className="flex items-center gap-6">
              {upcomingEvents.map((event, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    event.type === 'coupon' ? 'bg-green-100' :
                    event.type === 'autocall_obs' ? 'bg-purple-100' :
                    'bg-blue-100'
                  }`}>
                    {event.type === 'coupon' ? <Gift className="w-5 h-5 text-green-600" /> :
                     event.type === 'autocall_obs' ? <Zap className="w-5 h-5 text-purple-600" /> :
                     <Flag className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-valura-ink">{event.label}</div>
                    <div className="text-xs text-muted">
                      {new Date(event.date).toLocaleDateString()}
                      {event.amount && (
                        <span className="ml-2 text-green-600 font-semibold">
                          {new Intl.NumberFormat('en-US', { 
                            style: 'currency', 
                            currency 
                          }).format(event.amount)}
                        </span>
                      )}
                    </div>
                    {event.eligible !== undefined && (
                      <div className={`text-xs font-semibold mt-0.5 ${
                        event.eligible ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {event.eligible ? '✓ Eligible' : '✗ Not Eligible'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted">No upcoming events - approaching maturity</div>
          )}
        </div>

        {/* Key Levels Distance */}
        {snapshot.keyLevels.length > 0 && (
          <div className="pl-6 border-l-2 border-border">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
              Distance to Key Levels
            </h3>
            <div className="space-y-2">
              {snapshot.keyLevels.slice(0, 2).map((level, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    level.status === 'safe' ? 'bg-green-500' :
                    level.status === 'at_risk' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm font-medium text-valura-ink">{level.label}:</span>
                  <span className={`text-sm font-bold ${
                    level.status === 'safe' ? 'text-green-600' :
                    level.status === 'at_risk' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {level.distance >= 0 ? '+' : ''}{level.distance.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
