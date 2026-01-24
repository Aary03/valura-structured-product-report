/**
 * Unified Lifecycle Types for Structured Products
 * Supports: Regular Income, Capital Protection, Boosted Growth
 */

// ============================================================================
// BUCKET TYPES
// ============================================================================

export type BucketType = 'REGULAR_INCOME' | 'CAPITAL_PROTECTION' | 'BOOSTED_GROWTH';
export type PayoffType = 
  | 'reverse_convertible' 
  | 'income_note' 
  | 'capital_protected_participation' 
  | 'bonus_certificate';

// ============================================================================
// UNDERLYING DATA
// ============================================================================

export interface UnderlyingLifecycle {
  symbol: string;
  name: string;
  initialPrice: number;
  currentPrice: number;
  performancePct: number;
  
  // Conditional trigger levels (based on bucket)
  protectionLevel?: number; // Regular Income - barrier/strike price
  protectionLevelPct?: number; // as % of initial
  
  autocallLevel?: number; // Regular Income - autocall trigger price
  autocallLevelPct?: number;
  
  participationStart?: number; // Capital Protection - participation start price
  participationStartPct?: number;
  
  capLevel?: number; // Capital Protection - cap price
  capLevelPct?: number;
  
  barrierLevel?: number; // Bonus - knock-in barrier price
  barrierLevelPct?: number;
  barrierBreached?: boolean;
  barrierBreachedDate?: string;
}

// ============================================================================
// EVENTS & TIMELINE
// ============================================================================

export interface LifecycleEvent {
  type: 'initial_fixing' | 'coupon_observation' | 'autocall_observation' | 'final_observation' | 'maturity' | 'settlement';
  date: string;
  label: string;
  status: 'completed' | 'upcoming' | 'pending';
  amount?: number; // For coupon payments
  paid?: boolean;
  description?: string;
}

export interface CouponSchedule {
  observationDate: string;
  paymentDate: string;
  couponRate: number;
  amount: number;
  status: 'paid' | 'upcoming' | 'pending';
  barrierChecked?: boolean;
  barrierBreached?: boolean;
}

// ============================================================================
// PRODUCT TERMS
// ============================================================================

export interface RegularIncomeTerms {
  couponRatePct: number;
  couponFreqPerYear: number;
  protectionLevelPct: number; // barrier/strike
  hasAutocall?: boolean;
  autocallLevelPct?: number;
  autocallStepDown?: boolean;
  autocallSchedule?: Array<{
    observationDate: string;
    triggerLevelPct: number;
  }>;
  conditionalCoupon?: boolean;
}

export interface CapitalProtectionTerms {
  capitalProtectionPct: number; // floor (e.g., 100%)
  participationStartPct: number; // e.g., 100%
  participationRatePct: number; // e.g., 150%
  capLevelPct?: number; // optional cap
  knockInEnabled?: boolean;
  knockInLevelPct?: number;
}

export interface BoostedGrowthTerms {
  bonusLevelPct: number; // guaranteed level if barrier not breached
  barrierPct: number; // knock-in barrier
  participationRatePct?: number; // upside participation (usually 100%)
}

// ============================================================================
// UNIFIED LIFECYCLE DATA
// ============================================================================

export interface ProductLifecycleData {
  // Core identifiers
  bucket: BucketType;
  payoffType: PayoffType;
  productDisplayName: string;
  isin?: string;
  
  // Dates
  tradeDate: string;
  initialFixingDate: string;
  maturityDate: string;
  settlementDate: string;
  
  // Underlyings
  underlyings: UnderlyingLifecycle[];
  basketType: 'single' | 'worst_of' | 'best_of' | 'average' | 'equally_weighted';
  worstPerformerIndex?: number;
  bestPerformerIndex?: number;
  
  // Events & timeline
  events: LifecycleEvent[];
  nextEvent?: LifecycleEvent;
  
  // Product-specific terms (conditional based on bucket)
  regularIncomeTerms?: RegularIncomeTerms;
  capitalProtectionTerms?: CapitalProtectionTerms;
  boostedGrowthTerms?: BoostedGrowthTerms;
  
  // Current status
  daysToMaturity: number;
  daysElapsed: number;
  progressPct: number; // % of time elapsed
  
