# Financial Modeling Prep API - Quick Reference

## Most Used Endpoints for Structured Product Reports

### 1. Get Current Quote (Spot Price)
```typescript
// Single symbol
const quote = await fmpClient.get(fmpClient.quote.quote('AAPL'));

// Multiple symbols (batch)
const quotes = await fmpClient.get(fmpClient.quote.batchQuote(['AAPL', 'MSFT', 'GOOGL']));
```

### 2. Get Historical Prices (for Performance Chart)
```typescript
// Full historical data
const prices = await fmpClient.get(
  fmpClient.historicalPrice.historicalPriceEodFull('AAPL', '2023-01-01', '2024-12-31')
);

// Light version (faster)
const pricesLight = await fmpClient.get(
  fmpClient.historicalPrice.historicalPriceEodLight('AAPL')
);
```

### 3. Get Analyst Estimates & Consensus
```typescript
// Analyst estimates
const estimates = await fmpClient.get(
  fmpClient.analyst.analystEstimates('AAPL', 'annual', 0, 10)
);

// Price target consensus
const priceTarget = await fmpClient.get(
  fmpClient.analyst.priceTargetConsensus('AAPL')
);

// Ratings snapshot
const ratings = await fmpClient.get(
  fmpClient.analyst.ratingsSnapshot('AAPL')
);
```

### 4. Get Company Profile
```typescript
// Company profile
const profile = await fmpClient.get(fmpClient.profile.profile('AAPL'));

// Stock peers
const peers = await fmpClient.get(fmpClient.profile.stockPeers('AAPL'));
```

### 5. Get Market Capitalization
```typescript
// Single symbol
const marketCap = await fmpClient.get(
  fmpClient.profile.marketCapitalization('AAPL')
);

// Batch
const marketCaps = await fmpClient.get(
  fmpClient.profile.marketCapitalizationBatch(['AAPL', 'MSFT', 'GOOGL'])
);
```

## Data Structure Examples

### Quote Response
```typescript
{
  symbol: "AAPL",
  name: "Apple Inc.",
  price: 182.64,
  changesPercentage: -0.32,
  change: -0.58,
  dayLow: 182.10,
  dayHigh: 183.50,
  yearHigh: 199.62,
  yearLow: 164.08,
  marketCap: 2800000000000,
  priceAvg50: 185.50,
  priceAvg200: 180.25,
  volume: 45000000,
  avgVolume: 55000000,
  exchange: "NASDAQ",
  open: 182.80,
  previousClose: 183.22,
  eps: 6.42,
  pe: 28.45,
  earningsAnnouncement: "2024-11-01",
  sharesOutstanding: 15300000000,
  timestamp: 1698000000
}
```

### Historical Price Response
```typescript
{
  symbol: "AAPL",
  historical: [
    {
      date: "2024-10-21",
      open: 182.50,
      high: 183.20,
      low: 182.10,
      close: 182.64,
      adjClose: 182.64,
      volume: 45000000,
      unadjustedVolume: 45000000,
      change: 0.14,
      changePercent: 0.08,
      vwap: 182.50,
      label: "October 21, 2024",
      changeOverTime: 0.0008
    },
    // ... more dates
  ]
}
```

### Analyst Estimates Response
```typescript
{
  symbol: "AAPL",
  date: "2024-10-21",
  estimatedRevenueLow: 120000000000,
  estimatedRevenueHigh: 130000000000,
  estimatedRevenueAvg: 125000000000,
  estimatedEbitdaLow: 35000000000,
  estimatedEbitdaHigh: 40000000000,
  estimatedEbitdaAvg: 37500000000,
  estimatedEbitLow: 30000000000,
  estimatedEbitHigh: 35000000000,
  estimatedEbitAvg: 32500000000,
  estimatedNetIncomeLow: 25000000000,
  estimatedNetIncomeHigh: 30000000000,
  estimatedNetIncomeAvg: 27500000000,
  estimatedSgaExpenseLow: 20000000000,
  estimatedSgaExpenseHigh: 22000000000,
  estimatedSgaExpenseAvg: 21000000000,
  estimatedEpsAvg: 6.50,
  estimatedEpsHigh: 6.80,
  estimatedEpsLow: 6.20,
  numberAnalystEstimatedRevenue: 25,
  numberAnalystsEstimatedEps: 30
}
```

### Price Target Consensus Response
```typescript
{
  symbol: "AAPL",
  targetHigh: 220.00,
  targetLow: 180.00,
  targetMean: 200.00,
  targetMedian: 199.50,
  numberOfAnalysts: 35
}
```

## Common Use Cases for Structured Products

### 1. Get Underlying Data for Report Table
```typescript
async function getUnderlyingData(symbols: string[]) {
  const [quotes, priceTargets, ratings] = await Promise.all([
    fmpClient.get(fmpClient.quote.batchQuote(symbols)),
    Promise.all(symbols.map(s => fmpClient.get(fmpClient.analyst.priceTargetConsensus(s)))),
    Promise.all(symbols.map(s => fmpClient.get(fmpClient.analyst.ratingsSnapshot(s))))
  ]);
  
  return symbols.map((symbol, index) => ({
    symbol,
    currentPrice: quotes[index]?.price,
    targetPrice: priceTargets[index]?.targetMean,
    consensus: ratings[index]?.rating,
    // ... other fields
  }));
}
```

### 2. Get Historical Performance for Chart
```typescript
async function getHistoricalPerformance(symbol: string, years: number = 1) {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - years * 365 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];
  
  const data = await fmpClient.get(
    fmpClient.historicalPrice.historicalPriceEodFull(symbol, startDate, endDate)
  );
  
  return data.historical.map(day => ({
    date: day.date,
    price: day.close,
    normalized: (day.close / data.historical[0].close) * 100 // Normalize to first day
  }));
}
```

### 3. Calculate Performance Metrics
```typescript
function calculatePerformance(currentPrice: number, initialPrice: number) {
  const performance = ((currentPrice - initialPrice) / initialPrice) * 100;
  return {
    value: performance,
    isPositive: performance >= 0,
    formatted: `${performance >= 0 ? '+' : ''}${performance.toFixed(2)}%`
  };
}
```

## Error Handling Best Practices

```typescript
async function safeGetQuote(symbol: string) {
  try {
    const quote = await fmpClient.get(fmpClient.quote.quote(symbol));
    return { success: true, data: quote };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        // Rate limit - wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return safeGetQuote(symbol);
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown error' };
  }
}
```

## Rate Limiting

Financial Modeling Prep has rate limits. For batch operations:
- Use `batchQuote` instead of multiple individual calls
- Implement retry logic with exponential backoff
- Cache responses when possible

## Caching Strategy

```typescript
// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedQuote(symbol: string) {
  const cached = cache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const quote = await fmpClient.get(fmpClient.quote.quote(symbol));
  cache.set(symbol, { data: quote, timestamp: Date.now() });
  return quote;
}
```

