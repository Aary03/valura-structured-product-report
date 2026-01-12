/**
 * Unified Position Evaluation Service
 * Product-agnostic evaluation engine for indicative outcome calculations
 * 
 * CRITICAL: This calculates RULE-BASED indicative values, NOT secondary market prices
 */

import type { InvestmentPosition } from '../types/investment';
import type { ReverseConvertibleTerms } from '../products/reverseConvertible/terms';
import type { CapitalProtectedParticipationTerms } from '../products/capitalProtectedParticipation/terms';
import { calcLevels, worstOf, bestOf, averageOf } from '../products/common/basket';
import { computeCppnPayoffPct } from '../products/capitalProtectedParticipation/engine';
import { round, safeDivide } from '../core/utils/math';

/**
 * Scenario override options for flexible evaluation
 */
export interface ScenarioOverrides {
  asOfDate?: Date; // Evaluate as if this is the current date
  assumeMaturityToday?: boolean; // Calculate final settlement now
  overrideFinalLevels?: number[]; // Override individual underlying levels (as decimal, e.g., 0.85)
  overrideWorstOfLevel?: number; // Override worst-of basket level directly (as decimal)
  overrideBarrierState?: 'none' | 'touched' | 'knocked_in' | 'knocked_out'; // Manual barrier state
  couponOverride?: {
    forceStatus?: 'paid' | 'missed'; // Force coupon payment status
    memoryEnabled?: boolean; // For memory coupons
  };
}

/**
 * Position snapshot - complete evaluation result
 */
export interface PositionSnapshot {
  // Core outcome
  indicativeOutcomeValue: number; // Total value investor would get
  invested: number; // Initial capital
  couponsReceived: number; // Coupons paid to date
  netPnL: number; // Profit or loss ($)
  netPnLPct: number; // Profit or loss (%)
  
  // Settlement details
  settlement: {
    type: 'cash' | 'physical';
    cashAmount?: number;
    shares?: Array<{
      symbol: string;
      quantity: number;
      currentPrice: number;
      marketValue: number;
    }>;
  };
  
  // Risk status
  riskStatus: 'SAFE' | 'WATCH' | 'TRIGGERED';
  keyLevels: Array<{
    label: string; // e.g., "Barrier", "Knock-In", "Autocall"
    level: number; // Target level (%)
    current: number; // Current level (%)
    status: 'safe' | 'at_risk' | 'breached';
    distance: number; // Distance to level (%)
  }>;
  
  // Next events
  nextEvents: Array<{
    type: 'coupon' | 'autocall_obs' | 'maturity';
    date: string;
    label: string;
    status: 'upcoming' | 'today' | 'passed';
    eligible?: boolean; // For conditional events
    amount?: number; // Expected amount if known
  }>;
  
  // Explainability
  reasonCodes: string[]; // Machine-readable codes like 'BARRIER_BREACHED', 'COUPON_PAID'
  reasonText: string; // Short human explanation
  methodologyDisclosure: string; // How barrier/prices are determined
  
  // Data quality
  dataFreshness: {
    pricesAsOf: Date;
    stalePrices: boolean; // true if > 1 day old
    missingData: string[]; // List of missing data points
  };
}

/**
 * Main evaluation function - unified for all product types
 */
export function evaluatePosition(
  position: InvestmentPosition,
  marketData: { underlyingPrices: number[]; timestamp: Date },
  overrides: ScenarioOverrides = {}
): PositionSnapshot {
  const productType = position.productTerms.productType;

  if (productType === 'RC') {
    return evaluateRCPosition(
      position,
      position.productTerms as ReverseConvertibleTerms,
      marketData,
      overrides
    );
  } else {
    return evaluateCPPNPosition(
      position,
      position.productTerms as CapitalProtectedParticipationTerms,
      marketData,
      overrides
    );
  }
}

/**
 * Evaluate Reverse Convertible position
 */
