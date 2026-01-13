/**
 * Why This Stock Card Component
 * Modern, compact display for AI-generated "Why This Stock?" explanation
 * Redesigned with better visual hierarchy and news integration
 */

import type { WhyThisStockResponse } from '../../services/ai/whyThisStock';
import { Target, TrendingUp, Shield, CheckCircle2, AlertTriangle, Copy, RefreshCw, Newspaper, ExternalLink, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface WhyThisStockCardProps {
  response: WhyThisStockResponse;
  symbol: string;
  companyName: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function WhyThisStockCard({ 
  response, 
  symbol, 
  companyName, 
  onRegenerate,
  isRegenerating = false 
}: WhyThisStockCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `
Why ${companyName} (${symbol})?

PRODUCT SUITABILITY
${response.productSuitability.headline}
${response.productSuitability.points.map(p => `• ${p}`).join('\n')}

INVESTMENT THESIS
${response.investmentThesis.headline}
${response.investmentThesis.points.map(p => `• ${p}`).join('\n')}

RISK/REWARD PROFILE
${response.riskReward.headline}

Upside: ${response.riskReward.upsideScenario}
Downside: ${response.riskReward.downsideScenario}

Key Risks:
${response.riskReward.keyRisks.map(r => `• ${r}`).join('\n')}

${response.recentNews && response.recentNews.length > 0 ? `
RECENT NEWS
${response.recentNews.map(n => `• ${n.headline} (${n.source}, ${n.date})${n.url ? `\n  ${n.url}` : ''}`).join('\n')}
` : ''}

BOTTOM LINE
${response.bottomLine}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-sm font-bold text-text-primary">
            AI-Powered Stock Analysis
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-text-primary transition-all text-xs font-medium flex items-center space-x-1.5 shadow-sm"
            title="Copy to clipboard"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 text-indigo-700 transition-all text-xs font-medium flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              title="Regenerate analysis"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          )}
        </div>
      </div>

      {/* Compact Stacked Layout */}
      <div className="space-y-3">
        {/* Top Row: Product Suitability + Investment Thesis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Product Suitability */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-5 h-5 text-blue-600" />
              <h4 className="text-sm font-bold text-blue-900">Why This Fits</h4>
            </div>
            <p className="text-sm font-semibold text-blue-700 mb-3 leading-snug">
              {response.productSuitability.headline}
            </p>
            <ul className="space-y-1.5">
              {response.productSuitability.points.map((point, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span className="text-xs text-text-secondary leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Investment Thesis */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="text-sm font-bold text-green-900">Investment Case</h4>
            </div>
            <p className="text-sm font-semibold text-green-700 mb-3 leading-snug">
              {response.investmentThesis.headline}
            </p>
            <ul className="space-y-1.5">
              {response.investmentThesis.points.map((point, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span className="text-xs text-text-secondary leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Risk/Reward - Compact Single Row */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-white border-l-4 border-amber-500 shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-5 h-5 text-amber-600" />
            <h4 className="text-sm font-bold text-amber-900">Risk/Reward</h4>
          </div>
          <p className="text-sm font-semibold text-amber-700 mb-3 leading-snug">
            {response.riskReward.headline}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {/* Upside */}
            <div className="p-3 bg-green-100/50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-1.5 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-bold text-green-900">Upside</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {response.riskReward.upsideScenario}
              </p>
            </div>

            {/* Downside */}
            <div className="p-3 bg-red-100/50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-1.5 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-bold text-red-900">Downside</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {response.riskReward.downsideScenario}
              </p>
            </div>
          </div>

          {/* Key Risks - Inline */}
          {response.riskReward.keyRisks.length > 0 && (
            <div className="pt-2 border-t border-amber-200">
              <span className="text-xs font-bold text-amber-900 mb-1.5 block">Key Risks to Monitor:</span>
              <div className="flex flex-wrap gap-2">
                {response.riskReward.keyRisks.map((risk, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium border border-amber-300">
                    {risk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent News - If Available */}
        {response.recentNews && response.recentNews.length > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-white border-l-4 border-indigo-500 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <Newspaper className="w-5 h-5 text-indigo-600" />
              <h4 className="text-sm font-bold text-indigo-900">Recent Developments</h4>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                AI-Generated
              </span>
            </div>
            <div className="space-y-2">
              {response.recentNews.map((news, idx) => {
                const sentimentColor = news.sentiment === 'positive' ? 'bg-green-100 text-green-700 border-green-300' :
                                      news.sentiment === 'negative' ? 'bg-red-100 text-red-700 border-red-300' :
                                      'bg-gray-100 text-gray-700 border-gray-300';
                const sentimentIcon = news.sentiment === 'positive' ? '📈' : news.sentiment === 'negative' ? '📉' : '➖';
                
                return (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-indigo-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${sentimentColor}`}>
                          {sentimentIcon} {news.sentiment}
                        </span>
                        <span className="text-xs text-text-tertiary">{news.source}</span>
                        <span className="text-xs text-text-tertiary">•</span>
                        <span className="text-xs text-text-tertiary">{news.date}</span>
                      </div>
                      {news.url && (
                        <a
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors flex-shrink-0"
                          title="Read full article"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-text-primary mb-1 leading-snug">
                      {news.headline}
                    </h5>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {news.summary}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Line - Prominent */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-2 opacity-90">
                Bottom Line
              </h4>
              <p className="text-base text-white leading-relaxed font-medium">
                {response.bottomLine}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
