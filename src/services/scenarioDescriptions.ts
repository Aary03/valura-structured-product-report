/**
 * User-Friendly Scenario Descriptions
 * Converts technical formulas into plain English that investors can understand
 */

import type { ReverseConvertibleTerms } from '../products/reverseConvertible/terms';
import type { CapitalProtectedParticipationTerms } from '../products/capitalProtectedParticipation/terms';
import { formatNumber } from '../core/utils/math';

// ==========================================
// REVERSE CONVERTIBLE DESCRIPTIONS
// ==========================================

export interface ScenarioDescription {
  title: string;
  lines: string[];
  example?: string;
}

/**
 * Get user-friendly description for RC cash redemption scenario
 */
export function getRCCashRedemption(terms: ReverseConvertibleTerms, notional: number = 100000): ScenarioDescription {
  const couponTotal = terms.couponRatePA * (terms.tenorMonths / 12);
  const totalReturn = (1 + couponTotal) * 100;
  const couponFreqText = {
    12: 'monthly',
    4: 'quarterly',
    2: 'semi-annually',
    1: 'annually',
  }[terms.couponFreqPerYear] || 'periodically';

  const basketText = terms.basketType === 'worst_of' ? 'stocks stay' : 'stock stays';
  const barrierPct = (terms.barrierPct || terms.strikePct || 0.70) * 100;

  return {
    title: `${basketText === 'stocks stay' ? 'Stocks Stay' : 'Stock Stays'} Above ${barrierPct}%`,
    lines: [
      `✓ You get back all your money (100%)`,
      `✓ Plus ${formatNumber(terms.couponRatePA * 100, 1)}% annual income paid ${couponFreqText}`,
      `✓ Total return: ~${formatNumber(totalReturn, 1)}% after ${terms.tenorMonths} months`,
    ],
    example: `If you invest $${formatNumber(notional / 1000, 0)}k, you receive $${formatNumber((notional * (1 + couponTotal)) / 1000, 1)}k`,
  };
}

/**
 * Get user-friendly description for RC share conversion scenario
 */
export function getRCShareConversion(terms: ReverseConvertibleTerms, notional: number = 100000): ScenarioDescription {
  const barrierPct = (terms.barrierPct || terms.strikePct || 0.70) * 100;
  const basketText = terms.basketType === 'worst_of' ? 'stocks drop' : 'stock drops';
  const couponTotal = terms.couponRatePA * (terms.tenorMonths / 12);
  const exampleDrop = barrierPct * 0.7; // Example: 70% of barrier (e.g., 49% if barrier is 70%)

  if (terms.variant === 'low_strike_geared_put') {
    const strikePct = (terms.strikePct || 0.55) * 100;
    const gearing = 1 / (terms.strikePct || 0.55);
    const exampleFinal = strikePct * 0.8; // 80% of strike
    const exampleReturn = (exampleFinal / strikePct) * 100;

    return {
      title: `${basketText === 'stocks drop' ? 'Stocks Drop' : 'Stock Drops'} Below ${strikePct}%`,
      lines: [
        `✓ You still keep all your ${formatNumber(terms.couponRatePA * 100, 1)}% coupon payments`,
        `✓ Your losses are cushioned vs. owning stocks directly`,
        `⚠ Below ${strikePct}%, you lose less than if you owned the shares`,
      ],
      example: `If stocks drop to ${formatNumber(exampleFinal, 0)}%, you get back ~${formatNumber(exampleReturn, 0)}% (better than ${formatNumber(exampleFinal, 0)}% if you owned stocks)`,
    };
  }

  return {
    title: `${basketText === 'stocks drop' ? 'Stocks Drop' : 'Stock Drops'} Below ${barrierPct}%`,
    lines: [
      `⚠ Instead of cash, you receive shares of the ${terms.basketType === 'worst_of' ? 'worst-performing stock' : 'underlying'}`,
      `✓ You still keep all your coupon payments`,
      `⚠ Final value depends on how far stocks fell`,
    ],
    example: `If ${basketText === 'stocks drop' ? 'worst stock drops' : 'stock drops'} to ${formatNumber(exampleDrop, 0)}%, you get ~${formatNumber(exampleDrop, 0)}% back in shares + ${formatNumber(couponTotal * 100, 0)}% coupons = ~${formatNumber(exampleDrop + couponTotal * 100, 0)}% total`,
  };
}

