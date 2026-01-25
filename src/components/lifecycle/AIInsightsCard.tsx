/**
 * AI Insights Card Component
 * Displays GPT-powered lifecycle analysis
 */

import { useState, useEffect } from 'react';
import type { ProductLifecycleData } from '../../types/lifecycle';
import { generateLifecycleInsights, type LifecycleInsight, getCachedLifecycleInsights, clearInsightsCache } from '../../services/lifecycleData';
import { Sparkles, AlertCircle, Eye, TrendingUp, RefreshCw } from 'lucide-react';

interface AIInsightsCardProps {
  data: ProductLifecycleData;
}

export function AIInsightsCard({ data }: AIInsightsCardProps) {
  const [insights, setInsights] = useState<LifecycleInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const cacheKey = `lifecycle_${data.isin || data.productDisplayName}_${data.underlyings.map(u => u.symbol).join('_')}`;
  
  const loadInsights = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    if (forceRefresh) {
      clearInsightsCache(cacheKey);
    }
    
    try {
      const context = {
        productType: data.bucket,
        underlyings: data.underlyings.map(u => ({
          symbol: u.symbol,
          name: u.name,
          initialPrice: u.initialPrice,
          currentPrice: u.currentPrice,
          performancePct: u.performancePct,
        })),
        terms: {
          couponRate: data.regularIncomeTerms?.couponRatePct,
          protectionLevel: data.regularIncomeTerms?.protectionLevelPct,
          autocallLevel: data.regularIncomeTerms?.autocallLevelPct,
          participationRate: data.capitalProtectionTerms?.participationRatePct,
          bonusLevel: data.boostedGrowthTerms?.bonusLevelPct,
          barrierLevel: data.boostedGrowthTerms?.barrierPct,
        },
        daysToMaturity: data.daysToMaturity,
        progressPct: data.progressPct,
      };
      
      const result = await getCachedLifecycleInsights(cacheKey, context);
      setInsights(result);
      setIsVisible(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerate = () => {
    loadInsights(false);
  };
  
  const handleRegenerate = () => {
    loadInsights(true);
  };
  
  if (!isVisible && !loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-indigo-900 uppercase tracking-wide">
                AI-Powered Insights
              </h3>
              <p className="text-sm text-indigo-700 mt-1">
                Get intelligent analysis of your product lifecycle
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Generate Insights
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-indigo-900 uppercase tracking-wide flex items-center gap-2">
              AI-Powered Insights
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            </h3>
            <p className="text-xs text-indigo-600 mt-0.5">
              Powered by GPT-4
            </p>
          </div>
        </div>
        
        {insights && !loading && (
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-300 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
        )}
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <div className="text-sm text-indigo-700 font-medium">
              Analyzing lifecycle data with AI...
            </div>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-red-900">Failed to generate insights</div>
            <div className="text-sm text-red-700 mt-1">{error}</div>
          </div>
        </div>
      )}
      
      {/* Insights Display */}
      {insights && !loading && (
        <div className="space-y-4">
          {/* Risk Assessment */}
          <div className="p-4 bg-white rounded-lg border border-indigo-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-sm uppercase tracking-wide text-amber-900">
                Risk Assessment
              </h4>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {insights.riskAssessment}
            </p>
          </div>
          
          {/* What to Watch */}
          <div className="p-4 bg-white rounded-lg border border-indigo-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-sm uppercase tracking-wide text-blue-900">
                What to Watch
              </h4>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {insights.whatToWatch}
            </p>
          </div>
          
          {/* Smart Summary */}
          <div className="p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg border border-indigo-300">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-indigo-700" />
              <h4 className="font-bold text-sm uppercase tracking-wide text-indigo-900">
                Bottom Line
              </h4>
            </div>
            <p className="text-sm font-medium text-indigo-900 leading-relaxed">
              {insights.smartSummary}
            </p>
          </div>
          
          {/* Probability Analysis (if available) */}
          {insights.probabilityAnalysis && (
            <div className="p-4 bg-white rounded-lg border border-indigo-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h4 className="font-bold text-sm uppercase tracking-wide text-purple-900">
                  Probability Analysis
                </h4>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {insights.probabilityAnalysis}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Disclaimer */}
      <div className="mt-6 pt-4 border-t border-indigo-200">
        <p className="text-xs text-indigo-600 leading-relaxed">
          <strong>AI Disclaimer:</strong> These insights are generated by AI and should be used for informational purposes only. 
          Not investment advice. Always consult with a financial professional before making investment decisions.
        </p>
      </div>
    </div>
  );
}
