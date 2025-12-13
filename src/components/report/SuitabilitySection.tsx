/**
 * Suitability Section Component
 * Good fit / Not a fit format
 */

import { CardShell } from '../common/CardShell';
import { SectionHeader } from '../common/SectionHeader';
import { CheckCircle, XCircle } from 'lucide-react';

export function SuitabilitySection() {
  const goodFitCriteria = [
    'You want income and can accept capped upside',
    'You\'re neutral to moderately bullish on these stocks',
    'You can hold to maturity',
  ];

  const notFitCriteria = [
    'You need capital protection',
    'You cannot accept share delivery risk',
    'You might need to sell early (liquidity/price risk)',
  ];

  return (
    <CardShell className="p-6">
      <SectionHeader
        title="Good fit / Not a fit"
        subtitle="Determine if this product matches your investment goals and risk tolerance"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Good Fit Column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-6 h-6 text-success-fg" />
            <h3 className="text-lg font-semibold text-valura-ink">Good fit if…</h3>
          </div>
          <div className="space-y-3">
            {goodFitCriteria.map((criterion, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-success-fg" />
                </div>
                <p className="text-muted flex-1 text-sm">{criterion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Not a Fit Column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <XCircle className="w-6 h-6 text-danger-fg" />
            <h3 className="text-lg font-semibold text-valura-ink">Not a fit if…</h3>
          </div>
          <div className="space-y-3">
            {notFitCriteria.map((criterion, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-danger-fg" />
                </div>
                <p className="text-muted flex-1 text-sm">{criterion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardShell>
  );
}

