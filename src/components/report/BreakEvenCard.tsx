/**
 * Break-Even Card Component
 * Displays break-even level information in a clear, standalone card
 */

import type { ReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import { formatPercent, formatNumber } from '../../core/utils/math';
import { calculateBreakEvenPct, calculateTotalCouponsPct } from '../../products/reverseConvertible/breakEven';
import { CardShell } from '../common/CardShell';
import { SectionHeader } from '../common/SectionHeader';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';

interface BreakEvenCardProps {
  terms: ReverseConvertibleTerms;
  notional?: number;
}

export function BreakEvenCard({ terms, notional = 100000 }: BreakEvenCardProps) {
  const breakEvenPct = calculateBreakEvenPct(terms);
  const totalCouponsPct = calculateTotalCouponsPct(terms);
  const totalCoupons = notional * totalCouponsPct;
  
  // Determine trigger level for context
  const triggerPct = terms.barrierPct ?? terms.strikePct ?? 0;
  const triggerPctNum = triggerPct * 100;
  const triggerLabel = terms.variant === 'low_strike_geared_put' ? 'Strike' : 'Barrier';
  
  // Check if break-even is in conversion zone
  const isInConversionZone = breakEvenPct < triggerPctNum;
  
  // Calculate what ending value would be at break-even
  const breakEvenLevel = breakEvenPct / 100;
  let breakEvenEndingValue: number;
  
  if (breakEvenLevel >= triggerPct) {
    // Above trigger: cash redemption
    breakEvenEndingValue = notional + totalCoupons;
  } else {
    // Below trigger: share conversion
    if (terms.variant === 'low_strike_geared_put' && terms.strikePct) {
      const K = terms.strikePct;
      breakEvenEndingValue = notional * (breakEvenLevel / K) * terms.conversionRatio + totalCoupons;
    } else {
      breakEvenEndingValue = notional * breakEvenLevel * terms.conversionRatio + totalCoupons;
    }
  }

  return (
    <CardShell className="p-6">
      <SectionHeader
        title="Break-Even Analysis"
        subtitle={
          terms.basketType === 'equally_weighted' 
            ? 'The average basket level where total return equals zero'
            : terms.basketType === 'worst_of'
            ? 'The worst stock final level where total return equals zero'
            : 'The stock final level where total return equals zero'
        }
      />
      
      <div className="mt-6 space-y-4">
        {/* Main Break-Even Level */}
        <div className="flex items-center justify-between p-4 bg-warning-bg rounded-xl border" style={{ borderColor: 'rgba(148,98,0,0.25)' }}>
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-warning-fg" />
            <div>
              <div className="text-sm text-muted mb-1">Break-Even Level</div>
              <div className="text-2xl font-bold text-warning-fg">
                {formatPercent(breakEvenPct / 100, 1)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted mb-1">Ending Value</div>
            <div className="text-xl font-semibold text-valura-ink">
              ${formatNumber(breakEvenEndingValue, 0)}
            </div>
          </div>
        </div>

        {/* Context Information */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-surface-2 rounded-lg">
            <TrendingUp className="w-5 h-5 text-success-fg mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-valura-ink mb-1">Above Break-Even</div>
              <div className="text-xs text-muted">
                If the {terms.basketType === 'equally_weighted' ? 'average basket level' : 
                  terms.basketType === 'worst_of' ? 'worst stock final level' : 
                  'stock final level'} is above {formatPercent(breakEvenPct / 100, 1)}, 
                you will have a positive total return (ending value + coupons {'>'} initial investment).
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-surface-2 rounded-lg">
            <TrendingUp className="w-5 h-5 text-danger-fg mt-0.5 flex-shrink-0 rotate-180" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-valura-ink mb-1">Below Break-Even</div>
              <div className="text-xs text-muted">
                If the {terms.basketType === 'equally_weighted' ? 'average basket level' : 
                  terms.basketType === 'worst_of' ? 'worst stock final level' : 
                  'stock final level'} is below {formatPercent(breakEvenPct / 100, 1)}, 
                you will have a negative total return (ending value + coupons {'<'} initial investment).
              </div>
            </div>
          </div>

          {/* Conversion Zone Note */}
          {isInConversionZone ? (
                  <div className="flex items-start space-x-3 p-3 bg-warning-bg rounded-lg border" style={{ borderColor: 'rgba(148,98,0,0.25)' }}>
                    <AlertCircle className="w-5 h-5 text-warning-fg mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-valura-ink mb-1">
                        Break-Even in Conversion Zone
                      </div>
                      <div className="text-xs text-muted">
                  Break-even ({formatPercent(breakEvenPct / 100, 1)}) is below the {triggerLabel} ({formatPercent(triggerPct, 0)}), 
                  meaning it occurs in the share conversion scenario. This is the level where share conversion value + coupons = initial investment.
                </div>
              </div>
            </div>
          ) : (
                  <div className="flex items-start space-x-3 p-3 bg-warning-bg rounded-lg border" style={{ borderColor: 'rgba(148,98,0,0.25)' }}>
                    <AlertCircle className="w-5 h-5 text-warning-fg mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-valura-ink mb-1">
                        Break-Even Outside Conversion Zone
                      </div>
                      <div className="text-xs text-muted">
                  Break-even ({formatPercent(breakEvenPct / 100, 1)}) is above the {triggerLabel} ({formatPercent(triggerPct, 0)}). 
                  Any conversion scenario will be below break-even, meaning you would have a negative return if conversion occurs.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Formula Breakdown */}
        <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs text-muted space-y-1">
            <div className="font-semibold text-text-primary mb-2">Calculation:</div>
            <div>Break-even = {terms.variant === 'low_strike_geared_put' ? 'Strike' : '1.00'} × (1 - Coupons/Notional)</div>
            <div>= {formatPercent(terms.variant === 'low_strike_geared_put' ? (terms.strikePct || 0) : 1.0, 0)} × (1 - {formatPercent(totalCouponsPct, 1)})</div>
            <div>= {formatPercent(breakEvenPct / 100, 1)}</div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

