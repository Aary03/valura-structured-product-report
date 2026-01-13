/**
 * Save Position Modal
 * Enhanced modal for saving positions with proper initial price selection
 */

import { useState, useEffect } from 'react';
import { X, Save, Calendar, Info } from 'lucide-react';
import type { ReverseConvertibleReportData, CapitalProtectedParticipationReportData } from '../../hooks/useReportGenerator';
import { InitialPriceSelector } from './InitialPriceSelector';
import { saveInvestmentPosition } from '../../services/investmentStorage';
import { generateCouponSchedule } from '../../products/common/schedule';
import { addMonths, getCurrentISODate } from '../../core/types/dates';
import type { InvestmentPosition } from '../../types/investment';

interface SavePositionModalProps {
  reportData: ReverseConvertibleReportData | CapitalProtectedParticipationReportData;
  onClose: () => void;
  onSaved: () => void;
}

export function SavePositionModal({ reportData, onClose, onSaved }: SavePositionModalProps) {
  const { terms, underlyingData } = reportData;
  const [positionName, setPositionName] = useState('');
  const [selectedPrices, setSelectedPrices] = useState<Record<string, number>>({});
  const [tradeDates, setTradeDates] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Initialize with current prices from report as default
  useEffect(() => {
    const initialPrices: Record<string, number> = {};
    underlyingData.forEach((data) => {
      initialPrices[data.symbol] = data.initialFixing || data.currentPrice;
    });
    setSelectedPrices(initialPrices);
  }, [underlyingData]);

  const handlePriceSelected = (symbol: string, price: number, date: string) => {
    setSelectedPrices(prev => ({ ...prev, [symbol]: price }));
    setTradeDates(prev => ({ ...prev, [symbol]: date }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Use the earliest trade date as inception
      const tradeDateValues = Object.values(tradeDates);
      const inceptionDate = tradeDateValues.length > 0 
        ? tradeDateValues.sort()[0] 
        : getCurrentISODate();

      const maturityDate = addMonths(inceptionDate, terms.tenorMonths);

      // Build initial fixings array from selected prices
      const initialFixings = terms.underlyings.map(u => {
        const selected = selectedPrices[u.ticker];
        if (selected && selected > 0) {
          return selected;
        }
        // Fallback to report data
        const reportPrice = underlyingData.find(d => d.symbol === u.ticker);
        return reportPrice?.initialFixing || reportPrice?.currentPrice || 100;
      });

      // Generate coupon schedule if RC product
      const couponHistory = terms.productType === 'RC'
        ? generateCouponSchedule(inceptionDate, terms.tenorMonths, terms.couponFreqPerYear).map((date, index) => ({
            date,
            amount: terms.notional * (terms.couponRatePA / terms.couponFreqPerYear),
            paid: false,
            description: `Coupon Payment ${index + 1}`,
          }))
        : [];

      // Calculate days
      const today = new Date();
      const maturity = new Date(maturityDate);
      const totalDays = Math.ceil((maturity.getTime() - new Date(inceptionDate).getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, Math.ceil((maturity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      const daysElapsed = totalDays - daysRemaining;

      // Generate position name
      const defaultName = terms.productType === 'RC'
        ? `RC - ${terms.underlyings.map(u => u.ticker).join('/')}`
        : terms.bonusEnabled
        ? `Bonus Certificate - ${terms.underlyings.map(u => u.ticker).join('/')}`
        : `CPPN - ${terms.underlyings.map(u => u.ticker).join('/')}`;

      const position: InvestmentPosition = {
        id: `pos_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        productTerms: { ...terms, initialFixings }, // Override with selected prices
        inceptionDate,
        maturityDate,
        notional: terms.notional,
        initialFixings,
        couponHistory,
        daysElapsed,
        daysRemaining,
        createdAt: getCurrentISODate(),
        updatedAt: getCurrentISODate(),
        name: positionName || defaultName,
      };

      saveInvestmentPosition(position);
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save position:', error);
      alert('Failed to save position. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const allPricesSelected = terms.underlyings.every(u => selectedPrices[u.ticker]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Save to Position Tracker</h2>
            <p className="text-sm opacity-90">Choose reference prices for accurate tracking</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Position Name */}
          <div>
            <label className="text-sm font-semibold text-valura-ink mb-2 block">
              Position Name (Optional)
            </label>
            <input
              type="text"
              value={positionName}
              onChange={(e) => setPositionName(e.target.value)}
              placeholder={`e.g., "My ${terms.underlyings.map(u => u.ticker).join('/')} Investment"`}
              className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-blue-500 outline-none"
            />
          </div>

          {/* Initial Price Selectors */}
          <div>
            <h3 className="text-lg font-bold text-valura-ink mb-3">
              Reference Prices (Initial Fixings)
            </h3>
            <p className="text-sm text-muted mb-4">
              Choose the historical price for each underlying. This determines your performance tracking baseline.
            </p>

            <div className="space-y-4">
              {terms.underlyings.map((underlying) => {
                const reportData = underlyingData.find(d => d.symbol === underlying.ticker);
                const defaultPrice = reportData?.currentPrice || 100;
                
                return (
                  <InitialPriceSelector
                    key={underlying.ticker}
                    symbol={underlying.ticker}
                    onPriceSelected={(price, date) => handlePriceSelected(underlying.ticker, price, date)}
                    defaultPrice={defaultPrice}
                  />
                );
              })}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-900">
                  <strong>Tip:</strong> Choose your actual trade date for accurate performance tracking. 
                  The system will calculate P&L from your selected reference price. If historical data 
                  doesn't load, you can use Manual Entry.
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-grey-light rounded-lg p-4 border border-border">
            <div className="text-sm font-semibold text-valura-ink mb-2">Summary:</div>
            <div className="space-y-1 text-sm">
              <div>Product: <strong>{terms.productType === 'RC' ? 'Reverse Convertible' : 'Participation Note'}</strong></div>
              <div>Notional: <strong>${terms.notional.toLocaleString()}</strong></div>
              <div>Underlyings: <strong>{terms.underlyings.map(u => u.ticker).join(', ')}</strong></div>
              <div>
                Reference Prices: <strong>
                  {terms.underlyings.map(u => 
                    `${u.ticker}: $${(selectedPrices[u.ticker] || 100).toFixed(2)}`
                  ).join(', ')}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-grey-light border-t border-border p-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border-2 border-border text-valura-ink font-semibold rounded-lg hover:bg-grey-light transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !allPricesSelected}
            className={`px-8 py-3 rounded-lg font-bold text-white transition-all ${
              saving || !allPricesSelected
                ? 'bg-grey-medium cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
            }`}
          >
            <Save className="w-5 h-5 inline mr-2" />
            {saving ? 'Saving...' : 'Save Position'}
          </button>
        </div>
      </div>
    </div>
  );
}
