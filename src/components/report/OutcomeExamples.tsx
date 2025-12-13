/**
 * Outcome Examples Component
 * Scenario table showing outcomes for different worst-of final levels
 */

import type { ReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import { formatPercent, formatNumber } from '../../core/utils/math';
import { calculateEndingValue } from '../../products/reverseConvertible/breakEven';
import { CardShell } from '../common/CardShell';
import { SectionHeader } from '../common/SectionHeader';

interface OutcomeExamplesProps {
  terms: ReverseConvertibleTerms;
  notional?: number; // Default: 100000
  barrierPct: number;
  breakEvenPct: number;
}

export function OutcomeExamples({ 
  terms, 
  notional = 100000, 
  barrierPct,
  breakEvenPct 
}: OutcomeExamplesProps) {
  const scenarios = [120, 100, 90, 70, 60, 50]; // Final levels in %
  
  // Determine trigger: barrier for standard RC, strike for low-strike RC
  const triggerPct = terms.barrierPct ?? terms.strikePct ?? 0;
  const triggerPctNum = triggerPct * 100; // Convert to percentage
  const triggerLabel = terms.variant === 'low_strike_geared_put' ? 'Strike' : 'Barrier';
  
  return (
    <CardShell className="p-6">
      <SectionHeader
        title={`If you invest $${formatNumber(notional, 0)} (illustrative)`}
        subtitle="Estimated outcomes based on worst stock final level at maturity"
      />
      
      <div className="overflow-x-auto mt-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-2">
              <th className="text-left p-3 border-b-2 border-border font-semibold text-valura-ink text-sm">
                Worst Stock Final Level (%)
              </th>
              <th className="text-left p-3 border-b-2 border-border font-semibold text-valura-ink text-sm">
                Redemption Type
              </th>
              <th className="text-right p-3 border-b-2 border-grey-border font-semibold text-text-primary text-sm">
                Estimated Coupons Received ($)
              </th>
              <th className="text-right p-3 border-b-2 border-grey-border font-semibold text-text-primary text-sm">
                Estimated Ending Value ($)
              </th>
              <th className="text-right p-3 border-b-2 border-grey-border font-semibold text-text-primary text-sm">
                Total Return (%)
              </th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((finalLevel) => {
              const outcome = calculateEndingValue(terms, finalLevel, notional);
              const isTrigger = Math.abs(finalLevel - triggerPctNum) < 0.5; // Within 0.5% of trigger
              
              // Break-even display rules:
              // - For low-strike: show if break-even < strike (in conversion zone)
              // - For standard RC: show if break-even < barrier (in conversion zone)
              //   If break-even >= barrier, it's outside conversion zone (any conversion is below break-even)
              const isBreakEven = breakEvenPct < triggerPctNum && Math.abs(finalLevel - breakEvenPct) < 1;
              
              return (
                <tr 
                  key={finalLevel}
                  className={`border-b border-border hover:bg-valura-mint-100/30 ${
                    isTrigger ? 'bg-valura-mint-100/20' : ''
                  } ${isBreakEven ? 'bg-warning-bg/20' : ''}`}
                >
                  <td className="p-3 text-valura-ink font-medium">
                    {finalLevel}%
                    {isTrigger && (
                      <span className="ml-2 text-xs text-valura-ink font-semibold">({triggerLabel})</span>
                    )}
                    {isBreakEven && (
                      <span className="ml-2 text-xs text-warning-fg font-semibold">(Break-even)</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      outcome.redemptionType === 'Cash'
                        ? 'bg-success-bg text-success-fg'
                        : 'bg-danger-bg text-danger-fg'
                    }`}>
                      {outcome.redemptionType}
                    </span>
                  </td>
                  <td className="p-3 text-right text-valura-ink">
                    ${formatNumber(outcome.couponsReceived, 0)}
                  </td>
                  <td className="p-3 text-right text-valura-ink font-semibold">
                    ${formatNumber(outcome.endingValue, 0)}
                  </td>
                  <td className={`p-3 text-right font-semibold ${
                    outcome.totalReturn >= 0 ? 'text-success-fg' : 'text-danger-fg'
                  }`}>
                    {outcome.totalReturn >= 0 ? '+' : ''}{formatPercent(outcome.totalReturn / 100, 1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <p className="text-xs text-muted mt-4 italic">
        Assumes coupons paid as scheduled and no issuer default. Values are illustrative and not guaranteed.
        {terms.variant === 'low_strike_geared_put' && terms.strikePct && (
          <span className="block mt-2">
            Below strike ({formatPercent(terms.strikePct, 0)}), you receive shares priced at the strike, so the ending value moves with the stock.
          </span>
        )}
        {terms.variant === 'standard_barrier_rc' && terms.barrierPct && breakEvenPct >= (terms.barrierPct * 100) && (
          <span className="block mt-2">
            Break-even level (including coupons): {formatPercent(breakEvenPct / 100, 1)} (outside conversion zone). Any conversion scenario will be below break-even.
          </span>
        )}
      </p>
    </CardShell>
  );
}

