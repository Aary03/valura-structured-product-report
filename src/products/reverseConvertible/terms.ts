/**
 * Reverse Convertible Terms
 * Product terms definition for Reverse Convertible products
 */

import type { Currency } from '../../core/types/money';
import type { Underlying, CouponFrequency } from '../common/productTypes';
import type { ISODateString } from '../../core/types/dates';

/**
 * Reverse Convertible variant types
 */
export type ReverseConvertibleVariant = 
  | 'standard_barrier_rc' 
  | 'low_strike_geared_put';

/**
 * Coupon type for Reverse Convertible
 */
export type CouponType = 'guaranteed' | 'conditional';

/**
 * Reverse Convertible product terms
 */
export interface ReverseConvertibleTerms {
  // Discriminator
  productType: 'RC';

  // Basic terms
  notional: number;
  currency: Currency;
  basketType: 'single' | 'worst_of';
  underlyings: Underlying[]; // Array of 1-3 underlyings
  initialFixings: number[]; // Initial fixing per underlying (same order as underlyings)
  tenorMonths: number;
  
  // Reference price (for pre-trade reports)
  referenceMode?: 'today' | 'custom'; // Default: 'today' (uses current spot as reference)
  referenceDate?: ISODateString; // Required if referenceMode === 'custom'
  
  // Coupon terms
  couponRatePA: number; // Annual coupon rate (e.g., 0.10 = 10%)
  couponFreqPerYear: CouponFrequency; // 12=monthly, 4=quarterly, 2=semi-annual, 1=annual
  couponType: CouponType; // 'guaranteed' or 'conditional'
  couponTriggerLevelPct?: number; // Required if couponType = 'conditional' (e.g., 0.60 = 60%)
  
  // Conversion terms
  conversionRatio: number; // CR, default 1.0
  
  // Variant selector
  variant: ReverseConvertibleVariant;
  
  // Standard Barrier RC terms
  barrierPct?: number; // B, e.g., 0.70 (required if variant = standard_barrier_rc)
  
  // Low Strike / Geared Put terms
  strikePct?: number; // K, e.g., 0.55 (required if variant = low_strike_geared_put)
  knockInBarrierPct?: number; // Optional; if omitted, KI = strikePct
  
  // Autocall terms (optional)
  autocallEnabled?: boolean; // Whether autocall feature is enabled
  autocallLevelPct?: number; // Autocall trigger level (e.g., 1.00 = 100%)
  autocallFrequency?: CouponFrequency; // How often autocall is observed (default: same as coupon frequency)
}

/**
 * Validate Reverse Convertible terms
 */
export function validateReverseConvertibleTerms(
  terms: ReverseConvertibleTerms
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Basic validation
  if (terms.notional <= 0) {
    errors.push('Notional must be greater than 0');
  }
  
  if (terms.tenorMonths <= 0) {
    errors.push('Tenor must be greater than 0 months');
  }
  
  if (terms.couponRatePA < 0 || terms.couponRatePA > 1) {
    errors.push('Coupon rate must be between 0 and 1 (0% to 100%)');
  }
  
  // Coupon type validation
  if (terms.couponType === 'conditional') {
    if (terms.couponTriggerLevelPct === undefined || terms.couponTriggerLevelPct <= 0 || terms.couponTriggerLevelPct > 1) {
      errors.push('Coupon trigger level must be between 0 and 1 (0% to 100%) when coupon type is conditional');
    }
  }
  
  if (terms.conversionRatio <= 0) {
    errors.push('Conversion ratio must be greater than 0');
  }
  
  // Basket validation
  if (!terms.underlyings || terms.underlyings.length === 0) {
    errors.push('At least one underlying must be specified');
  }
  
  if (terms.basketType === 'single' && terms.underlyings.length !== 1) {
    errors.push('Single basket type requires exactly 1 underlying');
  }
  
  if (terms.basketType === 'worst_of') {
    if (terms.underlyings.length < 2 || terms.underlyings.length > 3) {
      errors.push('Worst-of basket requires 2 or 3 underlyings');
    }
    
    // Check for duplicate symbols
    const symbols = terms.underlyings.map(u => u.ticker);
    const uniqueSymbols = new Set(symbols);
    if (uniqueSymbols.size !== symbols.length) {
      errors.push('Underlying symbols must be unique');
    }
  }
  
  // Initial fixings validation
  if (!terms.initialFixings || terms.initialFixings.length !== terms.underlyings.length) {
    errors.push('Initial fixings array must match underlyings array length');
  }
  
  if (terms.initialFixings.some(f => f <= 0)) {
    errors.push('All initial fixings must be greater than 0');
  }
  
  // Variant-specific validation
  if (terms.variant === 'standard_barrier_rc') {
    if (terms.barrierPct === undefined || terms.barrierPct <= 0 || terms.barrierPct > 1) {
      errors.push('Barrier percentage must be between 0 and 1 for standard barrier RC');
    }
  }
  
  if (terms.variant === 'low_strike_geared_put') {
    if (terms.strikePct === undefined || terms.strikePct <= 0 || terms.strikePct > 1) {
      errors.push('Strike percentage must be between 0 and 1 for low strike geared put');
    }
    if (terms.knockInBarrierPct !== undefined) {
      if (terms.knockInBarrierPct <= 0 || terms.knockInBarrierPct > 1) {
        errors.push('Knock-in barrier percentage must be between 0 and 1');
      }
      if (terms.knockInBarrierPct > (terms.strikePct || 1)) {
        errors.push('Knock-in barrier cannot be greater than strike');
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get default terms for testing
 */
export function getDefaultReverseConvertibleTerms(): ReverseConvertibleTerms {
  return {
    productType: 'RC',
    notional: 100000,
    currency: 'USD',
    basketType: 'single',
    underlyings: [{ ticker: 'AAPL', name: 'Apple Inc.' }],
    initialFixings: [100],
    tenorMonths: 12,
    couponRatePA: 0.10, // 10%
    couponFreqPerYear: 4, // Quarterly
    couponType: 'guaranteed', // Default to guaranteed
    conversionRatio: 1.0,
    variant: 'standard_barrier_rc',
    barrierPct: 0.70,
  };
}

