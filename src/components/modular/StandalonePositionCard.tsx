/**
 * Standalone Position Value Card
 * 
 * MODULAR & SELF-CONTAINED - Drop into any page!
 * 
 * Usage in Valura lifecycle page:
 * <StandalonePositionCard
 *   position={investmentData}
 *   marketPrices={currentPrices}
 * />
 * 
 * Shows: Current value if settled today + beautiful scenario grid
 */

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Info, Zap, AlertTriangle, DollarSign } from 'lucide-react';
import type { InvestmentPosition } from '../../types/investment';
import { evaluatePosition, type PositionSnapshot } from '../../services/positionEvaluator';
import { generateAIExplanation, generateScenarioInsights, type AIExplanation } from '../../services/aiExplainer';

interface StandalonePositionCardProps {
  position: InvestmentPosition;
  marketPrices: number[]; // Current prices for underlyings
  className?: string;
  showAI?: boolean; // Toggle AI explanations
}

export function StandalonePositionCard({
  position,
  marketPrices,
  className = '',
  showAI = true,
}: StandalonePositionCardProps) {
  const currency = position.productTerms.currency;
  const [currentSnapshot, setCurrentSnapshot] = useState<PositionSnapshot | null>(null);
  const [scenarios, setScenarios] = useState<Array<{ name: string; snapshot: PositionSnapshot }>>([]);
  const [aiExplanation, setAiExplanation] = useState<AIExplanation | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Calculate current value and scenarios
  useEffect(() => {
    const marketData = {
      underlyingPrices: marketPrices,
      timestamp: new Date(),
    };

    // Current snapshot
    const current = evaluatePosition(position, marketData, {});
    setCurrentSnapshot(current);

    // Generate 6 maturity scenarios
    const scenarioLevels = [
      { name: 'Strong Rally', level: 1.30, emoji: '📈📈', color: 'emerald' },
      { name: 'Moderate Gain', level: 1.15, emoji: '📈', color: 'green' },
      { name: 'Flat', level: 1.00, emoji: '➡️', color: 'gray' },
      { name: 'Moderate Loss', level: 0.85, emoji: '📉', color: 'orange' },
      { name: 'Near Barrier', level: 0.72, emoji: '⚠️', color: 'orange' },
      { name: 'Deep Loss', level: 0.50, emoji: '📉📉', color: 'red' },
    ];

    const evaluatedScenarios = scenarioLevels.map(s => ({
      ...s,
      snapshot: evaluatePosition(position, marketData, {
        assumeMaturityToday: true,
        overrideWorstOfLevel: s.level,
      }),
    }));

    setScenarios(evaluatedScenarios);

    // Generate AI explanation
    if (showAI) {
      generateAIForPosition(current, evaluatedScenarios);
    }
  }, [position, marketPrices, showAI]);

  // AI explanation generator
  const generateAIForPosition = async (
    current: PositionSnapshot,
    scenarios: any[]
  ) => {
    setLoadingAI(true);
    try {
      const explanation = await generateAIExplanation({
        productType: position.productTerms.productType,
        currentSnapshot: current,
        scenarios: scenarios.map(s => s.snapshot),
        position,
      });
      setAiExplanation(explanation);
    } catch (error) {
      console.error('AI explanation failed:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  if (!currentSnapshot) {
    return (
      <div className={`section-card ${className}`}>
        <div className="text-center py-8 text-muted">Calculating position value...</div>
      </div>
    );
  }

  const isProfit = currentSnapshot.netPnL >= 0;

  return (
    <div className={`${className}`}>
      {/* HERO: If Settled Today Value */}
      <div className={`relative overflow-hidden rounded-2xl p-8 shadow-2xl ${
        isProfit 
          ? 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600' 
          : 'bg-gradient-to-br from-red-500 via-rose-600 to-pink-600'
      } text-white`}>
        
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10">
          {/* Label */}
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
              <Info className="w-4 h-4" />
              <span className="text-xs font-semibold">
                Indicative Value If Settled Today
              </span>
            </div>
            {showAI && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/30 backdrop-blur-sm rounded-lg">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">AI Enhanced</span>
              </div>
            )}
          </div>

          {/* Main Value */}
          <div className="mb-6">
            <div className="text-7xl font-black mb-3">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(currentSnapshot.indicativeOutcomeValue)}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                {isProfit ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
                <span className="text-3xl font-bold">
                  {currentSnapshot.netPnLPct >= 0 ? '+' : ''}{currentSnapshot.netPnLPct.toFixed(2)}%
                </span>
              </div>
              <div className="text-2xl font-semibold opacity-90">
                {currentSnapshot.netPnL >= 0 ? '+' : ''}
                {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency 
                }).format(currentSnapshot.netPnL)}
              </div>
            </div>
          </div>

          {/* Quick Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xs opacity-80 mb-1">Invested</div>
              <div className="text-lg font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(currentSnapshot.invested)}
              </div>
            </div>
            
            {currentSnapshot.couponsReceived > 0 && (
              <div className="bg-green-400/20 backdrop-blur-sm rounded-lg p-3 border border-green-300/30">
                <div className="text-xs opacity-80 mb-1">Coupons</div>
                <div className="text-lg font-bold">
                  +{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(currentSnapshot.couponsReceived)}
                </div>
              </div>
            )}
            
            <div className={`backdrop-blur-sm rounded-lg p-3 border ${
              isProfit ? 'bg-green-400/20 border-green-300/30' : 'bg-red-400/20 border-red-300/30'
            }`}>
              <div className="text-xs opacity-80 mb-1">Settlement</div>
              <div className="text-lg font-semibold">
                {currentSnapshot.settlement.type === 'cash' ? '💵 Cash' : '📊 Shares'}
              </div>
            </div>
          </div>

          {/* Risk Status Badge */}
          <div className="mt-6 flex items-center justify-between">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
              currentSnapshot.riskStatus === 'SAFE' ? 'bg-green-500' :
              currentSnapshot.riskStatus === 'WATCH' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}>
              {currentSnapshot.riskStatus}
            </div>

            <div className="text-xs opacity-75 text-right">
              Rule-based calculation • Not a market price
              <br />
              Data as of {currentSnapshot.dataFreshness.pricesAsOf.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* AI EXPLANATION (if enabled) */}
      {showAI && aiExplanation && (
        <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-purple-700">AI Insights</h4>
              <p className="text-xs text-muted">Powered by GPT-4</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Headline */}
            <div className="bg-white/60 rounded-lg p-4">
              <div className="text-sm font-semibold text-purple-700 mb-2">📊 Current Position</div>
              <div className="text-base text-valura-ink">{aiExplanation.headline}</div>
            </div>

            {/* What Changed */}
            {aiExplanation.whatChanged && (
              <div className="bg-white/60 rounded-lg p-4">
                <div className="text-sm font-semibold text-blue-700 mb-2">🔄 Recent Changes</div>
                <div className="text-sm text-valura-ink">{aiExplanation.whatChanged}</div>
              </div>
            )}

            {/* What to Watch */}
            <div className="bg-white/60 rounded-lg p-4">
              <div className="text-sm font-semibold text-orange-700 mb-2">👀 What to Watch</div>
              <div className="text-sm text-valura-ink">{aiExplanation.whatToWatch}</div>
            </div>

            {/* Scenario Insights */}
            {aiExplanation.scenarioInsights && (
              <div className="bg-white/60 rounded-lg p-4">
                <div className="text-sm font-semibold text-green-700 mb-2">🎯 Scenario Analysis</div>
                <div className="text-sm text-valura-ink whitespace-pre-line">{aiExplanation.scenarioInsights}</div>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-purple-600">
            <Info className="w-3 h-3 inline mr-1" />
            AI provides educational insights only. Not investment advice. No forecasts or recommendations.
          </div>
        </div>
      )}

      {showAI && loadingAI && (
        <div className="mt-4 bg-purple-50 rounded-xl p-6 text-center">
          <div className="animate-pulse flex items-center justify-center gap-2 text-purple-600">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span className="font-semibold">Generating AI insights...</span>
          </div>
        </div>
      )}

      {/* SCENARIO GRID */}
      <div className="mt-6 bg-white rounded-2xl shadow-xl border-2 border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-valura-ink">If It Matures Today</h3>
            <p className="text-sm text-muted">See outcomes under different market scenarios</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">Live Calculation</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {scenarios.map((scenario, idx) => {
            const isProfit = scenario.snapshot.netPnL >= 0;
            const isBreached = scenario.snapshot.riskStatus === 'TRIGGERED';

            return (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-xl border-2 p-5 transition-all hover:scale-105 hover:shadow-2xl cursor-pointer ${
                  scenario.color === 'emerald' 
                    ? 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-400' 
                    : scenario.color === 'green'
                    ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-400'
                    : scenario.color === 'gray'
                    ? 'bg-gradient-to-br from-gray-50 to-slate-100 border-gray-300'
                    : scenario.color === 'orange'
                    ? 'bg-gradient-to-br from-orange-50 to-red-100 border-orange-400'
                    : 'bg-gradient-to-br from-red-50 to-rose-100 border-red-500'
                }`}
              >
                {isBreached && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Emoji */}
                <div className="text-4xl mb-3">{scenario.emoji}</div>

                {/* Scenario Name */}
                <div className="text-sm font-bold text-valura-ink mb-1">
                  {scenario.name}
                </div>
                <div className="text-xs text-muted mb-3">
                  Level: {(scenario.level * 100).toFixed(0)}%
                </div>

                {/* Value */}
                <div className="text-3xl font-black text-valura-ink mb-2">
                  {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency,
                    minimumFractionDigits: 0 
                  }).format(scenario.snapshot.indicativeOutcomeValue)}
                </div>

                {/* P&L */}
                <div className={`text-lg font-bold mb-2 ${
                  isProfit ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isProfit ? '+' : ''}{new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency 
                  }).format(scenario.snapshot.netPnL)}
                </div>
                <div className={`text-sm font-semibold ${
                  isProfit ? 'text-green-600' : 'text-red-600'
                }`}>
                  {scenario.snapshot.netPnLPct >= 0 ? '+' : ''}{scenario.snapshot.netPnLPct.toFixed(1)}%
                </div>

                {/* Settlement Badge */}
                <div className={`mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  scenario.snapshot.settlement.type === 'cash'
                    ? 'bg-green-500/20 text-green-700 border border-green-400'
                    : 'bg-orange-500/20 text-orange-700 border border-orange-400'
                }`}>
                  {scenario.snapshot.settlement.type === 'cash' ? '💵 Cash' : '📊 Shares'}
                </div>

                {/* AI Mini-Insight (if available) */}
                {showAI && aiExplanation?.scenarioInsights && (
                  <div className="mt-3 text-xs text-muted italic">
                    "{scenario.snapshot.reasonText.substring(0, 80)}..."
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-border text-xs text-muted text-center">
          <strong>Note:</strong> These are rule-based calculations showing hypothetical outcomes if the product 
          settled today at different basket levels. Not secondary market quotes. Actual settlement only occurs at maturity.
        </div>
      </div>

      {/* Current Explanation */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-blue-700 mb-2">Why This Value?</div>
            <div className="text-sm text-blue-900">
              {currentSnapshot.reasonText}
            </div>
            <div className="text-xs text-muted mt-2">
              Methodology: {currentSnapshot.methodologyDisclosure}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
