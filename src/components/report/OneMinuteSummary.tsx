/**
 * One-Minute Summary Component
 * Investor-first summary card answering key questions in 60 seconds
 */

import type { ReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import { formatPercent } from '../../core/utils/math';
import { CardShell } from '../common/CardShell';
import { DollarSign, Shield } from 'lucide-react';

interface OneMinuteSummaryProps {
  terms: ReverseConvertibleTerms;
  timestamp: string;
}

export function OneMinuteSummary({ terms, timestamp }: OneMinuteSummaryProps) {
  const couponRateText = formatPercent(terms.couponRatePA, 1) + ' p.a.';
  const barrierPct = formatPercent(terms.barrierPct || terms.strikePct || 0, 0);
  const basketLabel = terms.basketType === 'worst_of' 
    ? 'lowest stock' 
    : 'underlying stock';
  
  const couponFreqText = terms.couponFreqPerYear === 12 
    ? 'monthly' 
    : terms.couponFreqPerYear === 4 
    ? 'quarterly' 
    : terms.couponFreqPerYear === 2 
    ? 'semi-annually' 
    : 'annually';

  return (
    <CardShell className="p-6" style={{ backgroundColor: 'var(--surface-2)' }}>
      <div className="space-y-4">
        {/* Three key rows */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            <DollarSign className="w-6 h-6 text-success-fg" />
          </div>
          <div>
            <div className="font-semibold text-text-primary mb-1">Earn:</div>
            <div className="text-text-secondary">
              {couponRateText} coupons (paid {couponFreqText})
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            <Shield className="w-6 h-6 text-primary-blue" />
          </div>
          <div>
            <div className="font-semibold text-text-primary mb-1">Principal:</div>
            <div className="text-text-secondary">
              100% returned if the <span className="font-semibold italic">{basketLabel}</span> is ≥ {barrierPct} of its reference price at maturity
            </div>
          </div>
        </div>

        {/* Footer disclaimer */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center space-x-2 text-xs text-text-secondary">
            <span className="px-2 py-1 bg-warning-bg text-warning-fg rounded-full font-medium">
              Indicative terms
            </span>
            <span>•</span>
            <span>Data as of {new Date(timestamp).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
            <span>•</span>
            <span>Not an offer</span>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

