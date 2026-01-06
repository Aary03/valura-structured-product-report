/**
 * CPPN Outcome Examples
 * Scenario table showing outcomes for different final basket levels (X).
 */

import type { CapitalProtectedParticipationTerms } from '../../products/capitalProtectedParticipation/terms';
import { CardShell } from '../common/CardShell';
import { SectionHeader } from '../common/SectionHeader';
import { formatNumber, formatPercent } from '../../core/utils/math';

export function CppnOutcomeExamples({
  terms,
  notional = 100000,
}: {
  terms: CapitalProtectedParticipationTerms;
  notional?: number;
}) {
  const scenarios = [160, 140, 120, 100, 90, 70];
  const a = terms.participationRatePct / 100;

  const payoffAt = (X: number) => {
    if (terms.knockInEnabled && terms.knockInLevelPct != null && X < terms.knockInLevelPct) {
      const S = terms.downsideStrikePct ?? terms.knockInLevelPct;
      return (100 * X) / S;
    }
    const P = terms.capitalProtectionPct;
    const K = terms.participationStartPct;
    const delta = terms.participationDirection === 'up' ? Math.max(0, X - K) : Math.max(0, K - X);
    const cappedDelta =
      terms.capType === 'capped' && terms.capLevelPct != null ? Math.min(delta, Math.max(0, terms.capLevelPct - K)) : delta;
    return Math.max(P, P + a * cappedDelta);
  };

  const regimeLabel = (X: number) => {
    if (terms.knockInEnabled && terms.knockInLevelPct != null && X < terms.knockInLevelPct) return 'Knock-in (Geared)';
    if (terms.participationDirection === 'up') return X > terms.participationStartPct ? 'Participating' : 'Protected';
    return X < terms.participationStartPct ? 'Participating' : 'Protected';
  };

  return (
    <CardShell className="p-6">
      <SectionHeader
        title={`If you invest $${formatNumber(notional, 0)} (illustrative)`}
        subtitle="Estimated outcomes based on final basket level at maturity"
      />

      <div className="overflow-x-auto mt-6">
        <table className="w-full border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-surface-2">
              <th className="text-left p-3 border-b-2 border-border font-semibold text-valura-ink text-sm">
                Final Basket Level (X)
              </th>
              <th className="text-left p-3 border-b-2 border-border font-semibold text-valura-ink text-sm">
                Regime
              </th>
              <th className="text-right p-3 border-b-2 border-grey-border font-semibold text-text-primary text-sm">
                Payoff (%)
              </th>
              <th className="text-right p-3 border-b-2 border-grey-border font-semibold text-text-primary text-sm">
                Redemption ($)
              </th>
              <th className="text-right p-3 border-b-2 border-grey-border font-semibold text-text-primary text-sm">
                Total Return (%)
              </th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((X) => {
              const payoffPct = payoffAt(X);
              const redemption = (notional * payoffPct) / 100;
              const totalReturnPct = ((redemption / notional) - 1) * 100;
              const tone = totalReturnPct >= 0 ? 'text-success-fg' : 'text-danger-fg';
              return (
                <tr key={X} className="border-b border-border hover:bg-valura-mint-100/30">
                  <td className="p-3 text-valura-ink font-medium">{X}%</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-surface-2 border border-border">
                      {regimeLabel(X)}
                    </span>
                  </td>
                  <td className="p-3 text-right text-valura-ink font-semibold">
                    {formatNumber(payoffPct, 1)}%
                  </td>
                  <td className="p-3 text-right text-valura-ink font-semibold">
                    ${formatNumber(redemption, 0)}
                  </td>
                  <td className={`p-3 text-right font-semibold ${tone}`}>
                    {totalReturnPct >= 0 ? '+' : ''}
                    {formatPercent(totalReturnPct / 100, 1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted mt-4 italic">
        Illustrative only (issuer risk ignored). If Knock-in is enabled and the final level is below KI, payoff switches to 100×(X/S).
      </p>
    </CardShell>
  );
}














