/**
 * Sample Lifecycle Data for Testing
 * One example for each bucket type
 */

import type { ProductLifecycleData, CouponSchedule } from '../types/lifecycle';

// ============================================================================
// REGULAR INCOME SAMPLE (Reverse Convertible with Autocall)
// ============================================================================

export const regularIncomeSample: ProductLifecycleData = {
  bucket: 'REGULAR_INCOME',
  payoffType: 'reverse_convertible',
  productDisplayName: 'Tech Giants Income Note with Quarterly Coupons',
  isin: 'US12345XYZ89',
  
  tradeDate: '2025-07-15',
  initialFixingDate: '2025-07-22',
  maturityDate: '2026-07-22',
  settlementDate: '2026-07-27',
  
  underlyings: [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      initialPrice: 185.50,
      currentPrice: 192.30,
      performancePct: 3.66,
      protectionLevel: 129.85, // 70% of initial
      protectionLevelPct: 70,
      autocallLevel: 185.50, // 100% autocall
      autocallLevelPct: 100,
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      initialPrice: 415.20,
      currentPrice: 405.80,
      performancePct: -2.26,
      protectionLevel: 290.64, // 70% of initial
      protectionLevelPct: 70,
      autocallLevel: 415.20,
      autocallLevelPct: 100,
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      initialPrice: 138.75,
      currentPrice: 145.90,
      performancePct: 5.15,
      protectionLevel: 97.13,
      protectionLevelPct: 70,
      autocallLevel: 138.75,
      autocallLevelPct: 100,
    },
  ],
  
  basketType: 'worst_of',
  worstPerformerIndex: 1, // MSFT
  
  events: [
    {
      type: 'initial_fixing',
      date: '2025-07-22',
      label: 'Initial Fixing',
      status: 'completed',
      description: 'Reference prices set',
    },
    {
      type: 'coupon_observation',
      date: '2025-10-22',
      label: 'Q1 Coupon',
      status: 'completed',
      amount: 2875,
      paid: true,
    },
    {
      type: 'coupon_observation',
      date: '2026-01-22',
      label: 'Q2 Coupon',
      status: 'upcoming',
      amount: 2875,
      paid: false,
    },
    {
      type: 'coupon_observation',
      date: '2026-04-22',
      label: 'Q3 Coupon',
      status: 'pending',
    },
    {
      type: 'final_observation',
      date: '2026-07-22',
      label: 'Final Observation',
      status: 'pending',
    },
    {
      type: 'maturity',
      date: '2026-07-22',
      label: 'Maturity',
      status: 'pending',
    },
    {
      type: 'settlement',
      date: '2026-07-27',
      label: 'Settlement',
      status: 'pending',
    },
  ],
  
  regularIncomeTerms: {
    couponRatePct: 11.5,
    couponFreqPerYear: 4,
    protectionLevelPct: 70,
    hasAutocall: true,
    autocallLevelPct: 100,
    conditionalCoupon: false,
  },
  
  daysToMaturity: 190,
  daysElapsed: 175,
  progressPct: 47.95,
  
  currentValue: 102875,
  indicativeReturn: 2875,
  indicativeReturnPct: 2.875,
  settlementType: 'cash',
};

export const regularIncomeCouponSchedule: CouponSchedule[] = [
  {
    observationDate: '2025-10-22',
    paymentDate: '2025-10-27',
    couponRate: 2.875,
    amount: 2875,
    status: 'paid',
    barrierChecked: true,
    barrierBreached: false,
  },
  {
    observationDate: '2026-01-22',
    paymentDate: '2026-01-27',
    couponRate: 2.875,
    amount: 2875,
    status: 'upcoming',
    barrierChecked: false,
  },
  {
    observationDate: '2026-04-22',
    paymentDate: '2026-04-27',
    couponRate: 2.875,
    amount: 2875,
    status: 'pending',
    barrierChecked: false,
  },
  {
    observationDate: '2026-07-22',
    paymentDate: '2026-07-27',
    couponRate: 2.875,
    amount: 2875,
    status: 'pending',
    barrierChecked: false,
  },
];

// ============================================================================
// CAPITAL PROTECTION SAMPLE (CPPN with Knock-In)
// ============================================================================

