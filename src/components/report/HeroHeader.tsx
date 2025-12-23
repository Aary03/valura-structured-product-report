/**
 * Hero Header Component
 * Premium header with KPI tiles
 * Supports single and worst-of basket
 */

import type { ReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import { formatPercent } from '../../core/utils/math';
import { KpiTile } from '../common/KpiTile';
import { TrendingUp, Shield, AlertTriangle, TrendingDown, Layers, Calendar } from 'lucide-react';
import { getLogoWithFallback } from '../../utils/logo';
import { addMonths, getCurrentISODate } from '../../core/types/dates';

interface HeroHeaderProps {
  terms: ReverseConvertibleTerms;
  currentWorstOfLevel: number;
  barrierLevel: number;
  worstUnderlyingIndex: number | null;
}

export function HeroHeader({ 
  terms, 
  currentWorstOfLevel, 
  barrierLevel,
  worstUnderlyingIndex,
}: HeroHeaderProps) {
  const couponRatePercent = formatPercent(terms.couponRatePA, 1);
  const variantLabel =
    terms.variant === 'standard_barrier_rc'
      ? 'Standard Barrier'
      : 'Low Strike / Geared Put';

  const basketLabel = terms.basketType === 'worst_of'
    ? `Worst-Of: ${terms.underlyings.map(u => u.ticker).join(' / ')}`
    : terms.underlyings[0]?.ticker || '';

  const barrierOrStrike =
    terms.variant === 'standard_barrier_rc'
      ? `Barrier: ${formatPercent(terms.barrierPct || 0, 0)}`
      : `Strike: ${formatPercent(terms.strikePct || 0, 0)}`;

  // Calculate first observation date based on coupon frequency
  const getFirstObservationDate = () => {
    const monthsToFirst = 12 / terms.couponFreqPerYear;
    const firstObservation = addMonths(getCurrentISODate(), monthsToFirst);
    return new Date(firstObservation).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      {/* Main Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
            {/* Underlying Logos */}
            <div className="flex items-center space-x-2">
              {terms.underlyings.slice(0, 3).map((underlying, index) => {
                const { logoUrl, fallback } = getLogoWithFallback(underlying.ticker, underlying.name);
                return (
                  <div
                    key={index}
                    className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-border flex-shrink-0 shadow-sm relative"
                  >
                    <img
                      src={logoUrl}
                      alt={underlying.ticker}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const existingFallback = parent.querySelector('.logo-fallback');
                          if (!existingFallback) {
                            const fallbackEl = document.createElement('div');
                            fallbackEl.className = 'logo-fallback text-valura-ink font-bold text-sm absolute inset-0 flex items-center justify-center';
                            fallbackEl.textContent = fallback;
                            parent.appendChild(fallbackEl);
                          }
                        }
                      }}
                    />
                    <div className="logo-fallback text-valura-ink font-bold text-sm absolute inset-0 flex items-center justify-center hidden">
                      {fallback}
                    </div>
                  </div>
                );
              })}
              {terms.underlyings.length > 3 && (
                <div className="w-12 h-12 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-muted font-semibold text-xs">
                  +{terms.underlyings.length - 3}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-valura-ink">
                Reverse Convertible {couponRatePercent}
                {terms.basketType === 'worst_of' && (
                  <span className="text-2xl text-text-secondary ml-3">
                    ({basketLabel})
                  </span>
                )}
              </h1>
            </div>
          </div>
          <p className="text-text-secondary text-xl">{variantLabel}</p>
        </div>
        <div 
          className="flex-shrink-0 ml-4 px-6 py-4 rounded-xl font-bold text-base text-white space-y-2"
          style={{ 
            background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%)',
            boxShadow: 'var(--shadow-button)',
            minWidth: '280px',
          }}
        >
          <div className="text-sm font-normal opacity-95">Product Details</div>
          
          {/* Underlying Chips Row */}
          <div className="flex flex-wrap gap-1.5">
            {terms.underlyings.map((u, idx) => {
              const { logoUrl, fallback } = getLogoWithFallback(u.ticker, u.name);
              return (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30"
                  style={{ fontSize: '13px' }}
                >
                  <img
                    src={logoUrl}
                    alt={u.ticker}
                    className="w-4 h-4 rounded object-contain bg-white"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                    }}
                  />
                  <span className="font-semibold">{u.ticker}</span>
                </div>
              );
            })}
          </div>

          {/* Key Info */}
          <div className="space-y-1 text-sm font-medium">
            <div className="flex items-center justify-between">
              <span className="opacity-90">Duration:</span>
              <span className="font-semibold">{terms.tenorMonths}M</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-90">Currency:</span>
              <span className="font-semibold">{terms.currency}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-90">{terms.variant === 'standard_barrier_rc' ? 'Barrier:' : 'Strike:'}</span>
              <span className="font-semibold">{formatPercent(terms.barrierPct || terms.strikePct || 0, 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-90">Autocall:</span>
              <span className="font-semibold">
                {terms.autocallEnabled 
                  ? `Yes @ ${formatPercent(terms.autocallLevelPct || 1.0, 0)}`
                  : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-90">1st Observation:</span>
              <span className="font-semibold text-xs">{getFirstObservationDate()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiTile
          icon={<TrendingUp className="w-5 h-5" />}
          value={couponRatePercent}
          subtitle="Coupon Rate (p.a.)"
          gradient="success"
        />
        <KpiTile
          icon={<Shield className="w-5 h-5" />}
          value={formatPercent(terms.barrierPct || terms.strikePct || 0, 0)}
          subtitle={terms.variant === 'standard_barrier_rc' ? 'Barrier Level' : 'Strike Level'}
          gradient="primary"
        />
      </div>

      {/* Basket Info (if worst-of) */}
      {terms.basketType === 'worst_of' && (
        <div className="mt-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--accent-teal-bg)', borderColor: 'var(--accent-teal)' }}>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-accent-teal-dark" />
            <div>
              <span className="font-semibold text-text-primary">Mechanic: </span>
              <span className="text-accent-teal-dark font-bold">Worst-of at maturity</span>
              <span className="text-text-secondary ml-2">
                (based on final vs reference)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
