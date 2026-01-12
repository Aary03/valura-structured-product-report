/**
 * AI-Enhanced Scenario Card
 * Each scenario gets AI-powered explanation
 * Maximizes OpenAI usage for investor education
 */

import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { PositionSnapshot } from '../../services/positionEvaluator';
import { generateScenarioExplanation } from '../../services/aiScenarioExplainer';

interface AIEnhancedScenarioCardProps {
  scenarioName: string;
  level: number;
  emoji: string;
  snapshot: PositionSnapshot;
  currency: string;
  color: string;
}

export function AIEnhancedScenarioCard({
  scenarioName,
  level,
  emoji,
  snapshot,
  currency,
  color,
}: AIEnhancedScenarioCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const isProfit = snapshot.netPnL >= 0;
  const isBreached = snapshot.riskStatus === 'TRIGGERED';

  const loadAIInsight = async () => {
    if (aiInsight) {
      setExpanded(!expanded);
      return;
    }

    setLoadingAI(true);
    setExpanded(true);

    try {
      const insight = await generateScenarioExplanation({
        scenarioName,
        level,
        snapshot,
      });
      setAiInsight(insight);
    } catch (error) {
      console.error('Failed to generate AI insight:', error);
      setAiInsight('AI analysis temporarily unavailable.');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
        color === 'emerald' 
          ? 'bg-gradient-to-br from-emerald-50 via-green-100 to-teal-50 border-emerald-400' 
          : color === 'green'
          ? 'bg-gradient-to-br from-green-50 via-emerald-100 to-green-50 border-green-400'
          : color === 'gray'
          ? 'bg-gradient-to-br from-gray-50 via-slate-100 to-gray-50 border-gray-300'
          : color === 'orange'
          ? 'bg-gradient-to-br from-orange-50 via-amber-100 to-orange-50 border-orange-400'
          : 'bg-gradient-to-br from-red-50 via-rose-100 to-red-50 border-red-500'
      } ${expanded ? 'shadow-2xl scale-105' : 'shadow-lg hover:shadow-xl hover:scale-102'}`}
    >
      {/* Main Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-5xl mb-2">{emoji}</div>
            <div className="text-lg font-bold text-valura-ink mb-1">{scenarioName}</div>
            <div className="text-sm text-muted">Level: {(level * 100).toFixed(0)}%</div>
          </div>
          {isBreached && (
            <div className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold animate-pulse">
              BREACHED
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-4">
          <div className="text-4xl font-black text-valura-ink mb-2">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(snapshot.indicativeOutcomeValue)}
          </div>
          <div className={`text-xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
            {isProfit ? '+' : ''}{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(snapshot.netPnL)}
            <span className="ml-2 text-lg">({snapshot.netPnLPct >= 0 ? '+' : ''}{snapshot.netPnLPct.toFixed(1)}%)</span>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
            snapshot.settlement.type === 'cash'
              ? 'bg-green-500/20 text-green-700 border border-green-400'
              : 'bg-orange-500/20 text-orange-700 border border-orange-400'
          }`}>
            {snapshot.settlement.type === 'cash' ? '💵 Cash' : '📊 Physical'}
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
            snapshot.riskStatus === 'SAFE' ? 'bg-green-500 text-white' :
            snapshot.riskStatus === 'WATCH' ? 'bg-yellow-500 text-white' :
            'bg-red-500 text-white'
          }`}>
            {snapshot.riskStatus}
          </div>
        </div>

        {/* AI Insight Toggle */}
        <button
          onClick={loadAIInsight}
          className="w-full flex items-center justify-between px-4 py-3 bg-purple-100 hover:bg-purple-200 rounded-xl transition-all border border-purple-300"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">
              {loadingAI ? 'Generating AI insights...' : 'AI Explanation'}
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-purple-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-purple-600" />
          )}
        </button>
      </div>

      {/* Expanded AI Content */}
      {expanded && (
        <div className="px-6 pb-6 border-t-2 border-purple-200 bg-purple-50/50">
          <div className="pt-4 space-y-3">
            {loadingAI ? (
              <div className="text-center py-4">
                <Sparkles className="w-6 h-6 text-purple-500 animate-spin mx-auto mb-2" />
                <div className="text-sm text-purple-600">AI analyzing scenario...</div>
              </div>
            ) : aiInsight ? (
              <>
                <div className="text-sm text-purple-900 leading-relaxed">
                  {aiInsight}
                </div>
                
                {/* Physical Delivery Details */}
                {snapshot.settlement.shares && snapshot.settlement.shares.length > 0 && (
                  <div className="mt-3 p-3 bg-orange-100 rounded-lg border border-orange-300">
                    <div className="text-xs font-semibold text-orange-700 mb-2">Physical Delivery:</div>
                    {snapshot.settlement.shares.map((share, idx) => (
                      <div key={idx} className="text-sm text-orange-900">
                        {share.quantity.toLocaleString()} shares of {share.symbol} @ {
                          new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(share.currentPrice)
                        } = {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(share.marketValue)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Disclaimer */}
                <div className="text-xs text-purple-600 italic mt-2">
                  <Info className="w-3 h-3 inline mr-1" />
                  Educational explanation only. Not investment advice.
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
