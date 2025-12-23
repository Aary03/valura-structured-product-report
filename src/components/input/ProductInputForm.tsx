/**
 * Product Input Form
 * Form for entering Reverse Convertible product parameters
 * Supports single underlying and worst-of basket (2-3 underlyings)
 */

import { useEffect, useMemo, useState, FormEvent } from 'react';
import type { ReverseConvertibleTerms, ReverseConvertibleVariant } from '../../products/reverseConvertible/terms';
import type { CapitalProtectedParticipationTerms } from '../../products/capitalProtectedParticipation/terms';
import { validateCapitalProtectedParticipationTerms } from '../../products/capitalProtectedParticipation/terms';
import type { Underlying, BasketType } from '../../products/common/productTypes';
import { frequencyFromString } from '../../products/common/productTypes';
import { validateReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import { SymbolInput } from './SymbolInput';
import { Plus, X } from 'lucide-react';
import { computeSMinForContinuity, computeProtectedPayoffPctAtX } from '../../products/capitalProtectedParticipation/guards';

interface ProductInputFormProps {
  onSubmit: (terms: ReverseConvertibleTerms | CapitalProtectedParticipationTerms) => void;
  loading?: boolean;
}

interface UnderlyingInput {
  symbol: string;
  name: string;
}

export function ProductInputForm({ onSubmit, loading = false }: ProductInputFormProps) {
  const [productType, setProductType] = useState<'RC' | 'CPPN'>('RC');
  const [basketTypeRC, setBasketTypeRC] = useState<'single' | 'worst_of'>('single');
  const [basketTypeCPPN, setBasketTypeCPPN] = useState<BasketType>('single');
  const [underlyings, setUnderlyings] = useState<UnderlyingInput[]>([
    { symbol: 'AAPL', name: 'Apple Inc.' },
  ]);

  const [rcFormData, setRcFormData] = useState({
    notional: '100000',
    currency: 'USD' as const,
    tenorMonths: '12',
    couponRate: '10', // Percentage
    couponFrequency: 'quarterly',
    variant: 'standard_barrier_rc' as ReverseConvertibleVariant,
    barrierPct: '70', // Percentage
    strikePct: '55', // Percentage
    knockInBarrierPct: '',
    conversionRatio: '1.0',
    autocallEnabled: false,
    autocallLevelPct: '100', // Percentage
    autocallFrequency: '', // Default: same as coupon frequency
  });

  type CppnFormState = {
    notional: string;
    currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
    tenorMonths: string;
    capitalProtectionPct: string;
    participationDirection: 'up' | 'down';
    participationStartPct: string;
    participationRatePct: string;
    capType: 'none' | 'capped';
    capLevelPct: string;
    knockInEnabled: boolean;
    knockInLevelPct: string;
    downsideStrikePct: string;
  };

  const [cppnFormData, setCppnFormData] = useState<CppnFormState>({
    notional: '100000',
    currency: 'USD',
    tenorMonths: '12',
    capitalProtectionPct: '100', // P
    participationDirection: 'up', // up | down
    participationStartPct: '100', // K
    participationRatePct: '120', // α
    capType: 'none', // none | capped
    capLevelPct: '140', // C
    knockInEnabled: false,
    knockInLevelPct: '70', // KI
    downsideStrikePct: '', // S (default: KI)
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRcChange = (field: string, value: string) => {
    setRcFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCppnChange = (field: string, value: string) => {
    setCppnFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleUnderlyingChange = (index: number, symbol: string, name?: string) => {
    const newUnderlyings = [...underlyings];
    newUnderlyings[index] = {
      symbol: symbol.toUpperCase(),
      name: name || newUnderlyings[index].name,
    };
    setUnderlyings(newUnderlyings);
  };

  const handleAddUnderlying = () => {
    if (underlyings.length < 3) {
      setUnderlyings([...underlyings, { symbol: '', name: '' }]);
    }
  };

  const handleRemoveUnderlying = (index: number) => {
    if (underlyings.length > 1) {
      const newUnderlyings = underlyings.filter((_, i) => i !== index);
      setUnderlyings(newUnderlyings);
    }
  };

  const ensureUnderlyingCountForBasket = (type: 'single' | 'worst_of' | 'best_of' | 'average') => {
    if (type === 'single') {
      setUnderlyings([underlyings[0] || { symbol: '', name: '' }]);
    } else {
      if (underlyings.length < 2) {
        setUnderlyings([
          underlyings[0] || { symbol: '', name: '' },
          { symbol: '', name: '' },
        ]);
      }
    }
  };

  const handleBasketTypeChangeRC = (type: 'single' | 'worst_of') => {
    setBasketTypeRC(type);
    ensureUnderlyingCountForBasket(type);
  };

  const handleBasketTypeChangeCPPN = (type: BasketType) => {
    setBasketTypeCPPN(type);
    ensureUnderlyingCountForBasket(type);
  };

  const activeBasketType = productType === 'RC' ? basketTypeRC : basketTypeCPPN;

  const canAddUnderlying = useMemo(() => {
    return activeBasketType !== 'single' && underlyings.length < 3;
  }, [activeBasketType, underlyings.length]);

  const cppnStrikeGuard = useMemo(() => {
    if (productType !== 'CPPN') return null;
    if (!cppnFormData.knockInEnabled) return null;
    const P = parseFloat(cppnFormData.capitalProtectionPct);
    const KI = parseFloat(cppnFormData.knockInLevelPct);
    if (!Number.isFinite(P) || !Number.isFinite(KI) || P <= 0 || KI <= 0) return null;

    const params = {
      capitalProtectionPct: P,
      participationDirection: cppnFormData.participationDirection,
      participationStartPct: parseFloat(cppnFormData.participationStartPct) || 100,
      participationRatePct: parseFloat(cppnFormData.participationRatePct) || 100,
      capType: cppnFormData.capType,
      capLevelPct: cppnFormData.capType === 'capped' ? (parseFloat(cppnFormData.capLevelPct) || undefined) : undefined,
    } as const;

    const protectedAtKI = computeProtectedPayoffPctAtX(params, KI);
    const sMin = computeSMinForContinuity(params, KI, 1);
    const lock = P < 100;
    return { sMin, protectedAtKI, lock };
  }, [productType, cppnFormData]);

  // Auto-lock S to S_min when KI enabled and P < 100 (prevents discontinuity / "breach becomes better")
  useEffect(() => {
    if (productType !== 'CPPN') return;
    if (!cppnFormData.knockInEnabled) return;
    if (!cppnStrikeGuard) return;
    if (!cppnStrikeGuard.lock) return;
    if (!Number.isFinite(cppnStrikeGuard.sMin)) return;
    const next = cppnStrikeGuard.sMin.toFixed(2);
    if (cppnFormData.downsideStrikePct !== next) {
      setCppnFormData((prev) => ({ ...prev, downsideStrikePct: next }));
    }
  }, [productType, cppnFormData.knockInEnabled, cppnStrikeGuard, cppnFormData.downsideStrikePct]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Build underlyings array
    const underlyingsArray: Underlying[] = underlyings.map(u => ({
      ticker: u.symbol.trim().toUpperCase(),
      name: u.name || undefined,
    }));

    // Get initial fixings (will be set from API data, use current prices as placeholder)
    const initialFixings = underlyingsArray.map(() => 100); // Placeholder, will be replaced by API data

    if (productType === 'RC') {
      const terms: ReverseConvertibleTerms = {
        productType: 'RC',
        notional: parseFloat(rcFormData.notional),
        currency: rcFormData.currency,
        basketType: basketTypeRC,
        underlyings: underlyingsArray,
        initialFixings,
        tenorMonths: parseInt(rcFormData.tenorMonths),
        couponRatePA: parseFloat(rcFormData.couponRate) / 100, // Convert % to decimal
        couponFreqPerYear: frequencyFromString(rcFormData.couponFrequency),
        couponCondition: 'unconditional',
        conversionRatio: parseFloat(rcFormData.conversionRatio),
        variant: rcFormData.variant,
      };

      if (rcFormData.variant === 'standard_barrier_rc') {
        terms.barrierPct = parseFloat(rcFormData.barrierPct) / 100;
      } else {
        terms.strikePct = parseFloat(rcFormData.strikePct) / 100;
        if (rcFormData.knockInBarrierPct) {
          terms.knockInBarrierPct = parseFloat(rcFormData.knockInBarrierPct) / 100;
        }
      }

      // Add autocall terms if enabled
      if (rcFormData.autocallEnabled) {
        terms.autocallEnabled = true;
        terms.autocallLevelPct = parseFloat(rcFormData.autocallLevelPct) / 100;
        terms.autocallFrequency = rcFormData.autocallFrequency 
          ? frequencyFromString(rcFormData.autocallFrequency)
          : terms.couponFreqPerYear; // Default to coupon frequency
      }

      const validation = validateReverseConvertibleTerms(terms);
      if (!validation.valid) {
        const errorMap: Record<string, string> = {};
        validation.errors.forEach((error) => {
          if (error.includes('Notional')) errorMap.notional = error;
          else if (error.includes('Tenor')) errorMap.tenorMonths = error;
          else if (error.includes('Coupon')) errorMap.couponRate = error;
          else if (error.includes('Barrier')) errorMap.barrierPct = error;
          else if (error.includes('Strike')) errorMap.strikePct = error;
          else if (error.includes('Conversion')) errorMap.conversionRatio = error;
          else if (error.includes('underlying') || error.includes('Underlying')) errorMap.underlyings = error;
          else errorMap._general = error;
        });
        setErrors(errorMap);
        return;
      }

      setErrors({});
      onSubmit(terms);
      return;
    }

    const capType = cppnFormData.capType;
    const knockInEnabled = cppnFormData.knockInEnabled;
    const ki = knockInEnabled ? parseFloat(cppnFormData.knockInLevelPct) : undefined;
    const strikeS =
      knockInEnabled
        ? (cppnFormData.downsideStrikePct ? parseFloat(cppnFormData.downsideStrikePct) : ki)
        : undefined;

    const terms: CapitalProtectedParticipationTerms = {
      productType: 'CPPN',
      notional: parseFloat(cppnFormData.notional),
      currency: cppnFormData.currency,
      tenorMonths: parseInt(cppnFormData.tenorMonths),
      underlyings: underlyingsArray,
      initialFixings,
      basketType: basketTypeCPPN,
      capitalProtectionPct: parseFloat(cppnFormData.capitalProtectionPct),
      participationDirection: cppnFormData.participationDirection,
      participationStartPct: parseFloat(cppnFormData.participationStartPct),
      participationRatePct: parseFloat(cppnFormData.participationRatePct),
      capType,
      capLevelPct: capType === 'capped' ? parseFloat(cppnFormData.capLevelPct) : undefined,
      knockInEnabled,
      knockInMode: 'EUROPEAN',
      knockInLevelPct: knockInEnabled ? ki : undefined,
      downsideStrikePct: knockInEnabled ? strikeS : undefined,
    };

    const validation = validateCapitalProtectedParticipationTerms(terms);
    if (!validation.valid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((error) => {
        if (error.includes('Notional')) errorMap.notional = error;
        else if (error.includes('Tenor')) errorMap.tenorMonths = error;
        else if (error.includes('Capital protection')) errorMap.capitalProtectionPct = error;
        else if (error.includes('Participation start')) errorMap.participationStartPct = error;
        else if (error.includes('Participation rate')) errorMap.participationRatePct = error;
        else if (error.includes('Cap level')) errorMap.capLevelPct = error;
        else if (error.includes('Knock-in')) errorMap.knockInLevelPct = error;
        else if (error.includes('Downside strike')) errorMap.downsideStrikePct = error;
        else if (error.includes('underlying') || error.includes('Underlying')) errorMap.underlyings = error;
        else errorMap._general = error;
      });
      setErrors(errorMap);
      return;
    }

    setErrors({});
    onSubmit(terms);
  };

  const isStandardVariant = rcFormData.variant === 'standard_barrier_rc';

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="section-card">
        <h2 className="text-3xl font-bold mb-6 text-valura-ink">
          {productType === 'RC'
            ? 'Reverse Convertible Product Configuration'
            : 'Capital Protected Participation Note Configuration'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selector */}
          <div className="border border-border rounded-lg p-4 bg-surface shadow-soft">
            <div className="label mb-2">Product Type</div>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="productType"
                  value="RC"
                  checked={productType === 'RC'}
                  onChange={() => {
                    setProductType('RC');
                    // Ensure RC only uses single / worst-of baskets
                    if (basketTypeRC !== 'single' && basketTypeRC !== 'worst_of') setBasketTypeRC('single');
                  }}
                  className="w-5 h-5 text-valura-ink"
                />
                <span className="text-valura-ink font-medium">Reverse Convertible</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="productType"
                  value="CPPN"
                  checked={productType === 'CPPN'}
                  onChange={() => setProductType('CPPN')}
                  className="w-5 h-5 text-valura-ink"
                />
                <span className="text-valura-ink font-medium">Capital Protected Participation Note</span>
              </label>
            </div>
            <div className="text-sm text-muted mt-2">
              {productType === 'RC'
                ? 'Income-focused note with conditional downside via barrier/strike.'
                : 'Principal protected participation note with optional knock-in (airbag-style).'}
            </div>
          </div>
          {/* Basic Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Notional Amount</label>
              <input
                type="number"
                className="input-field"
                value={productType === 'RC' ? rcFormData.notional : cppnFormData.notional}
                onChange={(e) =>
                  productType === 'RC'
                    ? handleRcChange('notional', e.target.value)
                    : handleCppnChange('notional', e.target.value)
                }
                required
                min="1"
              />
              {errors.notional && (
                <p className="text-danger-fg text-sm mt-1">{errors.notional}</p>
              )}
            </div>

            <div>
              <label className="label">Currency</label>
              <select
                className="input-field"
                value={productType === 'RC' ? rcFormData.currency : cppnFormData.currency}
                onChange={(e) =>
                  productType === 'RC'
                    ? handleRcChange('currency', e.target.value)
                    : handleCppnChange('currency', e.target.value)
                }
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>

            <div>
              <label className="label">Tenor (Months)</label>
              <input
                type="number"
                className="input-field"
                value={productType === 'RC' ? rcFormData.tenorMonths : cppnFormData.tenorMonths}
                onChange={(e) =>
                  productType === 'RC'
                    ? handleRcChange('tenorMonths', e.target.value)
                    : handleCppnChange('tenorMonths', e.target.value)
                }
                required
                min="1"
              />
              {errors.tenorMonths && (
                <p className="text-danger-fg text-sm mt-1">{errors.tenorMonths}</p>
              )}
            </div>
          </div>

          {/* Basket Type Selection */}
          <div className="border-t border-border pt-6">
            <h3 className="text-xl font-semibold mb-4 text-valura-ink">Underlying Selection</h3>
            <div className="space-y-4 mb-6">
              {productType === 'RC' ? (
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="basketType"
                      value="single"
                      checked={basketTypeRC === 'single'}
                      onChange={() => handleBasketTypeChangeRC('single')}
                      className="w-5 h-5 text-valura-ink"
                    />
                    <span className="text-valura-ink">Single Underlying</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="basketType"
                      value="worst_of"
                      checked={basketTypeRC === 'worst_of'}
                      onChange={() => handleBasketTypeChangeRC('worst_of')}
                      className="w-5 h-5 text-valura-ink"
                    />
                    <span className="text-valura-ink">Worst-Of Basket (2-3)</span>
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Basket Method</label>
                    <select
                      className="input-field"
                      value={basketTypeCPPN}
                      onChange={(e) => handleBasketTypeChangeCPPN(e.target.value as BasketType)}
                    >
                      <option value="single">Single Underlying</option>
                      <option value="worst_of">Worst-of Basket</option>
                      <option value="best_of">Best-of Basket</option>
                      <option value="average">Average Basket</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Underlying Inputs */}
            <div className="space-y-4">
              {underlyings.map((underlying, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-1">
                    <SymbolInput
                      value={underlying.symbol}
                      onChange={(symbol, name) => handleUnderlyingChange(index, symbol, name)}
                      label={`Underlying ${index + 1}${activeBasketType === 'single' ? '' : ' (Basket)'}`}
                      placeholder="Search symbol (e.g., AAPL)"
                      required
                    />
                    {underlying.name && (
                      <p className="text-sm text-muted mt-1 ml-1">{underlying.name}</p>
                    )}
                  </div>
                  {activeBasketType !== 'single' && underlyings.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUnderlying(index)}
                      className="mt-8 p-2 text-danger-fg hover:bg-danger-bg rounded-md transition-colors"
                      title="Remove underlying"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              {canAddUnderlying && (
                <button
                  type="button"
                  onClick={handleAddUnderlying}
                  className="flex items-center space-x-2 px-4 py-2 text-valura-ink border border-border rounded-md hover:bg-valura-mint-100 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Underlying</span>
                </button>
              )}
              {errors.underlyings && (
                <p className="text-danger-fg text-sm mt-1">{errors.underlyings}</p>
              )}
            </div>
          </div>

          {/* RC-only: Coupon Terms */}
          {productType === 'RC' && (
            <div className="border-t border-border pt-6">
              <h3 className="text-xl font-semibold mb-4 text-valura-ink">Coupon Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Coupon Rate (%)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={rcFormData.couponRate}
                    onChange={(e) => handleRcChange('couponRate', e.target.value)}
                    required
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  {errors.couponRate && (
                    <p className="text-danger-fg text-sm mt-1">{errors.couponRate}</p>
                  )}
                </div>

                <div>
                  <label className="label">Coupon Frequency</label>
                  <select
                    className="input-field"
                    value={rcFormData.couponFrequency}
                    onChange={(e) => handleRcChange('couponFrequency', e.target.value)}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi-annual">Semi-Annual</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>

              {/* Autocall Section */}
              <div className="section-card mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="section-title">Autocall Feature (Optional)</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rcFormData.autocallEnabled}
                      onChange={(e) => handleRcChange('autocallEnabled', String(e.target.checked))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Enable Autocall</span>
                  </label>
                </div>

                {rcFormData.autocallEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Autocall Level (%)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={rcFormData.autocallLevelPct}
                        onChange={(e) => handleRcChange('autocallLevelPct', e.target.value)}
                        placeholder="100"
                        min="0"
                        max="200"
                        step="1"
                      />
                      <p className="text-text-secondary text-xs mt-1">
                        Level at which the product autocalls (typically 100%)
                      </p>
                    </div>

                    <div>
                      <label className="label">Autocall Frequency</label>
                      <select
                        className="input-field"
                        value={rcFormData.autocallFrequency}
                        onChange={(e) => handleRcChange('autocallFrequency', e.target.value)}
                      >
                        <option value="">Same as Coupon Frequency</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="semi-annual">Semi-Annual</option>
                        <option value="annual">Annual</option>
                      </select>
                      <p className="text-text-secondary text-xs mt-1">
                        How often autocall is observed (defaults to coupon frequency)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RC-only: Variant + Conversion */}
          {productType === 'RC' ? (
            <>
              <div className="border-t border-border pt-6">
                <h3 className="text-xl font-semibold mb-4 text-valura-ink">Product Variant</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="variant"
                      value="standard_barrier_rc"
                      checked={rcFormData.variant === 'standard_barrier_rc'}
                      onChange={(e) => handleRcChange('variant', e.target.value)}
                      className="w-5 h-5 text-valura-ink"
                    />
                    <span className="text-valura-ink">Standard Barrier Reverse Convertible</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="variant"
                      value="low_strike_geared_put"
                      checked={rcFormData.variant === 'low_strike_geared_put'}
                      onChange={(e) => handleRcChange('variant', e.target.value)}
                      className="w-5 h-5 text-valura-ink"
                    />
                    <span className="text-valura-ink">Low Strike / Geared Put</span>
                  </label>
                </div>
              </div>

              {/* Variant-Specific Fields */}
              {isStandardVariant ? (
                <div className="border-t border-border pt-6">
                  <h3 className="text-xl font-semibold mb-4 text-valura-ink">Barrier Terms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Barrier (%)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={rcFormData.barrierPct}
                        onChange={(e) => handleRcChange('barrierPct', e.target.value)}
                        required
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      {errors.barrierPct && (
                        <p className="text-danger-fg text-sm mt-1">{errors.barrierPct}</p>
                      )}
                      <p className="text-sm text-muted mt-1">
                        Conversion occurs if worst-of final level &lt; barrier
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t border-border pt-6">
                  <h3 className="text-xl font-semibold mb-4 text-valura-ink">Strike Terms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Strike (%)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={rcFormData.strikePct}
                        onChange={(e) => handleRcChange('strikePct', e.target.value)}
                        required
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      {errors.strikePct && (
                        <p className="text-danger-fg text-sm mt-1">{errors.strikePct}</p>
                      )}
                      <p className="text-sm text-muted mt-1">
                        Lower strike = higher gearing
                      </p>
                    </div>

                    <div>
                      <label className="label">Knock-in Barrier (%) (Optional)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={rcFormData.knockInBarrierPct}
                        onChange={(e) => handleRcChange('knockInBarrierPct', e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="Defaults to strike"
                      />
                      {errors.knockInBarrierPct && (
                        <p className="text-danger-fg text-sm mt-1">{errors.knockInBarrierPct}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-6">
                <h3 className="text-xl font-semibold mb-4 text-valura-ink">Conversion Terms</h3>
                <div>
                  <label className="label">Conversion Ratio</label>
                  <input
                    type="number"
                    className="input-field"
                    value={rcFormData.conversionRatio}
                    onChange={(e) => handleRcChange('conversionRatio', e.target.value)}
                    required
                    min="0.1"
                    step="0.1"
                  />
                  {errors.conversionRatio && (
                    <p className="text-danger-fg text-sm mt-1">{errors.conversionRatio}</p>
                  )}
                  <p className="text-sm text-muted mt-1">
                    Shares per unit (typically 1.0)
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* CPPN: Product Details */}
              <div className="border-t border-border pt-6">
                <h3 className="text-xl font-semibold mb-4 text-valura-ink">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Capital Protection (%)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={cppnFormData.capitalProtectionPct}
                      onChange={(e) => handleCppnChange('capitalProtectionPct', e.target.value)}
                      required
                      min="0"
                      max="200"
                      step="0.1"
                    />
                    {errors.capitalProtectionPct && (
                      <p className="text-danger-fg text-sm mt-1">{errors.capitalProtectionPct}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Participation Direction</label>
                    <select
                      className="input-field"
                      value={cppnFormData.participationDirection}
                      onChange={(e) => handleCppnChange('participationDirection', e.target.value)}
                    >
                      <option value="up">Upside Participation</option>
                      <option value="down">Downside Participation</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Participation Starts At (%)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={cppnFormData.participationStartPct}
                      onChange={(e) => handleCppnChange('participationStartPct', e.target.value)}
                      required
                      min="0"
                      max="300"
                      step="0.1"
                    />
                    {errors.participationStartPct && (
                      <p className="text-danger-fg text-sm mt-1">{errors.participationStartPct}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Participation Rate (%)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={cppnFormData.participationRatePct}
                      onChange={(e) => handleCppnChange('participationRatePct', e.target.value)}
                      required
                      min="0"
                      max="500"
                      step="0.1"
                    />
                    {errors.participationRatePct && (
                      <p className="text-danger-fg text-sm mt-1">{errors.participationRatePct}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* CPPN: Cap */}
              <div className="border-t border-border pt-6">
                <h3 className="text-xl font-semibold mb-4 text-valura-ink">Upside Cap</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Cap</label>
                    <select
                      className="input-field"
                      value={cppnFormData.capType}
                      onChange={(e) => handleCppnChange('capType', e.target.value)}
                    >
                      <option value="none">No Cap</option>
                      <option value="capped">Capped</option>
                    </select>
                  </div>
                  {cppnFormData.capType === 'capped' && (
                    <div>
                      <label className="label">Cap Level (%)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={cppnFormData.capLevelPct}
                        onChange={(e) => handleCppnChange('capLevelPct', e.target.value)}
                        required
                        min="0"
                        max="500"
                        step="0.1"
                      />
                      {errors.capLevelPct && (
                        <p className="text-danger-fg text-sm mt-1">{errors.capLevelPct}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* CPPN: Knock-In */}
              <div className="border-t border-border pt-6">
                <h3 className="text-xl font-semibold mb-4 text-valura-ink">Knock-In (Optional)</h3>
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={cppnFormData.knockInEnabled}
                    onChange={(e) => setCppnFormData((prev) => ({ ...prev, knockInEnabled: e.target.checked }))}
                    className="w-5 h-5"
                  />
                  <span className="text-valura-ink">Enable Knock-In (European, checked at maturity)</span>
                </label>

                {cppnFormData.knockInEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Knock-In Level (%)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={cppnFormData.knockInLevelPct}
                        onChange={(e) => handleCppnChange('knockInLevelPct', e.target.value)}
                        required
                        min="0"
                        max="300"
                        step="0.1"
                      />
                      {errors.knockInLevelPct && (
                        <p className="text-danger-fg text-sm mt-1">{errors.knockInLevelPct}</p>
                      )}
                      <p className="text-sm text-muted mt-1">
                        If final basket level falls below KI, payoff switches to a geared-put regime.
                      </p>
                    </div>

                    <div>
                      <label className="label">
                        {cppnStrikeGuard?.lock ? 'Downside Conversion Strike (auto) S (%)' : 'Downside Strike S (%)'}
                      </label>
                      <input
                        type="number"
                        className="input-field"
                        value={cppnFormData.downsideStrikePct}
                        onChange={(e) => handleCppnChange('downsideStrikePct', e.target.value)}
                        min="0"
                        max="300"
                        step="0.1"
                        placeholder="Defaults to KI (airbag)"
                        readOnly={!!cppnStrikeGuard?.lock}
                      />
                      {errors.downsideStrikePct && (
                        <p className="text-danger-fg text-sm mt-1">{errors.downsideStrikePct}</p>
                      )}
                      <p className="text-sm text-muted mt-1">
                        {cppnStrikeGuard?.lock ? (
                          <>
                            Strike auto-set to keep payoff smooth at KI (no jump).{' '}
                            <span className="font-mono">S_min = {cppnStrikeGuard.sMin.toFixed(2)}%</span>{' '}
                            (computed so payoff just below KI equals protected payoff at KI).
                          </>
                        ) : (
                          <>
                            Default <span className="font-mono">S = KI</span> makes the payoff curve continuous at the KI point.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* General Errors */}
          {errors._general && (
            <div className="bg-danger-bg border border-danger-fg/20 rounded-md p-4">
              <p className="text-danger-fg">{errors._general}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-border">
            <button
              type="submit"
              className="btn-primary min-w-[220px] py-3.5 text-base font-semibold"
              style={{
                boxShadow: 'var(--shadow-button)',
              }}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
