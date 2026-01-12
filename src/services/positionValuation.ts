/**
 * Position Valuation Service
 * Calculates current value of structured product investments
 */

import type { InvestmentPosition, PositionValue, PositionMarketData } from '../types/investment';
import type { ReverseConvertibleTerms } from '../products/reverseConvertible/terms';
import type { CapitalProtectedParticipationTerms } from '../products/capitalProtectedParticipation/terms';
import { calcLevels, worstOf, bestOf, averageOf } from '../products/common/basket';
import { round, safeDivide } from '../core/utils/math';
import { computeCppnPayoffPct } from '../products/capitalProtectedParticipation/engine';

/**
 * Main calculation function - routes to appropriate product calculator
 */
export function calculatePositionValue(
  position: InvestmentPosition,
  marketData: PositionMarketData
): PositionValue {
  const productType = position.productTerms.productType;

  if (productType === 'RC') {
    return calculateRCPositionValue(
      position,
      position.productTerms as ReverseConvertibleTerms,
      marketData
    );
  } else {
    return calculateCPPNPositionValue(
      position,
      position.productTerms as CapitalProtectedParticipationTerms,
      marketData
    );
  }
}

/**
 * Calculate Reverse Convertible position value
 */
function calculateRCPositionValue(
  position: InvestmentPosition,
  terms: ReverseConvertibleTerms,
  marketData: PositionMarketData
): PositionValue {
  const notional = position.notional;
  const initialFixings = position.initialFixings;
  const currentPrices = marketData.underlyingPrices;

  // Calculate current levels
  const levels = calcLevels(currentPrices, initialFixings);
  const { worstLevel, worstIndex } = worstOf(levels);

  // Sum paid coupons
  const couponsReceived = position.couponHistory
    .filter(c => c.paid)
    .reduce((sum, c) => sum + c.amount, 0);

  // Determine settlement type and value
  let settlementType: 'cash' | 'physical_shares';
  let sharesReceived: number | undefined;
  let sharesMarketValue: number | undefined;
  let cashAmount: number | undefined;
  let projectedSettlementValue: number;
  let barrierStatus: 'safe' | 'breached' | 'at_risk' | 'n/a';

  if (terms.variant === 'standard_barrier_rc') {
    const barrier = terms.barrierPct!;
    const barrierBreached = position.manualBarrierBreach || worstLevel < barrier;

    if (barrierBreached) {
      // Physical delivery
      settlementType = 'physical_shares';
      const worstInitialPrice = initialFixings[worstIndex];
      const worstCurrentPrice = currentPrices[worstIndex];
      sharesReceived = safeDivide(notional, worstInitialPrice * terms.conversionRatio);
      sharesMarketValue = sharesReceived * worstCurrentPrice;
      projectedSettlementValue = sharesMarketValue;
      barrierStatus = 'breached';
    } else {
      // Cash redemption
      settlementType = 'cash';
      cashAmount = notional;
      projectedSettlementValue = notional;
      
      // Determine barrier status
      const distanceToBarrier = worstLevel - barrier;
      if (distanceToBarrier < 0.05) { // Within 5% of barrier
        barrierStatus = 'at_risk';
      } else {
        barrierStatus = 'safe';
      }
    }
  } else {
    // Low strike / geared put variant
    const kiBarrier = terms.knockInBarrierPct ?? terms.strikePct!;
    const strike = terms.strikePct!;
    const knockedIn = position.manualBarrierBreach || worstLevel < kiBarrier;

    if (knockedIn) {
      // Geared payoff
      settlementType = 'physical_shares';
      const gearingFactor = safeDivide(worstLevel, strike);
      projectedSettlementValue = notional * gearingFactor;
      
      // Calculate shares at strike price
      const worstInitialPrice = initialFixings[worstIndex];
      const strikePrice = worstInitialPrice * strike;
      sharesReceived = safeDivide(notional, strikePrice * terms.conversionRatio);
      sharesMarketValue = sharesReceived * currentPrices[worstIndex];
      barrierStatus = 'breached';
    } else {
      // Cash redemption
      settlementType = 'cash';
      cashAmount = notional;
      projectedSettlementValue = notional;
      
      const distanceToBarrier = worstLevel - kiBarrier;
      if (distanceToBarrier < 0.05) {
        barrierStatus = 'at_risk';
      } else {
        barrierStatus = 'safe';
      }
    }
  }

  // Calculate total current value
  const currentMarketValue = couponsReceived + projectedSettlementValue;
  const absoluteReturn = currentMarketValue - notional;
  const percentageReturn = safeDivide(absoluteReturn, notional) * 100;

  // Calculate days to maturity
  const today = new Date();
  const maturity = new Date(position.maturityDate);
  const daysToMaturity = Math.max(0, Math.ceil((maturity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    initialInvestment: notional,
    couponsReceivedToDate: couponsReceived,
    currentMarketValue,
    projectedSettlementValue,
    settlementType,
    sharesReceived: sharesReceived ? round(sharesReceived, 2) : undefined,
    sharesMarketValue: sharesMarketValue ? round(sharesMarketValue, 2) : undefined,
    cashAmount: cashAmount ? round(cashAmount, 2) : undefined,
    absoluteReturn: round(absoluteReturn, 2),
    percentageReturn: round(percentageReturn, 2),
    barrierStatus,
    daysToMaturity,
    underlyingLevels: levels,
    worstPerformer: {
      index: worstIndex,
      ticker: terms.underlyings[worstIndex].ticker,
      level: round(worstLevel, 4),
      currentPrice: round(currentPrices[worstIndex], 2),
      initialPrice: round(initialFixings[worstIndex], 2),
    },
  };
}

/**
 * Calculate CPPN position value (including Bonus Certificates)
 */
function calculateCPPNPositionValue(
  position: InvestmentPosition,
  terms: CapitalProtectedParticipationTerms,
  marketData: PositionMarketData
): PositionValue {
  const notional = position.notional;
  const initialFixings = position.initialFixings;
  const currentPrices = marketData.underlyingPrices;

  // Calculate basket level
  const levels = calcLevels(currentPrices, initialFixings);
  let basketLevelPct: number;
  let worstIndex: number | undefined;
  let bestIndex: number | undefined;

  if (terms.basketType === 'single') {
    basketLevelPct = levels[0] * 100;
  } else if (terms.basketType === 'worst_of') {
    const worst = worstOf(levels);
    basketLevelPct = worst.worstLevel * 100;
    worstIndex = worst.worstIndex;
  } else if (terms.basketType === 'best_of') {
    const best = bestOf(levels);
    basketLevelPct = best.bestLevel * 100;
    bestIndex = best.bestIndex;
  } else {
    // average
    basketLevelPct = averageOf(levels) * 100;
  }

  // Determine if barrier was breached (for bonus certificates)
  let barrierNeverBreached: boolean | undefined;
  if (terms.bonusEnabled && terms.bonusBarrierPct) {
    const barrierBreached = position.manualBarrierBreach || basketLevelPct < terms.bonusBarrierPct;
    barrierNeverBreached = !barrierBreached;
  }

  // Calculate payoff
  const { redemptionPct, knockInTriggered, bonusPaid } = computeCppnPayoffPct(
    terms,
    basketLevelPct,
    barrierNeverBreached
  );

  const projectedSettlementValue = notional * redemptionPct;
  const currentMarketValue = projectedSettlementValue;

  // Determine settlement type for CPPN
  const settlementType: 'cash' | 'physical_shares' = knockInTriggered ? 'physical_shares' : 'cash';
  
  // For knock-in triggered, calculate shares
  let sharesReceived: number | undefined;
  let sharesMarketValue: number | undefined;
  
  if (knockInTriggered && terms.downsideStrikePct) {
    const referenceIndex = worstIndex ?? bestIndex ?? 0;
    const strikePrice = initialFixings[referenceIndex] * (terms.downsideStrikePct / 100);
    sharesReceived = safeDivide(notional, strikePrice);
    sharesMarketValue = sharesReceived * currentPrices[referenceIndex];
  }

  // Calculate returns
  const absoluteReturn = currentMarketValue - notional;
  const percentageReturn = safeDivide(absoluteReturn, notional) * 100;

  // Determine barrier status
  let barrierStatus: 'safe' | 'breached' | 'at_risk' | 'n/a' = 'n/a';
  
  if (terms.knockInEnabled && terms.knockInLevelPct) {
    if (knockInTriggered) {
      barrierStatus = 'breached';
    } else {
      const distanceToKI = basketLevelPct - terms.knockInLevelPct;
      barrierStatus = distanceToKI < 5 ? 'at_risk' : 'safe';
    }
  } else if (terms.bonusEnabled && terms.bonusBarrierPct) {
    if (!barrierNeverBreached) {
      barrierStatus = 'breached';
    } else {
      const distanceToBarrier = basketLevelPct - terms.bonusBarrierPct;
      barrierStatus = distanceToBarrier < 5 ? 'at_risk' : 'safe';
    }
  }

  // Calculate days to maturity
  const today = new Date();
  const maturity = new Date(position.maturityDate);
  const daysToMaturity = Math.max(0, Math.ceil((maturity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // Build worst/best performer info
  let worstPerformer: PositionValue['worstPerformer'];
  let bestPerformer: PositionValue['bestPerformer'];

  if (worstIndex !== undefined) {
    worstPerformer = {
      index: worstIndex,
      ticker: terms.underlyings[worstIndex].ticker,
      level: round(levels[worstIndex], 4),
      currentPrice: round(currentPrices[worstIndex], 2),
      initialPrice: round(initialFixings[worstIndex], 2),
    };
  }

  if (bestIndex !== undefined) {
    bestPerformer = {
      index: bestIndex,
      ticker: terms.underlyings[bestIndex].ticker,
      level: round(levels[bestIndex], 4),
      currentPrice: round(currentPrices[bestIndex], 2),
      initialPrice: round(initialFixings[bestIndex], 2),
    };
  }

  // Bonus status
  let bonusStatus: 'active' | 'lost' | 'n/a' = 'n/a';
  let bonusAmount: number | undefined;
  
  if (terms.bonusEnabled) {
    bonusStatus = bonusPaid ? 'active' : 'lost';
    if (bonusPaid && terms.bonusLevelPct) {
      bonusAmount = notional * ((terms.bonusLevelPct - 100) / 100);
    }
  }

  return {
    initialInvestment: notional,
    couponsReceivedToDate: 0, // CPPN has no coupons
    currentMarketValue: round(currentMarketValue, 2),
    projectedSettlementValue: round(projectedSettlementValue, 2),
    settlementType,
    sharesReceived: sharesReceived ? round(sharesReceived, 2) : undefined,
    sharesMarketValue: sharesMarketValue ? round(sharesMarketValue, 2) : undefined,
    cashAmount: settlementType === 'cash' ? round(projectedSettlementValue, 2) : undefined,
    absoluteReturn: round(absoluteReturn, 2),
    percentageReturn: round(percentageReturn, 2),
    barrierStatus,
    daysToMaturity,
    underlyingLevels: levels,
    worstPerformer,
    bestPerformer,
    bonusStatus,
    bonusAmount: bonusAmount ? round(bonusAmount, 2) : undefined,
  };
}

/**
 * Helper: Format currency value
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Helper: Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Helper: Get barrier status color
 */
export function getBarrierStatusColor(status: 'safe' | 'breached' | 'at_risk' | 'n/a'): string {
  switch (status) {
    case 'safe': return 'text-green-positive';
    case 'at_risk': return 'text-yellow-500';
    case 'breached': return 'text-red-negative';
    case 'n/a': return 'text-grey-medium';
  }
}

/**
 * Helper: Get return color class
 */
export function getReturnColor(percentageReturn: number): string {
  if (percentageReturn > 0) return 'text-green-positive';
  if (percentageReturn < 0) return 'text-red-negative';
  return 'text-grey-medium';
}
