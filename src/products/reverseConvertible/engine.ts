/**
 * Reverse Convertible Payoff Engine
 * Deterministic payoff calculations for Reverse Convertible products
 * Supports single underlying and worst-of basket (2-3 underlyings)
 */

import type { ReverseConvertibleTerms } from './terms';
import type { PayoffResult, PayoffTimeline, CashflowEvent } from '../common/payoffTypes';
import type { ISODateString } from '../../core/types/dates';
import { round, safeDivide } from '../../core/utils/math';
import { generateCouponSchedule, calculateCouponCount } from '../common/schedule';
import { getCurrentISODate, addMonths } from '../../core/types/dates';
import { calcLevels, worstOf } from '../common/basket';

/**
 * Market data input for payoff calculation
 */
export interface ReverseConvertibleMarketData {
  initialFixings: number[]; // Initial fixing per underlying (same order as terms.underlyings)
  spotPrices: number[]; // Current spot per underlying (same order)
  finalPrices?: number[]; // Final prices for scenario evaluation (optional)
}

/**
 * Calculate standard barrier Reverse Convertible payoff
 * Uses worst-of level for basket products
 */
export function calculateStandardBarrierRC(
  terms: ReverseConvertibleTerms,
  market: ReverseConvertibleMarketData
): {
  redemptionPct: number;
  totalPct: number;
  couponPct: number;
  shares?: number;
  worstOfLevel: number;
  worstUnderlyingIndex: number;
} {
  const B = terms.barrierPct!; // Barrier percentage
  const CR = terms.conversionRatio;
  const notional = terms.notional;
  
  // Calculate normalized levels for each underlying
  const levels = calcLevels(market.spotPrices, market.initialFixings);
  
  // Get worst-of level and index
  const { worstLevel, worstIndex } = worstOf(levels);
  const worstUnderlying = terms.underlyings[worstIndex];
  const worstInitialFixing = market.initialFixings[worstIndex];
  const worstSpotPrice = market.spotPrices[worstIndex];
  const worstFinalPrice = market.finalPrices?.[worstIndex] || worstSpotPrice;
  
  // Coupon calculations (unconditional)
  const couponPerPeriod = terms.couponRatePA / terms.couponFreqPerYear;
  const nCoupons = calculateCouponCount(terms.tenorMonths, terms.couponFreqPerYear);
  const couponTotal = notional * couponPerPeriod * nCoupons;
  const couponPct = couponTotal / notional;
  
  let redemptionPct: number;
  let shares: number | undefined;
  
  // Apply barrier check on worst-of level
  if (worstLevel >= B) {
    // Above barrier: cash redemption
    redemptionPct = 1.0;
  } else {
    // Below barrier: share conversion (worst underlying)
    // For standard barrier: conversion at final price
    shares = safeDivide(notional, worstInitialFixing * CR);
    const redemption = shares * worstFinalPrice;
    redemptionPct = safeDivide(redemption, notional);
  }
  
  const totalPct = redemptionPct + couponPct;
  
  return {
    redemptionPct: round(redemptionPct, 4),
    totalPct: round(totalPct, 4),
    couponPct: round(couponPct, 4),
    shares: shares ? round(shares, 2) : undefined,
    worstOfLevel: round(worstLevel, 4),
    worstUnderlyingIndex: worstIndex,
  };
}

/**
 * Calculate low strike / geared put Reverse Convertible payoff
 * Uses worst-of level for basket products
 */
