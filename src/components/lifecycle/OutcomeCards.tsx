/**
 * Outcome Cards Component
 * 3 scenario cards explaining payoff logic per product type
 */

import type { ProductLifecycleData } from '../../types/lifecycle';
import { TrendingUp, Shield, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface OutcomeCardsProps {
  data: ProductLifecycleData;
}

export function OutcomeCards({ data }: OutcomeCardsProps) {
  const { bucket, regularIncomeTerms, capitalProtectionTerms, boostedGrowthTerms } = data;
  
  // Build scenarios based on bucket
  const scenarios = getScenarios(data);
  
  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <h3 className="font-bold text-base text-text-primary mb-4 uppercase tracking-wide">
        How This Works: Outcome Scenarios
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario, idx) => {
          const Icon = scenario.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-xl border-2 transition-all hover:shadow-lg ${scenario.borderColor} ${scenario.bgColor}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${scenario.iconBg}`}>
                  <Icon className={`w-5 h-5 ${scenario.iconColor}`} />
                </div>
                <h4 className={`font-bold text-sm uppercase tracking-wide ${scenario.textColor}`}>
                  {scenario.title}
                </h4>
              </div>
              
              <ul className="space-y-2 mb-4">
                {scenario.points.map((point, pidx) => (
                  <li key={pidx} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className={`${scenario.textColor} mt-0.5 font-bold`}>•</span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
              
              {scenario.example && (
                <div className={`mt-4 p-3 rounded-lg ${scenario.exampleBg} border ${scenario.exampleBorder}`}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-80">
                    Example
                  </div>
                  <div className="text-sm leading-relaxed">
                    {scenario.example}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// SCENARIO BUILDERS
// ============================================================================

interface Scenario {
  title: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  exampleBg: string;
  exampleBorder: string;
  points: string[];
  example?: string;
}

function getScenarios(data: ProductLifecycleData): Scenario[] {
  const { bucket, regularIncomeTerms, capitalProtectionTerms, boostedGrowthTerms } = data;
  
  if (bucket === 'REGULAR_INCOME' && regularIncomeTerms) {
    const couponRate = regularIncomeTerms.couponRatePct;
    const protection = regularIncomeTerms.protectionLevelPct;
    const hasAutocall = regularIncomeTerms.hasAutocall;
    const autocallLevel = regularIncomeTerms.autocallLevelPct || 100;
    
    return [
      {
        title: '🎯 Best Case: Autocall',
        icon: Zap,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
        bgColor: 'bg-green-50',
        exampleBg: 'bg-green-100/50',
        exampleBorder: 'border-green-200',
        points: hasAutocall
          ? [
              `Stocks rise above ${autocallLevel}% at any observation`,
              `Product terminates early (autocall)`,
              `You receive coupons earned + principal`,
              `Exit early with full returns locked in`,
            ]
          : [
              `Stocks perform well throughout`,
              `Receive all scheduled coupons`,
              `Get principal back at maturity`,
              `Total return = all coupons earned`,
            ],
        example: hasAutocall
          ? `If stocks hit ${autocallLevel}% after 6 months, you get 6mo coupons + $100k principal`
          : `Earn ${couponRate}% p.a. for full term + principal`,
      },
      {
        title: '📊 Neutral: Coupons Earned',
        icon: CheckCircle,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
        bgColor: 'bg-blue-50',
        exampleBg: 'bg-blue-100/50',
        exampleBorder: 'border-blue-200',
        points: [
          `Stocks finish above ${protection}% (protection level)`,
          regularIncomeTerms.conditionalCoupon
            ? `Coupons paid only if barrier not breached at obs`
            : `All coupons received as scheduled`,
          `Principal returned in full`,
          `Positive return from coupons alone`,
        ],
        example: `Stocks at ${protection + 5}% at maturity → you keep all coupons + principal`,
      },
      {
        title: '⚠️ Downside: Below Protection',
        icon: AlertTriangle,
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-100',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-300',
        bgColor: 'bg-amber-50',
        exampleBg: 'bg-amber-100/50',
        exampleBorder: 'border-amber-200',
        points: [
          `Stocks fall below ${protection}% (protection level)`,
          `Protection buffer exhausted`,
          `You receive physical shares or cash equivalent`,
          `Loss mirrors underlying drop below ${protection}%`,
        ],
        example: `If stocks drop to ${protection - 20}%, you lose ~${20}% (plus any coupons earned offset loss)`,
      },
    ];
  }
  
  if (bucket === 'CAPITAL_PROTECTION' && capitalProtectionTerms) {
    const floor = capitalProtectionTerms.capitalProtectionPct;
    const partStart = capitalProtectionTerms.participationStartPct;
    const partRate = capitalProtectionTerms.participationRatePct;
    const hasCap = capitalProtectionTerms.capLevelPct != null;
    const cap = capitalProtectionTerms.capLevelPct || 150;
    const hasKnockIn = capitalProtectionTerms.knockInEnabled;
    const knockIn = capitalProtectionTerms.knockInLevelPct || 70;
    
    return [
      {
        title: '🚀 Best Case: Upside Captured',
        icon: TrendingUp,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
        bgColor: 'bg-green-50',
        exampleBg: 'bg-green-100/50',
        exampleBorder: 'border-green-200',
        points: [
          `Stocks rise above ${partStart}% (participation start)`,
          `You capture ${partRate}% of the upside`,
          hasCap ? `Gains capped at ${cap}%` : `Unlimited upside potential`,
          `Principal fully protected at ${floor}%`,
        ],
        example: hasCap
          ? `Stocks up 40% → you get ${floor + (40 - partStart + 100) * (partRate / 100)}% (participation + floor)`
          : `Stocks up 40% → you get ${floor + (40) * (partRate / 100)}% return`,
      },
      {
        title: '🛡️ Neutral: Principal Protected',
        icon: Shield,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
        bgColor: 'bg-blue-50',
        exampleBg: 'bg-blue-100/50',
        exampleBorder: 'border-blue-200',
        points: [
          `Stocks finish flat or slightly down`,
          `Below participation start (${partStart}%)`,
          `Principal protected at ${floor}%`,
          hasKnockIn ? `Protection holds if barrier at ${knockIn}% never touched` : `Guaranteed floor`,
        ],
        example: `Stocks down 10% → you still get ${floor}% of principal back`,
      },
      {
        title: hasKnockIn ? '⚠️ Knock-In: Protection Removed' : '💼 Downside: No Gain',
        icon: hasKnockIn ? AlertTriangle : Minus,
        iconColor: hasKnockIn ? 'text-amber-600' : 'text-gray-600',
        iconBg: hasKnockIn ? 'bg-amber-100' : 'bg-gray-100',
        textColor: hasKnockIn ? 'text-amber-700' : 'text-gray-700',
        borderColor: hasKnockIn ? 'border-amber-300' : 'border-gray-300',
        bgColor: hasKnockIn ? 'bg-amber-50' : 'bg-gray-50',
        exampleBg: hasKnockIn ? 'bg-amber-100/50' : 'bg-gray-100/50',
        exampleBorder: hasKnockIn ? 'border-amber-200' : 'border-gray-200',
        points: hasKnockIn
          ? [
              `Stocks touch ${knockIn}% barrier during product life`,
              `Principal protection removed`,
              `You participate 1:1 in further losses`,
              `Full downside exposure below ${knockIn}%`,
            ]
          : [
              `Stocks don't rise enough to participate`,
              `Finish below ${partStart}% start level`,
              `You get ${floor}% principal back`,
              `No gain, but protected from loss`,
            ],
        example: hasKnockIn
          ? `Barrier breached → stocks at ${knockIn - 10}% → you get ~${knockIn - 10}% of principal`
          : `Stocks up 5% (below ${partStart}% start) → return is ${floor}%`,
      },
    ];
  }
  
  if (bucket === 'BOOSTED_GROWTH' && boostedGrowthTerms) {
    const bonus = boostedGrowthTerms.bonusLevelPct;
    const barrier = boostedGrowthTerms.barrierPct;
    const partRate = boostedGrowthTerms.participationRatePct || 100;
    
    return [
      {
        title: '🎁 Best Case: Bonus Payout',
        icon: Zap,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
        bgColor: 'bg-green-50',
        exampleBg: 'bg-green-100/50',
        exampleBorder: 'border-green-200',
        points: [
          `Barrier at ${barrier}% never breached during product life`,
          `You receive guaranteed ${bonus}% bonus payout`,
          `Doesn't matter if stocks finish flat, up, or slightly down`,
          `Bonus protected as long as barrier holds`,
        ],
        example: `Stocks finish at 95% (above ${barrier}% barrier) → you get ${bonus}% return`,
      },
      {
        title: '📈 Upside: Bonus + Growth',
        icon: TrendingUp,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
        bgColor: 'bg-blue-50',
        exampleBg: 'bg-blue-100/50',
        exampleBorder: 'border-blue-200',
        points: [
          `Stocks rise significantly above bonus level`,
          `Barrier never breached`,
          `You get the higher of: ${bonus}% bonus OR actual stock performance`,
          `Unlimited upside potential`,
        ],
        example: `Stocks up 40% (barrier safe) → you get 40% return (better than ${bonus}% bonus)`,
      },
      {
        title: '⚠️ Barrier Breached',
        icon: AlertTriangle,
        iconColor: 'text-red-600',
        iconBg: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-300',
        bgColor: 'bg-red-50',
        exampleBg: 'bg-red-100/50',
        exampleBorder: 'border-red-200',
        points: [
          `Stocks touch or fall below ${barrier}% barrier`,
          `Bonus payout no longer applies`,
          `Payoff tracks underlying ${partRate}:1`,
          `Full downside exposure like owning stocks`,
        ],
        example: `Barrier breached → stocks finish at ${barrier - 20}% → you lose ~${20}%`,
      },
    ];
  }
  
  return {
    title: 'Scenarios vary by product',
    icon: Shield,
    iconColor: 'text-gray-600',
    iconBg: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    bgColor: 'bg-gray-50',
    exampleBg: 'bg-gray-100/50',
    exampleBorder: 'border-gray-200',
    points: ['Product structure determines outcome'],
    example: 'Consult product terms for details',
  };
}

