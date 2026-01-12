/**
 * Autocall Logic for Reverse Convertibles
 * Handles both fixed and step-down autocall features
 */

import type { ReverseConvertibleTerms } from './terms';
import type { ISODateString } from '../../core/types/dates';
import { generateCouponSchedule } from '../common/schedule';

/**
 * Autocall observation point
 */
export interface AutocallObservation {
  date: ISODateString;
  observationNumber: number; // 1-indexed (1 = first observation)
  autocallLevel: number; // Trigger level for this observation (decimal, e.g., 1.00 = 100%)
  daysSinceInception: number;
}

/**
 * Generate autocall observation schedule
 */
export function generateAutocallSchedule(
  inceptionDate: ISODateString,
  tenorMonths: number,
  autocallFrequency: number, // observations per year
  autocallStepDown: boolean = false,
  stepDownLevels?: number[] // Array of descending levels, e.g., [1.00, 0.95, 0.90, 0.85]
): AutocallObservation[] {
  // Generate dates based on frequency
  const dates = generateCouponSchedule(inceptionDate, tenorMonths, autocallFrequency);
  
  // If step-down enabled, use provided levels
  if (autocallStepDown && stepDownLevels && stepDownLevels.length > 0) {
    return dates.map((date, index) => {
      // Use level from array, or last level if we exceed array length
      const levelIndex = Math.min(index, stepDownLevels.length - 1);
      const autocallLevel = stepDownLevels[levelIndex];
      
      // Calculate days since inception
      const inception = new Date(inceptionDate);
      const obsDate = new Date(date);
      const daysSinceInception = Math.ceil((obsDate.getTime() - inception.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        date,
        observationNumber: index + 1,
        autocallLevel,
        daysSinceInception,
      };
    });
  }
  
  // Fixed autocall: all observations have same level
  // This shouldn't be reached if using step-down, but included for completeness
  return dates.map((date, index) => {
    const inception = new Date(inceptionDate);
    const obsDate = new Date(date);
    const daysSinceInception = Math.ceil((obsDate.getTime() - inception.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      date,
      observationNumber: index + 1,
      autocallLevel: 1.00, // Default fixed level
      daysSinceInception,
    };
  });
}

/**
 * Check if autocall is triggered at a specific observation
 */
export function checkAutocallTrigger(
  basketLevel: number, // Current basket level (decimal, e.g., 1.05 = 105%)
  observation: AutocallObservation
): boolean {
  return basketLevel >= observation.autocallLevel;
}

/**
 * Calculate autocall payout (principal + coupons to date)
 */
export function calculateAutocallPayout(
  notional: number,
  couponsToDate: number
): number {
  return notional + couponsToDate;
}

/**
 * Get next autocall observation from current date
 */
export function getNextAutocallObservation(
  observations: AutocallObservation[],
  currentDate: ISODateString
): AutocallObservation | null {
  const current = new Date(currentDate);
  
  for (const obs of observations) {
    const obsDate = new Date(obs.date);
    if (obsDate > current) {
      return obs;
    }
  }
  
  return null; // No future observations
}

/**
 * Generate default step-down levels
 * Creates descending levels from start to end
 */
export function generateStepDownLevels(
  startLevel: number, // e.g., 1.00 for 100%
  stepSize: number, // e.g., 0.05 for 5% steps
  numberOfSteps: number // e.g., 4 for 4 observations
): number[] {
  const levels: number[] = [];
  
  for (let i = 0; i < numberOfSteps; i++) {
    const level = startLevel - (i * stepSize);
    levels.push(Math.max(0.5, level)); // Don't go below 50%
  }
  
  return levels;
}
