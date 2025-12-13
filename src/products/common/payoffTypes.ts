/**
 * Payoff Types
 * Standard output contract for payoff calculations
 */

import type { ISODateString } from '../../core/types/dates';

/**
 * Cashflow event types
 */
export type CashflowEventType = 
  | 'coupon' 
  | 'autocall' 
  | 'maturity' 
  | 'redemption' 
  | 'conversion';

/**
 * Individual cashflow event
 */
export interface CashflowEvent {
  date: ISODateString;
  type: CashflowEventType;
  amount: number; // Currency amount (can be 0)
  details: Record<string, any>; // Additional context (levels, triggers, etc.)
}

/**
 * Complete payoff timeline
 */
export interface PayoffTimeline {
  events: CashflowEvent[];
  endedEarly: boolean; // For autocallables (always false for RC)
  endDate: ISODateString;
}

/**
 * Point on payoff curve for charting
 */
export interface CurvePoint {
  x: number; // Final level (normalized: ST/S0)
  redemptionPct: number; // Redemption as % of notional
  totalPct: number; // Total payoff (redemption + coupons) as % of notional
  couponPct: number; // Coupon portion as % of notional
  note?: string; // Optional annotation
}

/**
 * Payoff calculation result
 */
export interface PayoffResult {
  redemptionPct: number; // Redemption as % of notional
  totalPct: number; // Total payoff as % of notional
  couponPct: number; // Coupon portion as % of notional
  shares?: number; // Number of shares (if conversion)
  gearing?: number; // Gearing factor (for low strike variant)
  timeline: PayoffTimeline;
  worstOfLevel?: number; // Worst-of level (for basket products)
  worstUnderlyingIndex?: number; // Index of worst underlying (for basket products)
}

