# Component Architecture & Data Flow

## Component Hierarchy

```
App
├── ReverseConvertibleReport
    ├── Header
    │   ├── ProductTitle
    │   └── KeyFeaturesBadge
    ├── ProductDetails
    │   ├── SpecificationsTable
    │   └── UnderlyingsList
    ├── SuitabilitySection
    │   └── CriteriaChecklist
    ├── UnderlyingsTable
    │   ├── UnderlyingRow (×N)
    │   └── DataLoader (API)
    ├── PayoffGraph
    │   ├── PayoffChart (Recharts)
    │   └── IntrinsicValueMarker
    ├── PerformanceGraph
    │   ├── PerformanceChart (Recharts)
    │   └── BarrierReferenceLine
    └── ScenariosFlowchart
        ├── DecisionNode
        └── OutcomeBox
```

## Data Flow

### 1. Configuration Input
```typescript
// User/Platform provides configuration
const config: ReverseConvertibleConfig = {
  couponRate: 10,
  barrier: 70,
  underlyings: ['AAPL', 'TSLA'],
  // ... other params
}
```

### 2. Data Fetching (useProductData hook)
```
Config → API Client → Financial Modeling Prep API
                    ↓
              Raw API Data
                    ↓
              Data Transformer
                    ↓
         Product Data (typed)
```

### 3. Calculation (usePayoffCalculation hook)
```
Product Data + Config → Payoff Calculator
                            ↓
                    Payoff Curve Points
                    Intrinsic Value
                    Breakeven Analysis
```

### 4. Rendering
```
Calculated Data → Chart Components
                → Table Components
                → Flowchart Components
                ↓
         Final Report (React Component)
```

## State Management

### Global State (Context/Store):
```typescript
interface AppState {
  productConfig: ReverseConvertibleConfig;
  underlyingData: UnderlyingData[];
  calculations: PayoffCalculations;
  loading: boolean;
  error: string | null;
}
```

### Component State:
- Local UI state (expanded/collapsed, selected tab)
- Form inputs (if configurable)
- Chart zoom/pan state

## API Integration Flow

### Financial Modeling Prep API Calls:

```typescript
// Parallel API calls for multiple underlyings
Promise.all([
  getQuote('AAPL'),
  getHistoricalPrices('AAPL', '1y'),
  getAnalystEstimates('AAPL'),
  // Repeat for each underlying
])
  .then(transformData)
  .then(updateState)
  .catch(handleError)
```

### Data Transformation:
```typescript
API Response → {
  symbol: string;
  currentPrice: number;
  initialPrice: number;
  performance: number;
  analystConsensus: string;
  targetPrice: number;
  historicalData: PricePoint[];
}
```

## Calculation Pipeline

### Payoff Calculation:
```typescript
// Generate payoff curve
for (let level = 0; level <= 150; level += 0.5) {
  const payoff = calculatePayoff(
    level,           // Final level %
    config.barrier,
    config.principal
  );
  payoffCurve.push({ level, payoff });
}

// Calculate intrinsic value
const intrinsicValue = calculatePayoff(
  currentSpot / initialFixing * 100,
  config.barrier,
  config.principal
);
```

### Performance Data Processing:
```typescript
// Normalize historical prices
historicalData.map(price => ({
  date: price.date,
  value: (price.close / currentSpot) * 100, // Normalize to %
  symbol: price.symbol
}));
```

## Component Props Interface

### ReverseConvertibleReport:
```typescript
interface ReverseConvertibleReportProps {
  config: ReverseConvertibleConfig;
  onConfigChange?: (config: ReverseConvertibleConfig) => void;
  theme?: 'light' | 'dark';
  showControls?: boolean;
}
```

### PayoffGraph:
```typescript
interface PayoffGraphProps {
  payoffCurve: PayoffPoint[];
  barrier: number;
  intrinsicValue: number;
  currentLevel: number;
  width?: number;
  height?: number;
}
```

### UnderlyingsTable:
```typescript
interface UnderlyingsTableProps {
  underlyings: UnderlyingData[];
  initialFixing: Record<string, number>;
  loading?: boolean;
}
```

## Error Handling Strategy

### API Errors:
```typescript
try {
  const data = await fetchUnderlyingData(symbol);
} catch (error) {
  if (error.status === 429) {
    // Rate limit - retry with backoff
  } else if (error.status === 404) {
    // Symbol not found - show placeholder
  } else {
    // Generic error - show error message
  }
}
```

### Calculation Errors:
```typescript
// Validate inputs before calculation
if (barrier <= 0 || barrier > 100) {
  throw new Error('Invalid barrier level');
}

// Safe calculation with fallbacks
const payoff = calculatePayoff(...) ?? 0;
```

## Performance Optimizations

### Memoization:
```typescript
// Memoize expensive calculations
const payoffCurve = useMemo(
  () => calculatePayoffCurve(config),
  [config.barrier, config.principal]
);

// Memoize API data transformation
const transformedData = useMemo(
  () => transformAPIResponse(rawData),
  [rawData]
);
```

### Lazy Loading:
```typescript
// Lazy load chart components
const PayoffGraph = lazy(() => import('./PayoffGraph'));
const PerformanceGraph = lazy(() => import('./PerformanceGraph'));
```

### Virtual Scrolling:
```typescript
// For large historical datasets
<VirtualizedList
  items={historicalData}
  renderItem={renderPricePoint}
  itemHeight={30}
/>
```

## Testing Strategy

### Unit Tests:
- Payoff calculation functions
- Data transformation utilities
- Formatters (currency, percentage)

### Component Tests:
- Render with mock data
- User interactions
- Error states

### Integration Tests:
- API client with mock responses
- Full report generation flow
- Multiple underlying scenarios

## Module Export Structure

```typescript
// Main export
export { generateReverseConvertibleReport } from './ReverseConvertibleReport';

// Component exports (for customization)
export { PayoffGraph } from './components/PayoffGraph';
export { UnderlyingsTable } from './components/UnderlyingsTable';

// Type exports
export type { ReverseConvertibleConfig } from './types/product';
export type { UnderlyingData } from './types/report';

// Utility exports
export { calculatePayoff } from './services/calculations/reverseConvertible';
```

---

This architecture ensures scalability, maintainability, and easy integration with the Valura platform.


