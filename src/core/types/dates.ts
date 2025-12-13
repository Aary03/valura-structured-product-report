/**
 * Date Types and Utilities
 * ISO date string handling and date calculations
 */

export type ISODateString = string; // Format: YYYY-MM-DD

/**
 * Get current date as ISO string
 */
export function getCurrentISODate(): ISODateString {
  return new Date().toISOString().split('T')[0];
}

/**
 * Add months to a date
 */
export function addMonths(date: ISODateString, months: number): ISODateString {
  if (!date || typeof date !== 'string') {
    throw new Error(`Invalid date string: ${date}`);
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

/**
 * Format date for display
 */
export function formatDate(date: ISODateString, format: 'short' | 'long' = 'short'): string {
  if (!date || typeof date !== 'string') {
    return 'Invalid Date';
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    console.warn(`Invalid date string: ${date}`);
    return date; // Return original string if invalid
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate days between two dates
 */
export function daysBetween(start: ISODateString, end: ISODateString): number {
  if (!start || !end || typeof start !== 'string' || typeof end !== 'string') {
    return 0;
  }
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 0;
  }
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generate date range for coupon schedule
 */
export function generateDateRange(
  startDate: ISODateString,
  endDate: ISODateString,
  frequencyMonths: number
): ISODateString[] {
  if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
    return [];
  }
  const dates: ISODateString[] = [];
  let current = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(current.getTime()) || isNaN(end.getTime())) {
    return [];
  }
  
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setMonth(current.getMonth() + frequencyMonths);
  }
  
  // Ensure end date is included
  if (dates.length === 0 || dates[dates.length - 1] !== endDate) {
    dates.push(endDate);
  }
  
  return dates;
}

