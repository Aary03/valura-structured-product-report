# Financial Modeling Prep API Client

Comprehensive API client for all Financial Modeling Prep endpoints.

## Usage

```typescript
import { fmpClient } from './financialModelingPrep';

// Get quote for a symbol
const quote = await fmpClient.get(fmpClient.quote.quote('AAPL'));

// Get historical prices
const prices = await fmpClient.get(
  fmpClient.historicalPrice.historicalPriceEodFull('AAPL', '2024-01-01', '2024-12-31')
);

// Get analyst estimates
const estimates = await fmpClient.get(
  fmpClient.analyst.analystEstimates('AAPL', 'annual', 0, 10)
);

// Batch quotes for multiple symbols
const batchQuotes = await fmpClient.get(
  fmpClient.quote.batchQuote(['AAPL', 'MSFT', 'GOOGL'])
);
```

## Available Endpoint Categories

- **search** - Search by symbol, name, CIK, CUSIP, ISIN
- **list** - Stock lists, ETF lists, exchanges, sectors
- **profile** - Company profiles, peers, market cap
- **quote** - Real-time quotes, batch quotes
- **financialStatements** - Income, balance sheet, cash flow
- **historicalPrice** - Historical prices, charts
- **analyst** - Analyst estimates, ratings, price targets
- **news** - Stock news, press releases
- **corporateActions** - Dividends, earnings, splits
- **technicalIndicators** - SMA, EMA, RSI, etc.
- And many more...

## Environment Variable

Set `VITE_FMP_API_KEY` in your `.env` file. The API key is also hardcoded as fallback for development.

## Error Handling

All requests use axios with proper error handling. Wrap calls in try-catch:

```typescript
try {
  const data = await fmpClient.get(fmpClient.quote.quote('AAPL'));
} catch (error) {
  console.error('API Error:', error);
}
```

