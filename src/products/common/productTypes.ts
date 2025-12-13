/**
 * Common Product Types
 * Shared types across all structured products
 */

import type { Currency } from '../../core/types/money';

/**
 * Underlying asset definition
 */
export interface Underlying {
  ticker: string;
  name?: string;
  initialFixing?: number; // Initial price/fixing level
}

/**
 * Basket type for multi-underlying products
 */
export type BasketType = 'single' | 'worst_of' | 'best_of';

/**
 * Settlement type
 */
export type SettlementType = 'cash' | 'physical';

/**
 * Coupon frequency options
 */
export type CouponFrequency = 12 | 4 | 2 | 1; // Monthly, Quarterly, Semi-Annual, Annual

/**
 * Convert frequency number to human-readable string
 */
export function frequencyToString(freq: CouponFrequency): string {
  const map: Record<CouponFrequency, string> = {
    12: 'Monthly',
    4: 'Quarterly',
    2: 'Semi-Annual',
    1: 'Annual',
  };
  return map[freq] || 'Unknown';
}

/**
 * Convert frequency string to number
 */
export function frequencyFromString(freq: string): CouponFrequency {
  const map: Record<string, CouponFrequency> = {
    monthly: 12,
    quarterly: 4,
    'semi-annual': 2,
    annual: 1,
  };
  return map[freq.toLowerCase()] || 4; // Default to quarterly
}