function evaluateRCPosition(
  position: InvestmentPosition,
  terms: ReverseConvertibleTerms,
  marketData: { underlyingPrices: number[]; timestamp: Date },
  overrides: ScenarioOverrides
): PositionSnapshot {
  const notional = position.notional;
  const initialFixings = position.initialFixings;
  
  // Determine effective prices
  let currentPrices = marketData.underlyingPrices;
  if (overrides.overrideFinalLevels) {
    currentPrices = overrides.overrideFinalLevels.map((level, i) => initialFixings[i] * level);
  }

  // Calculate basket level
  const levels = calcLevels(currentPrices, initialFixings);
  let basketLevel: number;
  let referenceIndex: number;

  if (terms.basketType === 'equally_weighted') {
    basketLevel = averageOf(levels);
    referenceIndex = 0;
  } else {
    const { worstLevel, worstIndex } = worstOf(levels);
    basketLevel = worstLevel;
    referenceIndex = worstIndex;
  }

  if (overrides.overrideWorstOfLevel !== undefined) {
    basketLevel = overrides.overrideWorstOfLevel;
  }

  // Calculate coupons received
  const asOfDate = overrides.asOfDate || new Date();
  const couponsReceived = position.couponHistory
    .filter(c => new Date(c.date) <= asOfDate && c.paid)
    .reduce((sum, c) => sum + c.amount, 0);

  // Determine barrier/strike breach
  const triggerLevel = terms.variant === 'standard_barrier_rc' ? terms.barrierPct! : (terms.knockInBarrierPct || terms.strikePct!);
  const barrierState = overrides.overrideBarrierState || 
    (basketLevel < triggerLevel ? 'touched' : 'none');
  
  const isBreached = barrierState === 'touched' || barrierState === 'knocked_in';

  // Calculate settlement
  let settlementType: 'cash' | 'physical';
  let cashAmount: number | undefined;
  let shares: PositionSnapshot['settlement']['shares'];
  let redemptionValue: number;

  if (isBreached) {
    settlementType = 'physical';
    const worstInitialPrice = initialFixings[referenceIndex];
    const worstCurrentPrice = currentPrices[referenceIndex];
    
    if (terms.variant === 'low_strike_geared_put') {
      const strike = terms.strikePct!;
      const strikePrice = worstInitialPrice * strike;
      const qty = safeDivide(notional, strikePrice * terms.conversionRatio);
      redemptionValue = qty * worstCurrentPrice;
      shares = [{
        symbol: terms.underlyings[referenceIndex].ticker,
        quantity: round(qty, 2),
        currentPrice: round(worstCurrentPrice, 2),
        marketValue: round(redemptionValue, 2),
      }];
    } else {
      const qty = safeDivide(notional, worstInitialPrice * terms.conversionRatio);
      redemptionValue = qty * worstCurrentPrice;
      shares = [{
        symbol: terms.underlyings[referenceIndex].ticker,
        quantity: round(qty, 2),
        currentPrice: round(worstCurrentPrice, 2),
        marketValue: round(redemptionValue, 2),
      }];
    }
  } else {
    settlementType = 'cash';
    cashAmount = notional;
    redemptionValue = notional;
  }

  const indicativeOutcomeValue = couponsReceived + redemptionValue;
  const netPnL = indicativeOutcomeValue - notional;
  const netPnLPct = (netPnL / notional) * 100;

  // Build key levels
  const keyLevels: PositionSnapshot['keyLevels'] = [];
  
  if (terms.variant === 'standard_barrier_rc' && terms.barrierPct) {
    const distancePct = (basketLevel - terms.barrierPct) * 100;
    keyLevels.push({
      label: 'Barrier',
      level: terms.barrierPct * 100,
      current: basketLevel * 100,
      status: basketLevel >= terms.barrierPct ? 'safe' : 'breached',
      distance: distancePct,
    });
  }

  if (terms.autocallEnabled && terms.autocallLevelPct) {
    const distancePct = (basketLevel - terms.autocallLevelPct) * 100;
    keyLevels.push({
      label: 'Autocall Trigger',
      level: terms.autocallLevelPct * 100,
      current: basketLevel * 100,
      status: basketLevel >= terms.autocallLevelPct ? 'breached' : 'safe',
      distance: distancePct,
    });
  }

  // Determine overall risk status
  let riskStatus: 'SAFE' | 'WATCH' | 'TRIGGERED';
  if (isBreached) {
    riskStatus = 'TRIGGERED';
  } else if (basketLevel - triggerLevel < 0.05) {
    riskStatus = 'WATCH';
  } else {
    riskStatus = 'SAFE';
  }

  // Build next events
  const nextEvents = position.couponHistory
    .filter(c => new Date(c.date) > asOfDate)
    .slice(0, 3)
    .map(c => ({
      type: 'coupon' as const,
      date: c.date,
      label: `Coupon Payment`,
      status: 'upcoming' as const,
      amount: c.amount,
    }));

  // Add maturity event
  const maturityDate = new Date(position.maturityDate);
  if (maturityDate > asOfDate) {
    nextEvents.push({
      type: 'maturity' as const,
      date: position.maturityDate,
      label: 'Maturity',
      status: 'upcoming' as const,
    });
  }

  // Generate reason codes and text
  const reasonCodes: string[] = [];
  let reasonText = '';

  if (isBreached) {
    reasonCodes.push('BARRIER_BREACHED');
    reasonText = `Basket level (${(basketLevel * 100).toFixed(1)}%) fell below ${terms.variant === 'standard_barrier_rc' ? 'barrier' : 'knock-in'} (${(triggerLevel * 100).toFixed(1)}%). Physical delivery triggered.`;
  } else if (riskStatus === 'WATCH') {
    reasonCodes.push('NEAR_BARRIER');
    reasonText = `Basket level within 5% of ${terms.variant === 'standard_barrier_rc' ? 'barrier' : 'knock-in'}. Monitor closely.`;
  } else {
    reasonCodes.push('PROTECTED');
    reasonText = `Capital protected. Basket level (${(basketLevel * 100).toFixed(1)}%) above ${terms.variant === 'standard_barrier_rc' ? 'barrier' : 'knock-in'}.`;
  }

  if (couponsReceived > 0) {
    reasonCodes.push('COUPONS_RECEIVED');
  }

  return {
    indicativeOutcomeValue: round(indicativeOutcomeValue, 2),
    invested: notional,
    couponsReceived: round(couponsReceived, 2),
    netPnL: round(netPnL, 2),
    netPnLPct: round(netPnLPct, 2),
    settlement: {
      type: settlementType,
      cashAmount,
      shares,
    },
    riskStatus,
    keyLevels,
    nextEvents,
    reasonCodes,
    reasonText,
    methodologyDisclosure: 'Barrier check uses current closing prices. Historical intraday monitoring not available.',
    dataFreshness: {
      pricesAsOf: marketData.timestamp,
      stalePrices: (new Date().getTime() - marketData.timestamp.getTime()) > 86400000, // > 1 day
      missingData: [],
    },
  };
}

