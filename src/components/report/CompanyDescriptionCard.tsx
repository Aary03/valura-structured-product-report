/**
 * Company Description Card Component
 * Beautiful card showing company background, description, and key details
 */

import { useState, useEffect } from 'react';
import type { UnderlyingSummary } from '../../services/underlyingSummary';
import { CardShell } from '../common/CardShell';
import { User, MapPin, Globe, ChevronDown, ChevronUp, Building2, Calendar, Loader2 } from 'lucide-react';
import { getLogoWithFallback } from '../../utils/logo';
import { generateInvestmentInsights, type InvestmentInsights } from '../../services/aiInsights';
import { AIInsightsCard } from './AIInsightsCard';

interface CompanyDescriptionCardProps {
  summary: UnderlyingSummary;
  productType?: 'RC' | 'CPPN';
  barrierPct?: number;
}

export function CompanyDescriptionCard({ 
  summary, 
  productType = 'RC', 
  barrierPct = 0.7 
}: CompanyDescriptionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [insights, setInsights] = useState<InvestmentInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const { logoUrl, fallback } = getLogoWithFallback(summary.symbol, summary.name);

  // Don't render if no description
  if (!summary.description) {
    return null;
  }

  // Fetch AI insights
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

  const hasMoreContent = summary.description.length > 400;

  // Format IPO date
  const ipoYear = summary.ipoDate 
    ? new Date(summary.ipoDate).getFullYear()
    : null;

  // Format employee count
  const employeeCount = summary.fullTimeEmployees
    ? summary.fullTimeEmployees >= 1000000
      ? `${(summary.fullTimeEmployees / 1000000).toFixed(1)}M`
      : summary.fullTimeEmployees >= 1000
      ? `${(summary.fullTimeEmployees / 1000).toFixed(0)}K`
      : summary.fullTimeEmployees.toLocaleString()
    : null;

  return (
    <CardShell 
      className="p-7 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f0f9ff 100%)',
        borderLeft: '4px solid var(--primary-blue)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Decorative corner accent */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-5"
        style={{
          background: 'radial-gradient(circle at top right, var(--primary-blue) 0%, transparent 70%)',
        }}
      />
      {/* Header */}
      <div className="flex items-start space-x-4 mb-6 relative z-10">
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
                const existingFallback = parent.querySelector('.logo-fallback');
                if (!existingFallback) {
                  const fallbackEl = document.createElement('div');
                  fallbackEl.className = 'logo-fallback text-primary font-bold text-lg absolute inset-0 flex items-center justify-center';
                  fallbackEl.textContent = fallback;
                  parent.appendChild(fallbackEl);
                }
              }
            }}
          />
          <div className="logo-fallback text-primary font-bold text-lg absolute inset-0 flex items-center justify-center hidden">
            {fallback}
          </div>
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-text-primary mb-1">
            {summary.name}
          </h3>
          <div className="flex items-center space-x-2 mb-2">
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
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 pb-6 border-b-2 border-border relative z-10">
        {/* CEO */}
        {summary.ceo && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-text-secondary">CEO</div>
              <div className="text-sm font-semibold text-text-primary truncate">
                {summary.ceo}
              </div>
            </div>
          </div>
        )}

        {/* Location */}
        {(summary.city || summary.country) && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-accent-teal-bg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-accent-teal-dark" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-text-secondary">Headquarters</div>
              <div className="text-sm font-semibold text-text-primary truncate">
                {[summary.city, summary.country].filter(Boolean).join(', ')}
              </div>
            </div>
          </div>
        )}

        {/* Website */}
        {summary.website && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-accent-purple-bg flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-accent-purple-dark" />
            </div>
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

      {/* Description */}
      <div className="mb-5 relative z-10">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary-blue-light rounded-full"></div>
          <h4 className="text-base font-bold text-text-primary uppercase tracking-wide">
            About the Company
          </h4>
        </div>
        <div 
          className={`relative ${!isExpanded ? 'max-h-24 overflow-hidden' : ''}`}
        >
          <div 
            className="text-[15px] text-text-secondary leading-relaxed space-y-3"
            style={{
              textAlign: 'justify',
              hyphens: 'auto',
              wordSpacing: '-0.05em',
            }}
          >
            {summary.description.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="first:mt-0">
                {paragraph}
              </p>
            ))}
          </div>
          {!isExpanded && hasMoreContent && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent"
            />
          )}
        </div>
        {hasMoreContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-blue-light text-white hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2 font-semibold text-sm"
            style={{
              boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.25)',
            }}
          >
            <span>{isExpanded ? 'Show less' : 'Read full description'}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Footer - Additional Details */}
      {(employeeCount || summary.exchange || ipoYear) && (
        <div className="flex flex-wrap items-center gap-4 pt-5 border-t-2 border-border text-xs text-text-secondary relative z-10">
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

      {/* AI Investment Insights */}
      <div className="mt-6 relative z-10">
        {loadingInsights && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
            <span className="text-sm text-text-secondary">Generating AI insights...</span>
          </div>
        )}
        
        {insights && !loadingInsights && (
          <AIInsightsCard
            insights={insights}
            symbol={summary.symbol}
            companyName={summary.name}
            description={summary.description}
            productType={productType === 'RC' ? 'Reverse Convertible' : 'Capital Protected Participation Note'}
            currentMetrics={`Performance: ${summary.performancePct?.toFixed(1)}%, Distance to ${productType === 'RC' ? 'barrier' : 'participation start'}: ${summary.distanceToBarrier?.toFixed(1)} ppts`}
          />
        )}
      </div>
    </CardShell>
  );
}