// ==========================================
// CPPN STANDARD DESCRIPTIONS
// ==========================================

/**
 * Get user-friendly description for CPPN protected outcome
 */
export function getCPPNProtectedOutcome(terms: CapitalProtectedParticipationTerms, notional: number = 100000): ScenarioDescription {
  const floorPct = terms.capitalProtectionPct;
  const isFullyProtected = floorPct >= 100;

  if (isFullyProtected) {
    return {
      title: 'Your Money is Protected',
      lines: [
        `✓ No matter how far stocks fall, you get back at least ${formatNumber(floorPct, 0)}%`,
        `✓ Zero downside risk below ${formatNumber(terms.participationStartPct, 0)}%`,
        `✓ Peace of mind: Your principal is safe`,
      ],
      example: `Even if stocks crash to 50%, you still receive $${formatNumber((notional * floorPct) / 100000, 0)}k on $${formatNumber(notional / 1000, 0)}k invested`,
    };
  }

  return {
    title: 'Partial Protection',
    lines: [
      `✓ Your floor: ${formatNumber(floorPct, 0)}% guaranteed`,
      `⚠ You have some downside risk`,
      `✓ Better than owning stocks if they drop significantly`,
    ],
    example: `If stocks drop to 50%, you still get back ${formatNumber(floorPct, 0)}% ($${formatNumber((notional * floorPct) / 100000, 0)}k on $${formatNumber(notional / 1000, 0)}k)`,
  };
}

/**
 * Get user-friendly description for CPPN participation outcome
 */
export function getCPPNParticipationOutcome(terms: CapitalProtectedParticipationTerms, notional: number = 100000): ScenarioDescription {
  const partRate = terms.participationRatePct;
  const startPct = terms.participationStartPct;
  const capPct = terms.capLevelPct;
  const hasCap = terms.capType === 'capped' && capPct != null;

  const exampleGain = 20; // stocks up 20%
  const yourGain = (exampleGain * partRate) / 100;
  const finalReturn = 100 + yourGain;
  const cappedReturn = hasCap && capPct ? Math.min(finalReturn, capPct) : finalReturn;

  return {
    title: `Stocks Go Up – You Profit ${partRate}% on the Gains`,
    lines: [
      `✓ For every 1% stocks rise, you gain ${formatNumber(partRate / 100, 2)}%`,
      `✓ Example: Stocks +${exampleGain}% → You get +${formatNumber(yourGain, 1)}%`,
      hasCap ? `⚠ Maximum return capped at ${formatNumber(capPct, 0)}%` : `✓ Unlimited upside (no cap)`,
    ],
    example: `Stocks at ${100 + exampleGain}% → You receive $${formatNumber((notional * cappedReturn) / 100000, 1)}k${hasCap && finalReturn > capPct! ? ' (capped)' : ''}`,
  };
}

// ==========================================
// CPPN WITH KNOCK-IN DESCRIPTIONS
// ==========================================

/**
 * Get user-friendly description for CPPN knock-in triggered scenario
 */
export function getCPPNKnockInTriggered(terms: CapitalProtectedParticipationTerms, notional: number = 100000): ScenarioDescription {
  const kiPct = terms.knockInLevelPct || 70;
  const strikePct = terms.downsideStrikePct || kiPct;
  const exampleDrop = kiPct * 0.85; // stocks at 85% of KI (e.g., 53% when KI is 62%)

  return {
    title: `Stocks Fall Below ${formatNumber(kiPct, 0)}% – Protection Removed`,
    lines: [
      `⚠ Your safety net no longer applies once stocks touch ${formatNumber(kiPct, 0)}%`,
      `⚠ You participate 1-to-1 in further losses`,
      `⚠ Full downside exposure below ${formatNumber(kiPct, 0)}%`,
    ],
    example: `If stocks drop to ${formatNumber(exampleDrop, 0)}%, you get back ~${formatNumber(exampleDrop, 0)}% (${formatNumber((notional * exampleDrop) / 10000, 1)}k on ${formatNumber(notional / 1000, 0)}k invested)`,
  };
}

/**
 * Get user-friendly description for CPPN knock-in not triggered (protected)
 */
