/**
 * AI Draft to Product Terms Converter
 * Converts AI conversation draft into valid product terms
 */

import type { ReportDraft } from './aiReportAssistant';
import type { ReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import type { CapitalProtectedParticipationTerms } from '../../products/capitalProtectedParticipation/terms';
import type { ProductTerms } from '../../hooks/useReportGenerator';
import { getDefaultReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import { getDefaultCapitalProtectedParticipationTerms } from '../../products/capitalProtectedParticipation/terms';

/**
 * Convert AI draft to valid product terms
 */
export function convertDraftToTerms(draft: ReportDraft): ProductTerms | null {
  if (!draft.productType || !draft.underlyings || draft.underlyings.length === 0) {
    return null;
  }

  const params = draft.parameters as any;
  if (!params) return null;

  // Build underlyings array
  const underlyings = draft.underlyings.map(u => ({
    ticker: u.ticker,
    name: u.name,
  }));

  // Common fields
  const notional = params.notional || 100000;
  const tenorMonths = params.tenorMonths || 12;
  const basketType = underlyings.length > 1 ? 'worst_of' : 'single';

  if (draft.productType === 'RC') {
    // Build Reverse Convertible terms
    const defaults = getDefaultReverseConvertibleTerms();
    
    const variant = params.variant || 'standard_barrier_rc';
    const barrierPct = params.barrierPct || params.strikePct || 0.70;
    const couponRatePA = params.couponRatePA || 0.10;
    const couponFreqPerYear = params.couponFreqPerYear || 4;

    // Get initial fixings (use current prices as defaults)
    const initialFixings = params.initialFixings || underlyings.map(() => 100);

    const terms: ReverseConvertibleTerms = {
      ...defaults,
      productType: 'RC',
      notional,
      basketType: basketType as 'single' | 'worst_of',
      underlyings,
      initialFixings,
      tenorMonths,
      couponRatePA,
      couponFreqPerYear: couponFreqPerYear as 1 | 2 | 4 | 12,
      variant,
      ...(variant === 'standard_barrier_rc' ? { barrierPct } : {}),
      ...(variant === 'low_strike_geared_put' ? { 
        strikePct: barrierPct,
        knockInBarrierPct: params.knockInBarrierPct || barrierPct,
      } : {}),
    };

    return terms;
  } else if (draft.productType === 'CPPN' || draft.productType === 'Bonus') {
    // Build CPPN/Bonus terms
    const defaults = getDefaultCapitalProtectedParticipationTerms();
    
    const isBonus = draft.productType === 'Bonus';
    const capitalProtectionPct = isBonus ? 0 : (params.capitalProtectionPct !== undefined ? params.capitalProtectionPct : 100);
    const participationRatePct = params.participationRatePct || (isBonus ? 100 : 120);
    const participationStartPct = params.participationStartPct || 100;
    const participationDirection = params.participationDirection || 'up';

    // Get initial fixings
    const initialFixings = params.initialFixings || underlyings.map(() => 100);

    const terms: CapitalProtectedParticipationTerms = {
      ...defaults,
      productType: 'CPPN',
      notional,
      tenorMonths,
      underlyings,
      initialFixings,
      basketType: basketType as any,
      capitalProtectionPct,
      participationDirection,
      participationStartPct,
      participationRatePct,
      capType: params.capType || 'none',
      ...(params.capType === 'capped' ? { capLevelPct: params.capLevelPct || 140 } : {}),
      knockInEnabled: params.knockInEnabled || false,
      knockInMode: 'EUROPEAN',
      ...(!isBonus && params.knockInEnabled ? { 
        knockInLevelPct: params.knockInLevelPct || 70,
        downsideStrikePct: params.downsideStrikePct || params.knockInLevelPct || 70,
      } : {}),
      bonusEnabled: isBonus,
      ...(isBonus ? {
        bonusLevelPct: params.bonusLevelPct || 108,
        bonusBarrierPct: params.bonusBarrierPct || 60,
        participationRatePct: participationRatePct,
        participationStartPct: participationStartPct,
      } : {}),
    };

    return terms;
  }

  return null;
}

/**
 * Validate if draft is ready for conversion
 */
export function isDraftReadyForGeneration(draft: ReportDraft): boolean {
  return draft.completeness >= 80 && draft.missingFields.length === 0;
}