function getScenarios(data: ProductLifecycleData): Scenario[] {
  const { bucket, regularIncomeTerms, capitalProtectionTerms, boostedGrowthTerms } = data;
  
  if (bucket === 'REGULAR_INCOME' && regularIncomeTerms) {
    const couponRate = regularIncomeTerms.couponRatePct;
    const protection = regularIncomeTerms.protectionLevelPct;
    const hasAutocall = regularIncomeTerms.hasAutocall;
    const autocallLevel = regularIncomeTerms.autocallLevelPct || 100;
    
    return [
      {
        title: '🎯 Best Case: Autocall',
        icon: Zap,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
        bgColor: 'bg-green-50',
        exampleBg: 'bg-green-100/50',
        exampleBorder: 'border-green-200',
        points: hasAutocall
          ? [
              `Stocks rise above ${autocallLevel}% at any observation`,
              `Product terminates early (autocall)`,
              `You receive coupons earned + principal`,
              `Exit early with full returns locked in`,
            ]
          : [
              `Stocks perform well throughout`,
              `Receive all scheduled coupons`,
              `Get principal back at maturity`,
              `Total return = all coupons earned`,
            ],
        example: hasAutocall
          ? `If stocks hit ${autocallLevel}% after 6 months, you get 6mo coupons + $100k principal`
          : `Earn ${couponRate}% p.a. for full term + principal`,
      },
      {
        title: '📊 Neutral: Coupons Earned',
        icon: CheckCircle,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
        bgColor: 'bg-blue-50',
        exampleBg: 'bg-blue-100/50',
        exampleBorder: 'border-blue-200',
        points: [
          `Stocks finish above ${protection}% (protection level)`,
          regularIncomeTerms.conditionalCoupon
            ? `Coupons paid only if barrier not breached at obs`
            : `All coupons received as scheduled`,
          `Principal returned in full`,
          `Positive return from coupons alone`,
        ],
        example: `Stocks at ${protection + 5}% at maturity → you keep all coupons + principal`,
      },
      {
        title: '⚠️ Downside: Below Protection',
        icon: AlertTriangle,
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-100',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-300',
        bgColor: 'bg-amber-50',
        exampleBg: 'bg-amber-100/50',
        exampleBorder: 'border-amber-200',
        points: [
          `Stocks fall below ${protection}% (protection level)`,
          `Protection buffer exhausted`,
          `You receive physical shares or cash equivalent`,
          `Loss mirrors underlying drop below ${protection}%`,
        ],
        example: `If stocks drop to ${protection - 20}%, you lose ~${20}% (plus any coupons earned offset loss)`,
      },
    ];
  }
  
  if (bucket === 'CAPITAL_PROTECTION' && capitalProtectionTerms) {
    const floor = capitalProtectionTerms.capitalProtectionPct;
    const partStart = capitalProtectionTerms.participationStartPct;
    const partRate = capitalProtectionTerms.participationRatePct;
    const hasCap = capitalProtectionTerms.capLevelPct != null;
    const cap = capitalProtectionTerms.capLevelPct || 150;
    const hasKnockIn = capitalProtectionTerms.knockInEnabled;
    const knockIn = capitalProtectionTerms.knockInLevelPct || 70;
    
    return [
      {
        title: '🚀 Best Case: Upside Captured',
        icon: TrendingUp,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
        bgColor: 'bg-green-50',
        exampleBg: 'bg-green-100/50',
        exampleBorder: 'border-green-200',
        points: [
          `Stocks rise above ${partStart}% (participation start)`,
          `You capture ${partRate}% of the upside`,
          hasCap ? `Gains capped at ${cap}%` : `Unlimited upside potential`,
          `Principal fully protected at ${floor}%`,
        ],
        example: hasCap
          ? `Stocks up 40% → you get ${floor + (40 - partStart + 100) * (partRate / 100)}% (participation + floor)`
          : `Stocks up 40% → you get ${floor + (40) * (partRate / 100)}% return`,
      },
      {
        title: '🛡️ Neutral: Principal Protected',
        icon: Shield,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
        bgColor: 'bg-blue-50',
        exampleBg: 'bg-blue-100/50',
        exampleBorder: 'border-blue-200',
        points: [
          `Stocks finish flat or slightly down`,
          `Below participation start (${partStart}%)`,
          `Principal protected at ${floor}%`,
          hasKnockIn ? `Protection holds if barrier at ${knockIn}% never touched` : `Guaranteed floor`,
        ],
        example: `Stocks down 10% → you still get ${floor}% of principal back`,
      },
      {
        title: hasKnockIn ? '⚠️ Knock-In: Protection Removed' : '💼 Downside: No Gain',
        icon: hasKnockIn ? AlertTriangle : Minus,
        iconColor: hasKnockIn ? 'text-amber-600' : 'text-gray-600',
        iconBg: hasKnockIn ? 'bg-amber-100' : 'bg-gray-100',
        textColor: hasKnockIn ? 'text-amber-700' : 'text-gray-700',
        borderColor: hasKnockIn ? 'border-amber-300' : 'border-gray-300',
        bgColor: hasKnockIn ? 'bg-amber-50' : 'bg-gray-50',
        exampleBg: hasKnockIn ? 'bg-amber-100/50' : 'bg-gray-100/50',
        exampleBorder: hasKnockIn ? 'border-amber-200' : 'border-gray-200',
        points: hasKnockIn
          ? [
              `Stocks touch ${knockIn}% barrier during product life`,
              `Principal protection removed`,
              `You participate 1:1 in further losses`,
              `Full downside exposure below ${knockIn}%`,
            ]
          : [
              `Stocks don't rise enough to participate`,
              `Finish below ${partStart}% start level`,
              `You get ${floor}% principal back`,
              `No gain, but protected from loss`,
            ],
        example: hasKnockIn
          ? `Barrier breached → stocks at ${knockIn - 10}% → you get ~${knockIn - 10}% of principal`
          : `Stocks up 5% (below ${partStart}% start) → return is ${floor}%`,
      },
    ];
  }
  
  if (bucket === 'BOOSTED_GROWTH' && boostedGrowthTerms) {
    const bonus = boostedGrowthTerms.bonusLevelPct;
    const barrier = boostedGrowthTerms.barrierPct;
    const partRate = boostedGrowthTerms.participationRatePct || 100;
    
    return [
      {
        title: '🎁 Best Case: Bonus Payout',
        icon: Zap,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
        bgColor: 'bg-green-50',
        exampleBg: 'bg-green-100/50',
        exampleBorder: 'border-green-200',
        points: [
          `Barrier at ${barrier}% never breached during product life`,
          `You receive guaranteed ${bonus}% bonus payout`,
          `Doesn't matter if stocks finish flat, up, or slightly down`,
          `Bonus protected as long as barrier holds`,
        ],
        example: `Stocks finish at 95% (above ${barrier}% barrier) → you get ${bonus}% return`,
      },
      {
        title: '📈 Upside: Bonus + Growth',
        icon: TrendingUp,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
        bgColor: 'bg-blue-50',
        exampleBg: 'bg-blue-100/50',
        exampleBorder: 'border-blue-200',
        points: [
          `Stocks rise significantly above bonus level`,
          `Barrier never breached`,
          `You get the higher of: ${bonus}% bonus OR actual stock performance`,
          `Unlimited upside potential`,
        ],
        example: `Stocks up 40% (barrier safe) → you get 40% return (better than ${bonus}% bonus)`,
      },
      {
        title: '⚠️ Barrier Breached',
        icon: AlertTriangle,
        iconColor: 'text-red-600',
        iconBg: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-300',
        bgColor: 'bg-red-50',
        exampleBg: 'bg-red-100/50',
        exampleBorder: 'border-red-200',
        points: [
          `Stocks touch or fall below ${barrier}% barrier`,
          `Bonus payout no longer applies`,
          `Payoff tracks underlying ${partRate}:1`,
          `Full downside exposure like owning stocks`,
        ],
        example: `Barrier breached → stocks finish at ${barrier - 20}% → you lose ~${20}%`,
      },
    ];
  }
  
  // Fallback
  return [
    {
      title: 'Scenario 1',
      icon: Shield,
      iconColor: 'text-gray-600',
      iconBg: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
      bgColor: 'bg-gray-50',
      exampleBg: 'bg-gray-100/50',
      exampleBorder: 'border-gray-200',
      points: ['Outcome depends on product structure'],
    },
  ];
}
