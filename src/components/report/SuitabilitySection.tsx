/**
 * Suitability Section Component
 * Good fit / Not a fit format
 */

import { CardShell } from '../common/CardShell';
import { SectionHeader } from '../common/SectionHeader';
import { CheckCircle, XCircle } from 'lucide-react';
import { Pill } from '../common/Pill';

export function SuitabilitySection({ productType = 'RC' }: { productType?: 'RC' | 'CPPN' }) {
  const goodFitCriteria =
    productType === 'RC'
      ? [
          'You want income and can accept capped upside',
          "You're neutral to moderately bullish on these stocks",
          'You can hold to maturity',
        ]
      : [
          'You want a protected floor and upside/downside participation',
          "You're mildly directional (upside or downside view) and prefer defined terms",
          'You can hold to maturity (secondary liquidity may be limited)',
        ];

  const notFitCriteria =
    productType === 'RC'
      ? [
          'You need capital protection',
          'You cannot accept share delivery risk',
          'You might need to sell early (liquidity/price risk)',
        ]
      : [
          'You want full, uncapped equity participation',
          'You are uncomfortable with issuer credit risk',
          'You need high liquidity or might sell early',
        ];

  return (
    <CardShell className="p-6">
      <SectionHeader
        title="Good fit / Not a fit"
        subtitle="Determine if this product matches your investment goals and risk tolerance"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Good Fit Column */}
        <div
          className="space-y-4 p-4 rounded-2xl border"
          style={{
            background: 'linear-gradient(135deg, var(--success-bg) 0%, #ecfdf3 100%)',
            borderColor: 'var(--success-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-success-fg" />
              <h3 className="text-lg font-semibold text-text-primary">Good fit if…</h3>
            </div>
            <Pill variant="success">Good fit</Pill>
          </div>
          <div className="space-y-3">
            {goodFitCriteria.map((criterion, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-success" />
                </div>
                <p className="text-text-secondary flex-1 text-sm">{criterion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Not a Fit Column */}
        <div
          className="space-y-4 p-4 rounded-2xl border"
          style={{
            background: 'linear-gradient(135deg, var(--danger-bg) 0%, #fff5f5 100%)',
            borderColor: 'var(--danger-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <XCircle className="w-6 h-6 text-danger-fg" />
              <h3 className="text-lg font-semibold text-text-primary">Not a fit if…</h3>
            </div>
            <Pill variant="danger">Not a fit</Pill>
          </div>
          <div className="space-y-3">
            {notFitCriteria.map((criterion, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-danger" />
                </div>
                <p className="text-text-secondary flex-1 text-sm">{criterion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardShell>
  );
}

