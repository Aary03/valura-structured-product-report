/**
 * CPPN Hero Header
 * Mirrors the RC hero layout but with CPPN-specific KPIs.
 */

import type { CapitalProtectedParticipationTerms } from '../../products/capitalProtectedParticipation/terms';
import { KpiTile } from '../common/KpiTile';
import { Shield, TrendingUp, Layers } from 'lucide-react';
import { getLogoWithFallback } from '../../utils/logo';

interface CppnHeroHeaderProps {
  terms: CapitalProtectedParticipationTerms;
}

export function CppnHeroHeader({ terms }: CppnHeroHeaderProps) {
  const basketLabel =
    terms.basketType === 'single'
      ? terms.underlyings[0]?.ticker || ''
      : terms.underlyings.map((u) => u.ticker).join(' / ');

  const capText = terms.capType === 'capped' ? `Cap: ${terms.capLevelPct}%` : 'Cap: None';
  const kiText = terms.knockInEnabled ? `KI: ${terms.knockInLevelPct}% • S: ${terms.downsideStrikePct ?? terms.knockInLevelPct}%` : 'KI: Off';

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
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
                Capital Protected Participation Note
                {terms.basketType !== 'single' && (
                  <span className="text-2xl text-text-secondary ml-3">
                    ({basketLabel})
                  </span>
                )}
              </h1>
            </div>
          </div>
          <p className="text-text-secondary text-xl">
            Principal Protected + {terms.participationDirection === 'up' ? 'Upside' : 'Downside'} Participation
          </p>
        </div>

        <div
          className="flex-shrink-0 ml-4 px-5 py-3 rounded-lg font-bold text-base text-white"
          style={{
            background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%)',
            boxShadow: 'var(--shadow-button)',
          }}
        >
          <div className="text-sm font-normal mb-1 opacity-95">Key Features</div>
          <div className="text-base font-semibold">
            {terms.tenorMonths}M • {terms.currency} • Starts: {terms.participationStartPct}% • {capText}
          </div>
          <div className="text-sm font-normal mt-1 opacity-95">{kiText}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiTile
          icon={<Shield className="w-5 h-5" />}
          value={`${terms.capitalProtectionPct}%`}
          subtitle="Capital Protection (floor)"
          gradient="primary"
        />
        <KpiTile
          icon={<TrendingUp className="w-5 h-5" />}
          value={`${terms.participationRatePct}%`}
          subtitle="Participation Rate"
          gradient="success"
        />
      </div>

      {terms.basketType !== 'single' && (
        <div className="mt-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--accent-teal-bg)', borderColor: 'var(--accent-teal)' }}>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-accent-teal-dark" />
            <div>
              <span className="font-semibold text-text-primary">Mechanic: </span>
              <span className="text-accent-teal-dark font-bold">{terms.basketType.replace('_', '-')}</span>
              <span className="text-text-secondary ml-2">(basket level at maturity)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