export function calculateLowStrikeGearedPut(
  terms: ReverseConvertibleTerms,
  market: ReverseConvertibleMarketData
): {
  redemptionPct: number;
  totalPct: number;
  couponPct: number;
  shares?: number;
  gearing: number;
  worstOfLevel: number;
  worstUnderlyingIndex: number;
} {
  const K = terms.strikePct!; // Strike percentage
  const KI = terms.knockInBarrierPct ?? K; // Knock-in barrier (defaults to strike)
  const CR = terms.conversionRatio;
  const notional = terms.notional;
  
  // Calculate normalized levels for each underlying
  const levels = calcLevels(market.spotPrices, market.initialFixings);
  
  // Get worst-of level and index
  const { worstLevel, worstIndex } = worstOf(levels);
  const worstUnderlying = terms.underlyings[worstIndex];
  const worstInitialFixing = market.initialFixings[worstIndex];
  const worstSpotPrice = market.spotPrices[worstIndex];
  const worstFinalPrice = market.finalPrices?.[worstIndex] || worstSpotPrice;
  
  // Coupon calculations (unconditional)
  const couponPerPeriod = terms.couponRatePA / terms.couponFreqPerYear;
  const nCoupons = calculateCouponCount(terms.tenorMonths, terms.couponFreqPerYear);
  const couponTotal = notional * couponPerPeriod * nCoupons;
  const couponPct = couponTotal / notional;
  
  // Gearing calculation
  const gearing = safeDivide(1, K); // Gearing = 1/K (if CR=1)
  
  let redemptionPct: number;
  let shares: number | undefined;
  
  // Apply knock-in barrier check on worst-of level
  if (worstLevel >= KI) {
    // Above knock-in: cash redemption
    redemptionPct = 1.0;
  } else {
    // Below knock-in: geared put payoff
    // Redemption = worstLevel / K (geared)
    redemptionPct = safeDivide(worstLevel, K);
    
    // Physical delivery: shares of worst underlying at strike price
    const strikePrice = worstInitialFixing * K;
    shares = safeDivide(notional, strikePrice * CR);
  }
  
  const totalPct = redemptionPct + couponPct;
  
  return {
    redemptionPct: round(redemptionPct, 4),
    totalPct: round(totalPct, 4),
    couponPct: round(couponPct, 4),
    shares: shares ? round(shares, 2) : undefined,
    gearing: round(gearing, 2),
    worstOfLevel: round(worstLevel, 4),
    worstUnderlyingIndex: worstIndex,
  };
}

/**
 * Main payoff calculation function
 * Determines variant and calls appropriate calculator
 */
export function calculateReverseConvertiblePayoff(
  terms: ReverseConvertibleTerms,
  market: ReverseConvertibleMarketData
): PayoffResult {
  let result: any;
  
  if (terms.variant === 'standard_barrier_rc') {
    result = calculateStandardBarrierRC(terms, market);
  } else {
    result = calculateLowStrikeGearedPut(terms, market);
  }
  
  // Build timeline (simplified - just maturity event for now)
  let maturityDate: ISODateString;
  try {
    maturityDate = addMonths(getCurrentISODate(), terms.tenorMonths);
  } catch (error) {
    console.error('Error calculating maturity date:', error);
    // Fallback: use current date + tenor months manually
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + terms.tenorMonths);
    maturityDate = currentDate.toISOString().split('T')[0];
  }
  
  const events: CashflowEvent[] = [];
  
  // Add coupon events
  const couponSchedule = generateCouponSchedule(
    getCurrentISODate(),
    terms.tenorMonths,
    terms.couponFreqPerYear
  );
  
  couponSchedule.forEach((date) => {
    events.push({
      date,
      type: 'coupon',
      amount: terms.notional * (terms.couponRatePA / terms.couponFreqPerYear),
      description: `Coupon payment`,
    });
  });
  
  // Add maturity event
  const scenario = result.worstOfLevel >= (terms.barrierPct || terms.strikePct || 0)
    ? 'cash_redemption'
    : 'share_conversion';
  
  events.push({
    date: maturityDate,
    type: scenario,
    amount: result.redemptionPct * terms.notional,
    description: scenario === 'cash_redemption'
      ? 'Cash redemption at maturity'
      : `Share conversion (${terms.underlyings[result.worstUnderlyingIndex].ticker})`,
  });
  
  const timeline: PayoffTimeline = {
    events,
    maturityDate,
  };
  
  return {
    redemptionPct: result.redemptionPct,
    totalPct: result.totalPct,
    couponPct: result.couponPct,
    timeline,
    worstOfLevel: result.worstOfLevel,
    worstUnderlyingIndex: result.worstUnderlyingIndex,
    ...(result.gearing && { gearing: result.gearing }),
  };
}
