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
  
  // ISSUER CALLABLE NODE (if enabled) - First decision point
  if (terms.issuerCallableEnabled && terms.exitRatePA != null) {
    const callFreqLabel = terms.issuerCallFrequency
      ? terms.issuerCallFrequency.charAt(0).toUpperCase() + terms.issuerCallFrequency.slice(1).replace('-', ' ')
      : 'Periodic';
    
    // Calculate example payout for various call dates
    const exampleMonths = terms.tenorMonths >= 12 ? 6 : Math.floor(terms.tenorMonths / 2);
    const exampleExitReturn = terms.exitRatePA * (exampleMonths / 12);
    const examplePayout = terms.capitalProtectionPct + exampleExitReturn;
    
    nodes.push({
      id: 'issuer-call',
      stage: 'observation' as const,
      condition: `Has the issuer called the product at an observation date?`,
      yes: {
        title: 'Early Redemption (Issuer Called)',
        lines: [
          `• Product terminates early at the call date`,
          `• You receive: ${formatNumber(terms.capitalProtectionPct, 0)}% capital + Exit Rate`,
          `• Exit Rate = ${formatNumber(terms.exitRatePA, 2)}% p.a. × (months held / 12)`,
          `• No further upside participation after call`,
        ],
        note: `Example: Called after ${exampleMonths} months → ${formatNumber(terms.capitalProtectionPct, 0)}% + ${formatNumber(exampleExitReturn, 2)}% = ${formatNumber(examplePayout, 2)}%`,
      },
      no: {
        title: 'Product Continues',
        lines: [
          `• Issuer chooses not to call at this observation`,
          `• Product continues to next observation or maturity`,
          `• All participation and protection terms remain active`,
          `• Issuer can still call at future observation dates`,
        ],
        note: `Product continues with full participation in ${levelLabel} performance`,
      },
      metaChips: [
        `${callFreqLabel} Observations`,
        `Exit Rate: ${formatNumber(terms.exitRatePA, 2)}% p.a.`,
      ],
    });
  }

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

  // Build subtitle based on features
  let subtitle = 'What happens ';
  if (terms.issuerCallableEnabled) {
    subtitle += 'at observation dates (issuer call) and ';
  }
  subtitle += terms.bonusEnabled 
    ? 'at maturity based on whether the barrier was touched'
    : 'at maturity based on how the underlying performs';
  
  return {
    title: 'Understand the Scenarios',
    subtitle,
    nodes,
  };
}









