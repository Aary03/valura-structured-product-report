/**
 * Product Details Component
 * Specifications table and underlying information
 */

import type { ReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import type { Underlying } from '../../products/common/productTypes';
import { frequencyToString } from '../../products/common/productTypes';
import { formatPercent, formatNumber } from '../../core/utils/math';
import { addMonths } from '../../core/types/dates';
import { getCurrentISODate } from '../../core/types/dates';
import { formatDate } from '../../core/types/dates';
import { getLogoWithFallback } from '../../utils/logo';

interface ProductDetailsProps {
  terms: ReverseConvertibleTerms;
}

export function ProductDetails({ terms }: ProductDetailsProps) {
  const maturityDate = addMonths(getCurrentISODate(), terms.tenorMonths);
  // Use new underlyings array structure
  const underlying = terms.underlyings?.[0];
  
  if (!underlying) {
    return (
      <div className="section-card">
        <h2 className="text-2xl font-bold mb-4 text-grey-dark">Product Details</h2>
        <p className="text-grey-medium">No underlying information available</p>
      </div>
    );
  }

  const barrierOrStrikeLabel =
    terms.variant === 'standard_barrier_rc' ? 'Barrier Level' : 'Strike Level';
  const barrierOrStrikeValue =
    terms.variant === 'standard_barrier_rc'
      ? formatPercent(terms.barrierPct || 0, 0)
      : formatPercent(terms.strikePct || 0, 0);

  return (
    <div className="section-card">
      <h2 className="text-2xl font-bold mb-4 text-grey-dark">Product Details</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-grey-dark mb-2">
          {terms.basketType === 'worst_of' ? 'Underlying Assets (Worst-Of Basket)' : 'Underlying Asset'}
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          {terms.underlyings.map((underlyingItem, index) => {
            const { logoUrl, fallback } = getLogoWithFallback(underlyingItem.ticker, underlyingItem.name);
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center overflow-hidden border-2 border-blue-primary shadow-sm relative">
                  <img
                    src={logoUrl}
                    alt={underlyingItem.ticker}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      // Fallback to initials if image fails
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const existingFallback = parent.querySelector('.logo-fallback');
                        if (!existingFallback) {
                          const fallbackEl = document.createElement('div');
                          fallbackEl.className = 'logo-fallback text-blue-primary font-bold text-xl absolute inset-0 flex items-center justify-center';
                          fallbackEl.textContent = fallback;
                          parent.appendChild(fallbackEl);
                        }
                      }
                    }}
                  />
                  <div className="logo-fallback text-blue-primary font-bold text-xl absolute inset-0 flex items-center justify-center hidden">
                    {fallback}
                  </div>
                </div>
                <div>
                  <span className="text-xl font-bold text-blue-primary block">
                    {underlyingItem.ticker}
                  </span>
                  {underlyingItem.name && (
                    <span className="text-grey-medium text-sm">{underlyingItem.name}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-grey-background">
            <th className="text-left p-3 border-b-2 border-grey-border font-semibold text-grey-dark text-sm w-[50%]">
              Specification
            </th>
            <th className="text-left p-3 border-b-2 border-grey-border font-semibold text-grey-dark text-sm w-[50%]">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-grey-border">
            <td className="p-3 text-grey-medium text-sm">Coupon Rate</td>
            <td className="p-3 font-semibold text-grey-dark text-sm">
              {formatPercent(terms.couponRatePA, 2)} p.a.
            </td>
          </tr>
          <tr className="border-b border-grey-border">
            <td className="p-3 text-grey-medium text-sm">Coupon Frequency</td>
            <td className="p-3 font-semibold text-grey-dark text-sm">
              {frequencyToString(terms.couponFreqPerYear)}
            </td>
          </tr>
          <tr className="border-b border-grey-border">
            <td className="p-3 text-grey-medium text-sm">{barrierOrStrikeLabel}</td>
            <td className="p-3 font-semibold text-grey-dark text-sm">{barrierOrStrikeValue}</td>
          </tr>
          {terms.variant === 'low_strike_geared_put' && terms.knockInBarrierPct && (
            <tr className="border-b border-grey-border">
              <td className="p-3 text-grey-medium text-sm">Knock-in Barrier</td>
              <td className="p-3 font-semibold text-grey-dark text-sm">
                {formatPercent(terms.knockInBarrierPct, 0)}
              </td>
            </tr>
          )}
          <tr className="border-b border-grey-border">
            <td className="p-3 text-grey-medium text-sm">Maturity Date</td>
            <td className="p-3 font-semibold text-grey-dark text-sm">
              {formatDate(maturityDate, 'long')}
            </td>
          </tr>
          <tr className="border-b border-grey-border">
            <td className="p-3 text-grey-medium text-sm">
              {terms.basketType === 'worst_of' ? 'Underlyings (Worst-Of)' : 'Underlying'}
            </td>
            <td className="p-3 font-semibold text-grey-dark text-sm">
              {terms.basketType === 'worst_of'
                ? terms.underlyings.map(u => u.ticker).join(' / ')
                : underlying.ticker}
            </td>
          </tr>
          <tr className="border-b border-grey-border">
            <td className="p-3 text-grey-medium text-sm">Conversion Ratio</td>
            <td className="p-3 font-semibold text-grey-dark text-sm">
              {formatNumber(terms.conversionRatio, 2)}
            </td>
          </tr>
          <tr>
            <td className="p-3 text-grey-medium text-sm">Delivery</td>
            <td className="p-3 font-semibold text-grey-dark text-sm">Cash / Shares</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

