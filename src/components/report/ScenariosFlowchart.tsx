/**
 * Premium Scenarios Flowchart Component
 * Enhanced decision tree with numeric outcomes and info cards
 */

import type { ReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import { formatPercent } from '../../core/utils/math';
import { CardShell } from '../common/CardShell';
import { SectionHeader } from '../common/SectionHeader';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { formatNumber } from '../../core/utils/math';

interface ScenariosFlowchartProps {
  terms: ReverseConvertibleTerms;
  intrinsicValue?: number | null;
  currentLevel?: number;
}

export function ScenariosFlowchart({ 
  terms, 
  intrinsicValue = null,
  currentLevel = 1.0,
}: ScenariosFlowchartProps) {
  const barrierOrStrikeLabel =
    terms.variant === 'standard_barrier_rc' ? 'Barrier' : 'Strike';
  const barrierOrStrikeValue =
    terms.variant === 'standard_barrier_rc'
      ? formatPercent(terms.barrierPct || 0, 0)
      : formatPercent(terms.strikePct || 0, 0);

  const barrierPct = terms.barrierPct || terms.strikePct || 0;
  const strikePct = terms.strikePct || 0;
  const gearing = strikePct > 0 ? (1 / strikePct).toFixed(2) : null;

  // Calculate example outcomes
  const exampleFinalAbove = 100; // 100% of initial
  const exampleFinalBelow = barrierPct * 100 * 0.8; // 80% of barrier

  return (
    <CardShell className="p-6">
      <SectionHeader
        title="Understand the Scenarios"
        subtitle="What happens at maturity based on final underlying level"
      />
      
      {/* Info chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="px-3 py-1.5 bg-primary-light rounded-full text-sm">
          <span className="font-semibold text-text-primary">{barrierOrStrikeLabel}:</span>{' '}
          <span className="text-text-secondary">{barrierOrStrikeValue}</span>
        </div>
        {terms.variant === 'low_strike_geared_put' && strikePct > 0 && (
          <div className="px-3 py-1.5 bg-warning-light rounded-full text-sm">
            <span className="font-semibold text-text-primary">Strike:</span>{' '}
            <span className="text-text-secondary">{formatPercent(strikePct, 0)}</span>
          </div>
        )}
        <div className="px-3 py-1.5 bg-grey-background rounded-full text-sm">
          <span className="font-semibold text-text-primary">Conversion Ratio:</span>{' '}
          <span className="text-text-secondary">{formatNumber(terms.conversionRatio, 2)}</span>
        </div>
        <div className="px-3 py-1.5 bg-grey-background rounded-full text-sm">
          <span className="font-semibold text-text-primary">Settlement:</span>{' '}
          <span className="text-text-secondary">Cash/Physical</span>
        </div>
      </div>

      {/* Decision question card */}
      <div className="bg-gradient-to-r from-primary to-primary-2 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Info className="w-6 h-6" />
          <h3 className="text-xl font-bold">At Maturity</h3>
        </div>
        <p className="text-lg font-semibold mb-4">
          Is {terms.basketType === 'worst_of' ? 'Worst-Of' : 'Final'} Level ≥ {barrierOrStrikeLabel} Level ({barrierOrStrikeValue})?
        </p>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (currentLevel * 100 / (barrierPct * 100)) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Two-lane decision flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* YES Branch - Cash Redemption */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center text-white font-bold shadow-medium">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-text-primary">YES</span>
          </div>
          
          <div className="bg-success-light border-2 border-success rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-success text-lg mb-3">Cash Redemption</h4>
            
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-text-primary">100% Principal</p>
                  <p className="text-sm text-text-secondary">Full notional returned</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-text-primary">All Coupons Paid</p>
                  <p className="text-sm text-text-secondary">
                    {formatPercent(terms.couponRatePA, 1)} p.a. × {terms.tenorMonths} months
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-success/30">
              <p className="text-sm text-text-secondary mb-1">Example (Final = {exampleFinalAbove}%):</p>
              <p className="text-lg font-bold text-success">
                You receive: 100% + Coupons = ~{formatPercent(1 + (terms.couponRatePA * terms.tenorMonths / 12), 1)}
              </p>
            </div>
          </div>
        </div>

        {/* NO Branch - Share Conversion */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-danger rounded-full flex items-center justify-center text-white font-bold shadow-medium">
              <XCircle className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-text-primary">NO</span>
          </div>
          
          <div className="bg-danger-light border-2 border-danger rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-danger text-lg mb-3">Share Conversion</h4>
            
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <XCircle className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-text-primary">Shares Delivered</p>
                  <p className="text-sm text-text-secondary">
                    {formatNumber(terms.conversionRatio, 2)} shares per unit
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <XCircle className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-text-primary">Value at Final Price</p>
                  <p className="text-sm text-text-secondary">Depends on final underlying level</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-danger/30">
              <p className="text-sm text-text-secondary mb-1">Example (Final = {formatPercent(exampleFinalBelow / 100, 0)}):</p>
              <p className="text-lg font-bold text-danger">
                You receive: {formatNumber(terms.conversionRatio, 2)} shares
              </p>
              <p className="text-sm text-text-secondary mt-1">
                Value: ~{formatPercent(exampleFinalBelow / 100, 1)} of notional
              </p>
            </div>
          </div>
          
          {/* Geared Put Info Card */}
          {terms.variant === 'low_strike_geared_put' && gearing && (
            <div className="bg-warning-light border-2 border-warning rounded-2xl p-4 mt-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-text-primary text-sm mb-1">Key Risk: Geared Losses</p>
                  <p className="text-xs text-text-secondary">
                    Below strike ({formatPercent(strikePct, 0)}), losses are amplified by gearing = {gearing}x.
                    For every 1% drop below strike, you lose {gearing}% of notional.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {intrinsicValue !== null && (
        <div className="mt-6 p-4 bg-primary-light rounded-xl border border-primary">
          <p className="text-sm text-text-secondary mb-1">Current Intrinsic Value:</p>
          <p className="text-2xl font-bold text-primary">
            {formatPercent(intrinsicValue, 1)}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Based on current underlying level ({formatPercent(currentLevel, 1)})
          </p>
        </div>
      )}
    </CardShell>
  );
}
