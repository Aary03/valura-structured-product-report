/**
 * KPI Grid Component
 * 4 key metrics: Return Engine, Protection, Next Event, Time Remaining
 */

import type { ProductLifecycleData } from '../../types/lifecycle';
import { TrendingUp, Shield, Calendar, Clock } from 'lucide-react';
import { formatNumber } from '../../core/utils/math';

interface KPIGridProps {
  data: ProductLifecycleData;
}

export function KPIGrid({ data }: KPIGridProps) {
  const { bucket, regularIncomeTerms, capitalProtectionTerms, boostedGrowthTerms } = data;
  
  // Card 1: Return Engine
  const returnEngine = getReturnEngineContent(data);
  
  // Card 2: Protection
  const protection = getProtectionContent(data);
  
  // Card 3: Next Event
  const nextEvent = data.nextEvent || data.events.find(e => e.status === 'upcoming');
  
  // Card 4: Time Remaining
  const daysRemaining = data.daysToMaturity;
  const finalFixingDate = data.events.find(e => e.type === 'final_observation')?.date || data.maturityDate;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Return Engine */}
      <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-bold text-sm text-blue-900 uppercase tracking-wide">
            Return Engine
          </h3>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-blue-900">
            {returnEngine.value}
          </div>
          <div className="text-xs text-text-secondary leading-relaxed">
            {returnEngine.description}
          </div>
        </div>
      </div>
      
      {/* Protection */}
      <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-green-100">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-bold text-sm text-green-900 uppercase tracking-wide">
            Protection
          </h3>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-green-900">
            {protection.value}
          </div>
          <div className="text-xs text-text-secondary leading-relaxed">
            {protection.description}
          </div>
        </div>
      </div>
      
      {/* Next Event */}
      <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-purple-100">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-bold text-sm text-purple-900 uppercase tracking-wide">
            Next Event
          </h3>
        </div>
        <div className="space-y-2">
          {nextEvent ? (
            <>
              <div className="text-lg font-bold text-purple-900">
                {nextEvent.label}
              </div>
              <div className="text-xs text-text-secondary">
                {new Date(nextEvent.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              {nextEvent.description && (
                <div className="text-xs text-text-tertiary">
                  {nextEvent.description}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-purple-900">
                Maturity
              </div>
              <div className="text-xs text-text-secondary">
                {new Date(data.maturityDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Time Remaining */}
      <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-amber-100">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="font-bold text-sm text-amber-900 uppercase tracking-wide">
            Time Remaining
          </h3>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-amber-900">
            {daysRemaining} days
          </div>
          <div className="text-xs text-text-secondary leading-relaxed">
            Final fixing: {new Date(finalFixingDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
          <div className="mt-2 h-1.5 bg-amber-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all"
              style={{ width: `${Math.min(100, data.progressPct)}%` }}
            />
          </div>
          <div className="text-xs text-text-tertiary">
            {data.progressPct.toFixed(0)}% elapsed
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getReturnEngineContent(data: ProductLifecycleData): {
  value: string;
  description: string;
} {
  const { bucket, regularIncomeTerms, capitalProtectionTerms, boostedGrowthTerms } = data;
  
  if (bucket === 'REGULAR_INCOME' && regularIncomeTerms) {
    return {
      value: `${regularIncomeTerms.couponRatePct.toFixed(1)}% p.a.`,
      description: `${regularIncomeTerms.conditionalCoupon ? 'Conditional' : 'Guaranteed'} coupon paid ${regularIncomeTerms.couponFreqPerYear}x per year${regularIncomeTerms.hasAutocall ? ' + early exit' : ''}`,
    };
  }
  
  if (bucket === 'CAPITAL_PROTECTION' && capitalProtectionTerms) {
    return {
      value: `${capitalProtectionTerms.participationRatePct}%`,
      description: `Upside participation above ${capitalProtectionTerms.participationStartPct}%${capitalProtectionTerms.capLevelPct ? ` (capped at ${capitalProtectionTerms.capLevelPct}%)` : ''}`,
    };
  }
  
  if (bucket === 'BOOSTED_GROWTH' && boostedGrowthTerms) {
    return {
      value: `${boostedGrowthTerms.bonusLevelPct}%`,
      description: `Bonus return if barrier at ${boostedGrowthTerms.barrierPct}% holds throughout`,
    };
  }
  
  return {
    value: '—',
    description: 'Return structure varies by product',
  };
}

function getProtectionContent(data: ProductLifecycleData): {
  value: string;
  description: string;
} {
  const { bucket, regularIncomeTerms, capitalProtectionTerms, boostedGrowthTerms } = data;
  
  if (bucket === 'REGULAR_INCOME' && regularIncomeTerms) {
    return {
      value: `${regularIncomeTerms.protectionLevelPct}%`,
      description: 'Downside buffer before losses apply',
    };
  }
  
  if (bucket === 'CAPITAL_PROTECTION' && capitalProtectionTerms) {
    const hasKnockIn = capitalProtectionTerms.knockInEnabled && capitalProtectionTerms.knockInLevelPct;
    return {
      value: `${capitalProtectionTerms.capitalProtectionPct}%`,
      description: hasKnockIn 
        ? `Principal floor (conditional on ${capitalProtectionTerms.knockInLevelPct}% barrier)` 
        : 'Guaranteed principal floor',
    };
  }
  
  if (bucket === 'BOOSTED_GROWTH' && boostedGrowthTerms) {
    const breached = data.underlyings.some(u => u.barrierBreached);
    return {
      value: breached ? 'Breached ⚠️' : 'Active ✓',
      description: `Barrier at ${boostedGrowthTerms.barrierPct}%${breached ? ' — protection lost' : ' — bonus protected'}`,
    };
  }
  
  return {
    value: '—',
    description: 'Protection varies by product',
  };
}
