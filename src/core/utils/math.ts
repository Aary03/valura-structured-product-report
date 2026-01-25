/**
 * Math Utilities
 * Precision, rounding, and mathematical helpers
 */

/**
 * Round to specified decimal places
 */
export function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate percentage change
 */
export function percentChange(from: number, to: number): number {
  if (from === 0) return 0;
  return ((to - from) / from) * 100;
}

/**
 * Normalize value to percentage (0-100)
 */
export function toPercent(value: number, decimals: number = 2): number {
  return round(value * 100, decimals);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage (expects decimal, e.g., 0.1275 → "12.75%")
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${toPercent(value, decimals)}%`;
}

/**
 * Format percentage value (expects percentage, e.g., 12.75 → "12.75%")
 */
export function formatPercentValue(value: number, decimals: number = 2): string {
  return `${round(value, decimals)}%`;
}

/**
 * Safe division (returns 0 if denominator is 0)
 */
export function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

