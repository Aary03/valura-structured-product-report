/**
 * CPPN One-Minute Summary
 * Mirrors the RC "earn / principal / risk" layout with CPPN wording.
 */

import type { CapitalProtectedParticipationTerms } from '../../products/capitalProtectedParticipation/terms';
import { CardShell } from '../common/CardShell';
import { DollarSign, Shield, AlertTriangle } from 'lucide-react';

interface CppnOneMinuteSummaryProps {
  terms: CapitalProtectedParticipationTerms;
  timestamp: string;
}

export function CppnOneMinuteSummary({ terms, timestamp }: CppnOneMinuteSummaryProps) {
  const dirText = terms.participationDirection === 'up' ? 'upside' : 'downside';
  const capText = terms.capType === 'capped' ? `capped at ${terms.capLevelPct}%` : 'no cap';

  return (
    <CardShell className="p-6" style={{ backgroundColor: 'var(--surface-2)' }}>
      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            <DollarSign className="w-6 h-6 text-success-fg" />
          </div>
          <div>
            <div className="font-semibold text-text-primary mb-1">Earn:</div>
            <div className="text-text-secondary">
              {terms.participationRatePct}% {dirText} participation starting at {terms.participationStartPct}% ({capText})
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
              Minimum redemption is {terms.capitalProtectionPct}% at maturity (issuer dependent)
              {terms.knockInEnabled && (
                <>
                  . If final basket level is below KI ({terms.knockInLevelPct}%), payoff switches to 100×(X/S)
                </>
              )}
              .
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            <AlertTriangle className="w-6 h-6 text-warning" />
          </div>
          <div>
            <div className="font-semibold text-text-primary mb-1">Risk:</div>
            <div className="text-text-secondary">
              Issuer credit risk and liquidity risk; capped participation may limit returns
              {terms.knockInEnabled ? ' and knock-in can increase downside exposure.' : '.'}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center space-x-2 text-xs text-text-secondary">
            <span className="px-2 py-1 bg-warning-bg text-warning-fg rounded-full font-medium">
              Indicative terms
            </span>
            <span>•</span>
            <span>
              Data as of{' '}
              {new Date(timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span>•</span>
            <span>Not an offer</span>
          </div>
        </div>
      </div>
    </CardShell>
  );
}


