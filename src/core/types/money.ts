/**
 * Money and Currency Types
 * Core types for handling monetary values
 */

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF' | 'CAD' | 'AUD' | string;

export interface Money {
  amount: number;
  currency: Currency;
}

/**
 * Format money amount with currency symbol
 */
export function formatMoney(money: Money, decimals: number = 2): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(money.amount);
  
  return formatted;
}

/**
 * Format money amount as percentage
 */
export function formatMoneyAsPercent(amount: number, decimals: number = 2): string {
  return `${(amount * 100).toFixed(decimals)}%`;
}