export function getCPPNKnockInSafe(terms: CapitalProtectedParticipationTerms, notional: number = 100000): ScenarioDescription {
  const kiPct = terms.knockInLevelPct || 70;
  const floorPct = terms.capitalProtectionPct;
  const partRate = terms.participationRatePct;
  const exampleGain = 25;
  const yourGain = (exampleGain * partRate) / 100;

  return {
    title: `Stocks Stay Above ${formatNumber(kiPct, 0)}% – Full Protection Active`,
    lines: [
      `✓ Your ${formatNumber(floorPct, 0)}% floor is guaranteed`,
      `✓ If stocks rise, you get ${formatNumber(partRate, 0)}% of the gains`,
      `✓ Best of both worlds: Protected downside + leveraged upside`,
    ],
    example: `Stocks +${exampleGain}% → You get +${formatNumber(yourGain, 1)}% return ($${formatNumber((notional * (100 + yourGain)) / 100000, 1)}k)`,
  };
}

// ==========================================
// BONUS CERTIFICATE DESCRIPTIONS
// ==========================================

/**
 * Get user-friendly description for Bonus Certificate - Bonus earned
 */
export function getBonusCertificateBonus(terms: CapitalProtectedParticipationTerms, notional: number = 100000): ScenarioDescription {
  const bonusPct = terms.bonusLevelPct || 108;
  const barrierPct = terms.bonusBarrierPct || 60;
  const partRate = terms.participationRatePct || 100;
  const strikePct = terms.participationStartPct || 100;

  const exampleFlat = 90; // stocks at 90% (below strike but above barrier)
  const exampleUp = 120; // stocks at 120% (above strike)
  const exampleUpReturn = partRate === 100 ? exampleUp : bonusPct + ((exampleUp - strikePct) * partRate) / 100;

  return {
    title: `Stocks Stay Above ${formatNumber(barrierPct, 0)}% – Bonus Locked In 🎁`,
    lines: [
      `✓ You receive at least ${formatNumber(bonusPct, 0)}% – guaranteed!`,
      `✓ If stocks below ${formatNumber(strikePct, 0)}%: Flat ${formatNumber(bonusPct, 0)}% bonus`,
      `✓ If stocks above ${formatNumber(strikePct, 0)}%: ${formatNumber(bonusPct, 0)}% OR stock gains (whichever is higher)`,
    ],
    example: `Stocks at ${exampleFlat}% → You get ${formatNumber(bonusPct, 0)}% | Stocks at ${exampleUp}% → You get ${formatNumber(exampleUpReturn, 0)}%`,
  };
}

/**
 * Get user-friendly description for Bonus Certificate - Barrier breached
 */
export function getBonusCertificateBarrierBreached(terms: CapitalProtectedParticipationTerms, notional: number = 100000): ScenarioDescription {
  const barrierPct = terms.bonusBarrierPct || 60;
  const bonusPct = terms.bonusLevelPct || 108;

  const exampleDrop = barrierPct * 0.9; // stocks at 90% of barrier

  return {
    title: `Stocks Touch ${formatNumber(barrierPct, 0)}% – Bonus Lost ⛔`,
    lines: [
      `⚠ You lose the ${formatNumber(bonusPct, 0)}% bonus protection`,
      `⚠ You now track the stock 1-to-1 (like owning it)`,
      `⚠ Key: Don't let stocks touch ${formatNumber(barrierPct, 0)}% during the product life`,
    ],
    example: `If stocks drop to ${formatNumber(exampleDrop, 0)}% (and touched barrier), you get back ${formatNumber(exampleDrop, 0)}%`,
  };
}

// ==========================================
// HELPER: FORMAT WITH NOTIONAL
// ==========================================

/**
 * Add concrete dollar example to description
 */
export function withDollarExample(description: string, notional: number, percentages: { invest: number; receive: number }): string {
  const investAmount = (notional * percentages.invest) / 100;
  const receiveAmount = (notional * percentages.receive) / 100;
  
  return `${description} (e.g., $${formatNumber(investAmount / 1000, 0)}k invested → $${formatNumber(receiveAmount / 1000, 1)}k received)`;
}

/**
 * Get appropriate emoji for scenario tone
 */
export function getScenarioEmoji(tone: 'positive' | 'protected' | 'warning' | 'negative'): string {
  const emojiMap = {
    positive: '✅',
    protected: '🛡️',
    warning: '⚠️',
    negative: '❌',
  };
  return emojiMap[tone];
}

