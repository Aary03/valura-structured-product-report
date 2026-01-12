/**
 * Investment Position Tracking Types
 * Data models for tracking structured product investments
 */

import type { ReverseConvertibleTerms } from '../products/reverseConvertible/terms';
import type { CapitalProtectedParticipationTerms } from '../products/capitalProtectedParticipation/terms';
import type { ISODateString } from '../core/types/dates';

/**
 * Coupon payment record
 */
export interface CouponPayment {
  date: ISODateString;
  amount: number;
  paid: boolean; // Whether investor actually received it
  description?: string;
}

/**
 * Investment position data structure
 */
export interface InvestmentPosition {
  // Unique identifier
  id: string;
  
  // Product terms (full product configuration)
  productTerms: ReverseConvertibleTerms | CapitalProtectedParticipationTerms;
  
  // Inception data
  inceptionDate: ISODateString;
  maturityDate: ISODateString;
  notional: number;
  initialFixings: number[]; // Initial price per underlying
  
  // Historical tracking (from inception)
  couponHistory: CouponPayment[];
  
  // Current status
  daysElapsed: number;
  daysRemaining: number;
  
  // User can manually override if they know barrier was breached
  manualBarrierBreach?: boolean;
  
  // Metadata
  createdAt: ISODateString;
  updatedAt: ISODateString;
  name?: string; // Optional custom name for the position
}

/**
 * Position value calculation result
 */
export interface PositionValue {
  // Current value breakdown
  initialInvestment: number;
  couponsReceivedToDate: number;
  currentMarketValue: number; // If liquidated today
  projectedSettlementValue: number; // At maturity
  
  // Settlement details
  settlementType: 'cash' | 'physical_shares';
  sharesReceived?: number; // If physical delivery
  sharesMarketValue?: number; // Current value of those shares
  cashAmount?: number; // If cash settlement
  
  // Returns
  absoluteReturn: number; // $ amount
  percentageReturn: number; // %
  
  // Status indicators
  barrierStatus: 'safe' | 'breached' | 'at_risk' | 'n/a';
  daysToMaturity: number;
  
  // Underlying performance
  underlyingLevels: number[]; // Current levels as % of initial (e.g., 1.10 = 110%)
  worstPerformer?: {
    index: number;
    ticker: string;
    level: number;
    currentPrice: number;
    initialPrice: number;
  };
  bestPerformer?: {
    index: number;
    ticker: string;
    level: number;
    currentPrice: number;
    initialPrice: number;
  };
  
  // Bonus certificate specific
  bonusStatus?: 'active' | 'lost' | 'n/a';
  bonusAmount?: number;
}

/**
 * Market data for position valuation
 */
export interface PositionMarketData {
  underlyingPrices: number[]; // Current spot prices (same order as underlyings)
  timestamp: Date;
}

/**
 * Position summary for list views
 */
export interface PositionSummary {
  id: string;
  name: string;
  productType: 'RC' | 'CPPN';
  currentValue: number;
  percentageReturn: number;
  daysToMaturity: number;
  barrierStatus: 'safe' | 'breached' | 'at_risk' | 'n/a';
}
