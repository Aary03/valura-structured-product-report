/**
 * Product Summary Card Component
 * Colorful pill-based card showing product overview
 * Works for Reverse Convertible and Autocallable products
 */

import { Calendar, DollarSign, Layers, Shield, BadgePercent, Plus } from 'lucide-react';
import { formatPercent, formatNumber } from '../../core/utils/math';
import { formatDate } from '../../core/types/dates';
import { addMonths, getCurrentISODate } from '../../core/types/dates';
import { getLogoWithFallback } from '../../utils/logo';

interface Underlying {
  symbol: string;
  name?: string;
  logoUrl?: string;
}

interface PillBadge {
  icon: React.ReactNode;
  label: string;
  color: 'pink' | 'orange' | 'teal' | 'blue' | 'purple';
}

interface SpecItem {
  label: string;
  value: string;
}

interface ProductSummaryCardProps {
  productType: string;
  headlineRateText: string;
  underlyings: Underlying[];
  badges: PillBadge[];
  specs: SpecItem[];
  productColor?: 'blue' | 'purple' | 'orange';
}

export function ProductSummaryCard({
  productType,
  headlineRateText,
  underlyings,
  badges,
  specs,
  productColor = 'blue',
}: ProductSummaryCardProps) {
  const colorClasses = {
    blue: {
      text: 'text-primary-blue',
      bg: 'bg-primary-blue-bg',
      border: 'border-primary-blue',
    },
    purple: {
      text: 'text-accent-purple-dark',
      bg: 'bg-accent-purple-bg',
      border: 'border-accent-purple',
    },
    orange: {
      text: 'text-accent-coral-dark',
      bg: 'bg-accent-coral-bg',
      border: 'border-accent-coral',
    },
  };

  const pillColors = {
    pink: 'bg-accent-coral-bg text-accent-coral-dark border-accent-coral',
    orange: 'bg-accent-coral-bg text-accent-coral-dark border-accent-coral',
    teal: 'bg-accent-teal-bg text-accent-teal-dark border-accent-teal',
    blue: 'bg-primary-blue-bg text-primary-blue border-primary-blue',
    purple: 'bg-accent-purple-bg text-accent-purple-dark border-accent-purple',
  };

  const productColorClass = colorClasses[productColor];

  return (
    <div 
      className="bg-surface border p-6 transition-all duration-300 hover:shadow-strong hover:-translate-y-1"
      style={{
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-card)',
        borderColor: 'var(--border-light)',
        borderWidth: '1px',
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-2xl font-extrabold ${productColorClass.text} mb-1`}>
              {productType}
            </h2>
            <div className="text-3xl font-extrabold text-text-primary">
              {headlineRateText}
            </div>
          </div>
        </div>

        {/* Underlying Chips Row */}
        {underlyings.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {underlyings.slice(0, 4).map((underlying, index) => {
              const { logoUrl, fallback } = getLogoWithFallback(underlying.symbol, underlying.name);
              return (
                <div
                  key={index}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-surface border border-border rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={logoUrl}
                      alt={underlying.symbol}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const existingFallback = parent.querySelector('.chip-fallback');
                          if (!existingFallback) {
                            const fallbackEl = document.createElement('div');
                            fallbackEl.className = 'chip-fallback text-slate-600 font-bold text-[10px] absolute inset-0 flex items-center justify-center';
                            fallbackEl.textContent = fallback;
                            parent.appendChild(fallbackEl);
                          }
                        }
                      }}
                    />
                    <div className="chip-fallback text-slate-600 font-bold text-[10px] absolute inset-0 flex items-center justify-center hidden">
                      {fallback}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-text-primary">{underlying.symbol}</span>
                </div>
              );
            })}
            {underlyings.length > 4 && (
              <div className="px-3 py-1.5 bg-surface-2 text-muted rounded-full text-sm font-semibold">
                +{underlyings.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Colorful Feature Pills Row */}
        <div className="flex flex-wrap items-center gap-2">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${pillColors[badge.color]}`}>
                <span className="flex-shrink-0">{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
              {index < badges.length - 1 && (
                <div className="mx-1 w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-3 h-3 text-muted" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border my-6"></div>

      {/* Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specs.map((spec, index) => (
          <div key={index} className="space-y-1">
            <div className="text-xs text-text-secondary font-medium">{spec.label}</div>
            <div className="text-sm font-bold text-text-primary">{spec.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