  // Outcome preview
  currentValue?: number;
  indicativeReturn?: number;
  indicativeReturnPct?: number;
  settlementType?: 'cash' | 'physical';
  projectedShares?: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get bucket display info
 */
export function getBucketInfo(bucket: BucketType): {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
} {
  switch (bucket) {
    case 'REGULAR_INCOME':
      return {
        label: 'Regular Income',
        emoji: '💰',
        color: '#3b82f6',
        bgColor: '#dbeafe',
        description: 'Steady periodic coupons with conditional downside protection',
      };
    case 'CAPITAL_PROTECTION':
      return {
        label: 'Capital Protection',
        emoji: '🛡️',
        color: '#10b981',
        bgColor: '#d1fae5',
        description: 'Protected principal with leveraged upside participation',
      };
    case 'BOOSTED_GROWTH':
      return {
        label: 'Boosted Growth',
        emoji: '🚀',
        color: '#8b5cf6',
        bgColor: '#ede9fe',
        description: 'Enhanced returns if barrier not breached during product life',
      };
  }
}

/**
 * Calculate distance metrics (investor-friendly)
 */
export function calculateDistanceMetrics(
  currentPrice: number,
  targetPrice: number,
  type: 'to_target' | 'buffer_from_target'
): {
  distancePct: number;
  label: string;
  isPositive: boolean;
} {
  if (type === 'to_target') {
    // How much does price need to move to reach target?
    const distancePct = (targetPrice / currentPrice - 1) * 100;
    
    if (distancePct > 0) {
      return {
        distancePct,
        label: `${distancePct.toFixed(1)}% to reach`,
        isPositive: false,
      };
    } else {
      return {
        distancePct: Math.abs(distancePct),
        label: `Already ${Math.abs(distancePct).toFixed(1)}% above`,
        isPositive: true,
      };
    }
  } else {
    // How much buffer/cushion before hitting target?
    const bufferPct = (1 - targetPrice / currentPrice) * 100;
    
    if (bufferPct > 0) {
      return {
        distancePct: bufferPct,
        label: `${bufferPct.toFixed(1)}% buffer`,
        isPositive: true,
      };
    } else {
      return {
        distancePct: Math.abs(bufferPct),
        label: `Breached by ${Math.abs(bufferPct).toFixed(1)}%`,
        isPositive: false,
      };
    }
  }
}

/**
 * Get earn/risk lines for hero
 */
export function getEarnRiskLines(data: ProductLifecycleData): {
  earnLine: string;
  riskLine: string;
} {
  const { bucket, regularIncomeTerms, capitalProtectionTerms, boostedGrowthTerms } = data;
  
  if (bucket === 'REGULAR_INCOME' && regularIncomeTerms) {
    const couponAnnual = regularIncomeTerms.couponRatePct;
    const protection = regularIncomeTerms.protectionLevelPct;
    const hasAutocall = regularIncomeTerms.hasAutocall;
    
    return {
      earnLine: hasAutocall
        ? `Earn ${couponAnnual.toFixed(1)}% p.a. coupons + early exit opportunity`
        : `Earn ${couponAnnual.toFixed(1)}% p.a. in periodic coupons`,
      riskLine: `Protected down to ${protection}%, then 1:1 downside exposure`,
    };
  }
  
  if (bucket === 'CAPITAL_PROTECTION' && capitalProtectionTerms) {
    const floor = capitalProtectionTerms.capitalProtectionPct;
    const partRate = capitalProtectionTerms.participationRatePct;
    const partStart = capitalProtectionTerms.participationStartPct;
    const hasCap = capitalProtectionTerms.capLevelPct != null;
    
    return {
      earnLine: `Capture ${partRate}% of upside above ${partStart}%${hasCap ? ` (capped at ${capitalProtectionTerms.capLevelPct}%)` : ''}`,
      riskLine: `Principal protected at ${floor}%${capitalProtectionTerms.knockInEnabled ? ` (conditional on ${capitalProtectionTerms.knockInLevelPct}% barrier)` : ''}`,
    };
  }
  
  if (bucket === 'BOOSTED_GROWTH' && boostedGrowthTerms) {
    const bonus = boostedGrowthTerms.bonusLevelPct;
    const barrier = boostedGrowthTerms.barrierPct;
    
    return {
      earnLine: `Guaranteed ${bonus}% return if barrier holds`,
      riskLine: `Barrier at ${barrier}% — if breached, payoff tracks underlying 1:1`,
    };
  }
  
  return {
    earnLine: 'Returns based on underlying performance',
    riskLine: 'Risk depends on product structure',
  };
}
