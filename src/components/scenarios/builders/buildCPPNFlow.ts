/**
 * CPPN Flow Builder
 * Builds scenario flow for Capital Protected Participation Notes.
 */

import type { CapitalProtectedParticipationTerms } from '../../../products/capitalProtectedParticipation/terms';
import type { ScenarioFlow } from '../types';
import { formatNumber } from '../../../core/utils/math';
import {
  getCPPNProtectedOutcome,
  getCPPNParticipationOutcome,
  getCPPNKnockInTriggered,
  getCPPNKnockInSafe,
  getBonusCertificateBonus,
  getBonusCertificateBarrierBreached,
} from '../../../services/scenarioDescriptions';

export function buildCPPNFlow(terms: CapitalProtectedParticipationTerms): ScenarioFlow {
  const levelLabel =
    terms.basketType === 'single'
      ? 'stock'
      : `${terms.basketType.replace('_', '-')} basket`;

  const nodes = [];

  // BONUS CERTIFICATE LOGIC
  if (terms.bonusEnabled && terms.bonusBarrierPct && terms.bonusLevelPct) {
    const bonusDesc = getBonusCertificateBonus(terms, terms.notional);
    const breachDesc = getBonusCertificateBarrierBreached(terms, terms.notional);

    nodes.push({
      id: 'bonus-barrier',
      stage: 'maturity' as const,
      condition: `Did ${levelLabel} stay above ${formatNumber(terms.bonusBarrierPct, 0)}% throughout the entire period?`,
      yes: {
        title: bonusDesc.title,
        lines: bonusDesc.lines,
        note: bonusDesc.example,
      },
      no: {
        title: breachDesc.title,
        lines: breachDesc.lines,
        note: breachDesc.example,
      },
      metaChips: [
        `Bonus: ${formatNumber(terms.bonusLevelPct, 0)}%`,
        `Barrier: ${formatNumber(terms.bonusBarrierPct, 0)}%`,
      ],
    });

    return {
      title: 'Understand the Scenarios',
      subtitle: 'What happens at maturity based on whether the barrier was touched',
      nodes,
    };
  }

  // KNOCK-IN NODE (if enabled)
  if (terms.knockInEnabled && terms.knockInLevelPct != null) {
    const kiTriggeredDesc = getCPPNKnockInTriggered(terms, terms.notional);
    const kiSafeDesc = getCPPNKnockInSafe(terms, terms.notional);

    nodes.push({
      id: 'cppn-ki',
      stage: 'maturity' as const,
      condition: `Did ${levelLabel} drop below ${formatNumber(terms.knockInLevelPct, 0)}%?`,
      yes: {
        title: kiTriggeredDesc.title,
        lines: kiTriggeredDesc.lines,
        note: kiTriggeredDesc.example,
      },
      no: {
        title: kiSafeDesc.title,
        lines: kiSafeDesc.lines,
        note: kiSafeDesc.example,
      },
      metaChips: [
        `Safety Level: ${formatNumber(terms.knockInLevelPct, 0)}%`,
        terms.capType === 'capped' && terms.capLevelPct != null ? `Max Return: ${formatNumber(terms.capLevelPct, 0)}%` : undefined,
      ].filter(Boolean) as string[],
    });
  }

  // PARTICIPATION NODE (always show for standard CPPN)
  const participationDesc = getCPPNParticipationOutcome(terms, terms.notional);
  const protectedDesc = getCPPNProtectedOutcome(terms, terms.notional);

  nodes.push({
    id: 'cppn-participation',
    stage: 'maturity' as const,
    condition:
      terms.participationDirection === 'up'
        ? `Did ${levelLabel} go up (above ${formatNumber(terms.participationStartPct, 0)}%)?`
        : `Did ${levelLabel} go down (below ${formatNumber(terms.participationStartPct, 0)}%)?`,
    yes: {
      title: participationDesc.title,
      lines: participationDesc.lines,
      note: participationDesc.example,
    },
    no: {
      title: protectedDesc.title,
      lines: protectedDesc.lines,
      note: protectedDesc.example,
    },
    metaChips: [
      `Floor: ${formatNumber(terms.capitalProtectionPct, 0)}%`,
      `Participation: ${formatNumber(terms.participationRatePct, 0)}%`,
      terms.capType === 'capped' && terms.capLevelPct != null ? `Cap: ${formatNumber(terms.capLevelPct, 0)}%` : 'No Cap',
    ],
  });

  return {
    title: 'Understand the Scenarios',
    subtitle: 'What happens at maturity based on how the underlying performs',
    nodes,
  };
}