/**
 * Evaluate CPPN position
 */
function evaluateCPPNPosition(
  position: InvestmentPosition,
  terms: CapitalProtectedParticipationTerms,
  marketData: { underlyingPrices: number[]; timestamp: Date },
  overrides: ScenarioOverrides
): PositionSnapshot {
  const notional = position.notional;
  const initialFixings = position.initialFixings;
  
  // Determine effective prices
  let currentPrices = marketData.underlyingPrices;
  if (overrides.overrideFinalLevels) {
    currentPrices = overrides.overrideFinalLevels.map((level, i) => initialFixings[i] * level);
  }

  // Calculate basket level
  const levels = calcLevels(currentPrices, initialFixings);
  let basketLevelPct: number;
  let worstIndex: number | undefined;

  if (terms.basketType === 'single') {
    basketLevelPct = levels[0] * 100;
  } else if (terms.basketType === 'worst_of') {
    const worst = worstOf(levels);
    basketLevelPct = worst.worstLevel * 100;
    worstIndex = worst.worstIndex;
  } else if (terms.basketType === 'best_of') {
    const best = bestOf(levels);
    basketLevelPct = best.bestLevel * 100;
  } else {
    basketLevelPct = averageOf(levels) * 100;
  }

  if (overrides.overrideWorstOfLevel !== undefined) {
    basketLevelPct = overrides.overrideWorstOfLevel * 100;
  }

  // Determine barrier breach
  let barrierNeverBreached: boolean | undefined;
  if (terms.bonusEnabled && terms.bonusBarrierPct) {
    const barrierBreached = overrides.overrideBarrierState === 'touched' || 
      basketLevelPct < terms.bonusBarrierPct;
    barrierNeverBreached = !barrierBreached;
  }

  // Calculate payoff
  const { redemptionPct, knockInTriggered, bonusPaid } = computeCppnPayoffPct(
    terms,
    basketLevelPct,
    barrierNeverBreached
  );

  const redemptionValue = notional * redemptionPct;
  const indicativeOutcomeValue = redemptionValue;
  const netPnL = indicativeOutcomeValue - notional;
  const netPnLPct = (netPnL / notional) * 100;

  // Determine settlement type
  const settlementType: 'cash' | 'physical' = knockInTriggered ? 'physical' : 'cash';
  let shares: PositionSnapshot['settlement']['shares'];
  
  if (knockInTriggered && terms.downsideStrikePct && worstIndex !== undefined) {
    const strikePrice = initialFixings[worstIndex] * (terms.downsideStrikePct / 100);
    const qty = safeDivide(notional, strikePrice);
    shares = [{
      symbol: terms.underlyings[worstIndex].ticker,
      quantity: round(qty, 2),
      currentPrice: round(currentPrices[worstIndex], 2),
      marketValue: round(qty * currentPrices[worstIndex], 2),
    }];
  }

  // Build key levels
  const keyLevels: PositionSnapshot['keyLevels'] = [];
  
  if (terms.knockInEnabled && terms.knockInLevelPct) {
    const distancePct = basketLevelPct - terms.knockInLevelPct;
    keyLevels.push({
      label: 'Knock-In Barrier',
      level: terms.knockInLevelPct,
      current: basketLevelPct,
      status: knockInTriggered ? 'breached' : (distancePct < 5 ? 'at_risk' : 'safe'),
      distance: distancePct,
    });
  }

  if (terms.bonusEnabled && terms.bonusBarrierPct) {
    const distancePct = basketLevelPct - terms.bonusBarrierPct;
    keyLevels.push({
      label: 'Bonus Barrier',
      level: terms.bonusBarrierPct,
      current: basketLevelPct,
      status: !barrierNeverBreached ? 'breached' : (distancePct < 5 ? 'at_risk' : 'safe'),
      distance: distancePct,
    });
  }

  // Risk status
  let riskStatus: 'SAFE' | 'WATCH' | 'TRIGGERED';
  if (knockInTriggered || !barrierNeverBreached) {
    riskStatus = 'TRIGGERED';
  } else if (keyLevels.some(k => k.status === 'at_risk')) {
    riskStatus = 'WATCH';
  } else {
    riskStatus = 'SAFE';
  }

  // Next events (CPPN has no coupons, just maturity)
  const nextEvents: PositionSnapshot['nextEvents'] = [];
  const maturityDate = new Date(position.maturityDate);
  const asOfDate = overrides.asOfDate || new Date();
  
  if (maturityDate > asOfDate) {
    nextEvents.push({
      type: 'maturity',
      date: position.maturityDate,
      label: 'Maturity',
      status: 'upcoming',
    });
  }

  // Reason codes
  const reasonCodes: string[] = [];
  let reasonText = '';

  if (knockInTriggered) {
    reasonCodes.push('KNOCK_IN_TRIGGERED');
    reasonText = `Knock-in triggered (basket at ${basketLevelPct.toFixed(1)}% < ${terms.knockInLevelPct}%). Capital protection removed, geared payoff applies.`;
  } else if (bonusPaid) {
    reasonCodes.push('BONUS_ACTIVE');
    reasonText = `Bonus active (barrier not touched). Guaranteed ${terms.bonusLevelPct}% return if maintained to maturity.`;
  } else if (!barrierNeverBreached && terms.bonusEnabled) {
    reasonCodes.push('BONUS_LOST');
    reasonText = `Bonus lost (barrier touched at ${basketLevelPct.toFixed(1)}%). Downside participation applies.`;
  } else {
    reasonCodes.push('PROTECTED');
    reasonText = `Capital ${terms.capitalProtectionPct}% protected. ${terms.participationRatePct}% participation in upside.`;
  }

  return {
    indicativeOutcomeValue: round(indicativeOutcomeValue, 2),
    invested: notional,
    couponsReceived: 0, // CPPN has no coupons
    netPnL: round(netPnL, 2),
    netPnLPct: round(netPnLPct, 2),
    settlement: {
      type: settlementType,
      cashAmount: settlementType === 'cash' ? round(redemptionValue, 2) : undefined,
      shares,
    },
    riskStatus,
    keyLevels,
    nextEvents,
    reasonCodes,
    reasonText,
    methodologyDisclosure: 'European-style knock-in (checked at maturity only). Bonus barrier uses current level.',
    dataFreshness: {
      pricesAsOf: marketData.timestamp,
      stalePrices: (new Date().getTime() - marketData.timestamp.getTime()) > 86400000,
      missingData: [],
    },
  };
}

/**
 * Format currency for display
 */
export function formatSnapshotCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
