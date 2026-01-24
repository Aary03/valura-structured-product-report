/**
 * Timeline Progress Bar Component
 * Visual journey: Invested → Initial Fixing → Next Event → Maturity → Settlement
 */

import type { ProductLifecycleData } from '../../types/lifecycle';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface TimelineBarProps {
  data: ProductLifecycleData;
}

export function TimelineBar({ data }: TimelineBarProps) {
  const now = new Date();
  const tradeDate = new Date(data.tradeDate);
  const initialFixing = new Date(data.initialFixingDate);
  const maturity = new Date(data.maturityDate);
  const settlement = new Date(data.settlementDate);
  
  // Find next upcoming event
  const nextEvent = data.nextEvent;
  
  // Timeline milestones
  const milestones = [
    {
      label: 'Invested',
      date: tradeDate,
      status: 'completed' as const,
      icon: CheckCircle2,
    },
    {
      label: 'Initial Fixing',
      date: initialFixing,
      status: now >= initialFixing ? ('completed' as const) : ('pending' as const),
      icon: now >= initialFixing ? CheckCircle2 : Circle,
    },
    {
      label: nextEvent?.label || 'Next Event',
      date: nextEvent ? new Date(nextEvent.date) : maturity,
      status: nextEvent ? ('upcoming' as const) : ('pending' as const),
      icon: Clock,
      isHighlight: true,
    },
    {
      label: 'Maturity',
      date: maturity,
      status: now >= maturity ? ('completed' as const) : ('pending' as const),
      icon: now >= maturity ? CheckCircle2 : Circle,
    },
    {
      label: 'Settlement',
      date: settlement,
      status: now >= settlement ? ('completed' as const) : ('pending' as const),
      icon: now >= settlement ? CheckCircle2 : Circle,
    },
  ];
  
  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <h3 className="font-bold text-base text-text-primary mb-6 uppercase tracking-wide">
        Product Journey
      </h3>
      
      {/* Timeline */}
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-border" style={{ zIndex: 0 }} />
        <div 
          className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ 
            width: `${Math.min(100, data.progressPct)}%`,
            zIndex: 1,
          }}
        />
        
        {/* Milestones */}
        <div className="relative flex justify-between" style={{ zIndex: 2 }}>
          {milestones.map((milestone, idx) => {
            const Icon = milestone.icon;
            const isCompleted = milestone.status === 'completed';
            const isUpcoming = milestone.status === 'upcoming' || milestone.isHighlight;
            const isPending = milestone.status === 'pending';
            
            const iconColor = isCompleted 
              ? 'text-green-600' 
              : isUpcoming 
                ? 'text-purple-600' 
                : 'text-gray-400';
            
            const bgColor = isCompleted 
              ? 'bg-green-100 border-green-500' 
              : isUpcoming 
                ? 'bg-purple-100 border-purple-500 ring-4 ring-purple-200' 
                : 'bg-gray-50 border-gray-300';
            
            return (
              <div key={idx} className="flex flex-col items-center" style={{ flex: 1 }}>
                <div 
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${bgColor} mb-3 transition-all`}
                >
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div className="text-center">
                  <div className={`text-xs font-bold mb-1 ${isUpcoming ? 'text-purple-900' : 'text-text-primary'}`}>
                    {milestone.label}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {milestone.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  {isUpcoming && (
                    <div className="mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      Upcoming
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Progress percentage */}
      <div className="mt-6 text-center text-sm text-text-secondary">
        <span className="font-semibold text-text-primary">{data.progressPct.toFixed(1)}%</span> of product life elapsed
      </div>
    </div>
  );
}

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
