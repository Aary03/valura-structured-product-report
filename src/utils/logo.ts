/**
 * Logo Utilities
 * Get company logos for display
 */

/**
 * Get logo URL for a stock symbol
 * Uses multiple fallback services
 */
export function getCompanyLogoUrl(symbol: string, companyName?: string): string {
  // Financial Modeling Prep logo service
  // Format: https://financialmodelingprep.com/image-stock/{symbol}.png
  return `https://financialmodelingprep.com/image-stock/${symbol}.png`;
  
  // Alternative services (if FMP doesn't work):
  // 1. Polygon.io: `https://api.polygon.io/v1/meta/symbols/${symbol}/logo`
  // 2. Finnhub: `https://finnhub.io/api/logo?symbol=${symbol}`
  // 3. Clearbit (needs domain): `https://logo.clearbit.com/${domain}`
}

/**
 * Get logo URL with fallback
 * Returns a placeholder if logo fails to load
 */
export function getLogoWithFallback(symbol: string, companyName?: string): {
  logoUrl: string;
  fallback: string; // Initials or symbol
} {
  return {
    logoUrl: getCompanyLogoUrl(symbol, companyName),
    fallback: symbol.substring(0, 2).toUpperCase(),
  };
}

