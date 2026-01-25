/**
 * Calculations Card Component
 * Explains formulas and calculations for all product types
 */

import { useState } from 'react';
import type { ProductLifecycleData } from '../../types/lifecycle';
import { Calculator, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface CalculationsCardProps {
  data: ProductLifecycleData;
}

export function CalculationsCard({ data }: CalculationsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { bucket, regularIncomeTerms, capitalProtectionTerms, boostedGrowthTerms } = data;
  
  const getCalculations = () => {
    if (bucket === 'REGULAR_INCOME' && regularIncomeTerms) {
      return {
        title: 'Regular Income Calculations',
        sections: [
          {
            name: 'Coupon Payment',
            formula: 'Coupon Amount = Notional × (Coupon Rate / Frequency)',
            example: `Example: $100,000 × (${regularIncomeTerms.couponRatePct}% / ${regularIncomeTerms.couponFreqPerYear}) = $${(100000 * regularIncomeTerms.couponRatePct / 100 / regularIncomeTerms.couponFreqPerYear).toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
            note: regularIncomeTerms.conditionalCoupon ? 'Paid only if barrier not breached at observation' : 'Paid unconditionally',
          },
          {
            name: 'Performance',
            formula: 'Performance % = ((Current Price / Initial Price) - 1) × 100',
            example: 'Example: ((192.30 / 185.50) - 1) × 100 = +3.66%',
          },
          {
            name: 'Protection Level',
            formula: 'Protection Price = Initial Price × Protection Level %',
            example: `Example: $185.50 × ${regularIncomeTerms.protectionLevelPct}% = $${(185.50 * regularIncomeTerms.protectionLevelPct / 100).toFixed(2)}`,
            note: 'If final price < protection level, investor receives physical shares or cash equivalent',
          },
          ...(regularIncomeTerms.hasAutocall ? [{
            name: 'Autocall Check',
            formula: 'Autocall Triggers if: Worst Performer Price ≥ Autocall Level',
            example: `Example: If worst stock ≥ ${regularIncomeTerms.autocallLevelPct}% of initial, product terminates early`,
            note: 'Investor receives all coupons earned + principal',
          }] : []),
          {
            name: 'Distance to Autocall',
            formula: 'Distance = (Autocall Price / Current Price - 1) × 100',
            example: 'Example: ($185.50 / $192.30 - 1) × 100 = -3.5% (Already above)',
          },
          {
            name: 'Buffer to Protection',
            formula: 'Buffer = (1 - Protection Price / Current Price) × 100',
            example: 'Example: (1 - $129.85 / $192.30) × 100 = +32.5% buffer',
            note: 'Positive = Safe, Negative = Breached',
          },
          {
            name: 'Final Payout (Above Protection)',
            formula: 'Payout = Principal + All Coupons Received',
            example: 'Example: $100,000 + (4 coupons × $2,875) = $111,500',
          },
          {
            name: 'Final Payout (Below Protection)',
            formula: 'Payout = Principal × (Final Price / Initial Price) + Coupons',
            example: `Example: $100,000 × (50% / 100%) + $5,750 = $55,750`,
            note: 'Loss mirrors worst performer below protection level',
          },
        ],
      };
    }
    
    if (bucket === 'CAPITAL_PROTECTION' && capitalProtectionTerms) {
      return {
        title: 'Capital Protection Calculations',
        sections: [
          {
            name: 'Performance',
            formula: 'Performance % = ((Current Price / Initial Price) - 1) × 100',
            example: 'Example: ((115.20 / 128.00) - 1) × 100 = -10.00%',
          },
          {
            name: 'Participation Start',
            formula: 'Start Price = Initial Price × Participation Start %',
            example: `Example: $128.00 × ${capitalProtectionTerms.participationStartPct}% = $${(128.00 * capitalProtectionTerms.participationStartPct / 100).toFixed(2)}`,
            note: 'Upside participation begins above this level',
          },
          {
            name: 'Room to Participation',
            formula: 'Room = (Start Price / Current Price - 1) × 100',
            example: 'Example: ($128.00 / $115.20 - 1) × 100 = +11.1% to reach',
          },
          {
            name: 'Participated Gain',
            formula: 'Gain = (Final Perf - Start %) × Participation Rate',
            example: `Example: (40% - ${capitalProtectionTerms.participationStartPct}%) × ${capitalProtectionTerms.participationRatePct}% = ${((40 - capitalProtectionTerms.participationStartPct) * capitalProtectionTerms.participationRatePct / 100).toFixed(1)}%`,
            note: 'Applied only to gains above participation start',
          },
          ...(capitalProtectionTerms.capLevelPct ? [{
            name: 'Cap Level',
            formula: 'Cap Price = Initial Price × Cap %',
            example: `Example: $128.00 × ${capitalProtectionTerms.capLevelPct}% = $${(128.00 * capitalProtectionTerms.capLevelPct / 100).toFixed(2)}`,
            note: 'Maximum payout level (gains capped here)',
          }] : []),
          {
            name: 'Final Payout (Below Participation)',
            formula: `Payout = Principal × ${capitalProtectionTerms.capitalProtectionPct}%`,
            example: `Example: $100,000 × ${capitalProtectionTerms.capitalProtectionPct}% = $${(100000 * capitalProtectionTerms.capitalProtectionPct / 100).toLocaleString()}`,
            note: 'Protected floor - principal preserved',
          },
          {
            name: 'Final Payout (Above Participation)',
            formula: `Payout = Principal × (${capitalProtectionTerms.capitalProtectionPct}% + Participated Gain)`,
            example: `Example: $100,000 × (${capitalProtectionTerms.capitalProtectionPct}% + 15%) = $115,000`,
            note: capitalProtectionTerms.capLevelPct ? `Capped at ${capitalProtectionTerms.capLevelPct}%` : 'No cap on upside',
          },
          ...(capitalProtectionTerms.knockInEnabled && capitalProtectionTerms.knockInLevelPct ? [{
            name: 'Knock-In Breach',
            formula: `Protection Lost if: Any Stock Touches ${capitalProtectionTerms.knockInLevelPct}%`,
            example: 'Example: If breached, payout = Principal × Final Performance (1:1 loss)',
            note: '⚠️ Protection only valid if barrier never touched during life',
          }] : []),
        ],
      };
    }
    
    if (bucket === 'BOOSTED_GROWTH' && boostedGrowthTerms) {
      return {
        title: 'Boosted Growth Calculations',
        sections: [
          {
            name: 'Performance',
            formula: 'Performance % = ((Current Price / Initial Price) - 1) × 100',
            example: 'Example: ((210.75 / 185.00) - 1) × 100 = +13.92%',
          },
          {
            name: 'Barrier Level',
            formula: 'Barrier Price = Initial Price × Barrier %',
            example: `Example: $185.00 × ${boostedGrowthTerms.barrierPct}% = $${(185.00 * boostedGrowthTerms.barrierPct / 100).toFixed(2)}`,
            note: 'Must never touch this level during product life',
          },
          {
            name: 'Buffer to Barrier',
            formula: 'Buffer = (1 - Barrier Price / Current Price) × 100',
            example: 'Example: (1 - $111.00 / $210.75) × 100 = +47.3% buffer',
            note: 'Positive = Safe, Negative = Breached',
          },
          {
            name: 'Barrier Status',
            formula: 'Breached if: Any Price ≤ Barrier at Any Time',
            example: 'Continuously monitored throughout product life',
            note: 'European or American style observation per terms',
          },
          {
            name: 'Bonus Payout (Barrier Safe)',
            formula: `Payout = Principal × ${boostedGrowthTerms.bonusLevelPct}%`,
            example: `Example: $100,000 × ${boostedGrowthTerms.bonusLevelPct}% = $${(100000 * boostedGrowthTerms.bonusLevelPct / 100).toLocaleString()}`,
            note: 'Guaranteed if barrier never touched, regardless of final level',
          },
          {
            name: 'Upside Payout (Barrier Safe)',
            formula: 'Payout = Principal × max(Bonus %, Final Performance)',
            example: `Example: $100,000 × max(${boostedGrowthTerms.bonusLevelPct}%, 140%) = $140,000`,
            note: 'Investor gets higher of bonus or actual performance',
          },
          {
            name: 'Final Payout (Barrier Breached)',
            formula: `Payout = Principal × Final Performance × ${boostedGrowthTerms.participationRatePct || 100}%`,
            example: 'Example: $100,000 × 80% × 100% = $80,000 (20% loss)',
            note: '⚠️ Bonus lost - tracks underlying 1:1',
          },
        ],
      };
    }
    
    return null;
  };
  
  const calculations = getCalculations();
  
  if (!calculations) return null;
  
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-slate-300 shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/50 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-700 shadow-md">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-base text-slate-900 uppercase tracking-wide">
              How It's Calculated
            </h3>
            <p className="text-sm text-slate-600 mt-0.5">
              {calculations.title} - Formulas & Examples
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-600" />
        )}
      </button>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-4">
          {calculations.sections.map((section, idx) => (
            <div 
              key={idx}
              className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm"
            >
              {/* Section Title */}
              <div className="flex items-start gap-2 mb-3">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-slate-900">
                    {section.name}
                  </h4>
                </div>
              </div>
              
              {/* Formula */}
              <div className="mb-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Formula
                </div>
                <div className="font-mono text-sm text-slate-900 leading-relaxed">
                  {section.formula}
                </div>
              </div>
              
              {/* Example */}
              <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                  Example
                </div>
                <div className="font-mono text-sm text-blue-900 leading-relaxed">
                  {section.example}
                </div>
              </div>
              
              {/* Note */}
              {section.note && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-amber-600 font-bold mt-0.5">ℹ️</span>
                  <div className="text-xs text-amber-900 leading-relaxed">
                    {section.note}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-slate-100 rounded-lg border border-slate-300">
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong>Note:</strong> All calculations are illustrative. Actual payouts depend on final observations, 
              corporate actions, and specific product terms. Settlement type (cash vs physical delivery) 
              may affect final amounts. Consult official term sheet for precise calculation methodology.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
