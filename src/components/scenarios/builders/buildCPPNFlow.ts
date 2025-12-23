/**
 * CPPN Flow Builder
 * Builds scenario flow for Capital Protected Participation Notes.
 */

import type { CapitalProtectedParticipationTerms } from '../../../products/capitalProtectedParticipation/terms';
import type { ScenarioFlow } from '../types';
import { formatNumber } from '../../../core/utils/math';

export function buildCPPNFlow(terms: CapitalProtectedParticipationTerms): ScenarioFlow {
  const levelLabel =
    terms.basketType === 'single'
      ? 'Final Level'
      : `Basket Final Level (${terms.basketType.replace('_', '-')})`;

  const nodes = [];

  // Optional KI node first
  if (terms.knockInEnabled && terms.knockInLevelPct != null) {
    nodes.push({
      id: 'cppn-ki',
      stage: 'maturity' as const,
      condition: `Is ${levelLabel} < KI (${terms.knockInLevelPct}%)?`,
      yes: {
        title: 'Knock-in Regime (Geared Put)',
        lines: [
          'Protection floor is removed in this regime',
          `Payoff% = 100 × (X / S)`,
          `S = ${formatNumber(terms.downsideStrikePct ?? terms.knockInLevelPct, 0)}% (airbag-style by default)`,
        ],
      },
      no: {
        title: 'Protected Participation Regime',
        lines: [
          `Floor: ${formatNumber(terms.capitalProtectionPct, 0)}%`,
          `Participation starts at K = ${formatNumber(terms.participationStartPct, 0)}%`,
          `Rate: ${formatNumber(terms.participationRatePct, 0)}% (${terms.participationDirection === 'up' ? 'upside' : 'downside'})`,
        ],
      },
      metaChips: [
        terms.capType === 'capped' && terms.capLevelPct != null ? `Cap: ${formatNumber(terms.capLevelPct, 0)}%` : 'Cap: None',
      ],
    });
  }

  // Participation node (always)
  nodes.push({
    id: 'cppn-participation',
    stage: 'maturity' as const,
    condition:
      terms.participationDirection === 'up'
        ? `Is ${levelLabel} > K (${formatNumber(terms.participationStartPct, 0)}%)?`
        : `Is ${levelLabel} < K (${formatNumber(terms.participationStartPct, 0)}%)?`,
    yes: {
      title: terms.participationDirection === 'up' ? 'Participating Outcome' : 'Participating Outcome (Downside)',
      lines: [
        `Payoff% = max(P, P + a × ${terms.participationDirection === 'up' ? '(X − K)' : '(K − X)'})`,
        terms.capType === 'capped' && terms.capLevelPct != null ? `Capped at ${formatNumber(terms.capLevelPct, 0)}%` : 'No cap',
      ],
    },
    no: {
      title: 'Protected Outcome',
      lines: [
        `Payoff% = ${formatNumber(terms.capitalProtectionPct, 0)}% (floor)`,
        'No participation in this region',
      ],
    },
    metaChips: [
      `P: ${formatNumber(terms.capitalProtectionPct, 0)}%`,
      `α: ${formatNumber(terms.participationRatePct, 0)}%`,
      `K: ${formatNumber(terms.participationStartPct, 0)}%`,
    ],
  });

  return {
    title: 'Understand the Scenarios',
    subtitle: 'What happens at maturity based on final basket level',
    nodes,
  };
}






