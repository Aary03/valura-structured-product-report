/**
 * Investment Tracker Hook
 * Hook for saving report data as trackable investment positions
 */

import { useState } from 'react';
import type { InvestmentPosition } from '../types/investment';
import type { ReverseConvertibleReportData, CapitalProtectedParticipationReportData } from './useReportGenerator';
import { saveInvestmentPosition } from '../services/investmentStorage';
import { generateCouponSchedule } from '../products/common/schedule';
import { addMonths, getCurrentISODate } from '../core/types/dates';

export function useInvestmentTracker() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveToTracker = async (
    reportData: ReverseConvertibleReportData | CapitalProtectedParticipationReportData,
    customName?: string
  ): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);

      const position = createInvestmentFromReport(reportData, customName);
      saveInvestmentPosition(position);

      setSaving(false);
      return true;
    } catch (err) {
      console.error('Error saving to tracker:', err);
      setError('Failed to save investment to tracker');
      setSaving(false);
      return false;
    }
  };

  return {
    saveToTracker,
    saving,
    error,
  };
}

/**
 * Create an InvestmentPosition from report data
 */
function createInvestmentFromReport(
  reportData: ReverseConvertibleReportData | CapitalProtectedParticipationReportData,
  customName?: string
): InvestmentPosition {
  const { terms } = reportData;
  const inceptionDate = getCurrentISODate();
  const maturityDate = addMonths(inceptionDate, terms.tenorMonths);

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
    id: generateId(),
    productTerms: terms,
    inceptionDate,
    maturityDate,
    notional: terms.notional,
    initialFixings: terms.initialFixings,
    couponHistory,
    daysElapsed,
    daysRemaining,
    createdAt: getCurrentISODate(),
    updatedAt: getCurrentISODate(),
    name: customName || defaultName,
  };

  return position;
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `pos_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
