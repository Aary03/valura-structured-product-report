/**
 * Break-Even Calculation Utilities
 * Calculate break-even levels for Reverse Convertible products
 */

import type { ReverseConvertibleTerms } from './terms';
import { calculateCouponCount } from '../common/schedule';

/**
 * Calculate total coupon percentage over the tenor
 */
export function calculateTotalCouponsPct(
  terms: ReverseConvertibleTerms
): number {
  const couponPerPeriod = terms.couponRatePA / terms.couponFreqPerYear;
  const nCoupons = calculateCouponCount(terms.tenorMonths, terms.couponFreqPerYear);
  return couponPerPeriod * nCoupons;
}

/**
 * Calculate break-even worst-of final level (as percentage)
 * 
 * Break-even is the level L where EndingValue = N (total return = 0%)
 * 
 * Formula: L_BE = K * (1 - c)
 * Where:
 *   - K = Conversion/Strike level (1.00 for standard RC, strikePct for low-strike RC)
 *   - c = C/N = Total coupons as fraction of notional
 *   - Break-even (%) = 100 * L_BE
 * 
 * For standard barrier RC:
 *   - K = 1.00 (strike at 100% of reference)
 *   - L_BE = 1.00 * (1 - c)
 *   - Example: c = 0.10 → L_BE = 90%
 * 
 * For low-strike RC:
 *   - K = strikePct (e.g., 0.55 for 55% strike)
 *   - L_BE = K * (1 - c)
 *   - Example: K = 0.55, c = 0.10 → L_BE = 49.5%
 * 
 * Note: For standard RC, if break-even is above the barrier, it's outside the
 * conversion zone (any conversion will be below break-even).
 */
export function calculateBreakEvenPct(
  terms: ReverseConvertibleTerms
): number {
  // c = C/N = total coupons as fraction of notional
  const c = calculateTotalCouponsPct(terms);
  
  // Determine K: conversion/strike level
  let K: number;
  if (terms.variant === 'low_strike_geared_put' && terms.strikePct) {
    // Low-strike RC: K = strikePct (e.g., 0.55)
    K = terms.strikePct;
  } else {
    // Standard barrier RC: K = 1.00 (strike at 100% of reference)
    K = 1.00;
  }
  
  // L_BE = K * (1 - c)
  const L_BE = K * (1 - c);
  
  // Return as percentage
  return L_BE * 100;
}

/**
 * Calculate ending value for a given worst-of final level
 * Handles both standard barrier RC and low-strike RC variants
 */
export function calculateEndingValue(
  terms: ReverseConvertibleTerms,
  worstFinalPct: number, // As percentage (e.g., 70 for 70%)
  notional: number = 100000
): {
  redemptionType: 'Cash' | 'Shares';
  couponsReceived: number;
  endingValue: number;
  totalReturn: number;
} {
  const totalCouponsPct = calculateTotalCouponsPct(terms);
  const totalCoupons = notional * totalCouponsPct;
  
  const worstFinalLevel = worstFinalPct / 100; // Convert to decimal
  
  // Determine trigger: barrier for standard RC, strike for low-strike RC
  const triggerPct = terms.barrierPct ?? terms.strikePct ?? 0;
  
  let redemptionType: 'Cash' | 'Shares';
  let underlyingRedemptionValue: number;
  
  if (worstFinalLevel >= triggerPct) {
    // Above trigger: cash redemption
    redemptionType = 'Cash';
    underlyingRedemptionValue = notional; // 100% principal returned
  } else {
    // Below trigger: share conversion
    redemptionType = 'Shares';
    
    if (terms.variant === 'low_strike_geared_put' && terms.strikePct) {
      // Low-strike RC: shares delivered at strike price (S0 * K)
      // Shares = (N / (S0 * K)) * CR
      // Final price = S0 * L
      // Value = Shares * Final Price = N * (L / K) * CR
      const strikePct = terms.strikePct;
      const conversionRatio = terms.conversionRatio;
      underlyingRedemptionValue = notional * (worstFinalLevel / strikePct) * conversionRatio;
    } else {
      // Standard barrier RC: shares delivered at initial fixing
      // Shares = (N / S0) * CR
      // Final price = S0 * L
      // Value = Shares * Final Price = N * L * CR
      const conversionRatio = terms.conversionRatio;
      underlyingRedemptionValue = notional * worstFinalLevel * conversionRatio;
    }
  }
  
  const endingValue = underlyingRedemptionValue + totalCoupons;
  const totalReturn = ((endingValue - notional) / notional) * 100;
  
  return {
    redemptionType,
    couponsReceived: totalCoupons,
    endingValue,
    totalReturn,
  };
}

