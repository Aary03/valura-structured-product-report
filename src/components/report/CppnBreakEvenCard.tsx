/**
 * CPPN Break-even Card
 * Shows minimum redemption (if P>=100) or breakeven X level (if P<100) in protected regime.
 */

import type { CapitalProtectedParticipationTerms } from '../../products/capitalProtectedParticipation/terms';
import { calculateCppnBreakevenLevelPct } from '../../products/capitalProtectedParticipation/breakEven';
import { CardShell } from '../common/CardShell';
import { SectionHeader } from '../common/SectionHeader';
import { formatNumber } from '../../core/utils/math';
import { Target, AlertCircle, Shield } from 'lucide-react';

export function CppnBreakEvenCard({ terms }: { terms: CapitalProtectedParticipationTerms }) {
  const be = calculateCppnBreakevenLevelPct(terms);

  return (
    <CardShell className="p-6">
      <SectionHeader
        title="Break-Even Analysis"
        subtitle="When do you start making money at maturity?"
      />

      <div className="mt-6 space-y-4">
        {terms.capitalProtectionPct >= 100 ? (
          <div className="flex items-center justify-between p-4 bg-success-light rounded-xl border border-success">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-success-fg" />
              <div>
                <div className="text-sm text-muted mb-1">Minimum redemption</div>
                <div className="text-2xl font-bold text-success-fg">
                  {formatNumber(terms.capitalProtectionPct, 0)}%
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted mb-1">Note</div>
              <div className="text-sm font-semibold text-text-primary">
                Capital protected (issuer dependent)
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 bg-warning-bg rounded-xl border" style={{ borderColor: 'rgba(148,98,0,0.25)' }}>
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-warning-fg" />
                <div>
                  <div className="text-sm text-muted mb-1">Breakeven basket level (X)</div>
                  <div className="text-2xl font-bold text-warning-fg">
                    {be.kind === 'level' ? `${formatNumber(be.levelPct, 1)}%` : '—'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted mb-1">Floor</div>
                <div className="text-xl font-semibold text-valura-ink">
                  {formatNumber(terms.capitalProtectionPct, 0)}%
                </div>
              </div>
            </div>

            {be.kind === 'impossible' && (
              <div className="flex items-start space-x-3 p-3 bg-warning-bg rounded-lg border" style={{ borderColor: 'rgba(148,98,0,0.25)' }}>
                <AlertCircle className="w-5 h-5 text-warning-fg mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted">
                  <div className="font-semibold text-text-primary mb-1">Breakeven may be unreachable</div>
                  <div>{be.reason}</div>
                </div>
              </div>
            )}
          </>
        )}

        {terms.knockInEnabled && (
          <div className="flex items-start space-x-3 p-3 bg-surface-2 rounded-lg border border-border">
            <AlertCircle className="w-5 h-5 text-warning-fg mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted">
              <div className="font-semibold text-text-primary mb-1">Knock-in note</div>
              <div>
                If final level is below KI ({terms.knockInLevelPct}%), payoff switches to{' '}
                <span className="font-mono">100×(X/S)</span> (S={terms.downsideStrikePct ?? terms.knockInLevelPct}%).
              </div>
            </div>
          </div>
        )}
      </div>
    </CardShell>
  );
}