export const capitalProtectionSample: ProductLifecycleData = {
  bucket: 'CAPITAL_PROTECTION',
  payoffType: 'capital_protected_participation',
  productDisplayName: 'Protected Participation Note on Semiconductor Leaders',
  isin: 'US67890ABC45',
  
  tradeDate: '2025-09-01',
  initialFixingDate: '2025-09-08',
  maturityDate: '2027-09-08',
  settlementDate: '2027-09-13',
  
  underlyings: [
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      initialPrice: 455.00,
      currentPrice: 502.50,
      performancePct: 10.44,
      participationStart: 455.00, // 100%
      participationStartPct: 100,
      capLevel: 682.50, // 150%
      capLevelPct: 150,
    },
    {
      symbol: 'AMD',
      name: 'Advanced Micro Devices',
      initialPrice: 128.00,
      currentPrice: 115.20,
      performancePct: -10.00,
      participationStart: 128.00,
      participationStartPct: 100,
      capLevel: 192.00,
      capLevelPct: 150,
    },
  ],
  
  basketType: 'worst_of',
  worstPerformerIndex: 1, // AMD
  
  events: [
    {
      type: 'initial_fixing',
      date: '2025-09-08',
      label: 'Initial Fixing',
      status: 'completed',
    },
    {
      type: 'final_observation',
      date: '2027-09-08',
      label: 'Final Observation',
      status: 'pending',
    },
    {
      type: 'maturity',
      date: '2027-09-08',
      label: 'Maturity',
      status: 'pending',
    },
    {
      type: 'settlement',
      date: '2027-09-13',
      label: 'Settlement',
      status: 'pending',
    },
  ],
  
  capitalProtectionTerms: {
    capitalProtectionPct: 100,
    participationStartPct: 100,
    participationRatePct: 150,
    capLevelPct: 150,
    knockInEnabled: true,
    knockInLevelPct: 70,
  },
  
  daysToMaturity: 625,
  daysElapsed: 135,
  progressPct: 17.76,
  
  currentValue: 100000,
  indicativeReturn: 0,
  indicativeReturnPct: 0,
  settlementType: 'cash',
};

// ============================================================================
// BOOSTED GROWTH SAMPLE (Bonus Certificate)
// ============================================================================

export const boostedGrowthSample: ProductLifecycleData = {
  bucket: 'BOOSTED_GROWTH',
  payoffType: 'bonus_certificate',
  productDisplayName: 'Bonus Certificate on EV Leaders',
  isin: 'US11223DEF78',
  
  tradeDate: '2025-06-01',
  initialFixingDate: '2025-06-05',
  maturityDate: '2026-12-05',
  settlementDate: '2026-12-10',
  
  underlyings: [
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      initialPrice: 185.00,
      currentPrice: 210.75,
      performancePct: 13.92,
      barrierLevel: 111.00, // 60% barrier
      barrierLevelPct: 60,
      barrierBreached: false,
    },
    {
      symbol: 'RIVN',
      name: 'Rivian Automotive',
      initialPrice: 22.50,
      currentPrice: 18.90,
      performancePct: -16.00,
      barrierLevel: 13.50,
      barrierLevelPct: 60,
      barrierBreached: false,
    },
  ],
  
  basketType: 'worst_of',
  worstPerformerIndex: 1, // RIVN
  
  events: [
    {
      type: 'initial_fixing',
      date: '2025-06-05',
      label: 'Initial Fixing',
      status: 'completed',
    },
    {
      type: 'final_observation',
      date: '2026-12-05',
      label: 'Final Observation',
      status: 'pending',
    },
    {
      type: 'maturity',
      date: '2026-12-05',
      label: 'Maturity',
      status: 'pending',
    },
    {
      type: 'settlement',
      date: '2026-12-10',
      label: 'Settlement',
      status: 'pending',
    },
  ],
  
  boostedGrowthTerms: {
    bonusLevelPct: 125,
    barrierPct: 60,
    participationRatePct: 100,
  },
  
  daysToMaturity: 319,
  daysElapsed: 231,
  progressPct: 42.00,
  
  currentValue: 100000,
  indicativeReturn: 0,
  indicativeReturnPct: 0,
  settlementType: 'cash',
};

// ============================================================================
// SAMPLE SELECTOR
// ============================================================================

export type SampleType = 'regular_income' | 'capital_protection' | 'boosted_growth';

export function getSampleData(type: SampleType): {
  data: ProductLifecycleData;
  couponSchedule?: CouponSchedule[];
} {
  switch (type) {
    case 'regular_income':
      return {
        data: regularIncomeSample,
        couponSchedule: regularIncomeCouponSchedule,
      };
    case 'capital_protection':
      return {
        data: capitalProtectionSample,
      };
    case 'boosted_growth':
      return {
        data: boostedGrowthSample,
      };
  }
}
