/**
 * Product Input Form
 * Form for entering Reverse Convertible product parameters
 * Supports single underlying and worst-of basket (2-3 underlyings)
 */

import { useState, FormEvent } from 'react';
import type { ReverseConvertibleTerms, ReverseConvertibleVariant } from '../../products/reverseConvertible/terms';
import type { Underlying } from '../../products/common/productTypes';
import { frequencyFromString } from '../../products/common/productTypes';
import { validateReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import { SymbolInput } from './SymbolInput';
import { Plus, X } from 'lucide-react';

interface ProductInputFormProps {
  onSubmit: (terms: ReverseConvertibleTerms) => void;
  loading?: boolean;
}

interface UnderlyingInput {
  symbol: string;
  name: string;
}

export function ProductInputForm({ onSubmit, loading = false }: ProductInputFormProps) {
  const [basketType, setBasketType] = useState<'single' | 'worst_of'>('single');
  const [underlyings, setUnderlyings] = useState<UnderlyingInput[]>([
    { symbol: 'AAPL', name: 'Apple Inc.' },
  ]);

  const [formData, setFormData] = useState({
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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

  const handleBasketTypeChange = (type: 'single' | 'worst_of') => {
    setBasketType(type);
    if (type === 'single') {
      setUnderlyings([underlyings[0] || { symbol: '', name: '' }]);
    } else {
      // Ensure at least 2 underlyings for worst-of
      if (underlyings.length < 2) {
        setUnderlyings([
          underlyings[0] || { symbol: '', name: '' },
          { symbol: '', name: '' },
        ]);
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Build underlyings array
    const underlyingsArray: Underlying[] = underlyings.map(u => ({
      ticker: u.symbol.trim().toUpperCase(),
      name: u.name || undefined,
    }));

    // Get initial fixings (will be set from API data, use current prices as placeholder)
    const initialFixings = underlyingsArray.map(() => 100); // Placeholder, will be replaced by API data

    const terms: ReverseConvertibleTerms = {
      notional: parseFloat(formData.notional),
      currency: formData.currency,
      basketType,
      underlyings: underlyingsArray,
      initialFixings,
      tenorMonths: parseInt(formData.tenorMonths),
      couponRatePA: parseFloat(formData.couponRate) / 100, // Convert % to decimal
      couponFreqPerYear: frequencyFromString(formData.couponFrequency),
      couponCondition: 'unconditional',
      conversionRatio: parseFloat(formData.conversionRatio),
      variant: formData.variant,
    };

    // Add variant-specific fields
    if (formData.variant === 'standard_barrier_rc') {
      terms.barrierPct = parseFloat(formData.barrierPct) / 100;
    } else {
      terms.strikePct = parseFloat(formData.strikePct) / 100;
      if (formData.knockInBarrierPct) {
        terms.knockInBarrierPct = parseFloat(formData.knockInBarrierPct) / 100;
      }
    }

    // Validate
    const validation = validateReverseConvertibleTerms(terms);
    if (!validation.valid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((error) => {
        // Map errors to form fields
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
  };

  const isStandardVariant = formData.variant === 'standard_barrier_rc';

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="section-card">
        <h2 className="text-3xl font-bold mb-6 text-valura-ink">
          Reverse Convertible Product Configuration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Notional Amount</label>
              <input
                type="number"
                className="input-field"
                value={formData.notional}
                onChange={(e) => handleChange('notional', e.target.value)}
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
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
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
                value={formData.tenorMonths}
                onChange={(e) => handleChange('tenorMonths', e.target.value)}
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
              <div className="flex space-x-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="basketType"
                    value="single"
                    checked={basketType === 'single'}
                    onChange={() => handleBasketTypeChange('single')}
                    className="w-5 h-5 text-valura-ink"
                  />
                  <span className="text-valura-ink">Single Underlying</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="basketType"
                    value="worst_of"
                    checked={basketType === 'worst_of'}
                    onChange={() => handleBasketTypeChange('worst_of')}
                    className="w-5 h-5 text-valura-ink"
                  />
                  <span className="text-valura-ink">Worst-Of Basket (2-3)</span>
                </label>
              </div>
            </div>

            {/* Underlying Inputs */}
            <div className="space-y-4">
              {underlyings.map((underlying, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-1">
                    <SymbolInput
                      value={underlying.symbol}
                      onChange={(symbol, name) => handleUnderlyingChange(index, symbol, name)}
                      label={`Underlying ${index + 1}${basketType === 'worst_of' ? ' (Worst-Of)' : ''}`}
                      placeholder="Search symbol (e.g., AAPL)"
                      required
                    />
                    {underlying.name && (
                      <p className="text-sm text-muted mt-1 ml-1">{underlying.name}</p>
                    )}
                  </div>
                  {basketType === 'worst_of' && underlyings.length > 2 && (
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
              {basketType === 'worst_of' && underlyings.length < 3 && (
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

          {/* Coupon Terms */}
          <div className="border-t border-border pt-6">
            <h3 className="text-xl font-semibold mb-4 text-valura-ink">Coupon Terms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Coupon Rate (%)</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.couponRate}
                  onChange={(e) => handleChange('couponRate', e.target.value)}
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
                  value={formData.couponFrequency}
                  onChange={(e) => handleChange('couponFrequency', e.target.value)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi-annual">Semi-Annual</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Variant Selection */}
          <div className="border-t border-border pt-6">
            <h3 className="text-xl font-semibold mb-4 text-valura-ink">Product Variant</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="variant"
                  value="standard_barrier_rc"
                  checked={formData.variant === 'standard_barrier_rc'}
                  onChange={(e) => handleChange('variant', e.target.value)}
                  className="w-5 h-5 text-valura-ink"
                />
                <span className="text-valura-ink">Standard Barrier Reverse Convertible</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="variant"
                  value="low_strike_geared_put"
                  checked={formData.variant === 'low_strike_geared_put'}
                  onChange={(e) => handleChange('variant', e.target.value)}
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
                    value={formData.barrierPct}
                    onChange={(e) => handleChange('barrierPct', e.target.value)}
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
                    value={formData.strikePct}
                    onChange={(e) => handleChange('strikePct', e.target.value)}
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
                    value={formData.knockInBarrierPct}
                    onChange={(e) => handleChange('knockInBarrierPct', e.target.value)}
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

          {/* Conversion Terms */}
          <div className="border-t border-border pt-6">
            <h3 className="text-xl font-semibold mb-4 text-valura-ink">Conversion Terms</h3>
            <div>
              <label className="label">Conversion Ratio</label>
              <input
                type="number"
                className="input-field"
                value={formData.conversionRatio}
                onChange={(e) => handleChange('conversionRatio', e.target.value)}
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
