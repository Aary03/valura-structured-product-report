/**
 * Schedule Utilities
 * Generate coupon payment schedules and observation dates
 */

import type { ISODateString } from '../../core/types/dates';
import type { CouponFrequency } from './productTypes';
import { addMonths } from '../../core/types/dates';

/**
 * Generate coupon payment schedule
 * @param startDate Start date (ISO string)
 * @param tenorMonths Tenor in months
 * @param freqPerYear Frequency per year (12=monthly, 4=quarterly, etc.)
 * @param firstPaymentInMonths First payment in X months (default: same as frequency)
 * @returns Array of coupon payment dates
 */
export function generateCouponSchedule(
  startDate: ISODateString,
  tenorMonths: number,
  freqPerYear: CouponFrequency,
  firstPaymentInMonths?: number
): ISODateString[] {
  if (!startDate || typeof startDate !== 'string') {
    console.error('Invalid startDate in generateCouponSchedule:', startDate);
    return [];
  }
  
  try {
    const monthsPerPayment = 12 / freqPerYear;
    const firstPayment = firstPaymentInMonths ?? monthsPerPayment;
    
    const dates: ISODateString[] = [];
    const endDate = addMonths(startDate, tenorMonths);
    
    // First payment date
    let currentDate = addMonths(startDate, firstPayment);
    
    // Generate all payment dates until maturity
    while (currentDate <= endDate) {
      dates.push(currentDate);
      currentDate = addMonths(currentDate, monthsPerPayment);
    }
    
    // Ensure maturity date is included
    if (dates.length === 0 || dates[dates.length - 1] !== endDate) {
      dates.push(endDate);
    }
    
    return dates;
  } catch (error) {
    console.error('Error generating coupon schedule:', error);
    return [];
  }
}

/**
 * Calculate number of coupon payments
 */
export function calculateCouponCount(
  tenorMonths: number,
  freqPerYear: CouponFrequency
): number {
  return Math.round((tenorMonths / 12) * freqPerYear);
}

/**
 * Generate observation dates (for autocallables, etc.)
 */
export function generateObservationSchedule(
  startDate: ISODateString,
  tenorMonths: number,
  freqPerYear: CouponFrequency,
  firstObsInMonths: number
): ISODateString[] {
  const monthsPerObs = 12 / freqPerYear;
  const dates: ISODateString[] = [];
  const endDate = addMonths(startDate, tenorMonths);
  
  // First observation
  let currentDate = addMonths(startDate, firstObsInMonths);
  
  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addMonths(currentDate, monthsPerObs);
  }
  
  // Ensure maturity is included
  if (dates.length === 0 || dates[dates.length - 1] !== endDate) {
    dates.push(endDate);
  }
  
  return dates;
}

