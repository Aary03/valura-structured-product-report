/**
 * Combined Underlying Card
 * Smart integration of spotlight metrics, company info, and AI analysis
 * Reduces vertical scrolling with tabbed/collapsible sections
 */

import { useState, useEffect } from 'react';
import type { UnderlyingSummary } from '../../services/underlyingSummary';
import type { ReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import type { CapitalProtectedParticipationTerms } from '../../products/capitalProtectedParticipation/terms';
import { CardShell } from '../common/CardShell';
import { 
  User, MapPin, Globe, Building2, Calendar, Loader2, Sparkles,
  TrendingUp, TrendingDown, Minus, Activity, Target, Shield,
  BarChart3, ChevronDown, ChevronUp
} from 'lucide-react';
import { getLogoWithFallback } from '../../utils/logo';
import { formatNumber, formatPercent } from '../../core/utils/math';
import { generateInvestmentInsights, type InvestmentInsights } from '../../services/aiInsights';
import { AIInsightsCard } from './AIInsightsCard';
import { generateWhyThisStock, getCachedWhyThisStock, cacheWhyThisStock, type WhyThisStockResponse } from '../../services/ai/whyThisStock';
import { WhyThisStockCard } from './WhyThisStockCard';
import { AIThinkingLoader } from '../common/AIThinkingLoader';

type ProductTerms = ReverseConvertibleTerms | CapitalProtectedParticipationTerms;

interface UnderlyingCombinedCardProps {
  summary: UnderlyingSummary;
  productType?: 'RC' | 'CPPN';
  barrierPct?: number;
  productTerms?: ProductTerms;
  basketType?: 'single' | 'worst_of' | 'best_of' | 'average';
  basketPosition?: string;
  isWorstPerformer?: boolean;
}

type TabType = 'metrics' | 'company' | 'why' | 'insights';

export function UnderlyingCombinedCard({ 
  summary, 
  productType = 'RC', 
  barrierPct = 0.7,
  productTerms,
  basketType = 'single',
  basketPosition,
  isWorstPerformer = false
}: UnderlyingCombinedCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('metrics');
  const [isExpanded, setIsExpanded] = useState(false);
  const [insights, setInsights] = useState<InvestmentInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [whyThisStock, setWhyThisStock] = useState<WhyThisStockResponse | null>(null);
  const [loadingWhyThisStock, setLoadingWhyThisStock] = useState(false);
  const [lastGeneratedTime, setLastGeneratedTime] = useState<number>(0);
  const { logoUrl, fallback } = getLogoWithFallback(summary.symbol, summary.name);

  // Don't render if no description
  if (!summary.description) {
    return null;
  }

  // Fetch AI insights on mount
  useEffect(() => {
    const fetchInsights = async () => {
      if (!summary.description) return;

      setLoadingInsights(true);
      const result = await generateInvestmentInsights({
        symbol: summary.symbol,
        companyName: summary.name,
        description: summary.description,
        sector: summary.sector || 'N/A',
        industry: summary.industry || 'N/A',
        performancePct: summary.performancePct || 0,
        distanceToBarrier: summary.distanceToBarrier || 0,
        analystConsensus: summary.analystConsensus,
        targetUpside: summary.targetUpside,
        volatility: summary.volatility30d,
        pe: summary.pe,
        beta: summary.beta,
        productType,
        barrierPct,
      });
      setInsights(result);
      setLoadingInsights(false);
    };

    fetchInsights();
  }, [summary.symbol]);

  // Handle "Why This Stock?" generation
  const handleGenerateWhyThisStock = async () => {
    const now = Date.now();
    if (now - lastGeneratedTime < 30000) {
      alert('Please wait 30 seconds before regenerating.');
      return;
    }

    if (!productTerms) {
      console.warn('Product terms not provided');
      return;
    }

    const productTermsForCache = {
      barrierPct: productType === 'RC' ? (productTerms as ReverseConvertibleTerms).barrierPct : undefined,
      couponRatePct: productType === 'RC' ? (productTerms as ReverseConvertibleTerms).couponRatePct : undefined,
      couponFreqPerYear: productType === 'RC' ? (productTerms as ReverseConvertibleTerms).couponFreqPerYear : undefined,
      participationStartPct: productType === 'CPPN' ? (productTerms as CapitalProtectedParticipationTerms).participationStartPct : undefined,
      participationRatePct: productType === 'CPPN' ? (productTerms as CapitalProtectedParticipationTerms).participationRatePct : undefined,
      capitalProtectionPct: productType === 'CPPN' ? (productTerms as CapitalProtectedParticipationTerms).capitalProtectionPct : undefined,
      bonusLevelPct: productType === 'CPPN' ? (productTerms as CapitalProtectedParticipationTerms).bonusLevelPct : undefined,
      bonusBarrierPct: productType === 'CPPN' ? (productTerms as CapitalProtectedParticipationTerms).bonusBarrierPct : undefined,
      capLevelPct: productType === 'CPPN' ? (productTerms as CapitalProtectedParticipationTerms).capLevelPct : undefined,
      knockInEnabled: productType === 'CPPN' ? (productTerms as CapitalProtectedParticipationTerms).knockInEnabled : undefined,
      knockInLevelPct: productType === 'CPPN' ? (productTerms as CapitalProtectedParticipationTerms).knockInLevelPct : undefined,
    };

    const cached = getCachedWhyThisStock(summary.symbol, productTermsForCache);
    if (cached) {
      setWhyThisStock(cached);
      setActiveTab('why');
      return;
    }

    setLoadingWhyThisStock(true);
    setActiveTab('why');

    try {
      const result = await generateWhyThisStock({
        symbol: summary.symbol,
        companyName: summary.name,
        description: summary.description || '',
        sector: summary.sector || 'N/A',
        industry: summary.industry || 'N/A',
        spotPrice: summary.spotPrice,
        performancePct: summary.performancePct || 0,
        distanceToBarrier: summary.distanceToBarrier || 0,
        volatility30d: summary.volatility30d,
        beta: summary.beta,
        analystConsensus: summary.analystConsensus,
        targetUpside: summary.targetUpside,
        momentum20d: summary.momentum20d,
        pe: summary.pe,
        marketCap: summary.marketCap,
        productType,
        productTerms: productTermsForCache,
        basketType,
        basketPosition,
      });

      if (result) {
        setWhyThisStock(result);
        cacheWhyThisStock(summary.symbol, productTermsForCache, result);
        setLastGeneratedTime(now);
      } else {
        alert('Failed to generate analysis. Please try again.');
      }
    } catch (error) {
      console.error('Error generating Why This Stock:', error);
      alert('Failed to generate analysis. Please try again.');
    } finally {
      setLoadingWhyThisStock(false);
    }
  };

  // Format values
  const ipoYear = summary.ipoDate ? new Date(summary.ipoDate).getFullYear() : null;
  const employeeCount = summary.fullTimeEmployees
    ? summary.fullTimeEmployees >= 1000000
      ? `${(summary.fullTimeEmployees / 1000000).toFixed(1)}M`
      : summary.fullTimeEmployees >= 1000
      ? `${(summary.fullTimeEmployees / 1000).toFixed(0)}K`
      : summary.fullTimeEmployees.toLocaleString()
    : null;

  const performanceColor = summary.performancePct >= 0 ? 'text-success-fg' : 'text-danger-fg';
  const distanceColor = summary.distanceToBarrier >= 0 ? 'text-success-fg' : 'text-danger-fg';
  
  const MomentumIcon = summary.momentumBadge === 'Uptrend' ? TrendingUp : 
                       summary.momentumBadge === 'Downtrend' ? TrendingDown : Minus;
  const momentumColor = summary.momentumBadge === 'Uptrend' ? 'text-success-fg' : 
                       summary.momentumBadge === 'Downtrend' ? 'text-danger-fg' : 'text-text-secondary';

  return (
    <CardShell 
      className="p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f0f9ff 100%)',
        borderLeft: isWorstPerformer ? '4px solid #ef4444' : '4px solid var(--primary-blue)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Decorative corner */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-5"
        style={{
          background: 'radial-gradient(circle at top right, var(--primary-blue) 0%, transparent 70%)',
        }}
      />

      {/* Header with Logo and Title */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="flex items-start space-x-4 flex-1">
          {/* Logo */}
          <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden border-2 border-primary shadow-md relative flex-shrink-0">
            <img
              src={logoUrl}
              alt={summary.symbol}
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallbackEl = document.createElement('div');
                  fallbackEl.className = 'text-primary font-bold text-lg absolute inset-0 flex items-center justify-center';
                  fallbackEl.textContent = fallback;
                  parent.appendChild(fallbackEl);
                }
              }}
            />
          </div>

          {/* Title and Sector */}
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-text-primary mb-1">
              {summary.name}
            </h3>
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <span className="text-sm font-semibold text-text-secondary font-mono">
                {summary.symbol}
              </span>
              {summary.sector && (
                <>
                  <span className="text-text-tertiary">•</span>
                  <span className="text-sm text-text-secondary">{summary.sector}</span>
                </>
              )}
              {summary.industry && (
                <>
                  <span className="text-text-tertiary">•</span>
                  <span className="text-sm text-text-secondary">{summary.industry}</span>
                </>
              )}
            </div>
            {basketPosition && (
              <div className="inline-block px-3 py-1 rounded-full bg-amber-100 border border-amber-300">
                <span className="text-xs font-semibold text-amber-800">{basketPosition}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Metrics - Right Side */}
        <div className="flex flex-col items-end space-y-2 ml-4">
          <div className="text-right">
            <div className="text-xs text-text-secondary">Spot Price</div>
            <div className="text-2xl font-bold text-text-primary">
              ${formatNumber(summary.spotPrice, 2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-text-secondary">Performance</div>
            <div className={`text-lg font-bold ${performanceColor}`}>
              {summary.performancePct >= 0 ? '+' : ''}{formatNumber(summary.performancePct, 1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Row - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 pb-5 border-b-2 border-border relative z-10">
        {/* Distance to Barrier/Participation */}
        <div className="p-3 bg-white rounded-lg border border-border">
          <div className="flex items-center space-x-2 mb-1">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs text-text-secondary font-semibold">
              {summary.thresholdLabel || 'Barrier'} Distance
            </span>
          </div>
          <div className={`text-lg font-bold ${distanceColor}`}>
            {summary.distanceToBarrier >= 0 ? '+' : ''}{formatNumber(summary.distanceToBarrier, 1)} pp
          </div>
        </div>

        {/* Volatility */}
        {summary.vol30dAnn != null && (
          <div className="p-3 bg-white rounded-lg border border-border">
            <div className="flex items-center space-x-2 mb-1">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs text-text-secondary font-semibold">30D Volatility</span>
            </div>
            <div className="text-lg font-bold text-text-primary">
              {formatNumber(summary.vol30dAnn * 100, 1)}%
            </div>
            {summary.riskBadge && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                summary.riskBadge === 'Low' ? 'bg-success-bg text-success-fg' :
                summary.riskBadge === 'Medium' ? 'bg-warning-bg text-warning-fg' :
                'bg-danger-bg text-danger-fg'
              }`}>
                {summary.riskBadge} Risk
              </span>
            )}
          </div>
        )}

        {/* Momentum */}
        {summary.momentum20d != null && (
          <div className="p-3 bg-white rounded-lg border border-border">
            <div className="flex items-center space-x-2 mb-1">
              <MomentumIcon className={`w-4 h-4 ${momentumColor}`} />
              <span className="text-xs text-text-secondary font-semibold">20D Momentum</span>
            </div>
            <div className={`text-lg font-bold ${momentumColor}`}>
              {summary.momentum20d >= 0 ? '+' : ''}{formatNumber(summary.momentum20d, 1)}%
            </div>
            {summary.momentumBadge && (
              <span className="text-xs text-text-secondary">{summary.momentumBadge}</span>
            )}
          </div>
        )}

        {/* Target Upside - Enhanced */}
        {summary.targetUpside != null && (
          <div className="p-3 rounded-lg border-2 relative overflow-hidden"
            style={{
              background: summary.targetUpside >= 0 
                ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)'
                : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%)',
              borderColor: summary.targetUpside >= 0 ? '#22c55e' : '#ef4444',
              boxShadow: summary.targetUpside >= 0 
                ? '0 4px 12px rgba(34, 197, 94, 0.15)'
                : '0 4px 12px rgba(239, 68, 68, 0.15)'
            }}
          >
            {/* Decorative accent */}
            <div 
              className="absolute top-0 right-0 w-20 h-20 opacity-10"
              style={{
                background: `radial-gradient(circle at top right, ${summary.targetUpside >= 0 ? '#22c55e' : '#ef4444'} 0%, transparent 70%)`
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-1">
                <div className={`p-1.5 rounded-lg ${summary.targetUpside >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <BarChart3 className={`w-4 h-4 ${summary.targetUpside >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: summary.targetUpside >= 0 ? '#15803d' : '#b91c1c' }}
                >
                  Target Upside
                </span>
              </div>
              <div className={`text-2xl font-extrabold mb-1`}
                style={{ 
                  color: summary.targetUpside >= 0 ? '#15803d' : '#b91c1c',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                {summary.targetUpside >= 0 ? '+' : ''}{formatNumber(summary.targetUpside, 1)}%
              </div>
              {summary.analystConsensus && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: summary.targetUpside >= 0 ? '#22c55e' : '#ef4444',
                      color: 'white'
                    }}
                  >
                    {summary.analystConsensus}
                  </span>
                </div>
              )}
              {summary.targetPrice && (
                <div className="text-xs font-medium mt-1"
                  style={{ color: summary.targetUpside >= 0 ? '#166534' : '#991b1b' }}
                >
                  Target: ${formatNumber(summary.targetPrice, 2)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2 relative z-10">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === 'metrics'
              ? 'bg-primary text-white shadow-md'
              : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
          }`}
        >
          📊 Full Metrics
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === 'company'
              ? 'bg-primary text-white shadow-md'
              : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
          }`}
        >
          📋 About Company
        </button>
        {productTerms && (
          <button
            onClick={() => {
              if (!whyThisStock) {
                handleGenerateWhyThisStock();
              } else {
                setActiveTab('why');
              }
            }}
            disabled={loadingWhyThisStock}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'why'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
            } disabled:opacity-50`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Why This Stock?</span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === 'insights'
              ? 'bg-primary text-white shadow-md'
              : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
          }`}
        >
          🤖 AI Insights
        </button>
      </div>

      {/* Tab Content */}
      <div className="relative z-10">
        {/* Full Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Additional Company Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {summary.ceo && (
                <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-border">
                  <User className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-text-secondary">CEO</div>
                    <div className="text-sm font-semibold text-text-primary truncate">{summary.ceo}</div>
                  </div>
                </div>
              )}
              {(summary.city || summary.country) && (
                <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-border">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-text-secondary">Headquarters</div>
                    <div className="text-sm font-semibold text-text-primary truncate">
                      {[summary.city, summary.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </div>
              )}
              {summary.website && (
                <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-border">
                  <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-text-secondary">Website</div>
                    <a
                      href={summary.website.startsWith('http') ? summary.website : `https://${summary.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-primary hover:underline truncate block"
                    >
                      {summary.website.replace(/^https?:\/\/(www\.)?/, '')} →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {summary.pe != null && (
                <div className="p-3 bg-white rounded-lg border border-border">
                  <div className="text-xs text-text-secondary mb-1">P/E Ratio</div>
                  <div className="text-lg font-bold text-text-primary">{formatNumber(summary.pe, 1)}</div>
                </div>
              )}
              {summary.beta != null && (
                <div className="p-3 bg-white rounded-lg border border-border">
                  <div className="text-xs text-text-secondary mb-1">Beta</div>
                  <div className="text-lg font-bold text-text-primary">{formatNumber(summary.beta, 2)}</div>
                </div>
              )}
              {summary.marketCap != null && (
                <div className="p-3 bg-white rounded-lg border border-border">
                  <div className="text-xs text-text-secondary mb-1">Market Cap</div>
                  <div className="text-lg font-bold text-text-primary">${(summary.marketCap / 1e9).toFixed(1)}B</div>
                </div>
              )}
              {summary.dividendYieldPct != null && (
                <div className="p-3 bg-white rounded-lg border border-border">
                  <div className="text-xs text-text-secondary mb-1">Div Yield</div>
                  <div className="text-lg font-bold text-text-primary">{formatNumber(summary.dividendYieldPct, 2)}%</div>
                </div>
              )}
            </div>

            {/* Analyst Target Price - Highlighted Feature Card */}
            {summary.targetPrice && summary.targetUpside != null && (
              <div className="p-5 rounded-xl border-2 relative overflow-hidden shadow-md"
                style={{
                  background: summary.targetUpside >= 0
                    ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)'
                    : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%)',
                  borderColor: summary.targetUpside >= 0 ? '#10b981' : '#ef4444',
                  boxShadow: summary.targetUpside >= 0
                    ? '0 10px 25px rgba(16, 185, 129, 0.2)'
                    : '0 10px 25px rgba(239, 68, 68, 0.2)'
                }}
              >
                {/* Decorative elements */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 opacity-10"
                  style={{
                    background: `radial-gradient(circle at top right, ${summary.targetUpside >= 0 ? '#10b981' : '#ef4444'} 0%, transparent 70%)`
                  }}
                />
                <div 
                  className="absolute bottom-0 left-0 w-24 h-24 opacity-5"
                  style={{
                    background: `radial-gradient(circle at bottom left, ${summary.targetUpside >= 0 ? '#10b981' : '#ef4444'} 0%, transparent 70%)`
                  }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className={`p-2 rounded-xl ${summary.targetUpside >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                          <BarChart3 className={`w-6 h-6 ${summary.targetUpside >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide"
                            style={{ color: summary.targetUpside >= 0 ? '#047857' : '#991b1b' }}
                          >
                            Analyst Price Target
                          </div>
                          {summary.analystConsensus && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                              style={{
                                background: summary.targetUpside >= 0 ? '#10b981' : '#ef4444',
                                color: 'white'
                              }}
                            >
                              {summary.analystConsensus}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <div className="text-xs font-medium mb-1"
                            style={{ color: summary.targetUpside >= 0 ? '#065f46' : '#7f1d1d' }}
                          >
                            Current Price
                          </div>
                          <div className="text-xl font-bold text-valura-ink">
                            ${formatNumber(summary.spotPrice, 2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium mb-1"
                            style={{ color: summary.targetUpside >= 0 ? '#065f46' : '#7f1d1d' }}
                          >
                            Target Price
                          </div>
                          <div className="text-xl font-bold"
                            style={{ color: summary.targetUpside >= 0 ? '#047857' : '#991b1b' }}
                          >
                            ${formatNumber(summary.targetPrice, 2)}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t"
                        style={{ borderColor: summary.targetUpside >= 0 ? '#a7f3d0' : '#fecaca' }}
                      >
                        <div className="flex items-baseline space-x-2">
                          <span className="text-sm font-semibold text-text-secondary">
                            Upside Potential:
                          </span>
                          <span className="text-3xl font-extrabold"
                            style={{ 
                              color: summary.targetUpside >= 0 ? '#047857' : '#991b1b',
                              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          >
                            {summary.targetUpside >= 0 ? '+' : ''}{formatNumber(summary.targetUpside, 1)}%
                          </span>
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          Based on analyst consensus price target
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 52W Range */}
            {summary.range52w && (
              <div className="p-4 bg-white rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-text-secondary">52-Week Range</span>
                  <span className="text-sm text-text-secondary">
                    ${formatNumber(summary.range52w.low, 2)} - ${formatNumber(summary.range52w.high, 2)}
                  </span>
                </div>
                <div className="relative h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-danger to-success transition-all"
                    style={{ width: `${summary.range52w.position * 100}%` }}
                  />
                </div>
                <div className="text-xs text-text-secondary mt-1 text-center">
                  Current: ${formatNumber(summary.spotPrice, 2)} ({formatNumber(summary.range52w.position * 100, 0)}% of range)
                </div>
              </div>
            )}

            {/* Footer Details */}
            {(employeeCount || summary.exchange || ipoYear) && (
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-border text-xs text-text-secondary">
                {employeeCount && (
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{employeeCount} employees</span>
                  </div>
                )}
                {summary.exchange && (
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold">Exchange:</span>
                    <span>{summary.exchange}</span>
                  </div>
                )}
                {ipoYear && (
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>IPO {ipoYear}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Company Tab */}
        {activeTab === 'company' && (
          <div className="animate-fadeIn">
            <div className={`relative ${!isExpanded ? 'max-h-48 overflow-hidden' : ''}`}>
              <div className="text-sm text-text-secondary leading-relaxed space-y-3"
                style={{
                  textAlign: 'justify',
                  hyphens: 'auto',
                }}
              >
                {summary.description.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
              {!isExpanded && summary.description.length > 400 && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
              )}
            </div>
            {summary.description.length > 400 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-white hover:shadow-lg transition-all flex items-center space-x-2 text-sm font-semibold"
              >
                <span>{isExpanded ? 'Show less' : 'Read more'}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}

        {/* Why This Stock Tab */}
        {activeTab === 'why' && (
          <div className="animate-fadeIn">
            {loadingWhyThisStock ? (
              <AIThinkingLoader message="Analyzing why this stock fits your product..." showFacts={true} />
            ) : whyThisStock ? (
              <WhyThisStockCard
                response={whyThisStock}
                symbol={summary.symbol}
                companyName={summary.name}
                onRegenerate={handleGenerateWhyThisStock}
                isRegenerating={loadingWhyThisStock}
              />
            ) : (
              <div className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl border-2 border-indigo-200 text-center">
                <p className="text-sm text-text-secondary">
                  Click the "Why This Stock?" tab to generate a comprehensive AI-powered analysis.
                </p>
              </div>
            )}
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'insights' && (
          <div className="animate-fadeIn">
            {loadingInsights ? (
              <AIThinkingLoader message="Generating AI insights with live market news..." showFacts={true} />
            ) : insights ? (
              <AIInsightsCard
                insights={insights}
                symbol={summary.symbol}
                companyName={summary.name}
                description={summary.description}
                productType={productType === 'RC' ? 'Reverse Convertible' : 'Capital Protected Participation Note'}
                currentMetrics={`Performance: ${summary.performancePct?.toFixed(1)}%, Distance: ${summary.distanceToBarrier?.toFixed(1)} ppts`}
              />
            ) : (
              <div className="text-center text-text-secondary py-8">
                No AI insights available
              </div>
            )}
          </div>
        )}
      </div>
    </CardShell>
  );
}
